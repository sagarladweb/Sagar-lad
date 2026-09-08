import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimitByIp, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { ok, retryAfter } = await rateLimitByIp(`like:${ip}`, 20, 60_000);
    if (!ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    const body = await request.json().catch(() => null);
    const postSlug = body?.postSlug;
    const clientToken = body?.clientToken;
    const action = body?.action;

    if (
      !postSlug || typeof postSlug !== "string" ||
      !clientToken || typeof clientToken !== "string" ||
      (action !== "like" && action !== "unlike")
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const safeSlug = postSlug.replace(/[^a-z0-9-]/g, "").slice(0, 200);
    const safeToken = clientToken.replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);

    const post = await prisma.post.findUnique({
      where: { slug: safeSlug },
      select: { id: true, likes: true },
    }).catch(() => null);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (action === "like") {
      // Check for existing like event (server-side dedup)
      const existing = await prisma.postLikeEvent.findUnique({
        where: { postSlug_clientToken: { postSlug: safeSlug, clientToken: safeToken } },
        select: { id: true },
      }).catch(() => null);

      if (existing) {
        // Already liked — return current count, no-op
        return NextResponse.json({ likes: post.likes, liked: true });
      }

      // Create like event + increment atomically
      const [, updated] = await prisma.$transaction([
        prisma.postLikeEvent.create({
          data: { postSlug: safeSlug, clientToken: safeToken },
        }),
        prisma.post.update({
          where: { id: post.id },
          data: { likes: { increment: 1 } },
          select: { likes: true },
        }),
      ]);

      return NextResponse.json({ likes: updated.likes, liked: true });
    } else {
      // Unlike: remove event + decrement (floor at 0)
      const existing = await prisma.postLikeEvent.findUnique({
        where: { postSlug_clientToken: { postSlug: safeSlug, clientToken: safeToken } },
        select: { id: true },
      }).catch(() => null);

      if (!existing) {
        // Never liked — return current count, no-op
        return NextResponse.json({ likes: post.likes, liked: false });
      }

      const newLikes = Math.max(0, post.likes - 1);

      const [, updated] = await prisma.$transaction([
        prisma.postLikeEvent.delete({
          where: { postSlug_clientToken: { postSlug: safeSlug, clientToken: safeToken } },
        }),
        prisma.post.update({
          where: { id: post.id },
          data: { likes: newLikes },
          select: { likes: true },
        }),
      ]);

      return NextResponse.json({ likes: updated.likes, liked: false });
    }
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
