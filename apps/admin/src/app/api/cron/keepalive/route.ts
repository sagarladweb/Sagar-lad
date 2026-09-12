import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";

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

  try {
    // Lightweight ping — keeps Supabase free tier alive
    await prisma.post.findFirst({ select: { id: true } });
    return NextResponse.json({
      status: "active",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cron] keepalive failed:", err);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
