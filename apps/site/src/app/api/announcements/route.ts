import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const getActiveAnnouncements = unstable_cache(
  async () =>
    prisma.announcement.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        buttonText: true,
        buttonLink: true,
        barText: true,
        barLink: true,
        barStyle: true,
        barSpeed: true,
        barBgColor: true,
        barColor: true,
        eventDate: true,
      },
    }),
  ["api-announcements-v1"],
  { revalidate: 300, tags: ["announcements"] }
);

export async function GET() {
  try {
    const announcements = await getActiveAnnouncements();
    return NextResponse.json(
      { announcements },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } }
    );
  } catch {
    return NextResponse.json({ announcements: [] });
  }
}
