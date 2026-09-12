import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

import { requireAdmin } from "@/lib/requireAdmin";
import { revalidatePublic } from "@/lib/revalidate";
import { NO_STORE_HEADERS } from "@/lib/cache-headers";
export const runtime = "nodejs";

const lifeRazorSchema = z.object({
  pill: z.string().trim().min(1).max(100),
  heading: z.string().trim().min(1).max(200),
  accent: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1).max(1000),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = await prisma.lifeRazor.findUnique({ where: { id: "default" } });
    return NextResponse.json({ lifeRazor: data }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error("[liferazor] GET failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = lifeRazorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const data = await prisma.lifeRazor.upsert({
      where: { id: "default" },
      update: parsed.data,
      create: { id: "default", ...parsed.data },
    });
    revalidatePublic();
    return NextResponse.json({ lifeRazor: data });
  } catch (err) {
    console.error("[liferazor] PUT failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
