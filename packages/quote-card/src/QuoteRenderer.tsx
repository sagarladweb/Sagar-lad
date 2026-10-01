import React from "react";
import {
  QUOTE_BRAND,
  effectiveHighlightColor,
  quoteSize,
  splitHighlight,
  type QuoteData,
} from "./design";

export type QuoteRendererProps = QuoteData & {
  /** Logo image URL. Site passes "/logos/site-logo-black.png", admin absolute. */
  logoSrc?: string;
  /** Max width of the card in px. */
  maxWidth?: number;
  /** Website domain name displayed centered at the bottom. Defaults to "sagarlad.com". */
  websiteUrl?: string;
};

const DISPLAY_STACK =
  "'Rethink Sans', 'Be Vietnam Pro', system-ui, -apple-system, sans-serif";

/**
 * The one shared quote visual. Inline styles only — no CSS imports — so the
 * admin preview and the public page render pixel-identical output.
 *
 * Layout: center-aligned quote → right-aligned "- Author" → black site logo below → center-bottom "sagarlad.com".
 */
export function QuoteRenderer({
  text,
  highlightText,
  highlightColor,
  author,
  logoSrc = "/logos/site-logo-black.png",
  maxWidth = 760,
  websiteUrl = "sagarlad.com",
}: QuoteRendererProps) {
  const clean = text.replace(/\s+/g, " ").trim();
  const size = quoteSize(clean);
  const color = effectiveHighlightColor(highlightColor);
  const parts = splitHighlight(clean, highlightText);
  const who = (author ?? "").trim() || "Sagar Lad";
  const displayAuthor = who.startsWith("-") || who.startsWith("–") ? who : `–${who}`;

  const fontSize =
    size === "short"
      ? "clamp(1.9rem, 4.6vw, 3rem)"
      : size === "medium"
        ? "clamp(1.5rem, 3.6vw, 2.2rem)"
        : "clamp(1.2rem, 2.8vw, 1.7rem)";

  const isBlue = color === "blue";
  // Light brand washes — full coverage, ink text always readable.
  const band = isBlue ? "rgba(63,136,197,0.35)" : "rgba(255,203,0,0.5)";

  const words: React.ReactNode[] = [];
  if (parts) {
    const [before, match, after] = parts;
    words.push(<span key="b">{before}</span>);
    words.push(
      <span
        key="m"
        style={{
          background: band,
          borderRadius: 4,
          padding: "0 0.12em",
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
        }}
      >
        {match}
      </span>
    );
    words.push(<span key="a">{after}</span>);
  } else {
    words.push(<span key="t">{clean}</span>);
  }

  return (
    <figure
      style={{
        background: QUOTE_BRAND.paper,
        borderRadius: 24,
        padding: "clamp(2.5rem, 7vw, 5rem) clamp(1.75rem, 6vw, 4.5rem)",
        maxWidth,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <blockquote
        style={{
          margin: 0,
          fontFamily: DISPLAY_STACK,
          fontWeight: 700,
          fontSize,
          lineHeight: 1.4,
          letterSpacing: "-0.01em",
          color: QUOTE_BRAND.ink,
          textAlign: "center",
          textWrap: "balance" as const,
        }}
      >
        <span aria-hidden="true" style={{ color: QUOTE_BRAND.blue }}>
          &ldquo;
        </span>
        {words}
        <span aria-hidden="true" style={{ color: QUOTE_BRAND.blue }}>
          &rdquo;
        </span>
      </blockquote>

      <figcaption
        style={{
          marginTop: "2rem",
          fontFamily: DISPLAY_STACK,
          fontSize: "1.1rem",
          fontWeight: 600,
          color: QUOTE_BRAND.ink,
          textAlign: "right",
        }}
      >
        {displayAuthor}
      </figcaption>

      <div
        style={{
          marginTop: "1.25rem",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt={who}
          width={120}
          height={79}
          loading="lazy"
          decoding="async"
          style={{ height: 38, width: "auto", opacity: 0.95 }}
        />
      </div>

      <div
        style={{
          marginTop: "2.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: DISPLAY_STACK,
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "0.28em",
            color: QUOTE_BRAND.muted,
          }}
        >
          {websiteUrl}
        </span>
      </div>
    </figure>
  );
}
