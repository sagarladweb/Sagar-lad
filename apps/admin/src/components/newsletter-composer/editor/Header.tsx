"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarClock,
  CircleCheck,
  Eye,
  History,
  LayoutTemplate,
  Layers,
  Monitor,
  Redo2,
  Rocket,
  Send,
  Settings2,
  Smartphone,
  Tablet,
  Undo2,
} from "lucide-react";
import {
  Badge,
  Button,
  Segmented,
  Separator,
  Tooltip,
} from "@/components/newsletter-composer/ui/primitives";
import { useUI } from "@/components/newsletter-composer/editor/ui-context";
import { useEditorStore } from "@/components/newsletter-composer/store/editor-store";
import type { DeviceMode } from "@/components/newsletter-composer/types/editor";
import { cn, formatClock, formatRelativeTime } from "@/components/newsletter-composer/lib/utils";

function AutosaveStatus() {
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const lastSavedAt = useEditorStore((s) => s.lastSavedAt);
  const { openModal } = useUI();
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(timer);
  }, []);

  const label =
    saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Autosaved" : "Draft";

  /* Super small, discrete capsule */
  return (
    <button
      type="button"
      onClick={() => openModal("history")}
      title="Open version history"
      className="group inline-flex items-center gap-1.5 rounded-full border border-line/70 bg-canvas/90 px-2.5 py-1 text-[11px] font-medium text-ink-muted transition hover:border-brand/40 hover:text-ink"
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full transition-colors shrink-0",
          saveStatus === "saving"
            ? "bg-amber-500 animate-pulse"
            : saveStatus === "saved"
              ? "bg-emerald-500"
              : "bg-line-strong",
        )}
      />
      <span className="whitespace-nowrap tabular-nums leading-none">
        {label} {formatRelativeTime(lastSavedAt)}
      </span>
    </button>
  );
}

function PublishButton() {
  const { openModal } = useUI();
  const [hovered, setHovered] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHovered(false);
    }, 250);
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button
        variant="primary"
        size="sm"
        onClick={() => openModal("publish", { mode: "now" })}
      >
        <Rocket className="h-3.5 w-3.5" />
        <span>Publish</span>
      </Button>

      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 3, scale: 0.98 }}
          transition={{ duration: 0.12 }}
          className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-line bg-surface p-1.5 shadow-xl"
        >
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
            Delivery Options
          </div>
          <button
            type="button"
            onClick={() => {
              setHovered(false);
              openModal("publish", { mode: "now" });
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-ink transition hover:bg-canvas"
          >
            <Rocket className="h-3.5 w-3.5 text-brand shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-ink">Publish Now</span>
              <span className="text-[10px] text-ink-muted truncate">Broadcast immediately to active list</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              setHovered(false);
              openModal("publish", { mode: "schedule" });
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-brand transition hover:bg-brand/10"
          >
            <CalendarClock className="h-3.5 w-3.5 text-brand shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-brand">Schedule Newsletter</span>
              <span className="text-[10px] text-ink-muted truncate">Pick date & time via cron</span>
            </div>
          </button>
        </motion.div>
      )}
    </div>
  );
}

export function Header() {
  const { openModal } = useUI();
  const device = useEditorStore((s) => s.device);
  const setDevice = useEditorStore((s) => s.setDevice);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);
  const focusMode = useEditorStore((s) => s.focusMode);
  const toggleFocusMode = useEditorStore((s) => s.toggleFocusMode);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface px-3 md:px-4">
      {/* ---------------------------- Left ---------------------------- */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link
          href="/admin/newsletter"
          title="Return to Newsletters"
          className="group flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-2.5 py-1.5 text-[12px] font-semibold text-ink transition hover:border-brand hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Newsletters</span>
        </Link>
        <div className="hidden items-center gap-1.5 md:flex">
          <AutosaveStatus />
        </div>

        <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />

        <div className="flex items-center gap-1">
          <Tooltip label="Undo (⌘Z)">
            <Button
              variant="ghost"
              size="icon"
              disabled={!canUndo}
              onClick={undo}
              aria-label="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip label="Redo (⇧⌘Z)">
            <Button
              variant="ghost"
              size="icon"
              disabled={!canRedo}
              onClick={redo}
              aria-label="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* --------------------------- Center --------------------------- */}
      <div className="hidden shrink-0 items-center gap-3 md:flex">
        <Segmented<DeviceMode>
          layoutId="device-toggle"
          value={device}
          onChange={setDevice}
          items={[
            { value: "desktop", label: "Desktop", icon: <Monitor className="h-3.5 w-3.5" /> },
            { value: "tablet", label: "Tablet", icon: <Tablet className="h-3.5 w-3.5" /> },
            { value: "mobile", label: "Mobile", icon: <Smartphone className="h-3.5 w-3.5" /> },
          ]}
        />
        <span className="hidden text-[11.5px] text-ink-muted xl:inline">
          {device === "desktop" ? "720px" : device === "tablet" ? "600px" : "400px"}
        </span>
      </div>

      {/* ---------------------------- Right --------------------------- */}
      <div className="flex shrink-0 items-center justify-end gap-2 md:flex-1">
        <Tooltip label={focusMode ? "Exit focus mode" : "Focus mode"}>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFocusMode}
            aria-label="Toggle focus mode"
          >
            <Layers className="h-4 w-4" />
          </Button>
        </Tooltip>

        <Button
          variant="outline"
          size="sm"
          onClick={() => openModal("preview")}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Preview</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => openModal("test")}
        >
          <Send className="h-3.5 w-3.5" />
          <span>Test Email</span>
        </Button>

        <PublishButton />
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ *
 *  Mobile action bar — canvas only on phones
 * ------------------------------------------------------------------ */
export function MobileBar({
  onOpenBlocks,
  onOpenInspector,
}: {
  onOpenBlocks: () => void;
  onOpenInspector: () => void;
}) {
  const { openModal } = useUI();
  const toggleDarkPreview = useEditorStore((s) => s.toggleDarkPreview);

  return (
    <div className="flex items-center justify-around border-t border-line bg-surface px-2 py-2 md:hidden">
      <Button variant="ghost" size="sm" onClick={onOpenBlocks}>
        <LayoutTemplate className="h-4 w-4" />
        Blocks
      </Button>
      <Button variant="ghost" size="sm" onClick={onOpenInspector}>
        <Settings2 className="h-4 w-4" />
        Inspector
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          toggleDarkPreview();
          openModal("preview");
        }}
      >
        <Eye className="h-4 w-4" />
        Preview
      </Button>
      <Badge tone="brand">
        <CircleCheck className="h-3 w-3" />
        Autosaved
      </Badge>
    </div>
  );
}
