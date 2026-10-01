// Single source of truth for every Sagar Lad quote visual: admin preview,
// public page, OG image template, download. No CSS imports here — the
// renderer below uses inline styles only, so both Next apps stay identical.

export const QUOTE_BRAND = {
  blue: "#0D21A1",
  yellow: "#FFCB00",
  ink: "#111111",
  paper: "#FAFAF8",
  muted: "#6B6A63",
} as const;

export type HighlightColor = "yellow" | "blue";

export type QuoteData = {
  text: string;
  highlightText?: string | null;
  highlightColor?: HighlightColor | null;
  author?: string | null;
  tag?: string | null;
};

/** Split text on the FIRST occurrence of the highlight phrase. */
export function splitHighlight(
  text: string,
  highlight?: string | null
): [string, string, string] | null {
  const needle = (highlight ?? "").trim();
  if (!needle) return null;
  const i = text.toLowerCase().indexOf(needle.toLowerCase());
  if (i === -1) return null;
  return [text.slice(0, i), text.slice(i, i + needle.length), text.slice(i + needle.length)];
}

export function effectiveHighlightColor(
  color?: HighlightColor | null
): HighlightColor {
  return color === "blue" ? "blue" : "yellow";
}

/** Length tiers drive automatic typography — short shouts, long whispers. */
export type QuoteSize = "short" | "medium" | "long";
export function quoteSize(text: string): QuoteSize {
  const len = text.trim().length;
  if (len <= 90) return "short";
  if (len <= 200) return "medium";
  return "long";
}

const STOP = new Set([
  "a", "an", "the", "and", "or", "but", "to", "of", "in", "on", "for",
  "with", "is", "are", "it", "its", "as", "at", "by", "your", "you",
]);

export function slugifyQuote(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || "quote";
}

function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w) =>
      STOP.has(w.toLowerCase()) && w.length > 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(" ");
}

/** "Your Attitude Is Your Window to Life — Sagar Lad" */
export function quoteSeoTitle(text: string, author?: string | null): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const short = clean.length > 60 ? clean.slice(0, 57).trimEnd() + "…" : clean;
  const who = (author ?? "Sagar Lad").trim() || "Sagar Lad";
  return `${titleCase(short)} — ${who}`;
}

/** "A quote by Sagar Lad about attitude, mindset and moving forward." */
export function quoteSeoDescription(
  text: string,
  tag?: string | null,
  author?: string | null
): string {
  const who = (author ?? "Sagar Lad").trim() || "Sagar Lad";
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4 && !STOP.has(w));
  const topics = [tag?.trim(), ...words.slice(0, 3)].filter(Boolean).filter(
    (v, i, a) => a.indexOf(v) === i
  );
  const about = topics.length > 0 ? ` about ${topics.slice(0, 3).join(", ")}` : "";
  return `A quote by ${who}${about}.`;
}
