import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { dbSafe } from "@/lib/db";
import { prisma } from "@/lib/db";
import { SITE, VISIBLE_POST_WHERE } from "@/lib/site";

export const revalidate = 300;

const STATIC_PATHS: { path: string; priority: number; changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" }[] = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/about", priority: 0.9, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.9, changeFrequency: "daily" },
  { path: "/books", priority: 0.8, changeFrequency: "monthly" },
  { path: "/books-read", priority: 0.7, changeFrequency: "monthly" },
  { path: "/speaking", priority: 0.8, changeFrequency: "monthly" },
  { path: "/mentorship", priority: 0.8, changeFrequency: "monthly" },
  { path: "/videos", priority: 0.8, changeFrequency: "weekly" },
  { path: "/hire-me", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/newsletter", priority: 0.7, changeFrequency: "monthly" },
  { path: "/quotes", priority: 0.6, changeFrequency: "monthly" },
  { path: "/socials", priority: 0.6, changeFrequency: "monthly" },
  { path: "/ebooks", priority: 0.6, changeFrequency: "monthly" },
  { path: "/content", priority: 0.6, changeFrequency: "weekly" },
  { path: "/mindup-score", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

const getCachedSitemapData = unstable_cache(
  async () => {
    const [posts, videos] = await Promise.all([
      dbSafe(
        () =>
          prisma.post.findMany({
            where: VISIBLE_POST_WHERE,
            select: { slug: true, updatedAt: true },
          }),
        []
      ),
      dbSafe(
        () =>
          prisma.video.findMany({
            where: { published: true, deletedAt: null },
            select: { slug: true, createdAt: true },
          }),
        []
      ),
    ]);
    return { posts, videos };
  },
  ["sitemap-data-v1"],
  { revalidate: 300, tags: ["content"] }
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { posts, videos } = await getCachedSitemapData();

  return [
    ...STATIC_PATHS.map((p) => ({
      url: `${SITE.url}${p.path}`,
      lastModified: new Date(),
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...posts.map((post) => ({
      url: `${SITE.url}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...videos
      .filter((v) => v.slug)
      .map((video) => ({
        url: `${SITE.url}/videos/${video.slug}`,
        lastModified: video.createdAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ];
}
