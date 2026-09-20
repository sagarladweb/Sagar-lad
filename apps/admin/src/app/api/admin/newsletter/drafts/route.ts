import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import { buildTemplateBody, type NewsletterContent } from "@/lib/newsletterTemplates";
import { compileNewsletterToHtml, type DbData } from "@/components/newsletter-composer/lib/compiler";

export const runtime = "nodejs";

const draftSchema = z.object({
  id: z.string().optional(),
  subject: z.string().trim().max(200).default(""),
  html: z.string().optional(),
  content: z.unknown(),
});

async function fetchDbData(): Promise<DbData> {
  const [booksRead, booksPublished, ebooks, quotes, videos, blogs] = await Promise.all([
    prisma.book.findMany({ where: { type: "READ", published: true, deletedAt: null }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], select: { id: true, title: true, author: true, note: true, imageUrl: true, buyUrl: true } }),
    prisma.book.findMany({ where: { type: "PUBLISHED", published: true, deletedAt: null }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], select: { id: true, title: true, tagline: true, buyUrl: true, imageUrl: true } }),
    prisma.book.findMany({ where: { type: "EBOOK", published: true, deletedAt: null }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], select: { id: true, title: true, description: true, free: true, imageUrl: true, buyUrl: true } }),
    prisma.quote.findMany({ orderBy: { createdAt: "desc" }, take: 30, select: { id: true, text: true, tag: true } }),
    prisma.video.findMany({ where: { published: true, deletedAt: null }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take: 20, select: { id: true, title: true, embedUrl: true, thumbnail: true, slug: true } }),
    prisma.post.findMany({ where: { published: true, deletedAt: null }, orderBy: { publishedAt: "desc" }, take: 20, select: { id: true, title: true, slug: true, excerpt: true, coverImage: true } }),
  ]);
  return { booksRead, booksPublished, ebooks, quotes, videos, blogs };
}

// Save (or update) an unsent newsletter so the admin can come back to it later.
export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = draftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid draft" }, { status: 400 });
  }

  try {
    const content = parsed.data.content as any;
    let html = parsed.data.html || "";
    if (!html) {
      if (content && Array.isArray(content.blocks)) {
        const dbData = await fetchDbData().catch(() => ({} as DbData));
        html = compileNewsletterToHtml(content, "test", dbData);
      } else if (content?.template) {
        html = buildTemplateBody(content.template ?? "letter", content as NewsletterContent);
      }
    }

    if (parsed.data.id) {
      const existing = await prisma.newsletterCampaign.findFirst({
        where: { id: parsed.data.id, draft: true },
        select: { id: true },
      });
      if (!existing) {
        return NextResponse.json({ error: "Draft not found" }, { status: 404 });
      }
      const campaign = await prisma.newsletterCampaign.update({
        where: { id: existing.id },
        data: {
          subject: parsed.data.subject,
          html,
          contentJson: content as object,
        },
      });
      return NextResponse.json({ campaign });
    }

    const campaign = await prisma.newsletterCampaign.create({
      data: {
        subject: parsed.data.subject,
        html,
        contentJson: content as object,
        draft: true,
      },
    });
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (err) {
    console.error("[drafts] POST failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

// Drop a draft.
export async function DELETE(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    await prisma.newsletterCampaign.deleteMany({ where: { id, draft: true } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[drafts] DELETE failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}