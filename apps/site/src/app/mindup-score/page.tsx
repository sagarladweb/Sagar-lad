import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { MindUpScoreClient } from "./MindUpScoreClient";
import "./mindup-score.css";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const name = typeof params.name === "string" ? params.name : "";
  const score = typeof params.score === "string" ? params.score : "";
  const status = typeof params.status === "string" ? params.status : "";
  const m = typeof params.m === "string" ? params.m : "";
  const i = typeof params.i === "string" ? params.i : "";
  const n = typeof params.n === "string" ? params.n : "";
  const d = typeof params.d === "string" ? params.d : "";
  const u = typeof params.u === "string" ? params.u : "";
  const p = typeof params.p === "string" ? params.p : "";

  const hasScore = Boolean(score);
  const title = hasScore
    ? `${name ? `${name}'s ` : ""}MIND UP Score: ${score}/100 — ${SITE.name}`
    : `MindUp Score Assessment — ${SITE.name}`;

  const description = hasScore
    ? `Verified MIND UP Certificate${name ? ` for ${name}` : ""}: Scored ${score}/100 (${status || "Explorer"}). Discover where you stand across 6 personal growth dimensions.`
    : "How MIND UP are you? Discover where you stand across 6 dimensions, find your growth zone, and leave with one clear next move.";

  const ogImageUrl = hasScore
    ? `${SITE.url}/api/og/mindup?name=${encodeURIComponent(name || "Mind Up Explorer")}&score=${score}&status=${encodeURIComponent(status || "Explorer")}&m=${m}&i=${i}&n=${n}&d=${d}&u=${u}&p=${p}`
    : `${SITE.url}/logos/site-logo.png`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE.url}/mindup-score` },
    openGraph: {
      title,
      description,
      url: `${SITE.url}/mindup-score`,
      type: "website",
      siteName: SITE.name,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} Certificate`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function MindUpScorePage() {
  return <MindUpScoreClient />;
}
