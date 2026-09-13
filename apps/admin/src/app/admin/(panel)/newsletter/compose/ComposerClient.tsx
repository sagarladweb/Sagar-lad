"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useEditorStore } from "@/components/newsletter-composer/store/editor-store";
import type { NewsletterDoc } from "@/components/newsletter-composer/types/editor";
import { Skeleton } from "@/components/newsletter-composer/ui/primitives";

const EditorShell = dynamic(
  () =>
    import("@/components/newsletter-composer/editor/EditorShell").then(
      (m) => m.EditorShell
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full flex-col overflow-hidden bg-canvas">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface px-4">
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-4 w-40" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-64 rounded-full" />
          <div className="flex-1" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
        <div className="flex min-h-0 flex-1">
          <div className="hidden w-[300px] shrink-0 space-y-2 border-r border-line bg-canvas p-3 md:block">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-xl" />
            ))}
          </div>
          <div className="flex flex-1 justify-center p-10">
            <Skeleton className="h-[520px] w-full max-w-[720px] rounded-2xl" />
          </div>
          <div className="hidden w-[340px] shrink-0 space-y-3 border-l border-line bg-surface p-4 lg:block">
            <Skeleton className="h-8 w-full rounded-full" />
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    ),
  }
);

interface ComposerClientProps {
  seedDoc?: NewsletterDoc | null;
  draftId?: string | null;
}

export function ComposerClient({ seedDoc, draftId }: ComposerClientProps) {
  React.useEffect(() => {
    if (seedDoc && seedDoc.blocks) {
      useEditorStore.getState().setDoc(seedDoc);
    }
  }, [seedDoc]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas overflow-hidden font-sans text-ink">
      <EditorShell />
    </div>
  );
}
