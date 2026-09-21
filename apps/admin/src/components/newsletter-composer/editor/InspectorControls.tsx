"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bold,
  Code,
  CornerDownLeft,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Plus,
  Quote,
  Trash2,
  Underline,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
} from "lucide-react";
import {
  Button,
  ColorInput,
  Field,
  Input,
  Label,
  Select,
  Slider,
  Switch,
  Textarea,
  Textarea as TextareaInput,
  ToggleRow,
  Tooltip,
} from "@/components/newsletter-composer/ui/primitives";
import type { FieldDef } from "@/components/newsletter-composer/types/editor";
import { cn } from "@/components/newsletter-composer/lib/utils";

/* ------------------------------------------------------------------ *
 *  Rich text editor (contentEditable + execCommand)
 * ------------------------------------------------------------------ */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = 120,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [focused, setFocused] = React.useState(false);
  const [linkPopover, setLinkPopover] = React.useState<{ show: boolean; url: string }>({ show: false, url: "" });

  React.useEffect(() => {
    if (!ref.current) return;
    if (!focused && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value ?? "";
    }
  }, [value, focused]);

  const exec = (command: string, argument?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, argument);
    onChange(ref.current?.innerHTML ?? "");
  };

  const applyLink = () => {
    if (linkPopover.url) {
      exec("createLink", linkPopover.url);
    }
    setLinkPopover({ show: false, url: "" });
  };

  const openLinkPopover = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const node = sel.anchorNode;
      const anchor = node?.parentElement?.closest("a") as HTMLAnchorElement | null;
      if (anchor) {
        setLinkPopover({ show: true, url: anchor.href || "" });
      } else {
        setLinkPopover({ show: true, url: "https://" });
      }
    } else {
      setLinkPopover({ show: true, url: "https://" });
    }
  };

  const tools: { icon: React.ComponentType<{ className?: string }>; label: string; run: () => void }[] = [
    { icon: Bold, label: "Bold", run: () => exec("bold") },
    { icon: Italic, label: "Italic", run: () => exec("italic") },
    { icon: Underline, label: "Underline", run: () => exec("underline") },
    { icon: Link2, label: "Link", run: openLinkPopover },
    {
      icon: CornerDownLeft,
      label: "Highlight",
      run: () => exec("hiliteColor", "#FDF0B5"),
    },
    { icon: Code, label: "Inline code", run: () => exec("formatBlock", "<pre>") },
    { icon: List, label: "Bullet list", run: () => exec("insertUnorderedList") },
    { icon: ListOrdered, label: "Number list", run: () => exec("insertOrderedList") },
    { icon: Quote, label: "Quote", run: () => exec("formatBlock", "<blockquote>") },
  ];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-control border bg-surface transition",
        focused ? "border-brand ring-3 ring-brand/15" : "border-line",
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-canvas/60 px-1.5 py-1">
        {tools.map((tool) => (
          <Tooltip key={tool.label} label={tool.label}>
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                tool.run();
              }}
              className="flex h-6.5 w-6.5 items-center justify-center rounded-[7px] p-1 text-ink-muted transition hover:bg-black/[0.06] hover:text-ink"
            >
              <tool.icon className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        ))}
      </div>
      {linkPopover.show ? (
        <div className="flex items-center gap-2 border-b border-line bg-canvas/80 px-2 py-1.5">
          <Link2 className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
          <input
            type="url"
            value={linkPopover.url}
            onChange={(e) => setLinkPopover((prev) => ({ ...prev, url: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setLinkPopover({ show: false, url: "" });
            }}
            placeholder="https://..."
            autoFocus
            className="flex-1 rounded-md border border-line bg-white px-2 py-1 text-[12px] text-ink outline-none focus:border-brand"
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyLink();
            }}
            className="shrink-0 rounded-md bg-brand px-2 py-1 text-[11px] font-medium text-white hover:bg-brand/90"
          >
            Apply
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setLinkPopover({ show: false, url: "" });
            }}
            className="shrink-0 rounded-md px-1.5 py-1 text-[11px] text-ink-muted hover:bg-black/[0.05]"
          >
            Cancel
          </button>
        </div>
      ) : null}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onChange(ref.current?.innerHTML ?? "");
        }}
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="rich-text max-h-72 overflow-y-auto scroll-thin px-3 py-2 text-[13px] leading-relaxed text-ink outline-none empty:before:text-ink-muted empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Image field with upload + URL
 * ------------------------------------------------------------------ */
