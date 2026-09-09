import { unstable_cache } from "next/cache";
import { cache } from "react";
import { prisma, dbSafe } from "@/lib/db";
import { isInstagramUrl } from "@/lib/instagram";
import { VISIBLE_POST_WHERE } from "@/lib/site";

// Blog posts: Cached with unstable_cache for instant <5ms responses, deduped per-request with React cache.
const getPostBySlugCached = unstable_cache(
  async (slug: string) => {
    return dbSafe(
      () =>
        prisma.post.findFirst({
          where: { slug, ...VISIBLE_POST_WHERE },
          include: { category: { select: { id: true, name: true, slug: true } }, author: { select: { name: true } } },
        }),
      null
    );
  },
  ["post-by-slug-v2"],
  { revalidate: 604800, tags: ["content", "posts"] }
);

export const getPostBySlug = cache(async (slug: string) => {
  return getPostBySlugCached(slug);
});

// No fallback data — when DB is down, show empty states instead of fake content.

export type VideoCard = {
  id: string;
  title: string;
  slug: string | null;
  embedUrl: string;
  thumbnail: string | null;
  content?: string | null;
  categorySlug?: string | null;
};

// ── Content fetchers ──────────────────────────────────────────────────
// Uses unstable_cache ONLY for successful DB results. When DB is down,
// returns fallback directly (not cached) so next request gets a fresh
// chance at the DB. reinvalidateTag("content") from admin writes busts
// these caches instantly.

export const getCategories = unstable_cache(
  async () => {
    const result = await dbSafe(
      () => prisma.category.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { posts: true, videos: true } } },
      }),
      null,
    );
    if (result && result.length > 0) return result;
    // DB down — return fallback WITHOUT caching (so next request retries DB)
    console.warn("[content] getCategories: DB down, returning uncached fallback");
    return null;
  },
  ["categories-v2"],
  { revalidate: 300, tags: ["content"] }
);

// Wrapper: if cache returns null, it means DB was down — return empty
export async function getCategoriesWithFallback() {
  const cached = await getCategories();
  return cached ?? [];
}

export const getPublishedVideos = unstable_cache(
  async (take?: number, platform?: "youtube" | "instagram", skip?: number) => {
    const rows = await dbSafe(
      () => prisma.video.findMany({
        where: { published: true, deletedAt: null },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        ...(take ? { take } : {}),
        ...(skip ? { skip } : {}),
        select: {
          id: true, title: true, slug: true, embedUrl: true,
          thumbnail: true, content: true,
          category: { select: { slug: true } },
        },
      }),
      null,
    );
    if (!rows) return null;
    return rows
      .map((v) => ({ ...v, content: v.content }))
      .filter((v) =>
        platform
          ? platform === "instagram"
            ? isInstagramUrl(v.embedUrl)
            : !isInstagramUrl(v.embedUrl)
          : true
      );
  },
  ["videos-v2"],
  { revalidate: 300, tags: ["content"] }
);

export async function getPublishedVideosWithFallback(take?: number, platform?: "youtube" | "instagram", skip?: number) {
  const cached = await getPublishedVideos(take, platform, skip);
  return cached ?? [];
}

export const getPublishedVideoBySlug = unstable_cache(
  async (slug: string) => {
    return dbSafe(
      () => prisma.video.findFirst({
        where: { slug, published: true, deletedAt: null },
        select: {
          id: true, title: true, slug: true, embedUrl: true,
          thumbnail: true, content: true, layout: true, createdAt: true,
          category: { select: { slug: true, name: true } },
        },
      }),
      null,
    );
  },
  ["video-by-slug-v2"],
  { revalidate: 300, tags: ["content"] }
);

export const getQuotes = unstable_cache(
  async () => {
    const result = await dbSafe(
      () => prisma.quote.findMany({
        orderBy: { createdAt: "asc" },
        select: { id: true, text: true, tag: true },
      }),
      null,
    );
    if (result && result.length > 0) return result;
    return null;
  },
  ["quotes-v2"],
  { revalidate: 300, tags: ["content"] }
);

export async function getQuotesWithFallback() {
  const cached = await getQuotes();
  return cached ?? [];
}

