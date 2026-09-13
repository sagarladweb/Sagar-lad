"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/newsletter-composer/ui/primitives";
import { cn } from "@/components/newsletter-composer/lib/utils";
import { GripVertical, LayoutTemplate, X, Eye, Settings2 } from "lucide-react";
import { Header, MobileBar } from "@/components/newsletter-composer/editor/Header";
import { LeftPanel } from "@/components/newsletter-composer/editor/LeftPanel";
import { Canvas } from "@/components/newsletter-composer/editor/Canvas";
import { RightPanel } from "@/components/newsletter-composer/editor/Inspector";
import { CommandPalette } from "@/components/newsletter-composer/editor/CommandPalette";
import { EditorModals } from "@/components/newsletter-composer/editor/Modals";
import { UIProvider, useUI } from "@/components/newsletter-composer/editor/ui-context";
import { BLOCK_DEFS } from "@/components/newsletter-composer/blocks/registry";
import { useEditorShortcuts } from "@/components/newsletter-composer/hooks/useEditorShortcuts";
import { Skeleton } from "@/components/newsletter-composer/ui/primitives";
import { useEditorStore } from "@/components/newsletter-composer/store/editor-store";
import type { BlockType } from "@/components/newsletter-composer/types/editor";
import { TooltipProvider } from "@/components/newsletter-composer/ui/tooltip";

/* ------------------------------------------------------------------ *
 *  Loading shell
 * ------------------------------------------------------------------ */
function LoadingShell() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface px-4">
        <Skeleton className="h-9 w-9 rounded-[12px]" />
        <Skeleton className="h-4 w-40" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-64 rounded-full" />
        <div className="flex-1" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-[300px] shrink-0 space-y-2 border-r border-line bg-canvas p-3 md:block">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
        <div className="flex flex-1 justify-center p-10">
          <Skeleton className="h-[520px] w-full max-w-[720px] rounded-card" />
        </div>
        <div className="hidden w-[340px] shrink-0 space-y-3 border-l border-line bg-surface p-4 lg:block">
          <Skeleton className="h-8 w-full rounded-full" />
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Mobile sheet
 * ------------------------------------------------------------------ */
function Sheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#111827]/30"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className={cn("absolute inset-x-0 bottom-0 flex h-[78vh] flex-col overflow-hidden rounded-t-card border-t border-line bg-surface", className)}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="text-[13px] font-semibold text-ink">{title}</span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-ink-muted transition hover:bg-black/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ *
 *  Editor body
 * ------------------------------------------------------------------ */
