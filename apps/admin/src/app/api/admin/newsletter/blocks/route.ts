import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import { NO_STORE_HEADERS } from "@/lib/cache-headers";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [booksRead, booksPublished, ebooks, quotes, videos, blogs] = await Promise.all([
      prisma.book.findMany({
        where: { type: "READ", published: true, deletedAt: null },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        select: { id: true, title: true, author: true, note: true, imageUrl: true, buyUrl: true },
      }),
      prisma.book.findMany({
        where: { type: "PUBLISHED", published: true, deletedAt: null },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        select: { id: true, title: true, tagline: true, buyUrl: true, imageUrl: true },
      }),
      prisma.book.findMany({
        where: { type: "EBOOK", published: true, deletedAt: null },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        select: { id: true, title: true, description: true, free: true, imageUrl: true, buyUrl: true },
      }),
      prisma.quote.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { id: true, text: true, tag: true },
      }),
      prisma.video.findMany({
        where: { published: true, deletedAt: null },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 20,
        select: { id: true, title: true, embedUrl: true, thumbnail: true, slug: true },
      }),
      prisma.post.findMany({
        where: { published: true, deletedAt: null },
        orderBy: { publishedAt: "desc" },
        take: 20,
        select: { id: true, title: true, slug: true, excerpt: true, coverImage: true },
      }),
    ]);

    return NextResponse.json(
      { booksRead, booksPublished, ebooks, quotes, videos, blogs },
      { headers: NO_STORE_HEADERS },
    );
  } catch (err) {
    console.error("[newsletter/blocks] GET failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
