/**
 * High-Performance In-Memory Cache with Stale-While-Revalidate (SWR) & Promise Deduplication.
 *
 * Keeps hot data in Node.js process RAM so frequently used content is returned
 * in < 1ms without hitting Supabase across the ocean.
 *
 * Features:
 *  - Instant <1ms responses for cached data.
 *  - Stale-While-Revalidate (SWR): serves existing data immediately while refreshing in background.
 *  - In-flight Promise deduplication: prevents thundering herd / pool exhaustion when multiple visitors hit the same page.
 *  - Graceful fallback: returns stale data if database is temporarily slow or unreachable.
 *  - Tag-based invalidation: synced with /api/revalidate when admin updates content.
 */

type CacheEntry<T> = {
  value: T;
  updatedAt: number;
  ttlMs: number;
  swrMs: number;
  tags: string[];
};

const globalForCache = globalThis as unknown as {
  __site_memory_cache?: Map<string, CacheEntry<unknown>>;
  __site_inflight_fetches?: Map<string, Promise<unknown>>;
};

const memoryStore = (globalForCache.__site_memory_cache ??= new Map());
const inFlightFetches = (globalForCache.__site_inflight_fetches ??= new Map());

export interface CacheOptions {
  /** Time in milliseconds data remains strictly fresh (default: 5 minutes) */
  ttlMs?: number;
  /** Additional time in milliseconds stale data can be served while refreshing in background (default: 1 hour) */
  swrMs?: number;
  /** Associated tags for bulk cache invalidation (e.g. ["content", "posts"]) */
  tags?: string[];
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh
const DEFAULT_SWR_MS = 60 * 60 * 1000; // 1 hour SWR window

/**
 * Wraps a database fetcher in an in-memory SWR cache.
 */
export async function withMemoryCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const swrMs = options.swrMs ?? DEFAULT_SWR_MS;
  const tags = options.tags ?? ["content"];
  const now = Date.now();

  const entry = memoryStore.get(key) as CacheEntry<T> | undefined;

  // 1. Fresh hit: Return immediately in < 0.1ms
  if (entry && now - entry.updatedAt < entry.ttlMs) {
    return entry.value;
  }

  // 2. Stale hit (within SWR window): Return stale data instantly and revalidate in background
  if (entry && now - entry.updatedAt < entry.ttlMs + entry.swrMs) {
    triggerBackgroundRevalidation(key, fetcher, ttlMs, swrMs, tags);
    return entry.value;
  }

  // 3. Cache miss or fully expired: Fetch with in-flight deduplication
  return fetchAndCache(key, fetcher, ttlMs, swrMs, tags, entry?.value);
}

function triggerBackgroundRevalidation<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
  swrMs: number,
  tags: string[]
) {
  // If an in-flight fetch is already happening for this key, don't trigger another
  if (inFlightFetches.has(key)) return;

  fetchAndCache(key, fetcher, ttlMs, swrMs, tags).catch((err) => {
    console.warn(`[memory-cache] Background revalidation failed for ${key}:`, err?.message || err);
  });
}

async function fetchAndCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
  swrMs: number,
  tags: string[],
  staleFallback?: T
): Promise<T> {
  // Deduplicate concurrent requests for the exact same key
  const existingFetch = inFlightFetches.get(key) as Promise<T> | undefined;
  if (existingFetch) {
    return existingFetch;
  }

  const fetchPromise = (async () => {
    try {
      const data = await fetcher();

      // Only cache valid data (do not cache empty nulls from errors)
      if (data !== undefined && data !== null) {
        memoryStore.set(key, {
          value: data,
          updatedAt: Date.now(),
          ttlMs,
          swrMs,
          tags,
        });
      }
      return data;
    } catch (err) {
      // If we have stale data and the fetch threw, serve stale data gracefully
      if (staleFallback !== undefined) {
        console.warn(`[memory-cache] Fetch failed for ${key}, serving stale fallback`);
        return staleFallback;
      }
      throw err;
    } finally {
      inFlightFetches.delete(key);
    }
  })();

  inFlightFetches.set(key, fetchPromise);
  return fetchPromise;
}

/**
 * Invalidate memory cache entries matching specific tags or clear all.
 */
export function invalidateMemoryCache(tags?: string[]) {
  if (!tags || tags.length === 0) {
    memoryStore.clear();
    return;
  }

  const tagSet = new Set(tags);
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.tags.some((t: string) => tagSet.has(t))) {
      memoryStore.delete(key);
    }
  }
}