function EditorBody() {
  const { openModal } = useUI();
  const hydrate = useEditorStore((s) => s.hydrate);
  const hydrated = useEditorStore((s) => s.hydrated);
  const focusMode = useEditorStore((s) => s.focusMode);

  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [blocksSheet, setBlocksSheet] = React.useState(false);
  const [inspectorSheet, setInspectorSheet] = React.useState(false);
  const [dragChip, setDragChip] = React.useState<{
    label: string;
    kind: "library" | "block";
  } | null>(null);

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  React.useEffect(() => {
    const handleOpenPalette = () => setPaletteOpen(true);
    window.addEventListener("composer:open-palette", handleOpenPalette);
    return () => window.removeEventListener("composer:open-palette", handleOpenPalette);
  }, []);

  const handlers = React.useMemo(
    () => ({
      onOpenSlash: () =>
        window.dispatchEvent(new Event("composer:open-slash")),
      onOpenPalette: () => setPaletteOpen(true),
      onPreview: () => openModal("preview"),
    }),
    [openModal],
  );

  useEditorShortcuts(handlers);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as
      | { kind: "library"; type: BlockType }
      | { kind: "block"; label: string }
      | undefined;
    if (data?.kind === "library") {
      setDragChip({ label: BLOCK_DEFS[data.type]?.label ?? "Block", kind: "library" });
    } else {
      setDragChip({ label: data?.label ?? "Block", kind: "block" });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDragChip(null);
    const { active, over } = event;
    if (!over) return;

    const state = useEditorStore.getState();
    const device = state.device;
    const showHidden = state.showHidden;
    const blocks = state.doc.blocks;
    const visible = blocks.filter((block) => {
      if (block.settings.hidden && !showHidden) return false;
      if (device === "desktop" && !block.settings.showDesktop) return false;
      if (device === "tablet" && !block.settings.showTablet) return false;
      if (device === "mobile" && !block.settings.showMobile) return false;
      return true;
    });

    const overId = String(over.id);
    let visibleIndex: number;
    if (overId.startsWith("insert-")) {
      visibleIndex = Number(overId.replace("insert-", ""));
    } else {
      visibleIndex = visible.findIndex((block) => block.id === overId);
    }
    if (Number.isNaN(visibleIndex) || visibleIndex < 0) visibleIndex = visible.length;

    /* Map the visible insertion point back onto the document order. */
    const docIndex =
      visibleIndex >= visible.length
        ? blocks.length
        : blocks.findIndex((block) => block.id === visible[visibleIndex].id);

    const dragData = active.data.current as
      | { kind: "library"; type: BlockType }
      | { kind: "block"; label: string }
      | undefined;

    if (dragData?.kind === "library") {
      state.addBlock(dragData.type, docIndex < 0 ? blocks.length : docIndex);
      return;
    }

    if (overId === active.id) return;
    if (overId.startsWith("insert-")) {
      const target = visible[Math.min(visibleIndex, visible.length - 1)];
      if (target && target.id !== active.id) {
        state.reorderBlocks(String(active.id), target.id);
      }
      return;
    }
    state.reorderBlocks(String(active.id), overId);
  };

  if (!hydrated) return <LoadingShell />;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDragChip(null)}
    >
      <div className="flex h-screen w-full flex-col overflow-hidden bg-canvas">
        <Header />

        <div className="flex min-h-0 flex-1">
          {!focusMode ? (
            <aside className="hidden w-[300px] shrink-0 md:block">
              <LeftPanel />
            </aside>
          ) : null}

          <main className="flex min-w-0 flex-1 flex-col">
            <Canvas />
          </main>

          {!focusMode ? (
            <aside className="relative hidden w-[340px] shrink-0 lg:block">
              <RightPanel />
            </aside>
          ) : null}
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 hidden h-14 items-center justify-center border-t border-line bg-surface/95 backdrop-blur-sm lg:hidden">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setBlocksSheet(true)}>
              <LayoutTemplate className="h-4 w-4" />
              Blocks
            </Button>
            <Button variant="outline" size="sm" onClick={() => setInspectorSheet(true)}>
              <Settings2 className="h-4 w-4" />
              Inspector
            </Button>
            <Button variant="ghost" size="sm" onClick={() => useEditorStore.getState().toggleDarkPreview()}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <MobileBar
          onOpenBlocks={() => setBlocksSheet(true)}
          onOpenInspector={() => setInspectorSheet(true)}
        />
      </div>

      <Sheet open={blocksSheet} onClose={() => setBlocksSheet(false)} title="Blocks & templates">
        <LeftPanel />
      </Sheet>
      <Sheet open={inspectorSheet} onClose={() => setInspectorSheet(false)} title="Inspector">
        <RightPanel />
      </Sheet>

      <Sheet
        open={false}
        onClose={() => {}}
        title="Blocks & templates"
        className="hidden"
      >
        <div className="flex h-full min-h-0 flex-col">
          <LeftPanel />
        </div>
      </Sheet>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <EditorModals />

      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.22,1,0.36,1)" }}>
        {dragChip ? (
          <div className="pointer-events-none flex items-center gap-2 rounded-full border border-brand/30 bg-surface px-3 py-2 text-[12.5px] font-semibold text-ink shadow-lift">
            <GripVertical className="h-3.5 w-3.5 text-brand" />
            {dragChip.label}
            <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-muted">
              {dragChip.kind === "library" ? "insert" : "move"}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export function EditorShell() {
  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={100}>
      <UIProvider>
        <EditorBody />
      </UIProvider>
    </TooltipProvider>
  );
}
