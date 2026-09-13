"use client";

import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Copy,
  Grid3x3 as DotsGrid,
  Eye,
  EyeOff,
  Frame,
  GripVertical,
  LayoutTemplate,
  Mail,
  MessageCircle,
  PenLine,
  Plus,
  Trash2,
} from "lucide-react";
import { Button, Tooltip } from "@/components/newsletter-composer/ui/primitives";
import { BlockContent } from "@/components/newsletter-composer/blocks/renderers";
import { BLOCK_DEFS } from "@/components/newsletter-composer/blocks/registry";
import { SlashMenu } from "@/components/newsletter-composer/editor/SlashMenu";
import { createBlocks } from "@/components/newsletter-composer/lib/blockFactory";
import { blockInnerStyle, blockWrapperStyle } from "@/components/newsletter-composer/lib/styleToCss";
import { useEditorStore } from "@/components/newsletter-composer/store/editor-store";
import { DEVICE_WIDTH, type Block, type CommentThread, type DeviceMode } from "@/components/newsletter-composer/types/editor";
import { cn } from "@/components/newsletter-composer/lib/utils";

/**
 * Stable empty reference — returning a fresh array from a Zustand selector on
 * every render makes React loop forever (it always looks like a new snapshot).
 */
const NO_COMMENTS: CommentThread[] = [];

type DragProps = {
  attributes: Record<string, any>;
  listeners: Record<string, any> | undefined;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  isDragging: boolean;
};

/* ------------------------------------------------------------------ *
 *  Comments popover
 * ------------------------------------------------------------------ */
function CommentsPopover({
  blockId,
  onClose,
}: {
  blockId: string;
  onClose: () => void;
}) {
  const comments = useEditorStore((s) => s.comments[blockId] ?? NO_COMMENTS);
  const addComment = useEditorStore((s) => s.addComment);
  const resolveComment = useEditorStore((s) => s.resolveComment);
  const [draft, setDraft] = React.useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full z-50 mt-2 w-[290px] rounded-card border border-line bg-surface p-3 shadow-lift"
      onClick={(event) => event.stopPropagation()}
    >
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
        Comments
      </p>
      <div className="mb-2 max-h-44 space-y-2 overflow-y-auto scroll-thin">
        {comments.length ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-[10px] border border-line bg-canvas px-2.5 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11.5px] font-semibold text-ink">
                  {comment.author}
                </span>
                <button
                  type="button"
                  onClick={() => resolveComment(blockId, comment.id)}
                  className={cn(
                    "text-[10.5px] font-medium transition",
                    comment.resolved
                      ? "text-emerald-600"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  {comment.resolved ? "Resolved" : "Resolve"}
                </button>
              </div>
              <p
                className={cn(
                  "mt-0.5 text-[12px] leading-snug text-ink-soft",
                  comment.resolved && "line-through opacity-60",
                )}
              >
                {comment.body}
              </p>
            </div>
          ))
        ) : (
          <p className="text-[12px] text-ink-muted">
            No comments yet. Leave a note for your reviewer.
          </p>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && draft.trim()) {
              addComment(blockId, draft.trim());
              setDraft("");
            }
          }}
          placeholder="Write a comment…"
          className="h-8 flex-1 rounded-[10px] border border-line bg-surface px-2.5 text-[12px] outline-none focus:border-brand"
        />
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            if (!draft.trim()) return;
            addComment(blockId, draft.trim());
            setDraft("");
          }}
        >
          Add
        </Button>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-2 text-[11px] text-ink-muted transition hover:text-ink"
      >
        Close
      </button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 *  Floating block toolbar
 * ------------------------------------------------------------------ */
