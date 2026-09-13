"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CornerDownLeft,
  Eye,
  History,
  Layers,
  LayoutTemplate,
  Redo2,
  Rocket,
  Search,
  Send,
  Trash2,
  Undo2,
} from "lucide-react";
import { ScrollArea } from "@/components/newsletter-composer/ui/primitives";
import { BLOCK_LIST } from "@/components/newsletter-composer/blocks/registry";
import { TEMPLATES } from "@/components/newsletter-composer/templates/templates";
import { useUI } from "@/components/newsletter-composer/editor/ui-context";
import { useEditorStore } from "@/components/newsletter-composer/store/editor-store";
import { cn } from "@/components/newsletter-composer/lib/utils";

interface Command {
  id: string;
  label: string;
  hint: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
}

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);
  const { openModal, toast } = useUI();

  const addBlock = useEditorStore((s) => s.addBlock);
  const applyTemplate = useEditorStore((s) => s.applyTemplate);
  const markTemplateUsed = useEditorStore((s) => s.markTemplateUsed);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const toggleFocusMode = useEditorStore((s) => s.toggleFocusMode);
  const toggleShowHidden = useEditorStore((s) => s.toggleShowHidden);
  const toggleDarkPreview = useEditorStore((s) => s.toggleDarkPreview);
  const clearBlocks = useEditorStore((s) => s.clearBlocks);
  const setLeftTab = useEditorStore((s) => s.setLeftTab);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const commands = React.useMemo<Command[]>(() => {
    const actions: Command[] = [
      {
        id: "preview",
        label: "Preview issue",
        hint: "Open the full-email preview",
        group: "Actions",
        icon: Eye,
        run: () => openModal("preview"),
      },
      {
        id: "test",
        label: "Send test email",
        hint: "Deliver a test to your inbox",
        group: "Actions",
        icon: Send,
        run: () => openModal("test"),
      },
      {
        id: "publish",
        label: "Publish issue",
        hint: "Schedule or send now",
        group: "Actions",
        icon: Rocket,
        run: () => openModal("publish"),
      },
      {
        id: "history",
        label: "Version history",
        hint: "Restore an earlier snapshot",
        group: "Actions",
        icon: History,
        run: () => openModal("history"),
      },
      {
        id: "undo",
        label: "Undo",
        hint: "Step backwards",
        group: "Actions",
        icon: Undo2,
        run: undo,
      },
      {
        id: "redo",
        label: "Redo",
        hint: "Step forwards",
        group: "Actions",
        icon: Redo2,
        run: redo,
      },
      {
        id: "focus",
        label: "Toggle focus mode",
        hint: "Hide both side panels",
        group: "View",
        icon: Layers,
        run: toggleFocusMode,
      },
      {
        id: "hidden",
        label: "Toggle hidden blocks",
        hint: "Show or hide hidden sections",
        group: "View",
        icon: Eye,
        run: toggleShowHidden,
      },
      {
        id: "dark",
        label: "Toggle dark mode preview",
        hint: "Check the issue in dark mode",
        group: "View",
        icon: Eye,
        run: toggleDarkPreview,
      },
      {
        id: "templates",
        label: "Browse templates",
        hint: "Open the template gallery",
        group: "View",
        icon: LayoutTemplate,
        run: () => setLeftTab("templates"),
      },
      {
        id: "clear",
        label: "Clear all blocks",
        hint: "Start this issue again",
        group: "Danger",
        icon: Trash2,
        run: () => {
          clearBlocks();
          toast("Issue cleared", "warn");
        },
      },
    ];

    const blocks: Command[] = BLOCK_LIST.map((def) => ({
      id: `block-${def.type}`,
      label: `Insert ${def.label}`,
      hint: def.description,
      group: `Blocks · ${def.category}`,
      icon: def.icon,
      run: () => {
        addBlock(def.type);
        toast(`${def.label} added`, "success");
      },
    }));

    const templates: Command[] = TEMPLATES.map((template) => ({
      id: `template-${template.id}`,
      label: `Use ${template.name}`,
      hint: template.description,
      group: "Templates",
      icon: ArrowRight,
      run: () => {
        applyTemplate({ blocks: template.blocks() }, template.name);
        markTemplateUsed(template.id);
        toast(`${template.name} applied`, "success");
      },
    }));

    const all = [...actions, ...blocks, ...templates];
    const q = query.trim().toLowerCase();
    if (!q) return all.slice(0, 14);
    return all
      .filter(
        (command) =>
          command.label.toLowerCase().includes(q) ||
          command.hint.toLowerCase().includes(q) ||
          command.group.toLowerCase().includes(q),
      )
      .slice(0, 24);
  }, [
    query,
    openModal,
    undo,
    redo,
    toggleFocusMode,
    toggleShowHidden,
    toggleDarkPreview,
    setLeftTab,
    clearBlocks,
    addBlock,
    applyTemplate,
    markTemplateUsed,
    toast,
  ]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, Command[]>();
    commands.forEach((command) => {
      const list = map.get(command.group) ?? [];
      list.push(command);
      map.set(command.group, list);
    });
    return Array.from(map.entries());
  }, [commands]);

  const flat = commands;

  const run = (command: Command) => {
    command.run();
    if (command.group !== "Danger") onClose();
    else onClose();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((prev) => (prev + 1) % Math.max(flat.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((prev) => (prev - 1 + flat.length) % Math.max(flat.length, 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const command = flat[active];
      if (command) run(command);
    } else if (event.key === "Escape") {
      onClose();
    }
  };

  React.useEffect(() => {
    if (active >= flat.length) setActive(0);
  }, [flat.length, active]);

  React.useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <div className="fixed inset-0 z-[110] bg-[#111827]/25 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.995 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="fixed left-1/2 top-[14%] z-[115] w-[min(620px,94vw)] -translate-x-1/2 overflow-hidden rounded-card border border-line bg-surface shadow-lift"
          >
            <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-ink-muted" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onKeyDown}
                onFocus={(event) => event.currentTarget.select()}
                placeholder="Search actions, blocks and templates…"
                className="h-6 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-muted"
              />
              <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">
                ⌘K
              </span>
            </div>

            <ScrollArea className="max-h-[56vh]">
              <div ref={listRef} className="p-2">
              {grouped.map(([group, items]) => (
                <div key={group} className="mb-1.5">
                  <p className="px-2 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                    {group}
                  </p>
                  {items.map((command) => {
                    const index = flat.indexOf(command);
                    const isActive = index === active;
                    return (
                      <button
                        key={command.id}
                        data-index={index}
                        type="button"
                        onMouseEnter={() => setActive(index)}
                        onClick={() => run(command)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2 text-left transition",
                          isActive ? "bg-brand-50" : "hover:bg-black/[0.03]",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] border",
                            isActive
                              ? "border-brand/20 bg-white text-brand"
                              : "border-line bg-canvas text-ink-muted",
                          )}
                        >
                          <command.icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] font-medium text-ink">
                            {command.label}
                          </span>
                          <span className="block truncate text-[11.5px] text-ink-muted">
                            {command.hint}
                          </span>
                        </span>
                        {isActive ? (
                          <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-brand" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ))}
              {!grouped.length ? (
                <p className="px-3 py-10 text-center text-[13px] text-ink-muted">
                  Nothing matches “{query}”.
                </p>
              ) : null}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between border-t border-line bg-canvas/70 px-4 py-2 text-[10.5px] text-ink-muted">
              <span className="flex items-center gap-3">
                <span>↑↓ navigate</span>
                <span>↵ run</span>
                <span>esc close</span>
              </span>
              <span>{flat.length} results</span>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
