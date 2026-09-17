import { NextResponse } from "next/server";
import { prisma, dbSafe } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await dbSafe(
    () =>
      prisma.newsletterSiteSettings.upsert({
        where: { id: "default" },
        update: {},
        create: { id: "default", showArchive: true },
      }),
    { id: "default", showArchive: true, updatedAt: new Date() }
  );

  return NextResponse.json({ showArchive: settings.showArchive });
}

export async function PUT(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const showArchive = Boolean(body.showArchive);

  const settings = await dbSafe(
    () =>
      prisma.newsletterSiteSettings.upsert({
        where: { id: "default" },
        update: { showArchive },
        create: { id: "default", showArchive },
      }),
    null
  );

  if (!settings) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  return NextResponse.json({ showArchive: settings.showArchive });
}
