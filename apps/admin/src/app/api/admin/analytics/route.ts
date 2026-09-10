import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { NO_STORE_HEADERS } from "@/lib/cache-headers";
import { getGaAnalytics } from "@/lib/analytics";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const url = new URL(request.url);
    const requested = Number(url.searchParams.get("days") ?? 14);
    const days = Number.isFinite(requested) ? Math.min(90, Math.max(1, Math.round(requested))) : 14;

    const result = await getGaAnalytics(days);
    return NextResponse.json(result, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json({ daily: [], totals: { pageViews: 0, users: 0, sessions: 0 } });
  }
}