function ImageField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const upload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-control border border-dashed border-line-strong bg-canvas">
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={label ?? ""} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-ink-muted shadow-soft transition hover:text-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-ink-muted">
            <ImagePlus className="h-4 w-4" />
            <span className="text-[11.5px]">No image selected</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={value.startsWith("data:") ? "" : value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={value.startsWith("data:") ? "Uploaded file" : "https://…"}
          className="flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          className="shrink-0"
        >
          <Upload className="h-3.5 w-3.5" />
          {value ? "Replace" : "Upload"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,image/gif"
          className="hidden"
          onChange={(event) => upload(event.target.files?.[0])}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Repeatable list editor
 * ------------------------------------------------------------------ */
function RepeatEditor({
  field,
  items,
  onChange,
}: {
  field: FieldDef;
  items: Record<string, any>[];
  onChange: (items: Record<string, any>[]) => void;
}) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const childFields = field.fields ?? [];

  const blank = () => {
    const item: Record<string, any> = {};
    childFields.forEach((child) => {
      if (child.type === "toggle") item[child.key] = false;
      else if (child.type === "colorDot") item[child.key] = "#1D4ED8";
      else if (child.type === "select") item[child.key] = child.options?.[0]?.value ?? "";
      else item[child.key] = "";
    });
    return item;
  };

  const update = (index: number, key: string, value: any) => {
    const next = items.map((item, i) => (i === index ? { ...item, [key]: value } : item));
    onChange(next);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    setOpenIndex(null);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const title = String(
          item.title ??
            item.text ??
            item.question ??
            item.heading ??
            item.value ??
            item.label ??
            item.name ??
            item.platform ??
            item.source ??
            item.cells ??
            item.caption ??
            item.date ??
            `Item ${index + 1}`,
        );
        return (
          <div
            key={index}
            className="overflow-hidden rounded-control border border-line bg-surface"
          >
            <div className="flex items-center gap-1 px-2 py-1.5">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block truncate text-[12.5px] font-medium text-ink">
                  {title}
                </span>
              </button>
              <Tooltip label="Move up">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  className="rounded-[7px] p-1 text-ink-muted transition hover:bg-black/[0.05] hover:text-ink"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
              <Tooltip label="Move down">
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  className="rounded-[7px] p-1 text-ink-muted transition hover:bg-black/[0.05] hover:text-ink"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
              <Tooltip label="Remove">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="rounded-[7px] p-1 text-ink-muted transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            </div>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden border-t border-line"
                >
                  <div className="space-y-2.5 bg-canvas/50 px-2.5 py-2.5">
                    {childFields.map((child) => (
                      <FieldRenderer
                        key={child.key}
                        field={child}
                        value={item[child.key]}
                        onChange={(value) => update(index, child.key, value)}
                        compact
                      />
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => {
          const next = [...items, blank()];
          onChange(next);
          setOpenIndex(next.length - 1);
        }}
      >
        <Plus className="h-3.5 w-3.5" />
        {field.addLabel ?? `Add ${field.itemLabel ?? "item"}`}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Number input — commits on real values only.
 *
 *  Typing used to coerce an empty field to 0, which made a spacer jump to
 *  zero height (and vanish) mid-edit. The draft string is local, so clearing
 *  the field while typing is safe; only finite values reach the document.
 * ------------------------------------------------------------------ */
function NumberInput({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = React.useState(String(value ?? ""));
  const editing = React.useRef(false);

  React.useEffect(() => {
    if (!editing.current) setDraft(String(value ?? ""));
  }, [value]);

  return (
    <Input
      type="number"
      min={min}
      max={max}
      step={step}
      value={draft}
      onFocus={() => {
        editing.current = true;
      }}
      onBlur={() => {
        editing.current = false;
        setDraft(String(value ?? ""));
      }}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        if (next === "") return;
        const parsed = Number(next);
        if (Number.isFinite(parsed)) onChange(parsed);
      }}
    />
  );
}

/* ------------------------------------------------------------------ *
 *  Generic field renderer
 * ------------------------------------------------------------------ */
export function FieldRenderer({
  field,
  value,
  onChange,
  compact,
}: {
  field: FieldDef;
  value: any;
  onChange: (value: any) => void;
  compact?: boolean;
}) {
  switch (field.type) {
    case "text":
      return (
        <Field label={field.label} hint={field.hint}>
          <Input
            value={value ?? ""}
            placeholder={field.placeholder}
            onChange={(event) => onChange(event.target.value)}
          />
        </Field>
      );

    case "textarea":
      return (
        <Field label={field.label} hint={field.hint}>
          <Textarea
            value={value ?? ""}
            placeholder={field.placeholder}
            rows={compact ? 2 : 3}
            onChange={(event) => onChange(event.target.value)}
          />
        </Field>
      );

    case "richtext":
      return (
        <Field label={field.label} hint={field.hint}>
          <RichTextEditor
            value={value ?? ""}
            onChange={onChange}
            placeholder={field.placeholder ?? "Write…"}
            minHeight={compact ? 90 : 130}
          />
        </Field>
      );

    case "number":
      return (
        <Field label={field.label} hint={field.hint}>
          <NumberInput
            value={Number(value ?? 0)}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={onChange}
          />
        </Field>
      );

    case "range":
      return (
        <Field label={field.label} hint={field.hint}>
          <Slider
            value={Number(value ?? 0)}
            min={field.min ?? 0}
            max={field.max ?? 100}
            step={field.step ?? 1}
            onChange={onChange}
          />
        </Field>
      );

    case "select":
      return (
        <Field label={field.label} hint={field.hint}>
          <Select
            value={String(value ?? "")}
            options={field.options ?? []}
            onChange={onChange}
          />
        </Field>
      );

    case "toggle":
      return (
        <ToggleRow
          label={field.label}
          hint={field.hint}
          checked={Boolean(value)}
          onChange={onChange}
        />
      );

    case "color":
      return (
        <Field label={field.label} hint={field.hint}>
          <ColorInput value={String(value ?? "#FFFFFF")} onChange={onChange} allowTransparent />
        </Field>
      );

    case "colorDot":
      return (
        <Field label={field.label} hint={field.hint}>
          <ColorInput value={String(value ?? "#1D4ED8")} onChange={onChange} />
        </Field>
      );

    case "image":
      return (
        <Field label={field.label} hint={field.hint}>
          <ImageField value={String(value ?? "")} onChange={onChange} label={field.label} />
        </Field>
      );

    case "repeat":
      return (
        <Field label={field.label} hint={field.hint}>
          <RepeatEditor
            field={field}
            items={Array.isArray(value) ? value : []}
            onChange={onChange}
          />
        </Field>
      );

    default:
      return null;
  }
}

/* ------------------------------------------------------------------ *
 *  Inspector row helpers
 * ------------------------------------------------------------------ */
export function ControlGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2.5">{children}</div>;
}

export function SegmentedChoice<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-line bg-[#f0eee8] p-1">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 rounded-[8px] px-2 py-1.5 text-[12px] transition-colors duration-150 select-none cursor-pointer",
              active
                ? "bg-brand text-white font-semibold border border-brand shadow-none"
                : "text-ink-soft font-medium hover:text-ink hover:bg-black/[0.04] border border-transparent",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export { Switch, Label, TextareaInput };

/* ------------------------------------------------------------------ *
 *  Database item selector — picks items from DB for newsletter blocks
 * ------------------------------------------------------------------ */
type DBItem = { id: string; title: string; imageUrl?: string | null; thumbnail?: string | null; author?: string | null; slug?: string | null };

type DBBlockType = "booksRead" | "booksPublished" | "ebooks" | "quotes" | "videoFeed" | "blogPosts";

const DB_BLOCK_LABELS: Record<DBBlockType, string> = {
  booksRead: "Books I Read",
  booksPublished: "Books I Published",
  ebooks: "E-books",
  quotes: "Quotes",
  videoFeed: "Videos",
  blogPosts: "Blog Posts",
};

// API returns "videos" / "blogs" but block types are "videoFeed" / "blogPosts"
const API_KEY_MAP: Record<string, string> = {
  videoFeed: "videos",
  blogPosts: "blogs",
};

let dbCache: Record<string, DBItem[]> | null = null;
let dbPromise: Promise<Record<string, DBItem[]>> | null = null;

function useDBItems(blockType: DBBlockType) {
  const [items, setItems] = React.useState<DBItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (dbCache) {
      const apiKey = API_KEY_MAP[blockType] ?? blockType;
      setItems(dbCache[apiKey] ?? []);
      setLoading(false);
      return;
    }
    if (!dbPromise) {
      dbPromise = fetch("/api/admin/newsletter/blocks")
        .then((r) => r.json())
        .then((d) => {
          dbCache = d;
          return d;
        })
        .catch(() => ({}));
    }
    dbPromise.then((d) => {
      const apiKey = API_KEY_MAP[blockType] ?? blockType;
      setItems(d[apiKey] ?? []);
      setLoading(false);
    });
  }, [blockType]);

  return { items, loading };
}

export function ItemSelector({
  blockType,
  selectedIds,
  onChange,
}: {
  blockType: DBBlockType;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const { items, loading } = useDBItems(blockType);

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  };

  const selectAll = () => onChange(items.map((i) => i.id));
  const clearAll = () => onChange([]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-line px-3 py-4 text-[12px] text-ink-muted">
        <span className="h-3 w-3 animate-pulse rounded-full bg-brand/40" />
        Loading {DB_BLOCK_LABELS[blockType]}…
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-line px-3 py-4 text-center text-[12px] text-ink-muted">
        No {DB_BLOCK_LABELS[blockType].toLowerCase()} in database yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-ink-muted">
          {selectedIds.length} / {items.length} selected
        </span>
        <div className="flex gap-1">
          <button type="button" onClick={selectAll} className="rounded-md px-2 py-0.5 text-[11px] font-medium text-brand hover:bg-brand-50">
            All
          </button>
          <button type="button" onClick={clearAll} className="rounded-md px-2 py-0.5 text-[11px] font-medium text-ink-muted hover:bg-canvas">
            None
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1 max-h-60 overflow-y-auto scroll-thin">
        {items.map((item) => {
          const selected = selectedIds.includes(item.id);
          const img = item.imageUrl || item.thumbnail;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition",
                selected
                  ? "border-brand bg-brand-50/60"
                  : "border-line bg-surface hover:bg-canvas",
              )}
            >
              {img ? (
                <img src={img} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas text-[11px] text-ink-muted">
                  {item.title.charAt(0)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-ink">{item.title}</p>
                {item.author ? <p className="truncate text-[11px] text-ink-muted">{item.author}</p> : null}
                {item.slug ? <p className="truncate text-[11px] text-ink-muted">/{item.slug}</p> : null}
              </div>
              <span
                className={cn(
                  "h-4 w-4 shrink-0 rounded-md border-2 flex items-center justify-center transition",
                  selected ? "border-brand bg-brand" : "border-line-strong",
                )}
              >
                {selected && <span className="h-2 w-2 rounded-sm bg-white" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
