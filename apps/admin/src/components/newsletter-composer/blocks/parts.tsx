"use client";

import * as React from "react";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/components/newsletter-composer/lib/utils";
import { SITE } from "@/lib/site";

/* ------------------------------------------------------------------ *
 *  Image with graceful empty state
 * ------------------------------------------------------------------ */
export function SmartImage({
  src,
  alt,
  className,
  style,
  label = "Image",
}: {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}) {
  const [broken, setBroken] = React.useState(false);
  React.useEffect(() => setBroken(false), [src]);

  if (!src || broken) {
    return (
      <div
        style={style}
        className={cn(
          "flex min-h-[140px] w-full flex-col items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-line-strong bg-[#F7F6F2] px-4 py-6 text-center",
          className,
        )}
      >
        <ImageIcon className="h-4 w-4 text-ink-muted" />
        <span className="text-[12px] font-medium text-ink-muted">{label}</span>
        <span className="text-[11px] text-ink-muted/80">
          Add an image URL in the inspector
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      style={style}
      onError={() => setBroken(true)}
      className={cn("h-auto w-full object-cover", className)}
    />
  );
}

/* ------------------------------------------------------------------ *
 *  Highlighted words ("Highlight Words" control on headings)
 * ------------------------------------------------------------------ */
export function Highlighted({
  text,
  words,
}: {
  text: string;
  words?: string;
}) {
  const list = (words ?? "")
    .split(",")
    .map((w) => w.trim())
    .filter(Boolean);

  if (!text) return null;
  if (!list.length) return <>{text}</>;

  const escaped = list.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const chunks = text.split(regex);

  return (
    <>
      {chunks.map((chunk, index) =>
        regex.test(chunk) && list.some((w) => w.toLowerCase() === chunk.toLowerCase()) ? (
          <span
            key={index}
            className="rounded-[3px] px-[2px]"
            style={{ background: "var(--highlight, #FDF0B5)" }}
          >
            {chunk}
          </span>
        ) : (
          <React.Fragment key={index}>{chunk}</React.Fragment>
        ),
      )}
    </>
  );
}

/* ------------------------------------------------------------------ *
 *  Rich text rendering
 * ------------------------------------------------------------------ */
export function RichText({
  html,
  className,
  linkColor,
}: {
  html: string;
  className?: string;
  linkColor?: string;
}) {
  return (
    <div
      className={cn("rich-text", className)}
      style={linkColor ? ({ ["--link"]: linkColor } as React.CSSProperties) : undefined}
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  );
}

/* ------------------------------------------------------------------ *
 *  Avatars
 * ------------------------------------------------------------------ */
export function Avatar({
  src,
  name,
  size = 56,
  className,
}: {
  src?: string;
  name?: string;
  size?: number;
  className?: string;
}) {
  const imgSrc = src || `${SITE.url}/favicon-48x48.png`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={name ?? ""}
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}

/* ------------------------------------------------------------------ *
 *  Split helper for the table block
 * ------------------------------------------------------------------ */
export function splitCells(value: string): string[] {
  return String(value ?? "")
    .split("|")
    .map((cell) => cell.trim());
}

/* ------------------------------------------------------------------ *
 *  Mailto / anchor that stays inert inside the editor
 * ------------------------------------------------------------------ */
export function CanvasLink({
  href,
  children,
  className,
  style,
  onActivate,
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onActivate?: () => void;
}) {
  return (
    <a
      href={href || "#"}
      style={style}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onActivate?.();
      }}
    >
      {children}
    </a>
  );
}

/* ------------------------------------------------------------------ *
 *  Section label used by list-style blocks
 * ------------------------------------------------------------------ */
export function SectionLabel({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted",
        align === "center" && "text-center",
      )}
    >
      {children}
    </p>
  );
}
