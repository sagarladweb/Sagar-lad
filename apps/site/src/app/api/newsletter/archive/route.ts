import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma, dbSafe } from "@/lib/db";

export const runtime = "nodejs";

const PAGE_SIZE = 20;

const getCachedShowArchive = unstable_cache(
  async () =>
    dbSafe(
      () =>
        prisma.newsletterSiteSettings.findUnique({
          where: { id: "default" },
          select: { showArchive: true },
        }),
      { showArchive: true }
    ),
  ["newsletter-show-archive"],
  { revalidate: 300, tags: ["content", "newsletter-settings"] }
);

const getCachedCampaigns = unstable_cache(
  async (page: number) => {
    const skip = (page - 1) * PAGE_SIZE;
    const [campaigns, total] = await Promise.all([
      dbSafe(
        () =>
          prisma.newsletterCampaign.findMany({
            where: { draft: false },
            select: { id: true, subject: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            skip,
            take: PAGE_SIZE,
          }),
        []
      ),
      dbSafe(
        () => prisma.newsletterCampaign.count({ where: { draft: false } }),
        0
      ),
    ]);
    return { campaigns, total, page, pageSize: PAGE_SIZE };
  },
  ["newsletter-archive-v2"],
  { revalidate: 300, tags: ["content", "newsletter"] }
);

export async function GET(request: Request) {
  try {
    const settings = await getCachedShowArchive();
    if (!settings?.showArchive) {
      return NextResponse.json(
        { campaigns: [], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 0, showArchive: false },
        { headers: { "Cache-Control": "public, max-age=60" } }
      );
    }

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const data = await getCachedCampaigns(page);

    return NextResponse.json(
      {
        campaigns: data.campaigns,
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: Math.ceil(data.total / data.pageSize),
        showArchive: true,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { campaigns: [], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 0, showArchive: true },
      { headers: { "Cache-Control": "public, max-age=30" } }
    );
  }
}