export const getPublishedBooks = unstable_cache(
  async (type?: "PUBLISHED" | "READ" | "EBOOK") => {
    const books = await dbSafe(
      () => prisma.book.findMany({
        where: { published: true, deletedAt: null, ...(type ? { type } : {}) },
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true, type: true, title: true, author: true, tagline: true,
          description: true, learning: true, note: true, imageUrl: true,
          buyUrl: true, free: true, featured: true, sortOrder: true,
          currentlyReading: true,
        },
      }),
      null,
    );
    if (books && books.length > 0) {
      console.log(`[content] getPublishedBooks(${type ?? "all"}): ${books.length} books from DB`);
      return books;
    }
    console.warn(`[content] getPublishedBooks: DB down, returning empty`);
    return [];
  },
  ["books-v2"],
  { revalidate: 300, tags: ["content"] }
);

// ── Blog listing helpers ──────────────────────────────────────────────

export const getPostCount = unstable_cache(
  async (where?: Record<string, unknown>) => {
    const count = await dbSafe(
      () => prisma.post.count({ where: where ?? VISIBLE_POST_WHERE }),
      null,
    );
    return count;
  },
  ["post-count-v2"],
  { revalidate: 300, tags: ["content"] }
);

export async function getPostCountWithFallback(where?: Record<string, unknown>) {
  const count = await getPostCount(where);
  return count ?? 0;
}

export const getVideoCount = unstable_cache(
  async () => {
    const count = await dbSafe(
      () => prisma.video.count({ where: { published: true, deletedAt: null } }),
      null,
    );
    return count;
  },
  ["video-count-v2"],
  { revalidate: 300, tags: ["content"] }
);

export async function getVideoCountWithFallback() {
  const count = await getVideoCount();
  return count ?? 0;
}

export const getPostList = unstable_cache(
  async (
    where: Record<string, unknown>,
    opts: { take: number; skip: number }
  ) => {
    const posts = await dbSafe(
      () => prisma.post.findMany({
        where,
        select: {
          id: true, slug: true, title: true, coverImage: true,
          publishedAt: true, excerpt: true, views: true, likes: true,
          category: { select: { name: true, slug: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: opts.take,
        skip: opts.skip,
      }),
      null,
    );
    return posts;
  },
  ["post-list-v2"],
  { revalidate: 300, tags: ["content"] }
);

export async function getPostListWithFallback(
  where: Record<string, unknown>,
  opts: { take: number; skip: number }
) {
  const posts = await getPostList(where, opts);
  return posts ?? [];
}

export const getFeaturedPosts = unstable_cache(
  async (where: Record<string, unknown>, take: number) => {
    const posts = await dbSafe(
      () => prisma.post.findMany({
        where,
        select: {
          id: true, slug: true, title: true, coverImage: true,
          publishedAt: true, excerpt: true, views: true, likes: true,
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        take,
      }),
      null,
    );
    return posts;
  },
  ["featured-posts-v2"],
  { revalidate: 300, tags: ["content"] }
);

export async function getFeaturedPostsWithFallback(where: Record<string, unknown>, take: number) {
  const posts = await getFeaturedPosts(where, take);
  if (posts && posts.length > 0) {
    console.log(`[content] getFeaturedPosts: ${posts.length} posts from DB`);
    return posts;
  }
  console.warn("[content] getFeaturedPosts: DB down, returning empty");
  return [];
}

export const getRelatedPosts = unstable_cache(
  async (postId: string, categoryId: string | null) => {
    const where = {
      ...VISIBLE_POST_WHERE,
      NOT: { id: postId },
      ...(categoryId ? { categoryId } : { categoryId: null }),
    };
    let related = await dbSafe(
      () => prisma.post.findMany({
        where,
        select: { title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
      null,
    );
    if (!related || related.length === 0) return [];
    if (related.length < 3) {
      related = await dbSafe(
        () => prisma.post.findMany({
          where: { ...VISIBLE_POST_WHERE, NOT: { id: postId } },
          select: { title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true },
          orderBy: { publishedAt: "desc" },
          take: 3,
        }),
        related,
      );
    }
    return (related ?? []).slice(0, 3);
  },
  ["related-posts-v2"],
  { revalidate: 300, tags: ["content"] }
);

// Active announcement — cached with unstable_cache, busted instantly by revalidatePublic() via "announcements" tag
const getActiveAnnouncementCached = unstable_cache(
  async () => {
    return dbSafe(
      () =>
        prisma.announcement.findFirst({
          where: { active: true },
          orderBy: { createdAt: "desc" },
        }),
      null
    );
  },
  ["active-announcement-v1"],
  { revalidate: 300, tags: ["announcements"] }
);

export const getActiveAnnouncement = cache(async () => {
  return getActiveAnnouncementCached();
});
