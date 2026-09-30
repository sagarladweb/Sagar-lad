import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

import { requireAdmin } from "@/lib/requireAdmin";
import { revalidatePublic } from "@/lib/revalidate";
import { NO_STORE_HEADERS } from "@/lib/cache-headers";
import { moveToTrash } from "@/lib/trash";
import { slugifyQuote } from "@sagarlad/quote-card";
export const runtime = "nodejs";

const quoteSchema = z
  .object({
    id: z.string().optional(),
    text: z.string().trim().min(1).max(500),
    tag: z.string().trim().min(1).max(50),
    highlightText: z.string().trim().max(200).nullish(),
    highlightColor: z.enum(["yellow", "blue"]).nullish(),
    author: z.string().trim().max(80).nullish(),
    published: z.boolean().nullish(),
  })
  .superRefine((v, ctx) => {
    const h = (v.highlightText ?? "").trim();
    if (h && !v.text.includes(h)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["highlightText"],
        message: "Highlight must be an exact phrase from the quote",
      });
    }
  });

async function uniqueSlug(text: string, ignoreId?: string): Promise<string> {
  const base = slugifyQuote(text);
  let slug = base;
  for (let n = 1; ; n++) {
    const clash = await prisma.quote.findUnique({ where: { slug }, select: { id: true } });
    if (!clash || clash.id === ignoreId) return slug;
    slug = `${base}-${n}`;
  }
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ quotes }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error("[quotes] GET failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }
  const { id, ...fields } = parsed.data;
  if (id) {
    return NextResponse.json({ error: "Use PUT to update" }, { status: 400 });
  }
  const data = {
    text: fields.text,
    tag: fields.tag,
    highlightText: fields.highlightText?.trim() ? fields.highlightText.trim() : null,
    highlightColor: fields.highlightColor ?? "yellow",
    author: fields.author?.trim() ? fields.author.trim() : null,
    published: fields.published ?? true,
    slug: await uniqueSlug(fields.text),
  };
  try {
    const quote = await prisma.quote.create({ data });
    revalidatePublic();
    return NextResponse.json({ quote }, { status: 201 });
  } catch (err) {
    console.error("[quotes] POST failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success || !parsed.data.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const { id, ...fields } = parsed.data;
  const existing = await prisma.quote.findUnique({ where: { id }, select: { slug: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Keep the existing slug so shared URLs never break (only backfill nulls).
  const slug = existing.slug ?? (await uniqueSlug(fields.text, id));
  const data = {
    text: fields.text,
    tag: fields.tag,
    highlightText: fields.highlightText?.trim() ? fields.highlightText.trim() : null,
    highlightColor: fields.highlightColor ?? "yellow",
    author: fields.author?.trim() ? fields.author.trim() : null,
    published: fields.published ?? true,
    slug,
  };
  try {
    const quote = await prisma.quote.update({ where: { id }, data });
    revalidatePublic();
    return NextResponse.json({ quote });
  } catch (err) {
    console.error("[quotes] PUT failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const row = await prisma.quote.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await moveToTrash("QUOTE", row.id, row.text.slice(0, 120), row);
    await prisma.quote.delete({ where: { id } });
    revalidatePublic();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[quotes] DELETE failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}