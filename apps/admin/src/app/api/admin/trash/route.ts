import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { requireAdmin } from "@/lib/requireAdmin";
import { revalidatePublic } from "@/lib/revalidate";
import { NO_STORE_HEADERS } from "@/lib/cache-headers";

export const runtime = "nodejs";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysLeft(expiresAt: Date): number {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / DAY_MS));
}

// Archive box contents: trashed snapshots + soft-deleted posts.
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [items, posts] = await Promise.all([
      prisma.trashItem.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, entityType: true, title: true, createdAt: true, expiresAt: true },
      }),
      prisma.post.findMany({
        where: { deletedAt: { not: null } },
        orderBy: { deletedAt: "desc" },
        select: { id: true, title: true, slug: true, views: true, likes: true, deletedAt: true },
      }),
    ]);
    return NextResponse.json(
      {
        items: items.map((t) => ({ ...t, daysLeft: daysLeft(t.expiresAt), kind: "trash" as const })),
        posts: posts.map((p) => ({
          ...p,
          expiresAt: new Date(new Date(p.deletedAt!).getTime() + 15 * DAY_MS),
          daysLeft: daysLeft(new Date(new Date(p.deletedAt!).getTime() + 15 * DAY_MS)),
          kind: "post" as const,
        })),
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("[trash] GET failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

const actionSchema = z.object({
  action: z.enum(["restore", "purge"]),
  kind: z.enum(["trash", "post"]),
  id: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { action, kind, id } = parsed.data;

  try {
    // ── Soft-deleted posts ──────────────────────────────────────────
    if (kind === "post") {
      const post = await prisma.post.findUnique({ where: { id } });
      if (!post || !post.deletedAt) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (action === "restore") {
        await prisma.post.update({ where: { id }, data: { deletedAt: null } });
        try { await revalidatePublic(); } catch {}
        return NextResponse.json({ ok: true });
      }
      await prisma.post.delete({ where: { id } });
      try { await revalidatePublic(); } catch {}
      return NextResponse.json({ ok: true });
    }

    // ── Trashed snapshots ───────────────────────────────────────────
    const item = await prisma.trashItem.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (action === "purge") {
      await prisma.trashItem.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }

    // Restore: re-create the row from its snapshot under the original id.
    const snap = (item.snapshot ?? {}) as Record<string, unknown>;
    try {
      switch (item.entityType) {
        case "ANNOUNCEMENT":
          await prisma.announcement.create({ data: snap as never });
          break;
        case "BOOK":
          await prisma.book.create({ data: snap as never });
          break;
        case "VIDEO":
          await prisma.video.create({ data: snap as never });
          break;
        case "QUOTE":
          await prisma.quote.create({ data: snap as never });
          break;
        case "CATEGORY":
          await prisma.category.create({ data: snap as never });
          break;
        case "CAMPAIGN": {
          const { ...data } = snap;
          await prisma.newsletterCampaign.create({ data: data as never });
          break;
        }
        case "SUBSCRIBER":
          await prisma.newsletterSubscriber.create({ data: snap as never });
          break;
        case "COMMENT": {
          // Drop the embedded post relation (included at delete time).
          const data = { ...(snap as Record<string, unknown>) };
          delete data.post;
          await prisma.comment.create({ data: data as never });
          break;
        }
        case "ENQUIRY":
          await prisma.contactRequest.create({ data: snap as never });
          break;
        default:
          return NextResponse.json({ error: "Unknown item type" }, { status: 400 });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      // P2002: a row with the same id/slug/email already exists.
      // P2003/P2025: a related row (post, category) is gone.
      if (message.includes("Unique constraint") || message.includes("P2002"))
        return NextResponse.json({ error: "Already exists — cannot restore over it." }, { status: 409 });
      if (message.includes("P2003") || message.includes("P2025") || message.includes("Foreign key"))
        return NextResponse.json(
          { error: "Cannot restore — the related post or category no longer exists." },
          { status: 409 }
        );
      throw err;
    }
    await prisma.trashItem.delete({ where: { id } });
    try { await revalidatePublic(); } catch {}
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[trash] POST failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
