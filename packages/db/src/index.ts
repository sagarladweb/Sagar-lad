import dns from "dns";

// Force IPv4 first to eliminate 5-10 second macOS dual-stack IPv6 getaddrinfo hangs
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {}

import pg from "pg";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbPool: pg.Pool | undefined;
  heartbeatInterval: NodeJS.Timeout | undefined;
};

/* ── Recovery tracking ─────────────────────────────────────────── */
let consecutiveFailures = 0;

function markDbUp() {
  consecutiveFailures = 0;
}

export function markDbDown() {
  consecutiveFailures++;
  console.warn(`[db] connection failed (failure #${consecutiveFailures})`);
}

function createPool(): pg.Pool {
  let url = process.env.DATABASE_URL || "";
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  // Ensure PgBouncer transaction mode parameter is present
  if (url.includes(":6543") && !url.includes("pgbouncer=true")) {
    url += (url.includes("?") ? "&" : "?") + "pgbouncer=true";
  }

  const max = Math.min(Math.max(parseInt(process.env.DATABASE_POOL_MAX ?? "10", 10) || 10, 2), 15);
  const pool = new pg.Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    min: 2, // Keep 2 warm connections permanently ready in the pool
    max,
    family: 4,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    connectionTimeoutMillis: 8000,
    idleTimeoutMillis: 300000, // 5 minutes instead of 30s
    query_timeout: 10000,
    statement_timeout: 10000,
    statement_cache_size: 0, // PgBouncer transaction mode compatibility
  } as Record<string, unknown>);

  pool.on("error", (err) => {
    console.error("[db] idle pool error:", (err as Error)?.message || err);
    if (isConnectionError(err)) {
      resetPool().catch(() => {});
    }
  });

  // Keep-alive heartbeat: ping every 40s to keep Supabase PgBouncer sockets alive & hot
  if (!globalForPrisma.heartbeatInterval && typeof setInterval !== "undefined") {
    globalForPrisma.heartbeatInterval = setInterval(() => {
      if (globalForPrisma.dbPool) {
        globalForPrisma.dbPool.query("SELECT 1").catch(() => {});
      }
    }, 40000);
    if (typeof globalForPrisma.heartbeatInterval.unref === "function") {
      globalForPrisma.heartbeatInterval.unref();
    }
  }

  // Pre-warm the pool in background immediately
  pool.query("SELECT 1").then(markDbUp).catch(() => {});

  return pool;
}

function getPool(): pg.Pool {
  const existing = globalForPrisma.dbPool;
  if (existing) return existing;
  const pool = createPool();
  globalForPrisma.dbPool = pool;
  return pool;
}

function createClient() {
  const pool = getPool();
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: [],
  });
}

function getClient(): PrismaClient {
  const existing = globalForPrisma.prisma;
  if (existing) return existing;
  const client = createClient();
  globalForPrisma.prisma = client;
  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (prop === "then") return undefined;
    const client = getClient();
    const value = (client as unknown as Record<PropertyKey, unknown>)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

/* ── Connection-error detection ─────────────────────────────────── */
const CONNECTION_ERROR_CODES = new Set([
  "P1001", "P1002", "P1003", "P1008", "P1010", "P1011", "P1012", "P1017",
  "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "EPIPE",
  "57P01", "57P02", "57P03", "08006", "08001", "08004",
]);

function isConnectionError(err: unknown): boolean {
  if (err && typeof err === "object" && "code" in err) {
    return CONNECTION_ERROR_CODES.has((err as { code: string }).code);
  }
  const msg = (err as Error).message?.toLowerCase() ?? "";
  return (
    msg.includes("connect") ||
    msg.includes("timeout") ||
    msg.includes("econnrefused") ||
    msg.includes("econnreset") ||
    msg.includes("epipe") ||
    msg.includes("database is paused") ||
    msg.includes("server closed the connection unexpectedly") ||
    msg.includes("connection terminated") ||
    msg.includes("remaining connection slots are reserved") ||
    msg.includes("terminating connection")
  );
}

async function resetPool() {
  const pool = globalForPrisma.dbPool;
  if (!pool) return;
  try {
    await pool.end();
  } catch {}
  globalForPrisma.dbPool = undefined;
  globalForPrisma.prisma = undefined;
}

/**
 * Run a DB query with fast single retry.
 * Fast 200ms retry: recovers from transient socket recycle without stalling page loads.
 * Returns `fallback` if retry fails so user never waits more than a few hundred ms.
 */
export async function dbSafe<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  const RETRY_DELAY_MS = 200;

  for (let attempt = 0; attempt <= 1; attempt++) {
    try {
      const result = await query();
      markDbUp();
      return result;
    } catch (err) {
      if (!isConnectionError(err)) throw err;

      if (attempt === 0) {
        resetPool().catch(() => {});
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }

      markDbDown();
      resetPool().catch(() => {});
      console.warn("[db] connection error after retry, using fallback");
      return fallback;
    }
  }

  return fallback;
}

export function isDbDown(): boolean {
  return consecutiveFailures > 2;
}

export * from "./generated/prisma/client";
