import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET(request: Request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "BREVO_API_KEY not set" }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/account", {
      headers: { "api-key": apiKey, Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Brevo ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    const sendLimit = (data.plan ?? []).find(
      (p: { creditsType: string }) => p.creditsType === "sendLimit",
    );
    const totalCredits = sendLimit?.credits ?? 0;
    const planType = sendLimit?.type ?? "free";
    return NextResponse.json({ totalCredits, planType });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch Brevo account" },
      { status: 502 },
    );
  }
}
