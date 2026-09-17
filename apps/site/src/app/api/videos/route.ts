import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma, dbSafe } from "@/lib/db";

export const runtime = "nodejs";

const PAGE_SIZE = 12;

const getCachedVideos = unstable_cache(
  async (platform: string | null, limit: number, cursor: string | null) => {
    const platformFilter =
      platform === "instagram"
        ? { embedUrl: { contains: "instagram.com" } }
        : platform === "youtube"
          ? { embedUrl: { not: { contains: "instagram.com" } } }
          : {};

    return dbSafe(
      () =>
        prisma.video.findMany({
          where: { published: true, deletedAt: null, ...platformFilter },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
          take: limit + 1,
          select: {
            id: true,
            title: true,
            slug: true,
            embedUrl: true,
            thumbnail: true,
            content: true,
            category: { select: { slug: true } },
          },
        }),
      []
    );
  },
  ["videos-list-v1"],
  { revalidate: 60, tags: ["content"] }
);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const platform = url.searchParams.get("platform");
    const limitRaw = Number(url.searchParams.get("limit") ?? PAGE_SIZE);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(Math.trunc(limitRaw), 1), 48)
      : PAGE_SIZE;

    const all = await getCachedVideos(platform, limit, cursor);

    const hasNext = all.length > limit;
    const page = hasNext ? all.slice(0, limit) : all;
    const nextCursor = hasNext ? page[page.length - 1].id : null;

    return NextResponse.json({ videos: page, nextCursor });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
