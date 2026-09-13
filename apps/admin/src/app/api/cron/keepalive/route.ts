import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { processNewsletterQueue } from "@/lib/newsletter";

export const runtime = "nodejs";

function constantTimeCompare(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length);
  return crypto.timingSafeEqual(
    Buffer.from(a.padEnd(maxLen)),
    Buffer.from(b.padEnd(maxLen))
  );
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { status: "error", message: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!constantTimeCompare(token, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let publishedPosts = 0;
  let newsletterResult = null;

  try {
    // 1. Publish scheduled posts whose time has come
    const due = await prisma.post.updateMany({
      where: {
        published: false,
        scheduledAt: { not: null, lte: now },
        deletedAt: null,
      },
      data: {
        published: true,
        publishedAt: now,
        scheduledAt: null,
      },
    });
    publishedPosts = due.count;

    // 2. Lightweight ping — keeps Supabase free tier alive
    await prisma.post.findFirst({ select: { id: true } });

    // 3. Drain newsletter queue (respects 300/day limit, chunking & schedules)
    newsletterResult = await processNewsletterQueue();

    return NextResponse.json({
      status: "active",
      timestamp: now.toISOString(),
      publishedPosts,
      newsletter: newsletterResult,
    });
  } catch (err) {
    console.error("[cron] keepalive failed:", err);
    return NextResponse.json(
      { status: "error", message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
