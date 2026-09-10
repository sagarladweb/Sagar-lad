import { NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET /api/mindup/ebook — returns reward books for the quiz results page.
 * Returns all books where isReward=true, published, not deleted, with a fileKey or buyUrl.
 */
export async function GET() {
  const books = await dbSafe(
    () =>
      prisma.book.findMany({
        where: {
          isReward: true,
          published: true,
          deletedAt: null,
          OR: [{ fileKey: { not: null } }, { buyUrl: { not: null } }],
        },
        select: {
          id: true,
          title: true,
          tagline: true,
          description: true,
          imageUrl: true,
          fileKey: true,
        },
        orderBy: { sortOrder: "asc" },
      }),
    []
  );

  return NextResponse.json(books);
}