function BlockToolbar({
  block,
  drag,
  onAddBelow,
  onToggleComments,
  commentsOpen,
}: {
  block: Block;
  drag: DragProps;
  onAddBelow: () => void;
  onToggleComments: () => void;
  commentsOpen: boolean;
}) {
  const moveBlock = useEditorStore((s) => s.moveBlock);
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const updateSettings = useEditorStore((s) => s.updateSettings);
  const comments = useEditorStore((s) => s.comments[block.id] ?? NO_COMMENTS);

  const actions = [
    { label: "Move up", icon: ArrowUp, onClick: () => moveBlock(block.id, -1) },
    { label: "Move down", icon: ArrowDown, onClick: () => moveBlock(block.id, 1) },
    { label: "Duplicate", icon: Copy, onClick: () => duplicateBlock(block.id) },
    {
      label: block.settings.hidden ? "Show block" : "Hide block",
      icon: block.settings.hidden ? Eye : EyeOff,
      onClick: () => updateSettings(block.id, { hidden: !block.settings.hidden }),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 2, scale: 0.98 }}
      transition={{ duration: 0.13 }}
      data-slot="block-toolbar"
      data-block-type={block.type}
      className="absolute -top-[44px] left-0 z-40 flex items-center gap-0.5 rounded-xl border border-line bg-surface p-1 shadow-xs"
      onClick={(event) => event.stopPropagation()}
    >
      <Tooltip label="Drag to reorder">
        <button
          ref={drag.setActivatorNodeRef}
          {...drag.attributes}
          {...drag.listeners}
          className="flex h-7 w-7 cursor-grab items-center justify-center rounded-lg text-ink-soft transition hover:bg-black/[0.05] hover:text-ink active:cursor-grabbing"
          aria-label="Drag handle"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      </Tooltip>

      <span className="mx-1 max-w-[120px] truncate text-[11px] font-semibold text-ink-soft">
        {BLOCK_DEFS[block.type]?.label ?? block.type}
      </span>

      {actions.map((action) => (
        <Tooltip key={action.label} label={action.label}>
          <button
            type="button"
            onClick={action.onClick}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-soft transition hover:bg-black/[0.05] hover:text-ink"
            aria-label={action.label}
          >
            <action.icon className="h-3.5 w-3.5" />
          </button>
        </Tooltip>
      ))}

      <Tooltip label="Comments">
        <button
          type="button"
          onClick={onToggleComments}
          className={cn(
            "relative flex h-7 w-7 items-center justify-center rounded-lg transition",
            commentsOpen || comments.length
              ? "bg-brand-50 text-brand"
              : "text-ink-soft hover:bg-black/[0.05] hover:text-ink",
          )}
          aria-label="Comments"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {comments.length ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
              {comments.length}
            </span>
          ) : null}
        </button>
      </Tooltip>

      <Tooltip label="Add block below">
        <button
          type="button"
          onClick={onAddBelow}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-brand transition hover:bg-brand-50"
          aria-label="Add block below"
        >
          <Plus className="h-4 w-4" />
        </button>
      </Tooltip>

      <span className="mx-0.5 h-4 w-px bg-line" />

      <Tooltip label="Delete block">
        <button
          type="button"
          onClick={() => removeBlock(block.id)}
          className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted transition hover:bg-red-50 hover:text-red-600"
          aria-label="Delete block"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </Tooltip>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 *  Sortable block shell
 * ------------------------------------------------------------------ */
