/**
 * Deterministic engagement metrics.
 *
 * Generates realistic views/likes from the post slug + publish date.
 * Same input → same output every time. No randomness, no database, no API.
 *
 * Older posts accumulate more views. Each post has a unique "personality"
 * based on its slug hash. Likes are always 8-15% of views.
 */

/** FNV-1a hash → unsigned 32-bit int */
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Simple seeded LCG (Park-Miller) — returns 0..999 */
function seededRandom(seed: number): number {
  return seed % 1000;
}

/** Days between two ISO date strings (floor) */
function daysBetween(a: string, b: string): number {
  const ms = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return Math.floor(ms / 86_400_000);
}

type EngagementMetrics = { views: number; likes: number };

/**
 * Get deterministic engagement for a post.
 *
 * @param slug       Post slug (unique identifier)
 * @param publishedAt ISO date string of publication
 * @param now         Optional "current" date (for testing). Defaults to today.
 */
export function getEngagement(
  slug: string,
  publishedAt: string,
  now?: string,
): EngagementMetrics {
  const today = now ?? new Date().toISOString().slice(0, 10);
  const ageDays = Math.max(0, daysBetween(publishedAt, today));

  const slugHash = fnv1a(slug);
  const personality = seededRandom(slugHash); // 0–999 unique per post

  // --- VIEWS ---
  // Base: 3-8 views/day depending on post "personality"
  const dailyBase = 3 + (personality % 6); // 3..8
  // Age multiplier: newer posts grow slower, older posts compound
  const ageMultiplier = 1 + Math.log2(Math.max(1, ageDays)) * 0.35;
  // Weekly micro-variation: simulates weekday/weekend bumps (±12%)
  const dayOfWeek = new Date(today).getDay();
  const weekdayBoost = dayOfWeek >= 1 && dayOfWeek <= 5 ? 1.12 : 0.88;
  // Daily seed: tiny deterministic variation per day
  const dailySeed = fnv1a(slug + today) % 100;
  const dailyJitter = 0.9 + (dailySeed / 100) * 0.2; // 0.90..1.10

  const views = Math.round(
    dailyBase * ageDays * ageMultiplier * weekdayBoost * dailyJitter,
  );

  // --- LIKES ---
  // Ratio: 8-15% of views, determined by slug hash
  const likeRatio = 0.08 + (personality % 8) / 100; // 0.08..0.15
  const likes = Math.max(0, Math.round(views * likeRatio));

  return { views, likes };
}
