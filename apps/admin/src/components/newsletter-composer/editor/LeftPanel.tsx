"use client";

import * as React from "react";
import { useDraggable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Clock,
  Image as ImageIcon,
  LayoutGrid,
  LayoutTemplate,
  Mail,
  Check,
  Eye,
  PenLine,
  Plus,
  Save,
  Search,
  Star,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";
import {
  Button,
  Input,
  Segmented,
  Skeleton,
  Tooltip,
} from "@/components/newsletter-composer/ui/primitives";
import { BLOCK_CATEGORIES, BLOCK_DEFS, BLOCK_LIST } from "@/components/newsletter-composer/blocks/registry";
import { BlockContent } from "@/components/newsletter-composer/blocks/renderers";
import { TEMPLATES } from "@/components/newsletter-composer/templates/templates";
import { useUI } from "@/components/newsletter-composer/editor/ui-context";
import { createBlock } from "@/components/newsletter-composer/lib/blockFactory";
import { useEditorStore } from "@/components/newsletter-composer/store/editor-store";
import type { BlockDef, LeftTab, SavedTemplate, Template } from "@/components/newsletter-composer/types/editor";
import { cn } from "@/components/newsletter-composer/lib/utils";
import { Copy } from "lucide-react";
import type { DeviceMode } from "@/components/newsletter-composer/types/editor";

/* ------------------------------------------------------------------ *
 *  Hover preview — a live render of the block's default content
 * ------------------------------------------------------------------ */
interface PreviewState {
  def: BlockDef;
  left: number;
  top: number;
}

interface TemplatePreviewState {
  template: Template;
  left: number;
  top: number;
}

/* Category accents — kept neutral: colour lives in the block previews,
 * the palette itself stays monochrome and quiet. */
const CATEGORY_META: Record<
  string,
  { color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Writing: { color: "#6B7280", icon: PenLine },
  Layout: { color: "#6B7280", icon: LayoutGrid },
  Media: { color: "#6B7280", icon: ImageIcon },
  Newsletter: { color: "#6B7280", icon: Mail },
};

/* The preview mirrors the canvas: a 720px-wide email rendered at a smaller
 * scale. The body height is measured from the real content rather than
 * guessed, so a divider stays a sliver and a gallery gets room — never more
 * than the block actually needs. */
const PREVIEW_WIDTH = 344;
const PREVIEW_SCALE = 0.44;
const PREVIEW_MIN_BODY = 52;
const PREVIEW_MAX_BODY = 232;
const PREVIEW_CHROME = 44;
const EMAIL_WIDTH = 720;

function BlockPreview({ preview }: { preview: PreviewState }) {
  const block = React.useMemo(() => createBlock(preview.def.type)!, [preview.def.type]);
  const { def } = preview;
  const measureRef = React.useRef<HTMLDivElement>(null);
  const [natural, setNatural] = React.useState(160);

  React.useLayoutEffect(() => {
    const node = measureRef.current;
    if (node) setNatural(node.scrollHeight);
  }, [preview.def.type]);

  const bodyHeight = Math.min(
    Math.max(Math.round(natural * PREVIEW_SCALE), PREVIEW_MIN_BODY),
    PREVIEW_MAX_BODY,
  );
  const clipped = natural * PREVIEW_SCALE > PREVIEW_MAX_BODY;

  return (
    <motion.div
      data-slot="block-preview"
      initial={{ opacity: 0, x: -8, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -6, scale: 0.98, transition: { duration: 0.1 } }}
      transition={{ type: "spring", stiffness: 460, damping: 34, mass: 0.6 }}
      style={{ left: preview.left, top: preview.top, width: PREVIEW_WIDTH }}
      className="pointer-events-none fixed z-[70] overflow-hidden rounded-[16px] border border-line bg-surface shadow-lift"
    >
      <div className="flex items-center gap-2 border-b border-line px-2.5 py-1.5">
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px]"
          style={{ background: `${def.swatch}16`, color: def.swatch }}
        >
          <def.icon className="h-3 w-3" strokeWidth={2} />
        </span>
        <span className="truncate text-[11.5px] font-semibold tracking-[-0.01em] text-ink">
          {def.label}
        </span>
        <span className="ml-auto shrink-0 text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted/70">
          Preview
        </span>
      </div>

      <div className="relative overflow-hidden bg-white" style={{ height: bodyHeight }}>
        {/* Measured at full email width, then scaled, so type sizes read true. */}
        <div
          ref={measureRef}
          className="px-7 py-6"
          style={{
            width: EMAIL_WIDTH,
            transform: `scale(${PREVIEW_SCALE})`,
            transformOrigin: "top left",
          }}
        >
          <div aria-hidden>
            <BlockContent block={block} />
          </div>
        </div>
        {clipped ? (
          <span className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
        ) : null}
      </div>

      <div className="border-t border-line bg-canvas px-2.5 py-1 text-[10px] text-ink-muted">
        Click to insert · drag to place
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 *  Template hover preview — shows all blocks scaled down
 * ------------------------------------------------------------------ */
function TemplatePreview({ preview }: { preview: TemplatePreviewState }) {
  const blocks = React.useMemo(() => preview.template.blocks(), [preview.template]);
  const measureRef = React.useRef<HTMLDivElement>(null);
  const [natural, setNatural] = React.useState(200);

  React.useEffect(() => {
    if (!measureRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setNatural(entry.contentRect.height);
    });
    observer.observe(measureRef.current);
    return () => observer.disconnect();
  }, []);

  const bodyHeight = Math.max(PREVIEW_MIN_BODY, Math.min(natural * PREVIEW_SCALE, PREVIEW_MAX_BODY));
  const clipped = natural * PREVIEW_SCALE > PREVIEW_MAX_BODY;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      style={{ left: preview.left, top: preview.top }}
      className="pointer-events-none fixed z-[70] w-[344px] overflow-hidden rounded-[16px] border border-line bg-surface shadow-lift"
    >
      <div className="flex items-center gap-2 border-b border-line px-2.5 py-1.5">
        <span className="truncate text-[11.5px] font-semibold tracking-[-0.01em] text-ink">
          {preview.template.name}
        </span>
        <span className="ml-auto shrink-0 text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted/70">
          Preview
        </span>
      </div>

      <div className="relative overflow-hidden bg-white" style={{ height: bodyHeight }}>
        <div
          ref={measureRef}
          className="px-7 py-6"
          style={{
            width: EMAIL_WIDTH,
            transform: `scale(${PREVIEW_SCALE})`,
            transformOrigin: "top left",
          }}
        >
          <div aria-hidden>
            {blocks.map((block) => (
              <div key={block.id} className="mb-2">
                <BlockContent block={block} />
              </div>
            ))}
          </div>
        </div>
        {clipped ? (
          <span className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
        ) : null}
      </div>

      <div className="border-t border-line bg-canvas px-2.5 py-1 text-[10px] text-ink-muted">
        {blocks.length} blocks · {preview.template.readingTime} min read
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 *  Block card — compact tile in a two-column grid
 * ------------------------------------------------------------------ */
function BlockCard({
  def,
  index,
  onHover,
}: {
  def: BlockDef;
  index: number;
  onHover: (def: BlockDef | null, element?: HTMLElement | null) => void;
}) {
  const addBlock = useEditorStore((s) => s.addBlock);
  const { toast } = useUI();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${def.type}`,
    data: { kind: "library", type: def.type },
  });

  return (
    <motion.button
      ref={setNodeRef}
      type="button"
      data-slot="block-card"
      data-block-type={def.type}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.012, 0.2), duration: 0.18 }}
      onClick={() => {
        addBlock(def.type);
        toast(`${def.label} added`, "success");
      }}
      onMouseEnter={(event) => onHover(def, event.currentTarget)}
      onMouseLeave={() => onHover(null)}
      onFocus={(event) => onHover(def, event.currentTarget)}
      onBlur={() => onHover(null)}
      className={cn(
        "group relative flex h-[96px] flex-col justify-between overflow-hidden rounded-[12px] border border-line bg-surface p-3 text-left",
        "transition-[border-color,box-shadow,transform] duration-150",
        "hover:border-brand/40 hover:shadow-xs",
        "active:scale-[0.99]",
        "focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20",
        isDragging && "border-dashed border-line-strong opacity-50 shadow-none",
      )}
      {...attributes}
      {...listeners}
    >
      <span className="flex w-full items-start justify-between gap-2">
        <def.icon
          className="h-[18px] w-[18px] shrink-0 text-brand transition-opacity duration-200"
          strokeWidth={1.75}
        />
        <span
          aria-hidden
          className="flex h-5 w-5 shrink-0 -translate-y-0.5 items-center justify-center rounded-full border border-line bg-canvas text-ink opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Plus className="h-3 w-3" strokeWidth={2.2} />
        </span>
      </span>

      <span className="w-full">
        <span className="block w-full truncate text-[12.5px] font-semibold tracking-[-0.01em] text-ink">
          {def.label}
        </span>
        <span className="mt-0.5 line-clamp-2 block w-full text-[11px] leading-[1.4] text-ink-soft">
          {def.description}
        </span>
      </span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ *
 *  Blocks tab
 * ------------------------------------------------------------------ */
function BlockPalette({
  query,
  onHover,
}: {
  query: string;
  onHover: (def: BlockDef | null, element?: HTMLElement | null) => void;
}) {
  const [collapsed, setCollapsed] = React.useState<string[]>([]);
  const q = query.trim().toLowerCase();

  const groups = BLOCK_CATEGORIES.map((category) => ({
    category,
    items: BLOCK_LIST.filter(
      (def) =>
        def.category === category &&
        (!q ||
          def.label.toLowerCase().includes(q) ||
          def.description.toLowerCase().includes(q) ||
          def.keywords.some((keyword) => keyword.includes(q))),
    ),
  })).filter((group) => group.items.length);

  if (!groups.length) {
    return (
      <div className="flex flex-col items-center gap-1.5 px-4 py-12 text-center">
        <Search className="h-4 w-4 text-ink-muted" />
        <p className="text-[13px] font-medium text-ink">No blocks found</p>
        <p className="text-[11.5px] text-ink-muted">Try “heading”, “gallery” or “cta”.</p>
      </div>
    );
  }

  return (
    <div className="px-3 pb-6">
      {groups.map((group) => {
        const isCollapsed = collapsed.includes(group.category);
        const meta = CATEGORY_META[group.category];
        return (
          <section key={group.category} className="mb-3">
            <button
              type="button"
              onClick={() =>
                setCollapsed((prev) =>
                  prev.includes(group.category)
                    ? prev.filter((item) => item !== group.category)
                    : [...prev, group.category],
                )
              }
              className="sticky top-0 z-10 flex w-full items-center justify-between gap-2 bg-canvas/95 px-0.5 pb-1.5 pt-2.5 backdrop-blur"
            >
              <span className="flex items-center gap-1.5">
                {meta ? (
                  <meta.icon className="h-3 w-3 text-ink-muted/70" />
                ) : null}
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  {group.category}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[10.5px] text-ink-muted/70">{group.items.length}</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-ink-muted transition-transform",
                    isCollapsed && "-rotate-90",
                  )}
                />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {!isCollapsed ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-x-2.5 gap-y-2.5 pt-1.5">
                    {group.items.map((def, index) => (
                      <BlockCard key={def.type} def={def} index={index} onHover={onHover} />
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Template thumbnail — real blocks, scaled down
 * ------------------------------------------------------------------ */
function TemplateThumb({ template }: { template: Template }) {
  const blocks = React.useMemo(() => template.blocks().slice(0, 3), [template]);
  return (
    <div
      className="relative h-[150px] w-full overflow-hidden rounded-[14px] border border-line"
      style={{
        background: template.cover
          ? `linear-gradient(150deg, ${template.cover.from}, ${template.cover.to})`
          : undefined,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 w-[720px] origin-top -translate-x-1/2 bg-white/70 px-6 py-4"
        style={{ transform: "translateX(-50%) scale(0.27)" }}
      >
        {blocks.map((block) => (
          <div key={block.id} className="mb-2">
            <BlockContent block={block} />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/85 to-transparent" />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Template card
 * ------------------------------------------------------------------ */
type TemplateActionCardProps = {
  template: Template;
  index: number;
  onDuplicate?: () => void;
};

function TemplateActionCard({ template, index, onDuplicate }: TemplateActionCardProps) {
  const { openModal, toast } = useUI();
  const applyTemplate = useEditorStore((s) => s.applyTemplate);
  const markTemplateUsed = useEditorStore((s) => s.markTemplateUsed);
  const favorites = useEditorStore((s) => s.favorites);
  const toggleFavorite = useEditorStore((s) => s.toggleFavorite);
  const duplicateTemplate = useEditorStore((s) => s.duplicateTemplate);
  const isFavorite = favorites.includes(template.id);
  const [hoverPreview, setHoverPreview] = React.useState<TemplatePreviewState | null>(null);

  const use = () => {
    applyTemplate(template, template.name);
    markTemplateUsed(template.id);
    toast(`${template.name} applied`, "success");
  };

  const handleMouseEnter = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoverPreview({
      template,
      left: rect.right + 12,
      top: rect.top,
    });
  };

  return (
    <motion.div
      data-slot="template-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.25), duration: 0.2 }}
      className="group relative overflow-hidden rounded-card border border-line bg-surface p-2.5 transition-all hover:border-brand/40 hover:shadow-xs"
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`Preview ${template.name}`}
        onClick={() => openModal("template-preview", template)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHoverPreview(null)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openModal("template-preview", template);
          }
        }}
        className="block w-full cursor-pointer text-left outline-none focus-visible:ring-3 focus-visible:ring-brand/25"
      >
        <div className="overflow-hidden rounded-[14px] transition-transform duration-300 group-hover:scale-[1.015]">
          <TemplateThumb template={template} />
        </div>
      </div>

      <div className="flex items-start justify-between gap-2 px-1 pt-2.5">
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
            {template.name}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10.5px] text-ink-muted">
              <Clock className="h-3 w-3" />
              {template.readingTime} min read
            </span>
            <span className="text-[10.5px] text-ink-muted/60">·</span>
            <span className="text-[10.5px] text-ink-muted">
              {template.blocks().length} blocks
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip label={isFavorite ? "Unfavourite" : "Favourite"}>
            <button
              type="button"
              onClick={() => toggleFavorite(template.id)}
              className="rounded-[8px] p-1.5 transition hover:bg-black/[0.05]"
            >
              <Star
                className={cn(
                  "h-3.5 w-3.5",
                  isFavorite ? "fill-gold text-gold-600" : "text-ink-muted",
                )}
              />
            </button>
          </Tooltip>
          {onDuplicate ? (
            <Tooltip label="Duplicate to My templates">
              <button
                type="button"
                onClick={() => {
                  onDuplicate?.();
                  toast(`${template.name} duplicated`, "success");
                }}
                className="rounded-[8px] p-1.5 transition hover:bg-black/[0.05]"
              >
                <Copy className="h-3.5 w-3.5 text-ink-muted" />
              </button>
            </Tooltip>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 px-1 pb-1 pt-2">
        <Button variant="primary" size="sm" className="flex-1" onClick={use}>
          <Check className="h-3.5 w-3.5" />
          <span>Use Template</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => openModal("template-preview", template)}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Preview</span>
        </Button>
      </div>

      <AnimatePresence>
        {hoverPreview ? <TemplatePreview preview={hoverPreview} /> : null}
      </AnimatePresence>
    </motion.div>
  );
}

function TemplateCard({ template, index }: { template: Template; index: number }) {
  const savedTemplate = useEditorStore((s) =>
    s.savedTemplates.find((t) => t.id === template.id),
  );

  return (
    <TemplateActionCard
      template={template}
      index={index}
      onDuplicate={savedTemplate ? undefined : () => useEditorStore.getState().duplicateTemplate(template.id)}
    />
  );
}

/* ------------------------------------------------------------------ *
 *  Saved template thumbnail — renders first 3 blocks scaled down
 * ------------------------------------------------------------------ */
function SavedTemplateThumb({ template }: { template: SavedTemplate }) {
  const blocks = React.useMemo(() => template.blocks.slice(0, 3), [template.blocks]);
  const cover = template.theme?.cover ?? { from: "#F4F2EC", to: "#FFFFFF" };
  return (
    <div
      className="relative h-[150px] w-full overflow-hidden rounded-[12px] border border-line"
      style={{
        background: `linear-gradient(150deg, ${cover.from}, ${cover.to})`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 w-[720px] origin-top -translate-x-1/2 bg-white/70 px-6 py-4"
        style={{ transform: "translateX(-50%) scale(0.27)" }}
      >
        {blocks.map((block) => (
          <div key={block.id} className="mb-2">
            <BlockContent block={block} />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/85 to-transparent" />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Saved template card — with thumbnail, rename, and actions
 * ------------------------------------------------------------------ */
function SavedTemplateCard({ template, isApplied }: { template: SavedTemplate; isApplied?: boolean }) {
  const applyTemplate = useEditorStore((s) => s.applyTemplate);
  const updateSavedTemplate = useEditorStore((s) => s.updateSavedTemplate);
  const deleteSavedTemplate = useEditorStore((s) => s.deleteSavedTemplate);
  const renameSavedTemplate = useEditorStore((s) => s.renameSavedTemplate);
  const { toast } = useUI();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(template.name);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const saveName = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== template.name) {
      renameSavedTemplate(template.id, trimmed);
      toast("Template renamed", "success");
    }
    setIsEditing(false);
  };

  const use = () => {
    applyTemplate({ blocks: template.blocks }, template.name);
    toast(`${template.name} applied`, "success");
  };

  const update = () => {
    updateSavedTemplate(template.id);
    toast(`${template.name} updated`, "success");
  };

  return (
    <div className="group relative overflow-hidden rounded-card border border-line bg-surface p-2.5 transition-all hover:border-brand/40 hover:shadow-xs">
      <div className="overflow-hidden rounded-[12px]">
        <SavedTemplateThumb template={template} />
      </div>

      <div className="flex items-start justify-between gap-2 px-1 pt-2.5">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName();
                if (e.key === "Escape") {
                  setEditName(template.name);
                  setIsEditing(false);
                }
              }}
              className="w-full truncate rounded-md border border-brand bg-white px-2 py-0.5 text-[13px] font-semibold text-ink outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="group/name flex w-full items-center gap-1.5 text-left"
            >
              <span className="truncate text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
                {template.name}
              </span>
              <PenLine className="h-3 w-3 shrink-0 text-ink-muted opacity-0 transition group-hover/name:opacity-100" />
            </button>
          )}
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[10.5px] text-ink-muted">
              {template.blocks.length} blocks
            </span>
            <span className="text-[10.5px] text-ink-muted/60">·</span>
            <span className="text-[10.5px] text-ink-muted">
              Saved {new Date(template.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-1 pb-1 pt-2">
        <Button variant="primary" size="sm" className="flex-1" onClick={use}>
          <Check className="h-3.5 w-3.5" />
          <span>Use Template</span>
        </Button>
        {isApplied ? (
          <Button
            size="iconSm"
            variant="outline"
            onClick={update}
            title="Update template with current content"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        ) : null}
        <Button
          size="iconSm"
          variant="ghost"
          onClick={() => {
            deleteSavedTemplate(template.id);
            toast("Template deleted");
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 px-4 py-2">
        <span className="text-ink-muted">{icon}</span>
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {title}
        </span>
        {count !== undefined ? (
          <span className="text-[10.5px] text-ink-muted/70">{count}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Templates tab
 * ------------------------------------------------------------------ */
function TemplateGallery({ query }: { query: string }) {
  const recents = useEditorStore((s) => s.recents);
  const favorites = useEditorStore((s) => s.favorites);
  const savedTemplates = useEditorStore((s) => s.savedTemplates);
  const lastAppliedTemplateId = useEditorStore((s) => s.lastAppliedTemplateId);
  const deleteSavedTemplate = useEditorStore((s) => s.deleteSavedTemplate);
  const applyTemplate = useEditorStore((s) => s.applyTemplate);
  const { openModal, toast } = useUI();
  const blocks = useEditorStore((s) => s.doc.blocks);

  const q = query.trim().toLowerCase();
  const filtered = TEMPLATES.filter((template) => {
    const matchesQuery =
      !q ||
      template.name.toLowerCase().includes(q) ||
      template.description.toLowerCase().includes(q) ||
      template.tags.some((tag) => tag.includes(q));
    return matchesQuery;
  });

  const favouriteTemplates = TEMPLATES.filter((template) =>
    favorites.includes(template.id),
  );
  const recentTemplates = recents
    .map((id) => TEMPLATES.find((template) => template.id === id))
    .filter(Boolean) as Template[];

  return (
    <div className="pb-6">
      {!q && recentTemplates.length ? (
        <Section
          title="Recent"
          icon={<Clock className="h-3.5 w-3.5" />}
          count={recentTemplates.length}
        >
          <div className="grid grid-cols-1 gap-2.5 px-3">
            {recentTemplates.map((template, index) => (
              <TemplateCard key={template.id} template={template} index={index} />
            ))}
          </div>
        </Section>
      ) : null}

      {!q && favouriteTemplates.length ? (
        <Section
          title="Favourites"
          icon={<Star className="h-3.5 w-3.5" />}
          count={favouriteTemplates.length}
        >
          <div className="grid grid-cols-1 gap-2.5 px-3">
            {favouriteTemplates.map((template, index) => (
              <TemplateCard key={template.id} template={template} index={index} />
            ))}
          </div>
        </Section>
      ) : null}

      {!q && savedTemplates.length ? (
        <Section
          title="Your templates"
          icon={<BookmarkCheck className="h-3.5 w-3.5" />}
          count={savedTemplates.length}
        >
          <div className="flex flex-col gap-2 px-3">
            {savedTemplates.map((template) => (
              <SavedTemplateCard key={template.id} template={template} isApplied={template.id === lastAppliedTemplateId} />
            ))}
          </div>
        </Section>
      ) : null}

      <Section
        title={q ? "Results" : "All templates"}
        icon={<LayoutTemplate className="h-3.5 w-3.5" />}
        count={filtered.length}
      >
        <div className="grid grid-cols-1 gap-2.5 px-3">
          {filtered.map((template, index) => (
            <TemplateCard key={template.id} template={template} index={index} />
          ))}
          {!filtered.length ? (
            <p className="px-1 py-8 text-center text-[12.5px] text-ink-muted">
              No templates match that search.
            </p>
          ) : null}
        </div>
      </Section>

      <div className="px-3 pt-4">
        <button
          type="button"
          disabled={!blocks.length}
          onClick={() =>
            blocks.length
              ? openModal("save-template")
              : toast("Add some blocks first", "warn")
          }
          className={cn(
            "flex w-full items-center gap-2.5 rounded-[14px] border border-dashed border-line-strong bg-surface px-3 py-3 text-left transition",
            blocks.length
              ? "hover:border-brand hover:bg-brand-50/40"
              : "cursor-not-allowed opacity-50",
          )}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-brand-50 text-brand">
            <Save className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-[13px] font-semibold text-ink">
              Save this issue as a template
            </span>
            <span className="block text-[11.5px] text-ink-muted">
              {blocks.length} blocks
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Left panel shell — tabs up top, sticky search, scrolling content
 * ------------------------------------------------------------------ */
export function LeftPanel() {
  const leftTab = useEditorStore((s) => s.leftTab);
  const setLeftTab = useEditorStore((s) => s.setLeftTab);
  const search = useEditorStore((s) => s.search);
  const setSearch = useEditorStore((s) => s.setSearch);
  const device = useEditorStore((s) => s.device);
  const { openModal } = useUI();
  const [ready, setReady] = React.useState(false);
  const [preview, setPreview] = React.useState<PreviewState | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setReady(true), 220);
    return () => clearTimeout(timer);
  }, []);

  const handleHover = React.useCallback(
    (def: BlockDef | null, element?: HTMLElement | null) => {
      if (!def || !element || typeof window === "undefined") {
        setPreview(null);
        return;
      }
      /* Hover previews only where there is room beside the panel. */
      if (window.innerWidth < 1024) {
        setPreview(null);
        return;
      }
      const rect = element.getBoundingClientRect();
      setPreview({
        def,
        left: Math.min(rect.right + 14, window.innerWidth - PREVIEW_WIDTH - 16),
        top: Math.max(
          16,
          Math.min(
            rect.top - 6,
            window.innerHeight - PREVIEW_MAX_BODY - PREVIEW_CHROME - 16,
          ),
        ),
      });
    },
    [],
  );

  const isCompact = device === "mobile" || device === "tablet";

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-line bg-canvas">
      {/* Two equal tabs, always visible */}
      <div className="shrink-0 border-b border-line px-3 py-3">
        <Segmented<LeftTab>
          layoutId="left-tabs"
          fullWidth
          value={leftTab}
          onChange={setLeftTab}
          items={[
            { value: "blocks", label: "Blocks" },
            { value: "templates", label: "Templates" },
          ]}
        />
      </div>

      {/* Sticky search with shortcut hint */}
      <div className="sticky top-0 z-20 shrink-0 border-b border-line bg-canvas px-3 py-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={leftTab === "blocks" ? "Search blocks…" : "Search templates…"}
            className="pl-8 pr-14"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-[6px] p-1 text-ink-muted transition hover:bg-black/5"
            >
              <X className="h-3 w-3" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("composer:open-palette"))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-[6px] border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] text-ink-soft transition hover:text-ink hover:border-line-strong"
            >
              ⌘K
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scroll-thin">
        {ready ? (
          leftTab === "blocks" ? (
            <div className="pt-2">
              <BlockPalette query={search} onHover={handleHover} />
            </div>
          ) : (
            <div className="pt-1">
              <TemplateGallery query={search} />
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 gap-2 p-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-[96px] w-full" />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-line bg-canvas px-3 py-2">
        <p className="flex items-center gap-1.5 text-[10.5px] text-ink-muted">
          <Bookmark className="h-3 w-3 shrink-0" />
          {leftTab === "blocks"
            ? "Click to insert · drag to place · “/” for quick menu"
            : "Preview a template, then apply it to the canvas"}
        </p>
      </div>

      <AnimatePresence>
        {preview ? <BlockPreview key={preview.def.type} preview={preview} /> : null}
      </AnimatePresence>
    </div>
  );
}

export { BLOCK_DEFS };