function BlockShell({
  block,
  index,
  onAddBelow,
}: {
  block: Block;
  index: number;
  onAddBelow: () => void;
}) {
  const selectedId = useEditorStore((s) => s.selectedId);
  const hoveredId = useEditorStore((s) => s.hoveredId);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const hoverBlock = useEditorStore((s) => s.hoverBlock);
  const updateSettings = useEditorStore((s) => s.updateSettings);
  const [commentsOpen, setCommentsOpen] = React.useState(false);

  const selected = selectedId === block.id;
  const hovered = hoveredId === block.id;
  const hidden = block.settings.hidden;
  const collapsed = block.settings.collapsed;

  const sortable = useSortable({ id: block.id, disabled: block.settings.locked });

  const drag: DragProps = {
    attributes: sortable.attributes as unknown as Record<string, any>,
    listeners: sortable.listeners as unknown as Record<string, any> | undefined,
    setActivatorNodeRef: sortable.setActivatorNodeRef,
    isDragging: sortable.isDragging,
  };

  const { animation } = block.style;
  const initial =
    animation === "none"
      ? false
      : {
          opacity: 0,
          y: animation === "slideUp" ? 12 : 0,
          scale: animation === "scale" ? 0.985 : 1,
        };

  return (
    <motion.div
      ref={sortable.setNodeRef}
      layout
      transition={sortable.isDragging ? undefined : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      data-block-shell=""
      data-block-type={block.type}
      style={{
        transform: CSS.Translate.toString(sortable.transform),
        transition: sortable.isDragging ? sortable.transition : undefined,
        zIndex: sortable.isDragging ? 60 : undefined,
      }}
      className={cn(
        "relative",
        sortable.isDragging && "opacity-60",
      )}
    >
      <motion.div
        initial={initial}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={initial ? { duration: 0.22, ease: [0.22, 1, 0.36, 1] } : undefined}
        onMouseEnter={() => hoverBlock(block.id)}
        onMouseLeave={() => hoverBlock(null)}
        onClick={(event) => {
          event.stopPropagation();
          selectBlock(block.id);
          setCommentsOpen(false);
        }}
        whileHover={block.style.hoverLift ? { y: -2 } : undefined}
        className={cn(
          "group/block relative cursor-pointer transition-[box-shadow] duration-150",
          hovered && !selected && "outline outline-2 outline-offset-4 outline-brand/35",
          selected && "outline outline-2 outline-offset-4 outline-brand",
          hidden && "opacity-45 grayscale",
          block.settings.sectionDivider && "border-b border-dashed border-line-strong",
        )}
        style={blockWrapperStyle(block)}
      >
        <div
          style={blockInnerStyle(block)}
          className={cn(
            collapsed && "relative max-h-[104px] overflow-hidden",
          )}
        >
          <BlockContent block={block} />
          {collapsed ? (
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
          ) : null}
        </div>

        {collapsed ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              updateSettings(block.id, { collapsed: false });
            }}
            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full border border-line bg-surface px-3 py-0.5 text-[11px] font-medium text-ink-soft shadow-xs transition hover:text-ink hover:border-line-strong"
          >
            Collapsed · expand
          </button>
        ) : null}

        <AnimatePresence>
          {(hovered || selected) && !sortable.isDragging ? (
            <BlockToolbar
              block={block}
              drag={drag}
              onAddBelow={onAddBelow}
              onToggleComments={() => setCommentsOpen((open) => !open)}
              commentsOpen={commentsOpen}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {commentsOpen ? (
            <CommentsPopover blockId={block.id} onClose={() => setCommentsOpen(false)} />
          ) : null}
        </AnimatePresence>

        <div className="pointer-events-none absolute -right-[52px] top-1 hidden xl:block">
          <span className="rounded-full bg-canvas px-2 py-0.5 font-mono text-[10px] text-ink-muted">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 *  Insertion line between sections
 * ------------------------------------------------------------------ */
function InsertLine({
  index,
  active,
  onOpen,
}: {
  index: number;
  active: boolean;
  onOpen: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `insert-${index}` });

  return (
    <div
      ref={setNodeRef}
      className="group/insert relative flex h-8 items-center justify-center"
    >
      <div
        className={cn(
          "h-px w-full transition-colors",
          isOver ? "bg-brand" : "bg-transparent group-hover/insert:bg-brand/40",
        )}
      />
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
        className={cn(
          "absolute flex h-6.5 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[11.5px] font-semibold text-ink shadow-xs transition-all",
          "opacity-0 group-hover/insert:opacity-100",
          isActiveClass(active, isOver),
        )}
      >
        <Plus className="h-3.5 w-3.5 text-brand" />
        Add block
      </button>
    </div>
  );
}

function isActiveClass(active: boolean, isOver: boolean) {
  return active || isOver ? "opacity-100 border-brand text-brand" : "";
}

function InsertLineDots({
  index,
  active,
  onOpen,
}: {
  index: number;
  active: boolean;
  onOpen: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `insert-${index}` });

  return (
    <div
      ref={setNodeRef}
      className="group/insert relative flex h-10 items-center justify-center"
    >
      <div
        className={cn(
          "h-px w-full transition-colors",
          isOver ? "bg-brand" : "bg-transparent group-hover/insert:bg-brand/40",
        )}
      />
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
        className={cn(
          "absolute flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-[11.5px] font-semibold text-ink shadow-xs transition-all",
          "opacity-0 group-hover/insert:opacity-100",
          isActiveClass(active, isOver),
        )}
      >
        <Plus className="h-3.5 w-3.5 text-brand" />
        <DotsGrid className="h-3.5 w-3.5 text-ink-muted" />
        Add block
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Empty state
 * ------------------------------------------------------------------ */
function EmptyState() {
  const addBlock = useEditorStore((s) => s.addBlock);
  const insertBlocks = useEditorStore((s) => s.insertBlocks);
  const setLeftTab = useEditorStore((s) => s.setLeftTab);

  return (
    <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-7"
      >
        <div className="flex h-[132px] w-[168px] flex-col justify-center gap-2 rounded-[18px] border border-line bg-surface p-4 shadow-paper">
          <span className="h-2.5 w-3/4 rounded-full bg-[#ECE9E2]" />
          <span className="h-2.5 w-full rounded-full bg-[#F2F0EA]" />
          <span className="h-2.5 w-5/6 rounded-full bg-[#F2F0EA]" />
          <span className="mt-1 h-7 w-24 rounded-full bg-brand-50" />
        </div>
        <span className="absolute -right-4 -top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gold text-ink shadow-xs border border-gold-600/20">
          <PenLine className="h-4 w-4" />
        </span>
        <span className="absolute -bottom-3 -left-5 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink-soft shadow-xs">
          <Frame className="h-4 w-4" />
        </span>
      </motion.div>

      <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">
        Start writing your newsletter
      </h2>
      <p className="mt-2 max-w-[380px] text-[13.5px] leading-relaxed text-ink-muted">
        Pick a template to get a finished issue in one click, or start blank and
        build it block by block. Everything edits live.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        <Button variant="primary" size="default" onClick={() => setLeftTab("templates")}>
          <LayoutTemplate className="h-4 w-4" />
          <span>Choose template</span>
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={() =>
            insertBlocks(
              createBlocks([
                [
                  "heading",
                  { eyebrow: "Issue 001", text: "Your headline goes here", level: "h1" },
                ],
                [
                  "paragraph",
                  {
                    text: "Write the opening paragraph. One clear idea, then let the reader breathe.",
                  },
                ],
                [
                  "button",
                  { label: "Primary action", url: "https://example.com", align: "left" },
                ],
              ]),
              0,
            )
          }
        >
          <Plus className="h-4 w-4" />
          Start blank
        </Button>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
        <span className="text-[11.5px] text-ink-muted">Quick add:</span>
        {(["heading", "paragraph", "image", "button"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => addBlock(type)}
            className="rounded-full border border-line bg-surface px-2.5 py-1 text-[11.5px] font-medium text-ink-soft transition hover:border-brand hover:text-brand"
          >
            {BLOCK_DEFS[type].label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Inbox snippet & subject card (Simple, minimal, high-visibility)
 * ------------------------------------------------------------------ */
function InboxMetaCard() {
  const subject = useEditorStore((s) => s.doc.subject ?? s.doc.title ?? "");
  const previewText = useEditorStore((s) => s.doc.previewText ?? "");
  const setSubject = useEditorStore((s) => s.setSubject);
  const setPreviewText = useEditorStore((s) => s.setPreviewText);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full mb-5 rounded-2xl border border-line bg-surface p-5 shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
            1. Subject Line
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. The Sagar Lad Letter"
            className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-line bg-canvas text-ink placeholder:text-ink-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
            2. Preview Text (Preheader)
          </label>
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="e.g. aka safar"
            className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-line bg-canvas text-ink placeholder:text-ink-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition"
          />
        </div>
      </div>

      {/* Inbox preview strip */}
      <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-line bg-canvas px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-brand shrink-0" />
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted shrink-0">
          Inbox Preview:
        </span>
        <span className="text-sm font-bold text-ink truncate">
          {subject.trim() || "Subject line will appear here"}
        </span>
        <span className="text-sm text-ink-muted truncate">
          {previewText.trim() ? `— ${previewText.trim()}` : "— (Preview snippet will appear here…)"}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Canvas
 * ------------------------------------------------------------------ */
export function Canvas() {
  const blocks = useEditorStore((s) => s.doc.blocks);
  const device = useEditorStore((s) => s.device);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const darkPreview = useEditorStore((s) => s.darkPreview);
  const showHidden = useEditorStore((s) => s.showHidden);
  const docTitle = useEditorStore((s) => s.doc.title);
  const docIssue = useEditorStore((s) => s.doc.issue);

  const visible = React.useMemo(
    () =>
      blocks.filter((block) => {
        if (block.settings.hidden && !showHidden) return false;
        if (device === "desktop" && !block.settings.showDesktop) return false;
        if (device === "tablet" && !block.settings.showTablet) return false;
        if (device === "mobile" && !block.settings.showMobile) return false;
        return true;
      }),
    [blocks, device, showHidden],
  );

  const [slashAt, setSlashAt] = React.useState<number | null>(null);

  React.useEffect(() => {
    const open = () => {
      const store = useEditorStore.getState();
      const index = store.selectedId
        ? visible.findIndex((b) => b.id === store.selectedId) + 1
        : visible.length;
      setSlashAt(Math.max(0, index));
    };
    window.addEventListener("composer:open-slash", open);
    return () => window.removeEventListener("composer:open-slash", open);
  }, [visible]);

  const width = DEVICE_WIDTH[device as DeviceMode];

  return (
    <div
      onClick={() => {
        selectBlock(null);
        setSlashAt(null);
      }}
      className="relative min-h-0 flex-1 overflow-y-auto scroll-thin bg-canvas"
    >
      <div
        className="relative mx-auto flex flex-col items-center px-4 py-10"
        style={{ width: width ? `min(${width + 72}px, 100%)` : "100%" }}
      >
        <div className="mb-3 flex items-center justify-between w-full text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted/80">
          <span>{device} preview</span>
          {width ? <span className="text-ink-muted/50">{width}px</span> : null}
        </div>

        <InboxMetaCard />

        <motion.div
          layout
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
          className="w-full overflow-hidden rounded-card border border-line"
          style={{
            background: darkPreview ? "#0B0F17" : "#FFFFFF",
            boxShadow: darkPreview
              ? "0 24px 60px -30px rgba(0,0,0,0.7)"
              : "0 1px 1px rgba(17,24,39,0.03), 0 24px 60px -30px rgba(17,24,39,0.18)",
            color: darkPreview ? "#E5E7EB" : undefined,
            maxWidth: width ?? "100%",
          }}
        >
          <div
            className="flex items-center justify-between border-b px-7 py-3 text-[11px]"
            style={{
              borderColor: darkPreview ? "#1F2937" : "#F1EFE9",
              color: darkPreview ? "#6B7280" : "#8B8F98",
            }}
          >
            <span className="max-w-[60%] truncate font-semibold uppercase tracking-[0.14em]">
              {docTitle || "Untitled newsletter"}
            </span>
            <span>{docIssue}</span>
          </div>

          <div className="px-7 py-8">
            {visible.length ? (
              <SortableContext
                items={visible.map((block) => block.id)}
                strategy={verticalListSortingStrategy}
              >
                <InsertLineDots index={0} active={slashAt === 0} onOpen={() => setSlashAt(0)} />
                {visible.map((block, index) => (
                  <React.Fragment key={block.id}>
                    <BlockShell
                      block={block}
                      index={index}
                      onAddBelow={() => setSlashAt(index + 1)}
                    />
                    <InsertLineDots
                      index={index + 1}
                      active={slashAt === index + 1}
                      onOpen={() => setSlashAt(index + 1)}
                    />
                  </React.Fragment>
                ))}
              </SortableContext>
            ) : (
              <EmptyState />
            )}
          </div>

          {visible.length ? (
            <div
              className="flex items-center justify-between border-t px-7 py-3 text-[11px]"
              style={{
                borderColor: darkPreview ? "#1F2937" : "#F1EFE9",
                color: darkPreview ? "#6B7280" : "#8B8F98",
              }}
            >
              <span>{visible.length} blocks</span>
              <span>Sagar Lad · Newsletter Composer</span>
            </div>
          ) : null}
        </motion.div>

        <p className="mt-4 text-[11.5px] text-ink-muted/80">
          Press{" "}
          <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px]">
            /
          </kbd>{" "}
          anywhere to insert a block · ⌘K for the command menu
        </p>
      </div>

      <SlashMenu
        open={slashAt !== null}
        index={slashAt ?? 0}
        onClose={() => setSlashAt(null)}
      />
    </div>
  );
}
