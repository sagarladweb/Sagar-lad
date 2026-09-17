import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma, dbSafe } from "@/lib/db";

export const runtime = "nodejs";

type Props = { params: Promise<{ id: string }> };

const getCampaign = unstable_cache(
  async (id: string) =>
    dbSafe(
      () =>
        prisma.newsletterCampaign.findUnique({
          where: { id, draft: false },
          select: { id: true, subject: true, html: true, createdAt: true },
        }),
      null
    ),
  ["newsletter-issue"],
  { revalidate: 3600, tags: ["content", "newsletter"] }
);

export async function GET(_request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const campaign = await getCampaign(id);

    if (!campaign) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(
      { campaign },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
