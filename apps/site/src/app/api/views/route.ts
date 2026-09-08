import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimitByIp, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const postSlug = body?.postSlug;
    if (!postSlug || typeof postSlug !== "string") {
      return NextResponse.json({ error: "Missing postSlug" }, { status: 400 });
    }

    const ip = getClientIp(request);

    // Dedup: 1 view per IP per post per 24h (generous — avoids counting repeat visits)
    const { ok } = await rateLimitByIp(`view:${ip}:${postSlug}`, 1, 24 * 60 * 60_000);
    if (!ok) {
      // Already counted today — return current views without incrementing
      const post = await prisma.post.findUnique({
        where: { slug: postSlug },
        select: { views: true },
      }).catch(() => null);
      return NextResponse.json({ views: post?.views ?? 0 });
    }

    const post = await prisma.post.findUnique({
      where: { slug: postSlug },
      select: { id: true, views: true },
    }).catch(() => null);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const updated = await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
      select: { views: true },
    }).catch(() => null);

    return NextResponse.json({ views: updated?.views ?? post.views + 1 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
