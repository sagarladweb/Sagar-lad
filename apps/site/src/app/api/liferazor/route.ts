import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const getLifeRazor = unstable_cache(
  async () =>
    prisma.lifeRazor.findUnique({
      where: { id: "default" },
      select: { id: true, pill: true, heading: true, accent: true, description: true },
    }),
  ["site-liferazor"],
  { revalidate: 3600, tags: ["liferazor"] }
);

export async function GET() {
  try {
    const data = await getLifeRazor();
    return NextResponse.json(
      { lifeRazor: data },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } }
    );
  } catch (err) {
    console.warn("[api/liferazor] DB unavailable:", (err as Error).message);
    return NextResponse.json({ lifeRazor: null });
  }
}
