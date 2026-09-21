import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import { revalidatePublic } from "@/lib/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Strip HTML tags */
function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, "").trim();
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body?.commentId || !body?.content) {
      return NextResponse.json({ error: "commentId and content required" }, { status: 400 });
    }

    const parent = await prisma.comment.findUnique({
      where: { id: body.commentId },
      select: { id: true, postId: true, parentId: true },
    });
    if (!parent) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    // Can't reply to a reply — only top-level
    if (parent.parentId) {
      return NextResponse.json({ error: "Cannot reply to a reply" }, { status: 400 });
    }

    const reply = await prisma.comment.create({
      data: {
        name: "Sagar Lad",
        content: stripTags(body.content),
        postId: parent.postId,
        parentId: parent.id,
        approved: true,
      },
    });

    revalidatePublic();

    return NextResponse.json({ ok: true, id: reply.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
