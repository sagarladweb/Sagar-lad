import { unstable_cache } from "next/cache";
import { cache } from "react";
import { prisma, dbSafe } from "@/lib/db";
import { isInstagramUrl } from "@/lib/instagram";
import { VISIBLE_POST_WHERE } from "@/lib/site";
import { getEngagement } from "@/lib/engagement";
import { withMemoryCache } from "@/lib/memory-cache";

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
  { revalidate: process.env.NODE_ENV === "production" ? 604800 : 1, tags: ["content", "posts"] }
);

export const getPostBySlug = cache(async (slug: string) => {
  return withMemoryCache(
    `content:post-by-slug:${slug}`,
    () => getPostBySlugCached(slug),
    { ttlMs: 10 * 60_000, swrMs: 24 * 60 * 60_000, tags: ["content", "posts"] }
  );
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
  return withMemoryCache(
    "content:categories",
    async () => {
      const cached = await getCategories();
      return cached ?? [];
    },
    { ttlMs: 5 * 60_000, swrMs: 60 * 60_000, tags: ["content", "categories"] }
  );
}

export const getPublishedVideos = unstable_cache(
  async (take?: number, platform?: "youtube" | "instagram", skip?: number) => {
    // Push platform filter to DB instead of filtering in JS
    const platformFilter =
      platform === "instagram"
        ? { embedUrl: { contains: "instagram.com" } }
        : platform === "youtube"
          ? { embedUrl: { not: { contains: "instagram.com" } } }
          : {};

    const rows = await dbSafe(
      () => prisma.video.findMany({
        where: { published: true, deletedAt: null, ...platformFilter },
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
    return rows.map((v) => ({ ...v, content: v.content }));
  },
  ["videos-v2"],
  { revalidate: 300, tags: ["content"] }
);

export async function getPublishedVideosWithFallback(take?: number, platform?: "youtube" | "instagram", skip?: number) {
  const cacheKey = `content:videos:${take ?? "all"}:${platform ?? "all"}:${skip ?? 0}`;
  return withMemoryCache(
    cacheKey,
    async () => {
      const cached = await getPublishedVideos(take, platform, skip);
      return cached ?? [];
    },
    { ttlMs: 5 * 60_000, swrMs: 60 * 60_000, tags: ["content", "videos"] }
  );
}

const getPublishedVideoBySlugCached = unstable_cache(
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

export const getPublishedVideoBySlug = cache(async (slug: string) => {
  return withMemoryCache(
    `content:video:${slug}`,
    () => getPublishedVideoBySlugCached(slug),
    { ttlMs: 10 * 60_000, swrMs: 24 * 60 * 60_000, tags: ["content", "videos"] }
  );
});

const QUOTE_SELECT = {
  id: true,
  text: true,
  tag: true,
  slug: true,
  highlightText: true,
  highlightColor: true,
  author: true,
} as const;

export const getQuotes = unstable_cache(
  async () => {
    const result = await dbSafe(
      () => prisma.quote.findMany({
        where: { published: true },
        orderBy: { createdAt: "asc" },
        select: QUOTE_SELECT,
      }),
      null,
    );
    if (result && result.length > 0) return result;
    return null;
  },
  ["quotes-v3"],
  { revalidate: 300, tags: ["content"] }
);

export async function getQuotesWithFallback() {
  return withMemoryCache(
    "content:quotes",
    async () => {
      const cached = await getQuotes();
      return cached ?? [];
    },
    { ttlMs: 10 * 60_000, swrMs: 24 * 60 * 60_000, tags: ["content", "quotes"] }
  );
}

const getQuoteBySlugCached = unstable_cache(
  async (slug: string) => {
    return dbSafe(async () => {
      const bySlug = await prisma.quote.findFirst({
        where: { slug, published: true },
        select: QUOTE_SELECT,
      });
      if (bySlug) return bySlug;
      // Legacy fallback: old shares may carry the row id.
      return prisma.quote.findFirst({
        where: { id: slug, published: true },
        select: QUOTE_SELECT,
      });
    }, null);
  },
  ["quote-by-slug"],
  { revalidate: 300, tags: ["content"] }
);

export const getQuoteBySlug = cache(async (slug: string) => {
  return withMemoryCache(
    `content:quote:${slug}`,
    () => getQuoteBySlugCached(slug),
    { ttlMs: 10 * 60_000, swrMs: 24 * 60 * 60_000, tags: ["content", "quotes"] }
  );
});

const getPublishedBooksCached = unstable_cache(
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
      return books;
    }
    return [];
  },
  ["books-v2"],
  { revalidate: 300, tags: ["content"] }
);

export async function getPublishedBooks(type?: "PUBLISHED" | "READ" | "EBOOK") {
  return withMemoryCache(
    `content:books:${type ?? "all"}`,
    () => getPublishedBooksCached(type),
    { ttlMs: 5 * 60_000, swrMs: 60 * 60_000, tags: ["content", "books"] }
  );
}

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
  return withMemoryCache(
    `content:post-count:${JSON.stringify(where ?? {})}`,
    async () => {
      const count = await getPostCount(where);
      return count ?? 0;
    },
    { ttlMs: 5 * 60_000, swrMs: 60 * 60_000, tags: ["content", "posts"] }
  );
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
  return withMemoryCache(
    "content:video-count",
    async () => {
      const count = await getVideoCount();
      return count ?? 0;
    },
    { ttlMs: 5 * 60_000, swrMs: 60 * 60_000, tags: ["content", "videos"] }
  );
}

export const getTotalBlogViews = unstable_cache(
  async () => {
    const posts = await dbSafe(
      () =>
        prisma.post.findMany({
          where: {
            published: true,
            deletedAt: null,
            OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
          },
          select: { slug: true, publishedAt: true, views: true },
        }),
      null
    );
    if (!posts || posts.length === 0) return 0;
    return posts.reduce((sum, post) => {
      const algorithmViews = getEngagement(
        post.slug,
        new Date(post.publishedAt).toISOString()
      ).views;
      const realViews = post.views ?? 0;
      return sum + algorithmViews + realViews;
    }, 0);
  },
  ["total-blog-views-v2"],
  { revalidate: 60, tags: ["content", "posts"] }
);

export async function getTotalBlogViewsWithFallback() {
  return withMemoryCache(
    "content:total-blog-views",
    async () => {
      const count = await getTotalBlogViews();
      return count ?? 0;
    },
    { ttlMs: 60_000, swrMs: 15 * 60_000, tags: ["content", "posts"] }
  );
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
  const cacheKey = `content:post-list:${JSON.stringify(where)}:${opts.take}:${opts.skip}`;
  return withMemoryCache(
    cacheKey,
    async () => {
      const posts = await getPostList(where, opts);
      return posts ?? [];
    },
    { ttlMs: 5 * 60_000, swrMs: 60 * 60_000, tags: ["content", "posts"] }
  );
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
  const cacheKey = `content:featured-posts:${take}:${JSON.stringify(where)}`;
  return withMemoryCache(
    cacheKey,
    async () => {
      const posts = await getFeaturedPosts(where, take);
      return posts ?? [];
    },
    { ttlMs: 5 * 60_000, swrMs: 60 * 60_000, tags: ["content", "posts"] }
  );
}

const getRelatedPostsCached = unstable_cache(
  async (postId: string, categoryId: string | null) => {
    const where = {
      ...VISIBLE_POST_WHERE,
      NOT: { id: postId },
      ...(categoryId ? { categoryId } : { categoryId: null }),
    };
    let related = await dbSafe(
      () => prisma.post.findMany({
        where,
        select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true, views: true, likes: true, category: { select: { name: true, slug: true } } },
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
          select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true, views: true, likes: true, category: { select: { name: true, slug: true } } },
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

export const getRelatedPosts = async (postId: string, categoryId: string | null) => {
  return withMemoryCache(
    `content:related:${postId}:${categoryId ?? "none"}`,
    () => getRelatedPostsCached(postId, categoryId),
    { ttlMs: 10 * 60_000, swrMs: 24 * 60 * 60_000, tags: ["content", "posts"] }
  );
};

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
  return withMemoryCache(
    "content:active-announcement",
    () => getActiveAnnouncementCached(),
    { ttlMs: 2 * 60_000, swrMs: 30 * 60_000, tags: ["announcements"] }
  );
});
