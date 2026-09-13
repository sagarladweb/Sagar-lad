"use client";

import * as React from "react";
import { useEditorStore } from "@/components/newsletter-composer/store/editor-store";
import type { Block } from "@/components/newsletter-composer/types/editor";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target.isContentEditable
  );
}

export function useEditorShortcuts(handlers: {
  onOpenSlash?: () => void;
  onOpenPalette?: () => void;
  onPreview?: () => void;
}) {
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const flushSave = useEditorStore((s) => s.flushSave);
  const selectedId = useEditorStore((s) => s.selectedId);
  const blocks = useEditorStore((s) => s.doc.blocks);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      const typing = isTypingTarget(event.target);

      /* Undo / redo work everywhere except while typing in a field */
      if (mod && event.key.toLowerCase() === "z") {
        if (typing) return;
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }

      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        handlers.onOpenPalette?.();
        return;
      }

      if (mod && event.key.toLowerCase() === "s") {
        event.preventDefault();
        flushSave();
        return;
      }

      if (mod && event.key.toLowerCase() === "d" && selectedId && !typing) {
        event.preventDefault();
        duplicateBlock(selectedId);
        return;
      }

      if (mod && event.shiftKey && event.key.toLowerCase() === "p") {
        event.preventDefault();
        handlers.onPreview?.();
        return;
      }

      if (event.key === "/" && !typing) {
        event.preventDefault();
        handlers.onOpenSlash?.();
        return;
      }

      if (event.key === "k" && (event.metaKey || event.ctrlKey) && !typing) {
        event.preventDefault();
        handlers.onOpenPalette?.();
        return;
      }

      if ((event.key === "Backspace" || event.key === "Delete") && !typing && selectedId) {
        event.preventDefault();
        removeBlock(selectedId);
        return;
      }

      if (event.key === "Escape") {
        selectBlock(null);
        return;
      }

      /* Quick block navigation: Cmd + arrow keys */
      if (mod && (event.key === "ArrowUp" || event.key === "ArrowDown") && blocks.length) {
        event.preventDefault();
        const index = blocks.findIndex((b: Block) => b.id === selectedId);
        const nextIndex =
          event.key === "ArrowUp"
            ? index <= 0
              ? blocks.length - 1
              : index - 1
            : index < 0 || index === blocks.length - 1
              ? 0
              : index + 1;
        selectBlock(blocks[nextIndex].id);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    handlers,
    undo,
    redo,
    duplicateBlock,
    removeBlock,
    selectBlock,
    flushSave,
    selectedId,
    blocks,
  ]);
}
