import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

import { requireAdmin } from "@/lib/requireAdmin";
import { revalidatePublic } from "@/lib/revalidate";
import { NO_STORE_HEADERS } from "@/lib/cache-headers";
import { moveToTrash } from "@/lib/trash";
import { mobileBrandFromUA } from "@/lib/visitor";
import { locateIps } from "@/lib/geo";
export const runtime = "nodejs";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [subscribers, comments, enquiries] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        orderBy: { createdAt: "desc" },
        take: 500,
        select: { id: true, email: true, unsubscribed: true, createdAt: true },
      }),
      prisma.comment.findMany({
        include: { post: { select: { title: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
      prisma.contactRequest.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
    ]);

    // Minimal visitor context: mobile brand from UA + location when resolvable.
    const locByIp = await locateIps(comments.map((c) => c.ip));
    const enriched = comments.map((c) => ({
      ...c,
      brand: mobileBrandFromUA(c.userAgent),
      location: locByIp.get(c.ip ?? "") ?? null,
    }));

    return NextResponse.json({ subscribers, comments: enriched, enquiries }, { headers: NO_STORE_HEADERS });
  } catch (err) {
    console.error("[moderation] GET failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const schema = z.object({
    kind: z.enum(["subscriber", "comment", "enquiry"]),
    id: z.string().min(1).optional(),
    ids: z.array(z.string().min(1)).optional(),
    action: z.enum(["delete"]),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const ids = parsed.data.ids ?? (parsed.data.id ? [parsed.data.id] : []);
  if (!ids.length) return NextResponse.json({ error: "No ids" }, { status: 400 });

  if (parsed.data.action !== "delete") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    // Snapshot every row into the Archive box first so deletes are restorable.
    if (parsed.data.kind === "subscriber") {
      const rows = await prisma.newsletterSubscriber.findMany({ where: { id: { in: ids } } });
      for (const r of rows) await moveToTrash("SUBSCRIBER", r.id, r.email, r);
      await prisma.newsletterSubscriber.deleteMany({ where: { id: { in: ids } } });
    } else if (parsed.data.kind === "comment") {
      const rows = await prisma.comment.findMany({
        where: { id: { in: ids } },
        include: { post: { select: { title: true } } },
      });
      for (const r of rows)
        await moveToTrash("COMMENT", r.id, `${r.name} on “${r.post.title}”`, r);
      await prisma.comment.deleteMany({ where: { id: { in: ids } } });
    } else if (parsed.data.kind === "enquiry") {
      const rows = await prisma.contactRequest.findMany({ where: { id: { in: ids } } });
      for (const r of rows)
        await moveToTrash("ENQUIRY", r.id, `${r.firstName} ${r.lastName ?? ""} · ${r.email}`.trim(), r);
      await prisma.contactRequest.deleteMany({ where: { id: { in: ids } } });
    }

    if (parsed.data.kind === "comment") revalidatePublic();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[moderation] PATCH failed:", (err as Error).message);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}