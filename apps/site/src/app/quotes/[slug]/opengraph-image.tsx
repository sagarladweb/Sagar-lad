import { ImageResponse } from "@vercel/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { getQuoteBySlug } from "@/lib/content";
import {
  QUOTE_BRAND,
  effectiveHighlightColor,
  quoteSize,
  splitHighlight,
} from "@sagarlad/quote-card";

export const runtime = "nodejs";
export const size = { width: 1080, height: 1350 };
export const contentType = "image/png";

async function loadFont(weight: "500" | "700"): Promise<Buffer | null> {
  // Satori needs TrueType (woff2 unsupported) — dedicated OG copies of the
  // same Rethink Sans the site serves.
  try {
    return await readFile(
      join(process.cwd(), "src/app/fonts", `og-rethink-${weight}.ttf`)
    );
  } catch {
    return null;
  }
}

async function loadLogo(): Promise<string | null> {
  // Local file → data URI, so the stamp works everywhere (local, preview,
  // production) without depending on a deployed URL.
  try {
    const buf = await readFile(
      join(process.cwd(), "public/logos/site-logo-black.png")
    );
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function QuoteOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const quote = await getQuoteBySlug(slug).catch(() => null);
  if (!quote) notFound();

  const clean = quote.text.replace(/\s+/g, " ").trim();
  const size = quoteSize(clean);
  const color = effectiveHighlightColor(
    quote.highlightColor as "yellow" | "blue" | null
  );
  const parts = splitHighlight(clean, quote.highlightText);
  const who = (quote.author ?? "").trim() || "Sagar Lad";
  const isBlue = color === "blue";
  const highlightBg = isBlue ? "rgba(63,136,197,0.35)" : "rgba(255,203,0,0.5)";

  // Word-level flex items: satori wraps block text only per item, so each
  // word becomes an item and highlighted words keep their wash unbroken.
  const hlStart = parts ? parts[0].length : -1;
  const hlEnd = parts ? parts[0].length + parts[1].length : -1;
  const tokens = clean.split(/(\s+)/).filter((t) => t.length > 0);
  let pos = 0;
  const ranges = tokens.map((t) => {
    const s = pos;
    pos += t.length;
    return { t, s, e: pos };
  });
  const isHot = (r: { t: string; s: number; e: number }, i: number) => {
    if (hlStart === -1) return false;
    if (/^\s+$/.test(r.t)) {
      // Bridge the gap between two highlighted words so the band reads whole.
      const prev = ranges[i - 1];
      const next = ranges[i + 1];
      return !!prev && !!next && prev.s >= hlStart && prev.e <= hlEnd && next.s >= hlStart && next.e <= hlEnd;
    }
    return r.s >= hlStart && r.e <= hlEnd;
  };
  const quoteBody = tokens.map((t, i) => (
    <span key={i} style={isHot(ranges[i], i) ? { backgroundColor: highlightBg } : undefined}>
      {t}
    </span>
  ));

  const fontSize = size === "short" ? 62 : size === "medium" ? 52 : 44;

  const [regular, bold, logo] = await Promise.all([
    loadFont("500"),
    loadFont("700"),
    loadLogo(),
  ]);
  const fonts =
    regular && bold
      ? [
          { name: "Rethink", data: regular, weight: 500 as const },
          { name: "Rethink", data: bold, weight: 700 as const },
        ]
      : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1350,
          display: "flex",
          flexDirection: "column",
          // Satori drops background alpha, so this is brand yellow 7%
          // pre-blended over paper — never collides with either highlight.
          background: "#FFF7E7",
          padding: "110px 96px 90px",
          fontFamily: "Rethink, sans-serif",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize,
              fontWeight: 700,
              lineHeight: 1.4,
              color: QUOTE_BRAND.ink,
              display: "flex",
              flexWrap: "wrap",
              whiteSpace: "pre-wrap",
            }}
          >
            <span style={{ color: QUOTE_BRAND.blue }}>{"\u201C"}</span>
            {quoteBody}
            <span style={{ color: QUOTE_BRAND.blue }}>{"\u201D"}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 44,
              fontSize: 34,
              fontWeight: 600,
              color: QUOTE_BRAND.ink,
            }}
          >
            –{who}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 28,
            }}
          >
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="Sagar Lad" width={97} height={64} style={{ width: 97, height: 64 }} />
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 10,
              color: QUOTE_BRAND.muted,
            }}
          >
            SAGARLAD.COM
          </span>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, fonts }
  );
}
