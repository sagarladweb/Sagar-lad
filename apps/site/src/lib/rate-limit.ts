import { prisma } from "@/lib/db";

export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

// DB-backed rate limiting. Works across serverless instances (the old in-memory
// map reset per instance and only ever throttled one lambda at a time). One
// upsert per request — acceptable because these endpoints already write to the
// DB anyway. Expired rows are swept opportunistically so the table stays small.
// In-memory shield: absorbs burst checks in RAM in < 0.1ms without hitting Supabase across the ocean
const memRateLimit = new Map<string, { count: number; resetAt: number }>();

let lastCleanup = 0;

async function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60_000) return;
  lastCleanup = now;

  // Prune local memory map
  for (const [k, v] of memRateLimit.entries()) {
    if (v.resetAt <= now) memRateLimit.delete(k);
  }

  await prisma.rateLimitEntry
    .deleteMany({ where: { resetAt: { lt: new Date(now - 24 * 60 * 60_000) } } })
    .catch(() => {});
}

export async function rateLimitByIp(
  ip: string,
  limit = 20,
  windowMs = 60_000
): Promise<{ ok: boolean; retryAfter: number }> {
  void cleanup();
  const key = `ip:${ip}`;
  const now = Date.now();
  const resetAt = new Date(now + windowMs);

  // Fast-path in RAM:
  const mem = memRateLimit.get(key);
  if (mem && mem.resetAt > now) {
    if (mem.count >= limit) {
      return { ok: false, retryAfter: Math.ceil((mem.resetAt - now) / 1000) };
    }
    mem.count++;
  } else {
    memRateLimit.set(key, { count: 1, resetAt: now + windowMs });
  }

  // Persist to DB asynchronously / safely without blocking if DB is slow
  try {
    const record = await prisma.rateLimitEntry.findUnique({ where: { key } }).catch(() => null);
    if (!record || record.resetAt.getTime() <= now) {
      await prisma.rateLimitEntry.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      }).catch(() => {});
      return { ok: true, retryAfter: 0 };
    }

    if (record.count >= limit) {
      return { ok: false, retryAfter: Math.ceil((record.resetAt.getTime() - now) / 1000) };
    }

    await prisma.rateLimitEntry.update({
      where: { key },
      data: { count: { increment: 1 } },
    }).catch(() => {});
  } catch {
    // If DB has a network timeout, trust the in-memory rate limiter so user is not blocked
  }

  return { ok: true, retryAfter: 0 };
}
