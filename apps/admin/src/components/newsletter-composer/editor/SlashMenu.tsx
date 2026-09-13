"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, LayoutTemplate, Search } from "lucide-react";
import { ScrollArea } from "@/components/newsletter-composer/ui/primitives";
import { BLOCK_LIST } from "@/components/newsletter-composer/blocks/registry";
import { TEMPLATES } from "@/components/newsletter-composer/templates/templates";
import { useUI } from "@/components/newsletter-composer/editor/ui-context";
import { useEditorStore } from "@/components/newsletter-composer/store/editor-store";
import type { BlockDef, Template } from "@/components/newsletter-composer/types/editor";
import { cn } from "@/components/newsletter-composer/lib/utils";

type Entry =
  | { kind: "block"; def: BlockDef }
  | { kind: "template"; template: Template };

export function SlashMenu({
  open,
  index,
  onClose,
}: {
  open: boolean;
  index: number;
  onClose: () => void;
}) {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const addBlock = useEditorStore((s) => s.addBlock);
  const applyTemplate = useEditorStore((s) => s.applyTemplate);
  const markTemplateUsed = useEditorStore((s) => s.markTemplateUsed);
  const { toast } = useUI();
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const entries = React.useMemo<Entry[]>(() => {
    const q = query.trim().toLowerCase();
    const blocks: Entry[] = BLOCK_LIST.filter(
      (def) =>
        !q ||
        def.label.toLowerCase().includes(q) ||
        def.keywords.some((keyword) => keyword.includes(q)),
    ).map((def) => ({ kind: "block", def }));

    const templates: Entry[] = TEMPLATES.filter(
      (template) =>
        !q ||
        template.name.toLowerCase().includes(q) ||
        template.category.toLowerCase().includes(q),
    ).map((template) => ({ kind: "template", template }));

    return [...blocks, ...(q ? templates : [])].slice(0, 40);
  }, [query]);

  React.useEffect(() => {
    if (active >= entries.length) setActive(0);
  }, [entries.length, active]);

  React.useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${active}"]`,
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = React.useCallback(
    (entry: Entry) => {
      if (entry.kind === "block") {
        addBlock(entry.def.type, index);
        toast(`${entry.def.label} inserted`, "success");
      } else {
        applyTemplate({ blocks: entry.template.blocks() }, entry.template.name);
        markTemplateUsed(entry.template.id);
        toast(`${entry.template.name} applied`, "success");
      }
      onClose();
    },
    [addBlock, applyTemplate, index, markTemplateUsed, onClose, toast],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((prev) => (prev + 1) % Math.max(entries.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((prev) => (prev - 1 + entries.length) % Math.max(entries.length, 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const entry = entries[active];
      if (entry) choose(entry);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <div className="fixed inset-0 z-[90]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 460, damping: 34 }}
            className="fixed left-1/2 top-[22%] z-[95] w-[min(520px,92vw)] -translate-x-1/2 overflow-hidden rounded-card border border-line bg-surface shadow-lift"
          >
            <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onKeyDown}
                onFocus={(event) => event.currentTarget.select()}
                placeholder="Search blocks and templates…"
                className="h-6 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-muted"
              />
              <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">
                esc
              </span>
            </div>

            <ScrollArea className="max-h-[46vh]">
              <div ref={listRef} className="p-1.5">
              {entries.length ? (
                entries.map((entry, entryIndex) => {
                  const isActive = entryIndex === active;
                  const label =
                    entry.kind === "block" ? entry.def.label : entry.template.name;
                  const description =
                    entry.kind === "block"
                      ? entry.def.description
                      : entry.template.description;
                  const Icon =
                    entry.kind === "block" ? entry.def.icon : LayoutTemplate;
                  const swatch =
                    entry.kind === "block"
                      ? entry.def.swatch
                      : entry.template.cover
                        ? entry.template.cover.accent
                        : "#1D4ED8";

                  return (
                    <button
                      key={`${entry.kind}-${label}`}
                      data-index={entryIndex}
                      type="button"
                      onMouseEnter={() => setActive(entryIndex)}
                      onClick={() => choose(entry)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-left transition",
                        isActive ? "bg-brand-50" : "hover:bg-black/[0.03]",
                      )}
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px]"
                        style={{ background: `${swatch}16`, color: swatch }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-[13px] font-semibold text-ink">
                            {label}
                          </span>
                          <span className="shrink-0 rounded-full border border-line px-1.5 py-[1px] text-[9.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
                            {entry.kind === "block" ? entry.def.category : "Template"}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-[11.5px] text-ink-muted">
                          {description}
                        </span>
                      </span>
                      {isActive ? (
                        <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-brand" />
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center gap-1.5 px-4 py-10 text-center">
                  <Search className="h-4 w-4 text-ink-muted" />
                  <p className="text-[13px] font-medium text-ink">No matches</p>
                  <p className="text-[11.5px] text-ink-muted">
                    Try a different search term.
                  </p>
                </div>
              )}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between border-t border-line bg-canvas/70 px-3.5 py-2 text-[10.5px] text-ink-muted">
              <span className="flex items-center gap-2">
                <span>↑↓ navigate</span>
                <span>↵ insert</span>
              </span>
              <span>{entries.length} results</span>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
