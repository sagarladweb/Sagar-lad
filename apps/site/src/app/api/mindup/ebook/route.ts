import { NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET /api/mindup/ebook — returns the free MindUp ebook metadata.
 * Used by the quiz results page to show the download offer.
 */
export async function GET() {
  const book = await dbSafe(
    () =>
      prisma.book.findFirst({
        where: {
          type: "EBOOK",
          free: true,
          published: true,
          deletedAt: null,
          fileKey: { not: null },
        },
        select: {
          id: true,
          title: true,
          tagline: true,
          description: true,
          imageUrl: true,
        },
        orderBy: { sortOrder: "asc" },
      }),
    null
  );

  if (!book) {
    return NextResponse.json({ error: "No free ebook available" }, { status: 404 });
  }

  return NextResponse.json(book);
}
