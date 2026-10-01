import { ImageResponse } from "next/og";
import { getQuoteBySlug } from "@/lib/content";
import { prisma, dbSafe } from "@/lib/db";
import {
  QUOTE_BRAND,
  effectiveHighlightColor,
} from "@sagarlad/quote-card";
import { FONT_500, FONT_700, LOGO_DATA_URI } from "./og-assets";

export const runtime = "nodejs";
export const size = { width: 1080, height: 1350 };
export const contentType = "image/png";

type CardModel = {
  clean: string;
  who: string;
  fontSize: number;
  highlightText?: string | null;
  highlightColor?: string | null;
};

function calculateFontSize(clean: string): number {
  if (clean.length < 70) return 52;
  if (clean.length < 130) return 46;
  if (clean.length < 200) return 40;
  return 34;
}

function renderQuoteCardImage(model: CardModel): ImageResponse {
  const { clean, who, fontSize, highlightText, highlightColor } = model;
  const color = effectiveHighlightColor(
    (highlightColor as "yellow" | "blue" | null) ?? "yellow"
  );
  const isBlue = color === "blue";
  const highlightBg = isBlue
    ? "rgba(63,136,197,0.35)"
    : "rgba(255,203,0,0.5)";

  const authorDisplay =
    who.startsWith("-") || who.startsWith("–") ? who : `–${who}`;

  const cleanLower = clean.toLowerCase();
  const hlLower = (highlightText ?? "").trim().toLowerCase();
  const hlStart = hlLower ? cleanLower.indexOf(hlLower) : -1;
  const hlEnd = hlStart !== -1 ? hlStart + hlLower.length : -1;

  const words = clean.split(/\s+/).filter(Boolean);
  let charPos = 0;

  const tokens = words.map((w) => {
    const start = charPos;
    const end = start + w.length;
    charPos = end + 1;
    const isHot = hlStart !== -1 && end > hlStart && start < hlEnd;
    return { w, start, end, isHot };
  });

  const wordElements = tokens.map((t, i) => {
    const isFirstHot = t.isHot && (!tokens[i - 1] || !tokens[i - 1].isHot);
    const isLastHot = t.isHot && (!tokens[i + 1] || !tokens[i + 1].isHot);
    const isLast = i === tokens.length - 1;

    let textToRender = t.w;
    if (i === 0) textToRender = `\u201C${textToRender}`;
    if (isLast) textToRender = `${textToRender}\u201D`;

    if (t.isHot) {
      return (
        <span
          key={i}
          style={{
            display: "flex",
            backgroundColor: highlightBg,
            paddingLeft: isFirstHot ? 8 : 0,
            paddingRight: isLastHot ? 8 : 0,
            paddingTop: 2,
            paddingBottom: 2,
            borderTopLeftRadius: isFirstHot ? 4 : 0,
            borderBottomLeftRadius: isFirstHot ? 4 : 0,
            borderTopRightRadius: isLastHot ? 4 : 0,
            borderBottomRightRadius: isLastHot ? 4 : 0,
          }}
        >
          {isLastHot ? textToRender : `${textToRender} `}
        </span>
      );
    }

    return (
      <span key={i} style={{ display: "flex" }}>
        {isLast ? textToRender : `${textToRender} `}
      </span>
    );
  });

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
          backgroundColor: "#FFF7E7",
          padding: "100px 96px 84px",
          fontFamily: "Rethink, sans-serif",
        }}
      >
        {/* Main centered body */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Center-aligned quote text with quotes at start & end */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              textAlign: "center",
              fontSize,
              fontWeight: 700,
              lineHeight: 1.45,
              color: QUOTE_BRAND.ink,
              marginBottom: 60,
              paddingLeft: 24,
              paddingRight: 24,
              whiteSpace: "pre-wrap",
            }}
          >
            {wordElements}
          </div>

          {/* Right-aligned author */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginBottom: 32,
              paddingRight: 24,
            }}
          >
            <span
              style={{
                fontSize: 34,
                fontWeight: 600,
                color: QUOTE_BRAND.ink,
                letterSpacing: "-0.01em",
              }}
            >
              {authorDisplay}
            </span>
          </div>

          {/* Right-aligned black site logo below author with clear separation */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingRight: 24,
            }}
          >
            <img
              src={LOGO_DATA_URI}
              alt="Sagar Lad"
              width={120}
              height={79}
              style={{
                width: 120,
                height: 79,
                objectFit: "contain",
              }}
            />
          </div>
        </div>

        {/* Center bottom aligned website name */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "auto",
          }}
        >
          <span
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 8,
              color: QUOTE_BRAND.muted,
              textTransform: "uppercase",
            }}
          >
            sagarlad.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts,
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=86400",
      },
    }
  );
}

async function fetchQuote(slug: string) {
  try {
    const q = await getQuoteBySlug(slug);
    if (q) return q;
  } catch {
    // unstable_cache may fail outside request context; fall through to direct DB query
  }

  return dbSafe(async () => {
    const bySlug = await prisma.quote.findFirst({
      where: { slug, published: true },
      select: {
        id: true,
        slug: true,
        text: true,
        author: true,
        highlightText: true,
        highlightColor: true,
      },
    });
    if (bySlug) return bySlug;
    return prisma.quote.findFirst({
      where: { id: slug, published: true },
      select: {
        id: true,
        slug: true,
        text: true,
        author: true,
        highlightText: true,
        highlightColor: true,
      },
    });
  }, null);
}

export default async function QuoteOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const rawSlug = decodeURIComponent(slug);
    const quote = await fetchQuote(rawSlug);

    if (!quote) {
      return renderQuoteCardImage({
        clean: "A quote worth carrying with you.",
        who: "Sagar Lad",
        fontSize: 48,
      });
    }

    const clean = quote.text.replace(/\s+/g, " ").trim();
    const who = (quote.author ?? "").trim() || "Sagar Lad";
    const fontSize = calculateFontSize(clean);

    return renderQuoteCardImage({
      clean,
      who,
      fontSize,
      highlightText: quote.highlightText,
      highlightColor: quote.highlightColor,
    });
  } catch (err) {
    console.error(`[og-quote] render failed for slug "${slug}":`, err);
    return renderQuoteCardImage({
      clean: "A quote worth carrying with you.",
      who: "Sagar Lad",
      fontSize: 48,
    });
  }
}
