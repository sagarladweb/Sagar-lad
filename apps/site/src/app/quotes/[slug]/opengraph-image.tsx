import { ImageResponse } from "next/og";
import sharp from "sharp";
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
  // Loaded via `new URL(..., import.meta.url)` (not process.cwd()) so Next's
  // file tracer bundles the fonts into the production serverless function.
  // The old process.cwd() + readFile path silently missed the bundle on
  // Vercel → fonts: [] → Satori threw "No fonts are loaded" → HTTP 500.
  try {
    const res = await fetch(
      new URL(`../../fonts/og-rethink-${weight}.ttf`, import.meta.url)
    );
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

async function loadLogo(): Promise<string | null> {
  // Local file → data URI, so the stamp works everywhere (local, preview,
  // production) without depending on a deployed URL.
  try {
    const res = await fetch(
      new URL("../../../../public/logos/site-logo-black.png", import.meta.url)
    );
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Naive word-wrap for the emergency fallback card (no custom fonts needed). */
function wrapLines(text: string, maxChars = 30, maxLines = 12): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
    if (lines.length >= maxLines) break;
  }
  if (lines.length < maxLines && line) lines.push(line);
  return lines.slice(0, maxLines);
}

/**
 * Last-resort branded PNG rendered with sharp + plain SVG (system
 * sans-serif, no embedded fonts). Guarantees the download endpoint never
 * returns a 500, even if Satori or the DB is unavailable.
 */
async function fallbackPng(text: string, author: string): Promise<Response> {
  const lines = wrapLines(text);
  const startY = 600 - ((lines.length - 1) * 62) / 2;
  const body = lines
    .map(
      (l, i) =>
        `<text x="540" y="${Math.round(startY + i * 62)}" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="46" fill="#111111">${escapeXml(l)}</text>`
    )
    .join("");
  const svg =
    `<svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">` +
    `<rect width="1080" height="1350" fill="#FFF7E7"/>` +
    `<text x="540" y="330" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="44" fill="#0D21A1">\u201C</text>` +
    body +
    `<text x="540" y="1010" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="34" fill="#111111">\u2013${escapeXml(author)}</text>` +
    `<text x="540" y="1230" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="30" letter-spacing="10" fill="#6B6A63">SAGARLAD.COM</text>` +
    `</svg>`;
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

type TokenRange = { t: string; s: number; e: number };

/** Character offsets per token; module-level so render bodies stay pure. */
function tokenRanges(tokens: string[]): TokenRange[] {
  let pos = 0;
  return tokens.map((t) => {
    const s = pos;
    pos += t.length;
    return { t, s, e: s + t.length };
  });
}

type OgModel = {
  clean: string;
  who: string;
  fontSize: number;
  highlightBg: string;
  tokens: TokenRange[];
  isHot: boolean[];
  regular: Buffer | null;
  bold: Buffer | null;
  logo: string | null;
};

/** All fallible I/O happens here; the component below only renders. */
async function loadOgModel(slug: string): Promise<OgModel | null> {
  const quote = await getQuoteBySlug(slug).catch(() => null);
  // Never notFound() here: a missing quote in an image route surfaces as
  // a 500 error page instead of a graceful 404, breaking downloads.
  if (!quote) return null;

  const clean = quote.text.replace(/\s+/g, " ").trim();
  const tier = quoteSize(clean);
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
  const tokens = tokenRanges(clean.split(/(\s+)/).filter((t) => t.length > 0));
  const isHot = tokens.map((r, i) => {
    if (hlStart === -1) return false;
    if (/^\s+$/.test(r.t)) {
      // Bridge the gap between two highlighted words so the band reads whole.
      const prev = tokens[i - 1];
      const next = tokens[i + 1];
      return !!prev && !!next && prev.s >= hlStart && prev.e <= hlEnd && next.s >= hlStart && next.e <= hlEnd;
    }
    return r.s >= hlStart && r.e <= hlEnd;
  });

  const fontSize = tier === "short" ? 62 : tier === "medium" ? 52 : 44;

  const [regular, bold, logo] = await Promise.all([
    loadFont("500"),
    loadFont("700"),
    loadLogo(),
  ]);

  return { clean, who, fontSize, highlightBg, tokens, isHot, regular, bold, logo };
}

export default async function QuoteOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await loadOgModel(slug).catch((err) => {
    // The download button hits this route directly: any throw becomes the
    // "This page couldn't load" 500. Log it and serve a valid PNG instead.
    console.error(`[og-quote] load failed for slug "${slug}":`, err);
    return null;
  });
  if (!model) return fallbackPng("A quote worth carrying with you.", "Sagar Lad");
  // Satori throws "No fonts are loaded" when fonts is empty — that was the
  // production 500. Without the brand fonts, serve the sharp fallback
  // (valid PNG) instead of crashing.
  if (!model.regular || !model.bold) return fallbackPng(model.clean, model.who);

  const fonts = [
    { name: "Rethink", data: model.regular, weight: 500 as const },
    { name: "Rethink", data: model.bold, weight: 700 as const },
  ];
  const quoteBody = model.tokens.map((r, i) => (
    <span key={i} style={model.isHot[i] ? { backgroundColor: model.highlightBg } : undefined}>
      {r.t}
    </span>
  ));

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
              fontSize: model.fontSize,
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
            –{model.who}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 28,
            }}
          >
            {model.logo ? (
              <img src={model.logo} alt="Sagar Lad" width={97} height={64} style={{ width: 97, height: 64 }} />
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
