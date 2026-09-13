import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let counter = 0;

/** Short, collision-resistant id for blocks and lists. */
export function uid(prefix = "blk"): string {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${rand}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** "None · 3s ago" style relative timestamps for the autosave indicator. */
export function formatRelativeTime(ts: number | null): string {
  if (!ts) return "Not saved yet";
  const diff = Date.now() - ts;
  if (diff < 5_000) return "just now";
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatClock(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** #1D4ED8 -> rgba(29, 78, 216, alpha) */
export function hexToRgba(hex: string, alpha = 1): string {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const int = Number.parseInt(full || "000000", 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Luminance-based contrast ratio between two hex colours (1 – 21). */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) => {
    const clean = hex.replace("#", "");
    const full =
      clean.length === 3
        ? clean
            .split("")
            .map((c) => c + c)
            .join("")
        : clean;
    const int = Number.parseInt(full || "000000", 16);
    const channels = [(int >> 16) & 255, (int >> 8) & 255, int & 255].map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const l1 = lum(a);
  const l2 = lum(b);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return Math.round(ratio * 100) / 100;
}

export function contrastGrade(ratio: number): {
  label: string;
  tone: "pass" | "warn" | "fail";
} {
  if (ratio >= 7) return { label: `AAA · ${ratio}:1`, tone: "pass" };
  if (ratio >= 4.5) return { label: `AA · ${ratio}:1`, tone: "pass" };
  if (ratio >= 3) return { label: `AA large only · ${ratio}:1`, tone: "warn" };
  return { label: `Fails · ${ratio}:1`, tone: "fail" };
}

export function estimateReadingTime(blocks: { data: Record<string, unknown> }[]) {
  const text = blocks
    .map((block) =>
      Object.values(block.data ?? {})
        .filter((v): v is string => typeof v === "string")
        .join(" "),
    )
    .join(" ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function withUtm(
  url: string,
  params: { source?: string; medium?: string; campaign?: string },
): string {
  if (!url) return url;
  const entries = Object.entries(params).filter(([, v]) => Boolean(v));
  if (!entries.length) return url;
  try {
    const base = url.startsWith("http") ? url : `https://${url}`;
    const parsed = new URL(base);
    const map: Record<string, string> = {
      source: "utm_source",
      medium: "utm_medium",
      campaign: "utm_campaign",
    };
    entries.forEach(([k, v]) => parsed.searchParams.set(map[k] ?? k, String(v)));
    return parsed.toString();
  } catch {
    return url;
  }
}

export function truncate(value: string, length = 60): string {
  if (!value) return "";
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}

export function debounce<F extends (...args: never[]) => void>(fn: F, wait = 300) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
