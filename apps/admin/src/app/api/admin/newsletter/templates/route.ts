import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";

export const runtime = "nodejs";

// Client-generated id (uid("saved")) so upserts are trivial.
const templateSchema = z.object({
  id: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(200),
  theme: z.unknown().optional(),
  blocks: z.array(z.unknown()),
});

function toSavedTemplate(row: {
  id: string;
  name: string;
  theme: unknown;
  blocks: unknown;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    name: row.name,
    kind: "saved" as const,
    theme: row.theme ?? null,
    blocks: row.blocks,
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
  };
}

// List the admin's saved composer templates (server-side copy; localStorage
// stays as the instant-load cache).
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rows = await prisma.newsletterTemplate.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ templates: rows.map(toSavedTemplate) });
  } catch (err) {
    console.error("[templates] GET failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

// Create or update a template (upsert by client id).
export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = templateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid template" }, { status: 400 });
  }

  try {
    const { id, name, theme, blocks } = parsed.data;
    const row = await prisma.newsletterTemplate.upsert({
      where: { id },
      create: { id, name, theme: (theme ?? undefined) as object | undefined, blocks: blocks as object[] },
      update: { name, theme: (theme ?? undefined) as object | undefined, blocks: blocks as object[] },
    });
    return NextResponse.json({ template: toSavedTemplate(row) });
  } catch (err) {
    console.error("[templates] POST failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

// Delete a template.
export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    await prisma.newsletterTemplate.deleteMany({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[templates] DELETE failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
