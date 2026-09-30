"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { QuoteDownloadButton } from "@/components/quotes/QuoteDownloadButton";

// Minimal share row: one native Share icon + one Download icon. Nothing else.
export function QuoteShareRow({
  title,
  url,
  slug,
  fileName,
}: {
  title: string;
  url: string;
  slug: string;
  fileName: string;
}) {
  const [shared, setShared] = useState(false);

  async function share() {
    const data = { title, text: title, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      throw new Error("no-native-share");
    } catch (err) {
      // User dismissed — silent. Real failure — copy the link instead.
      if (err instanceof Error && err.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {}
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={share}
        aria-label="Share quote"
        title="Share quote"
        className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
      >
        {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      </button>
      <QuoteDownloadButton slug={slug} fileName={fileName} iconOnly />
    </div>
  );
}
