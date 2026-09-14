"use client";

import * as React from "react";
import {
  ArrowRight,
  Check,
  CircleCheck,
  Clock,
  ExternalLink,
  Heart,
  Mail,
  Play,
  Repeat2,
  Rss,
  Square,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import { Avatar, Highlighted, RichText, SectionLabel, SmartImage, splitCells } from "./parts";
import { gradientTextStyle } from "@/components/newsletter-composer/lib/styleToCss";
import { useEditorStore } from "@/components/newsletter-composer/store/editor-store";
import type { Block } from "@/components/newsletter-composer/types/editor";
import { cn } from "@/components/newsletter-composer/lib/utils";

/* ------------------------------------------------------------------ *
 *  Shared hook for fetching newsletter block data
 * ------------------------------------------------------------------ */
type BlockData = {
  booksRead: { id: string; title: string; author: string | null; note: string | null; imageUrl: string | null; buyUrl: string | null }[];
  booksPublished: { id: string; title: string; tagline: string | null; buyUrl: string | null; imageUrl: string | null }[];
  ebooks: { id: string; title: string; description: string | null; free: boolean; imageUrl: string | null; buyUrl: string | null }[];
  quotes: { id: string; text: string; tag: string }[];
  videos: { id: string; title: string; embedUrl: string; thumbnail: string | null; slug: string | null }[];
  blogs: { id: string; title: string; slug: string; excerpt: string | null; coverImage: string | null }[];
};

let cachedData: BlockData | null = null;
let cachePromise: Promise<BlockData> | null = null;

function useBlockData() {
  const [data, setData] = React.useState<BlockData | null>(cachedData);
  const [loading, setLoading] = React.useState(!cachedData);

  React.useEffect(() => {
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }
    if (!cachePromise) {
      cachePromise = fetch("/api/admin/newsletter/blocks")
        .then((r) => r.json())
        .then((d) => {
          cachedData = d;
          return d;
        })
        .catch(() => ({
          booksRead: [],
          booksPublished: [],
          ebooks: [],
          quotes: [],
          videos: [],
          blogs: [],
        }));
    }
    cachePromise.then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}

/* ------------------------------------------------------------------ *
 *  Tone palette used by callouts
 * ------------------------------------------------------------------ */
const TONES: Record<string, { bg: string; border: string; accent: string }> = {
  tip: { bg: "#FFFBEB", border: "#FDE68A", accent: "#B45309" },
  info: { bg: "#EFF6FF", border: "#BFDBFE", accent: "#1D4ED8" },
  warning: { bg: "#FEF2F2", border: "#FECACA", accent: "#B91C1C" },
  success: { bg: "#ECFDF5", border: "#A7F3D0", accent: "#047857" },
};

const PLATFORM_LABEL: Record<string, string> = {
  x: "X / Twitter",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  website: "Website",
  youtube: "YouTube",
  threads: "Threads",
  substack: "Substack",
};

function PlatformPill({ platform }: { platform: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-ink-soft">
      <Rss className="h-3.5 w-3.5 text-ink-muted" />
      {PLATFORM_LABEL[platform] ?? platform}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 *  FAQ — interactive accordion inside the canvas
 * ------------------------------------------------------------------ */
function FaqAccordion({ block }: { block: Block }) {
  const items = (block.data.items ?? []) as {
    question: string;
    answer: string;
  }[];
  const [open, setOpen] = React.useState<number[]>(
    block.data.expandFirst ? [0] : [],
  );
  const variant = block.data.style ?? "bordered";

  return (
    <div className="flex flex-col" style={{ gap: block.style.gap }}>
      {block.data.title ? (
        <p className="text-[18px] font-semibold tracking-[-0.01em]">
          {String(block.data.title)}
        </p>
      ) : null}
      {items.map((item: { question: string; answer: string }, index: number) => {
        const isOpen = open.includes(index);
        return (
          <div
            key={index}
            className={cn(
              variant === "cards" && "rounded-[14px] border border-line bg-white px-4",
              variant === "bordered" && "border-b border-line px-0",
              variant === "plain" && "px-0",
            )}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setOpen((prev) =>
                  prev.includes(index)
                    ? prev.filter((i) => i !== index)
                    : [...prev, index],
                );
              }}
              className="flex w-full items-center justify-between gap-3 py-3 text-left"
            >
              <span className="text-[15px] font-medium">{item.question}</span>
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line text-[13px] text-ink-muted transition-transform"
                style={{ transform: isOpen ? "rotate(45deg)" : undefined }}
              >
                +
              </span>
            </button>
            {isOpen ? (
              <p className="pb-3 text-[14px] leading-relaxed" style={{ opacity: 0.8 }}>
                {item.answer}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Main renderer
 * ------------------------------------------------------------------ */
export function BlockContent({ block }: { block: Block }) {
  const d = block.data as Record<string, any>;
  const s = block.style;
  const updateData = useEditorStore((state) => state.updateData);

  switch (block.type) {
    /* ----------------------------- Writing ---------------------------- */
    case "heading": {
      const level = (d.level ?? "h1") as "h1" | "h2" | "h3" | "h4";
      const Tag = level;
      return (
        <div className="flex flex-col gap-1.5">
          {d.eyebrow ? (
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: s.accentColor }}
            >
              {d.eyebrow}
            </p>
          ) : null}
          <Tag className="font-serif" style={gradientTextStyle(s)}>
            {d.emoji ? <span className="mr-1.5">{d.emoji}</span> : null}
            <Highlighted text={d.text} words={d.highlight} />
          </Tag>
          {d.anchor ? (
            <span className="font-mono text-[11px] text-ink-muted">#{d.anchor}</span>
          ) : null}
        </div>
      );
    }

    case "subheading":
      return (
        <h3 className="font-serif" style={gradientTextStyle(s)}>
          {d.text}
        </h3>
      );

    case "paragraph":
      /* Rich text renders block-level tags, so this must not be a <p>. */
      return (
        <div className={cn(s.dropCap && "drop-cap")} style={gradientTextStyle(s)}>
          <RichText html={d.text ?? ""} />
        </div>
      );

    case "richtext":
      return <RichText html={d.html ?? ""} />;

    case "highlight":
      return (
        <div className="flex items-start gap-3">
          {d.emoji ? <span className="text-[20px] leading-none">{d.emoji}</span> : null}
          <p className="font-serif text-[inherit] leading-snug">{d.text}</p>
        </div>
      );

    case "quote": {
      const tone = d.tone ?? "bar";
      const body = (
        <p className="font-serif leading-snug">{d.quote}</p>
      );
      const attribution = (
        <div className="flex items-center gap-3">
          {d.avatar ? (
            <Avatar src={d.avatar} name={d.author} size={36} />
          ) : null}
          <div
            className={cn(
              "text-[13px]",
              s.align === "center" && "text-center",
            )}
          >
            <p className="font-semibold">{d.author}</p>
            {d.role ? <p className="text-ink-muted">{d.role}</p> : null}
          </div>
        </div>
      );
      if (tone === "card") {
        return (
          <div className="flex flex-col gap-4">
            {body}
            {attribution}
          </div>
        );
      }
      if (tone === "centered") {
        return (
          <div className="flex flex-col items-center gap-4 text-center">
            {body}
            {attribution}
          </div>
        );
      }
      return (
        <div className="flex gap-4">
          <span
            className="w-[3px] shrink-0 rounded-full"
            style={{ background: s.accentColor }}
          />
          <div className="flex flex-col gap-3">
            {body}
            {attribution}
          </div>
        </div>
      );
    }

    case "divider": {
      if (d.variant === "ornament") {
        return (
          <div className="flex items-center justify-center gap-3 py-1 text-[13px] tracking-[0.4em] text-ink-muted">
            • • •
          </div>
        );
      }
      return (
        <div className="flex items-center gap-3">
          <span
            className="h-px flex-1"
            style={{
              borderTop: `1px ${d.variant ?? "solid"} ${s.borderColor ?? "#D9D5CB"}`,
            }}
          />
          {d.label ? (
            <span className="text-[12px] font-medium text-ink-muted">{d.label}</span>
          ) : null}
          {d.label ? (
            <span
              className="h-px flex-1"
              style={{
                borderTop: `1px ${d.variant ?? "solid"} ${s.borderColor ?? "#D9D5CB"}`,
              }}
            />
          ) : null}
        </div>
      );
    }

    case "spacer":
      return <div style={{ height: d.height ?? 40 }} />;

    case "list": {
      const items = (d.items ?? []) as { text: string }[];
      return (
        <ul className="flex flex-col" style={{ gap: Math.max(6, s.gap - 4) }}>
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <span
                className="mt-[2px] shrink-0 text-[13px] font-semibold"
                style={{ color: s.accentColor }}
              >
                {d.style === "number" ? `${index + 1}.` : d.style === "arrow" ? "→" : "•"}
              </span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      );
    }

    case "checklist": {
      const items = (d.items ?? []) as { text: string; done?: boolean }[];
      return (
        <ul className="flex flex-col" style={{ gap: Math.max(6, s.gap - 4) }}>
          {items.map((item, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  const next = items.map((entry, i) =>
                    i === index ? { ...entry, done: !entry.done } : entry,
                  );
                  updateData(block.id, { items: next });
                }}
                className="flex w-full items-start gap-3 text-left"
              >
                <span
                  className={cn(
                    "mt-[2px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[6px] border transition",
                    item.done ? "border-transparent" : "border-line-strong bg-white",
                  )}
                  style={item.done ? { background: s.accentColor } : undefined}
                >
                  {item.done ? <Check className="h-3 w-3 text-white" /> : null}
                </span>
                <span
                  className={cn(item.done && "text-ink-muted line-through")}
                >
                  {item.text}
                </span>
              </button>
            </li>
          ))}
        </ul>
      );
    }

    case "code":
      return (
        <div className="flex flex-col gap-2">
          {d.language ? (
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              {d.language}
            </span>
          ) : null}
          <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed">
            <code>{d.code ?? ""}</code>
          </pre>
        </div>
      );

    /* ------------------------------ Layout ---------------------------- */
    case "columns2":
    case "columns3": {
      const columns = (d.columns ?? []) as { heading: string; body: string }[];
      const count = block.type === "columns2" ? 2 : 3;
      const visibleColumns = React.useMemo(
        () =>
          columns.map((column, index) => ({
            column,
            id: `col-${block.id}-${index}`,
          })),
        [block.id, columns],
      );

      return (
        <div
          className={cn(
            "flex flex-col gap-3",
            s.stackOnMobile && "sm:grid sm:grid-cols-1 sm:grid-rows-none",
          )}
          style={s.stackOnMobile ? undefined : { display: "grid", gap: s.gap }}
        >
          {count > 1 && !s.stackOnMobile ? (
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
                gap: s.gap,
              }}
            >
              {visibleColumns.map(({ column, id }, index) => (
                <ColumnShell
                  key={id}
                  column={column}
                  index={index}
                  total={count}
                  blockId={block.id}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visibleColumns.map(({ column, id }, index) => (
                <ColumnShell
                  key={id}
                  column={column}
                  index={index}
                  total={count}
                  blockId={block.id}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

function ColumnShell({
  column,
  index,
  total,
  blockId,
}: {
  column: { heading: string; body: string };
  index: number;
  total: number;
  blockId: string;
}) {
  return (
    <div className="relative rounded-[16px] border border-line bg-white p-4 shadow-soft">
      <p className="pl-5 text-[15px] font-semibold tracking-[-0.01em]">
        {column.heading}
      </p>
      <p className="pl-5 text-[14.5px] leading-relaxed" style={{ opacity: 0.78 }}>
        {column.body}
      </p>
    </div>
  );
}
    case "callout": {
      const tone = TONES[d.tone ?? "tip"] ?? TONES.tip;
      return (
        <div
          className="flex gap-3 rounded-[14px] border px-4 py-3.5"
          style={{ background: tone.bg, borderColor: tone.border }}
        >
          {d.emoji ? <span className="text-[18px] leading-none">{d.emoji}</span> : null}
          <div className="flex flex-col gap-1">
            {d.title ? (
              <p className="text-[14.5px] font-semibold" style={{ color: tone.accent }}>
                {d.title}
              </p>
            ) : null}
            <p className="text-[14px] leading-relaxed text-ink-soft">{d.body}</p>
          </div>
        </div>
      );
    }

    case "card":
      return (
        <div className="flex flex-col gap-3">
          {d.image ? <SmartImage src={d.image} alt={d.title} className="rounded-[12px]" /> : null}
          {d.eyebrow ? (
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: s.accentColor }}
            >
              {d.eyebrow}
            </p>
          ) : null}
          <p className="text-[18px] font-semibold tracking-[-0.01em]">{d.title}</p>
          <p className="text-[14.5px] leading-relaxed" style={{ opacity: 0.8 }}>
            {d.body}
          </p>
          {d.linkLabel ? (
            <span
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold"
              style={{ color: s.linkColor }}
            >
              {d.linkLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          ) : null}
        </div>
      );

    case "featureGrid": {
      const items = (d.items ?? []) as { emoji: string; title: string; body: string }[];
      const cols = Number(d.columns ?? 2);
      return (
        <div className="flex flex-col gap-3">
          {d.title ? (
            <p className="text-[18px] font-semibold tracking-[-0.01em]">{d.title}</p>
          ) : null}
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: s.gap }}
          >
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-1.5 rounded-[14px] border border-line bg-white p-4"
              >
                <span className="text-[18px] leading-none">{item.emoji}</span>
                <p className="text-[14.5px] font-semibold">{item.title}</p>
                <p className="text-[13.5px] leading-relaxed text-ink-soft">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "table": {
      const headers = (d.headers ?? []) as { text: string }[];
      const rows = (d.rows ?? []) as { cells: string }[];
      return (
        <div className="overflow-hidden rounded-[14px] border border-line">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr style={{ background: "#F7F6F2" }}>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted"
                  >
                    {header.text}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-t border-line"
                  style={d.striped && rowIndex % 2 === 1 ? { background: "#FBFAF7" } : undefined}
                >
                  {splitCells(row.cells).map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2.5 text-[14px]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "stats": {
      const items = (d.items ?? []) as { value: string; label: string }[];
      return (
        <div className="flex flex-wrap" style={{ gap: s.gap }}>
          {items.map((item, index) => (
            <div
              key={index}
              className="min-w-[120px] flex-1 rounded-[14px] border border-line bg-white px-4 py-3"
            >
              <p className="font-serif text-[30px] leading-none tracking-[-0.02em]">
                {item.value}
              </p>
              <p className="mt-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-ink-muted">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      );
    }

    case "timeline": {
      const items = (d.items ?? []) as {
        date: string;
        title: string;
        body: string;
        color: string;
      }[];
      return (
        <div className="flex flex-col">
          {items.map((item, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className="mt-[6px] h-[10px] w-[10px] shrink-0 rounded-full ring-4"
                  style={{
                    background: item.color || s.accentColor,
                    boxShadow: `0 0 0 4px ${item.color || s.accentColor}22`,
                  }}
                />
                {index < items.length - 1 ? (
                  <span className="my-1 w-px flex-1 bg-line" />
                ) : null}
              </div>
              <div className="flex flex-col gap-1 pb-5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                  {item.date}
                </span>
                <p className="text-[15.5px] font-semibold">{item.title}</p>
                <p className="text-[14px] leading-relaxed" style={{ opacity: 0.8 }}>
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "faq":
      return <FaqAccordion block={block} />;

    /* ------------------------------ Media ----------------------------- */
    case "image":
      return (
        <div className="flex flex-col gap-2">
          <SmartImage
            src={d.src}
            alt={d.alt}
            className="rounded-[14px]"
            style={
              d.ratio && d.ratio !== "auto"
                ? { aspectRatio: d.ratio, height: "auto" }
                : undefined
            }
            label="Image"
          />
          {d.caption ? (
            <p className="text-center text-[13px] text-ink-muted">{d.caption}</p>
          ) : null}
          {d.credit ? (
            <p className="text-center text-[11px] text-ink-muted/80">{d.credit}</p>
          ) : null}
        </div>
      );

    case "banner":
      return (
        <div
          className="relative flex w-full items-end overflow-hidden rounded-[14px]"
          style={{ height: d.height ?? 260, background: "#EDEBE5" }}
        >
          {d.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={d.src}
              alt={d.title ?? ""}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          <span
            className="absolute inset-0"
            style={{ background: `rgba(17,24,39,${d.overlay ?? 0.25})` }}
          />
          {d.title || d.subtitle ? (
            <div className="relative z-10 flex flex-col gap-1 p-5">
              {d.title ? (
                <p className="font-serif text-[26px] leading-tight text-white">{d.title}</p>
              ) : null}
              {d.subtitle ? (
                <p className="text-[14px] text-white/85">{d.subtitle}</p>
              ) : null}
            </div>
          ) : !d.src ? (
            <div className="relative z-10 flex w-full flex-col items-center justify-center gap-1.5 py-14 text-center">
              <span className="text-[12px] font-medium text-ink-muted">Banner image</span>
              <span className="text-[11px] text-ink-muted/80">
                Add an image URL in the inspector
              </span>
            </div>
          ) : null}
        </div>
      );

    case "gallery": {
      const items = (d.items ?? []) as { src: string; caption: string }[];
      const cols = Number(d.columns ?? 2);
      return (
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: s.gap }}
        >
          {items.map((item, index) => (
            <div key={index} className="flex flex-col gap-1.5">
              <SmartImage
                src={item.src}
                alt={item.caption}
                className="rounded-[12px]"
                style={{ aspectRatio: "4/3" }}
                label="Image"
              />
              {item.caption ? (
                <p className="text-[12.5px] text-ink-muted">{item.caption}</p>
              ) : null}
            </div>
          ))}
        </div>
      );
    }

    case "gif":
      return (
        <div className="flex flex-col gap-2">
          <SmartImage src={d.src} alt={d.alt} className="rounded-[12px]" label="GIF" />
          {d.caption ? (
            <p className="text-center text-[13px] text-ink-muted">{d.caption}</p>
          ) : null}
        </div>
      );

    case "video":
      return (
        <div className="flex flex-col">
          <div className="relative flex w-full items-center justify-center overflow-hidden rounded-t-[17px] bg-[#0F172A]">
            {d.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={d.thumbnail}
                alt={d.title ?? ""}
                className="h-auto w-full object-cover opacity-80"
                style={{ aspectRatio: "16/9" }}
              />
            ) : (
              <div className="flex w-full items-center justify-center" style={{ aspectRatio: "16/9" }}>
                <span className="text-[12px] text-white/60">Video thumbnail</span>
              </div>
            )}
            <span className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-lg">
              <Play className="ml-0.5 h-4 w-4 fill-ink text-ink" />
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-b-[17px] border-t border-line bg-white px-4 py-3">
            <p className="text-[14.5px] font-semibold">{d.title}</p>
            {d.caption ? (
              <p className="text-[12.5px] text-ink-muted">{d.caption}</p>
            ) : null}
          </div>
        </div>
      );

    case "tweet":
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Avatar src={d.avatar} name={d.name} size={40} />
            <div className="min-w-0">
              <p className="text-[14.5px] font-semibold leading-tight">{d.name}</p>
              <p className="text-[13px] text-ink-muted">{d.handle}</p>
            </div>
            <span className="ml-auto text-[12px] text-ink-muted">{d.date}</span>
          </div>
          <p className="text-[15.5px] leading-relaxed">{d.body}</p>
          <div className="flex items-center gap-5 text-[12.5px] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" /> {d.likes}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Repeat2 className="h-3.5 w-3.5" /> {d.reposts}
            </span>
          </div>
        </div>
      );

    /* --------------------------- Newsletter --------------------------- */
    case "hero":
      return (
        <div className="flex flex-col gap-5">
          {d.showLogo ? (
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold tracking-[-0.02em]">
                {d.logo}
                <span style={{ color: s.accentColor }}>.</span>
              </span>
              {d.date ? (
                <span className="text-[12px] font-medium uppercase tracking-[0.1em] text-ink-muted">
                  {d.date}
                </span>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-col gap-3">
            {d.eyebrow ? (
              <span
                className="w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ background: `${s.accentColor}18`, color: s.accentColor }}
              >
                {d.eyebrow}
              </span>
            ) : null}
            <h1 className="font-serif text-[42px] leading-[1.05] tracking-[-0.02em]">
              {d.title}
            </h1>
            {d.subtitle ? (
              <p className="max-w-[52ch] text-[16px] leading-relaxed text-ink-soft">
                {d.subtitle}
              </p>
            ) : null}
          </div>
          {d.image ? (
            <SmartImage src={d.image} alt={d.title} className="rounded-[14px]" label="Hero image" />
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            {d.ctaLabel ? (
              <span className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-[14px] font-semibold text-white">
                {d.ctaLabel}
              </span>
            ) : null}
            {d.secondaryLabel ? (
              <span className="inline-flex h-10 items-center rounded-full border border-line-strong bg-white px-5 text-[14px] font-medium text-ink">
                {d.secondaryLabel}
              </span>
            ) : null}
            {d.issue ? (
              <span className="ml-auto text-[12px] font-medium text-ink-muted">
                Issue {d.issue}
              </span>
            ) : null}
          </div>
        </div>
      );

    case "authorCard":
      return (
        <div className="flex items-start gap-4">
          <Avatar src={d.avatar} name={d.name} size={56} />
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-[15.5px] font-semibold leading-tight">{d.name}</p>
              <p className="text-[13px] text-ink-muted">{d.role}</p>
            </div>
            <p className="text-[14px] leading-relaxed" style={{ opacity: 0.82 }}>
              {d.bio}
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "X", value: d.twitter },
                { label: "LinkedIn", value: d.linkedin },
                { label: "Website", value: d.website },
              ]
                .filter((item) => item.value)
                .map((item) => (
                  <span
                    key={item.label}
                    className="rounded-full border border-line bg-canvas px-2.5 py-1 text-[12px] font-medium text-ink-soft"
                  >
                    {item.label}
                  </span>
                ))}
            </div>
          </div>
        </div>
      );

    case "subscribe":
      return (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex flex-col gap-2">
            <p className="font-serif text-[26px] leading-tight">{d.title}</p>
            <p className="max-w-[48ch] text-[14.5px] leading-relaxed opacity-80">{d.body}</p>
          </div>
          <div className="flex w-full max-w-[420px] items-center gap-2 rounded-full border border-white/15 bg-white/10 p-1.5">
            <span className="flex-1 px-3 text-left text-[13.5px] opacity-60">
              {d.placeholder}
            </span>
            <span
              className="rounded-full px-4 py-2 text-[13.5px] font-semibold"
              style={{ background: s.accentColor, color: "#111827" }}
            >
              {d.buttonLabel}
            </span>
          </div>
          {d.note ? <p className="text-[12.5px] opacity-65">{d.note}</p> : null}
        </div>
      );

    case "share":
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-[17px] font-semibold">{d.title}</p>
          <p className="max-w-[46ch] text-[14px] leading-relaxed text-ink-soft">{d.body}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {(d.networks ?? "x")
              .split(",")
              .map((network: string) => network.trim())
              .filter(Boolean)
              .map((network: string) => (
                <PlatformPill key={network} platform={network} />
              ))}
          </div>
          {d.ctaLabel ? (
            <span className="mt-1 inline-flex h-9 items-center rounded-full bg-ink px-4 text-[13.5px] font-semibold text-white">
              {d.ctaLabel}
            </span>
          ) : null}
        </div>
      );

    case "social":
      return (
        <div
          className={cn(
            "flex flex-col gap-3",
            d.alignCenter && "items-center text-center",
          )}
        >
          {d.title ? <SectionLabel>{d.title}</SectionLabel> : null}
          <div className="flex flex-wrap justify-center gap-2">
            {((d.items ?? []) as { platform: string; url: string }[]).map((item, index) => (
              <PlatformPill key={index} platform={item.platform} />
            ))}
          </div>
        </div>
      );

    case "signature":
      return (
        <div className="flex items-center gap-3">
          {d.avatar ? <Avatar src={d.avatar} name={d.name} size={44} /> : null}
          <div className="flex flex-col">
            <p style={{ opacity: 0.85 }}>{d.text}</p>
            <p
              className={cn("mt-2 font-semibold", !d.signatureStyle && "text-[15px]")}
            >
              {d.name}
              {d.role ? (
                <span className="ml-1.5 text-[13px] font-normal text-ink-muted">
                  · {d.role}
                </span>
              ) : null}
            </p>
          </div>
        </div>
      );

    case "readingList": {
      const items = (d.items ?? []) as {
        title: string;
        source: string;
        url: string;
        thumb: string;
        description: string;
      }[];
      return (
        <div className="flex flex-col" style={{ gap: s.gap }}>
          {d.title ? (
            <p className="text-[18px] font-semibold tracking-[-0.01em]">{d.title}</p>
          ) : null}
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 border-b border-line pb-4 last:border-b-0 last:pb-0"
            >
              <span className="mt-[2px] font-mono text-[12px] text-ink-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-1 flex-col gap-1">
                <p className="text-[15.5px] font-semibold leading-snug">
                  {item.title}
                  {item.source ? (
                    <span className="ml-2 text-[12px] font-normal uppercase tracking-[0.08em] text-ink-muted">
                      {item.source}
                    </span>
                  ) : null}
                </p>
                <p className="text-[14px] leading-relaxed" style={{ opacity: 0.78 }}>
                  {item.description}
                </p>
              </div>
              <SmartImage
                src={item.thumb}
                alt={item.title}
                className="w-[92px] shrink-0 rounded-[10px]"
                style={{ aspectRatio: "4/3" }}
                label="Thumb"
              />
            </div>
          ))}
        </div>
      );
    }

    case "resources": {
      const items = (d.items ?? []) as {
        title: string;
        type: string;
        url: string;
        description: string;
      }[];
      return (
        <div className="flex flex-col" style={{ gap: s.gap }}>
          {d.title ? (
            <p className="text-[18px] font-semibold tracking-[-0.01em]">{d.title}</p>
          ) : null}
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-[14px] border border-line bg-white p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-50 text-[11px] font-bold text-brand">
                {item.type}
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-[15px] font-semibold">{item.title}</p>
                <p className="text-[13.5px] leading-relaxed text-ink-soft">
                  {item.description}
                </p>
              </div>
              <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-ink-muted" />
            </div>
          ))}
        </div>
      );
    }

    case "button": {
      const variants: Record<string, string> = {
        primary: "bg-brand text-white",
        accent: "bg-gold text-ink",
        outline: "border border-line-strong bg-white text-ink",
        dark: "bg-ink text-white",
      };
      const alignMap: Record<string, string> = {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      };
      return (
        <div className={cn("flex", alignMap[d.align ?? "center"])}>
          <span
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-full px-6 text-[14.5px] font-semibold shadow-[0_8px_20px_-10px_rgba(17,24,39,0.4)]",
              variants[d.variant ?? "primary"],
            )}
          >
            {d.label}
            {d.icon === "arrow" ? <ArrowRight className="h-4 w-4" /> : null}
            {d.icon === "external" ? <ExternalLink className="h-4 w-4" /> : null}
          </span>
        </div>
      );
    }

    case "footer":
      return (
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-brand text-[11px] font-bold text-white"
            >
              P
            </span>
            <p className="font-semibold text-ink-soft">{d.note}</p>
          </div>
          <p>{d.address}</p>
          <p>{d.copyright}</p>
          <span className="underline decoration-line-strong underline-offset-2">
            {d.unsubscribeLabel}
          </span>
        </div>
      );

    /* -------------------------- Database-backed -------------------------- */
    case "booksRead": {
      const d = block.data as { title?: string; selectedIds?: string[] };
      return <BooksReadRenderer title={d.title} selectedIds={d.selectedIds} />;
    }

    case "booksPublished": {
      const d = block.data as { title?: string; selectedIds?: string[] };
      return <BooksPublishedRenderer title={d.title} selectedIds={d.selectedIds} />;
    }

    case "ebooks": {
      const d = block.data as { title?: string; selectedIds?: string[] };
      return <EbooksRenderer title={d.title} selectedIds={d.selectedIds} />;
    }

    case "quotes": {
      const d = block.data as { title?: string; selectedIds?: string[] };
      return <QuotesRenderer title={d.title} selectedIds={d.selectedIds} />;
    }

    case "videoFeed": {
      const d = block.data as { title?: string; selectedIds?: string[] };
      return <VideoFeedRenderer title={d.title} selectedIds={d.selectedIds} />;
    }

    case "blogPosts": {
      const d = block.data as { title?: string; selectedIds?: string[] };
      return <BlogPostsRenderer title={d.title} selectedIds={d.selectedIds} />;
    }

    default:
      return (
        <div className="flex items-center gap-2 rounded-[12px] border border-dashed border-line-strong px-4 py-6 text-[13px] text-ink-muted">
          <Square className="h-4 w-4" />
          Unknown block type: {block.type}
        </div>
      );
  }
}

/* ------------------------------------------------------------------ *
 *  Small shared bits re-exported for convenience
 * ------------------------------------------------------------------ */
export { Avatar, Highlighted, RichText, SmartImage, SectionLabel };
export const BLOCK_ICONS = { Check, CircleCheck, Clock, Mail };

/* ------------------------------------------------------------------ *
 *  Database-backed block renderers
 * ------------------------------------------------------------------ */
function LoadingState() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-line px-4 py-6 text-[13px] text-ink-muted">
      <Clock className="h-4 w-4 animate-pulse" />
      Loading…
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-line px-4 py-6 text-[13px] text-ink-muted">
      <Square className="h-4 w-4" />
      No {label} found in database
    </div>
  );
}

function BooksReadRenderer({ title, selectedIds }: { title?: string; selectedIds?: string[] }) {
  const { data, loading } = useBlockData();
  if (loading) return <LoadingState />;
  const all = data?.booksRead ?? [];
  const items = selectedIds?.length ? all.filter((i) => selectedIds.includes(i.id)) : all;
  if (!items.length) return <EmptyState label="books" />;
  return (
    <div className="flex flex-col gap-4">
      {title ? <h3 className="font-serif text-[22px] font-bold text-ink">{title}</h3> : null}
      {items.map((item, i) => (
        <div key={item.id} className="flex gap-3 rounded-xl border border-line bg-surface p-4">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-[15px] font-bold text-brand">
              {i + 1}
            </span>
          )}
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-[15px] font-semibold text-ink truncate">{item.title}</p>
            {item.author ? <p className="text-[13px] text-ink-muted">by {item.author}</p> : null}
            {item.note ? <p className="text-[13px] text-ink-soft italic line-clamp-2">{item.note}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function BooksPublishedRenderer({ title, selectedIds }: { title?: string; selectedIds?: string[] }) {
  const { data, loading } = useBlockData();
  if (loading) return <LoadingState />;
  const all = data?.booksPublished ?? [];
  const items = selectedIds?.length ? all.filter((i) => selectedIds.includes(i.id)) : all;
  if (!items.length) return <EmptyState label="published books" />;
  return (
    <div className="flex flex-col gap-4">
      {title ? <h3 className="font-serif text-[22px] font-bold text-ink">{title}</h3> : null}
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} className="h-14 w-10 shrink-0 rounded-lg object-cover" />
          ) : (
            <span className="flex h-14 w-10 shrink-0 items-center justify-center rounded-lg bg-brand text-[18px]">📖</span>
          )}
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="text-[15px] font-semibold text-ink truncate">{item.title}</p>
            {item.tagline ? <p className="text-[13px] text-ink-muted truncate">{item.tagline}</p> : null}
          </div>
          {item.buyUrl ? (
            <a href={item.buyUrl} target="_blank" rel="noopener" className="ml-auto shrink-0 text-[12px] font-medium text-brand underline">Buy →</a>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function EbooksRenderer({ title, selectedIds }: { title?: string; selectedIds?: string[] }) {
  const { data, loading } = useBlockData();
  if (loading) return <LoadingState />;
  const all = data?.ebooks ?? [];
  const items = selectedIds?.length ? all.filter((i) => selectedIds.includes(i.id)) : all;
  if (!items.length) return <EmptyState label="e-books" />;
  return (
    <div className="flex flex-col gap-4">
      {title ? <h3 className="font-serif text-[22px] font-bold text-ink">{title}</h3> : null}
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} className="h-14 w-10 shrink-0 rounded-lg object-cover" />
          ) : (
            <span className="flex h-14 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-[18px]">📘</span>
          )}
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="text-[15px] font-semibold text-ink truncate">{item.title}</p>
            {item.description ? <p className="text-[13px] text-ink-muted truncate">{item.description}</p> : null}
          </div>
          <span className="ml-auto shrink-0 text-[12px] font-medium text-emerald-600">
            {item.free ? "Free" : "Premium"}
          </span>
        </div>
      ))}
    </div>
  );
}

function QuotesRenderer({ title, selectedIds }: { title?: string; selectedIds?: string[] }) {
  const { data, loading } = useBlockData();
  if (loading) return <LoadingState />;
  const all = data?.quotes ?? [];
  const items = selectedIds?.length ? all.filter((i) => selectedIds.includes(i.id)) : all;
  if (!items.length) return <EmptyState label="quotes" />;
  return (
    <div className="flex flex-col gap-5">
      {title ? <h3 className="font-serif text-[22px] font-bold text-ink">{title}</h3> : null}
      {items.map((item) => (
        <div key={item.id} className="border-l-2 border-brand pl-4">
          <p className="font-serif text-[17px] leading-relaxed text-ink italic">&ldquo;{item.text}&rdquo;</p>
          {item.tag ? <p className="mt-1 text-[12px] text-ink-muted uppercase tracking-wider">{item.tag}</p> : null}
        </div>
      ))}
    </div>
  );
}

function VideoFeedRenderer({ title, selectedIds }: { title?: string; selectedIds?: string[] }) {
  const { data, loading } = useBlockData();
  if (loading) return <LoadingState />;
  const all = data?.videos ?? [];
  const items = selectedIds?.length ? all.filter((i) => selectedIds.includes(i.id)) : all;
  if (!items.length) return <EmptyState label="videos" />;
  return (
    <div className="flex flex-col gap-4">
      {title ? <h3 className="font-serif text-[22px] font-bold text-ink">{title}</h3> : null}
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 rounded-xl border border-line bg-surface p-4">
          {item.thumbnail ? (
            <img src={item.thumbnail} alt={item.title} className="h-16 w-24 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
              <Play className="h-6 w-6 text-ink-muted" />
            </div>
          )}
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-[15px] font-semibold text-ink truncate">{item.title}</p>
            <a href={item.embedUrl} target="_blank" rel="noopener" className="text-[12px] text-brand underline truncate">
              Watch video →
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

function BlogPostsRenderer({ title, selectedIds }: { title?: string; selectedIds?: string[] }) {
  const { data, loading } = useBlockData();
  if (loading) return <LoadingState />;
  const all = data?.blogs ?? [];
  const items = selectedIds?.length ? all.filter((i) => selectedIds.includes(i.id)) : all;
  if (!items.length) return <EmptyState label="blog posts" />;
  return (
    <div className="flex flex-col gap-4">
      {title ? <h3 className="font-serif text-[22px] font-bold text-ink">{title}</h3> : null}
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 rounded-xl border border-line bg-surface p-4">
          {item.coverImage ? (
            <img src={item.coverImage} alt={item.title} className="h-16 w-24 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
              <Rss className="h-5 w-5 text-ink-muted" />
            </div>
          )}
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-[15px] font-semibold text-ink truncate">{item.title}</p>
            {item.excerpt ? <p className="text-[13px] text-ink-muted line-clamp-2">{item.excerpt}</p> : null}
            <a href={`https://sagarlad.com/blog/${item.slug}`} target="_blank" rel="noopener" className="text-[12px] text-brand underline">
              Read post →
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
