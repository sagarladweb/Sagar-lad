import { ImageResponse } from "next/og";
import sharp from "sharp";
import { getQuoteBySlug } from "@/lib/content";
import {
  QUOTE_BRAND,
  effectiveHighlightColor,
  quoteSize,
} from "@sagarlad/quote-card";
import { FONT_500, FONT_700, LOGO_DATA_URI } from "./og-assets";

export const runtime = "nodejs";
export const size = { width: 1080, height: 1350 };
export const contentType = "image/png";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapLines(text: string, maxChars = 32, maxLines = 10): string[] {
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
 * Ultra-emergency PNG renderer using sharp with embedded base64 TrueType font.
 * Guarantees zero tofu boxes even if ImageResponse/Satori ever fails and host OS has no fonts.
 */
async function emergencySharpPng(text: string, author: string): Promise<Response> {
  const who = author.trim() || "Sagar Lad";
  const authorDisplay = who.startsWith("-") || who.startsWith("–") ? who : `–${who}`;
  const lines = wrapLines(text);
  const startY = 620 - ((lines.length - 1) * 66) / 2;

  const font700Base64 = FONT_700.toString("base64");

  const body = lines
    .map((l, i) => {
      const isFirst = i === 0;
      const isLast = i === lines.length - 1;
      const prefix = isFirst ? `<tspan fill="${QUOTE_BRAND.blue}">\u201C</tspan>` : "";
      const suffix = isLast ? `<tspan fill="${QUOTE_BRAND.blue}">\u201D</tspan>` : "";
      return `<text x="540" y="${Math.round(startY + i * 66)}" text-anchor="middle" font-family="'Rethink', sans-serif" font-weight="bold" font-size="48" fill="${QUOTE_BRAND.ink}">${prefix}${escapeXml(l)}${suffix}</text>`;
    })
    .join("");

  const svg =
    `<svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">` +
    `<defs>` +
    `<style>` +
    `@font-face { font-family: 'Rethink'; font-weight: 700; src: url('data:font/ttf;base64,${font700Base64}'); }` +
    `</style>` +
    `</defs>` +
    `<rect width="1080" height="1350" fill="#FFF7E7"/>` +
    body +
    `<text x="984" y="1030" text-anchor="end" font-family="'Rethink', sans-serif" font-weight="600" font-size="34" fill="${QUOTE_BRAND.ink}">${escapeXml(authorDisplay)}</text>` +
    `<image href="${LOGO_DATA_URI}" x="864" y="1054" width="120" height="79"/>` +
    `<text x="540" y="1260" text-anchor="middle" font-family="'Rethink', sans-serif" font-weight="bold" font-size="28" letter-spacing="8" fill="${QUOTE_BRAND.muted}">sagarlad.com</text>` +
    `</svg>`;

  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

function renderQuoteResponse(opts: {
  clean: string;
  author: string;
  highlightText?: string | null;
  highlightColor?: string | null;
}): Response {
  const who = opts.author.trim() || "Sagar Lad";
  const authorDisplay = who.startsWith("-") || who.startsWith("–") ? who : `–${who}`;
  const tier = quoteSize(opts.clean);
  const color = effectiveHighlightColor(
    opts.highlightColor as "yellow" | "blue" | null
  );
  const isBlue = color === "blue";
  const highlightBg = isBlue ? "rgba(63,136,197,0.35)" : "rgba(255,203,0,0.5)";

  const hlNeedle = (opts.highlightText ?? "").trim();
  const hlStart = hlNeedle ? opts.clean.indexOf(hlNeedle) : -1;
  const hlEnd = hlStart !== -1 ? hlStart + hlNeedle.length : -1;

  const rawTokens = opts.clean.split(/(\s+)/).filter(Boolean);
  let pos = 0;
  const tokens = rawTokens.map((t) => {
    const s = pos;
    pos += t.length;
    return { t, s, e: pos };
  });

  const isHot = tokens.map((r, i) => {
    if (hlStart === -1) return false;
    if (/^\s+$/.test(r.t)) {
      const prev = tokens[i - 1];
      const next = tokens[i + 1];
      return !!prev && !!next && prev.s >= hlStart && prev.e <= hlEnd && next.s >= hlStart && next.e <= hlEnd;
    }
    return r.s >= hlStart && r.e <= hlEnd;
  });

  const quoteSpans = tokens.map((r, i) => {
    const isFirst = i === 0;
    const isLast = i === tokens.length - 1;
    return (
      <span
        key={i}
        style={isHot[i] ? { backgroundColor: highlightBg, borderRadius: 4 } : undefined}
      >
        {isFirst && <span style={{ color: QUOTE_BRAND.blue }}>{"\u201C"}</span>}
        {r.t}
        {isLast && <span style={{ color: QUOTE_BRAND.blue }}>{"\u201D"}</span>}
      </span>
    );
  });

  const fontSize = tier === "short" ? 60 : tier === "medium" ? 50 : 42;

  const fonts = [
    { name: "Rethink", data: FONT_500, weight: 500 as const },
    { name: "Rethink", data: FONT_700, weight: 700 as const },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1350,
          display: "flex",
          flexDirection: "column",
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
              lineHeight: 1.45,
              color: QUOTE_BRAND.ink,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              textAlign: "center",
              whiteSpace: "pre-wrap",
            }}
          >
            {quoteSpans}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 52,
              fontSize: 34,
              fontWeight: 600,
              color: QUOTE_BRAND.ink,
            }}
          >
            {authorDisplay}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 24,
            }}
          >
            <img
              src={LOGO_DATA_URI}
              alt={who}
              width={120}
              height={79}
              style={{ width: 120, height: 79 }}
            />
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
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 8,
              color: QUOTE_BRAND.muted,
            }}
          >
            sagarlad.com
          </span>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, fonts }
  );
}

export default async function QuoteOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const quote = await getQuoteBySlug(slug).catch(() => null);
    if (!quote) {
      return renderQuoteResponse({
        clean: "A quote worth carrying with you.",
        author: "Sagar Lad",
      });
    }

    const clean = quote.text.replace(/\s+/g, " ").trim();
    return renderQuoteResponse({
      clean,
      author: quote.author ?? "Sagar Lad",
      highlightText: quote.highlightText,
      highlightColor: quote.highlightColor,
    });
  } catch (err) {
    console.error(`[og-quote] render failed for slug "${slug}":`, err);
    return emergencySharpPng("A quote worth carrying with you.", "Sagar Lad");
  }
}
