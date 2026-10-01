"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export function QuoteDownloadButton({ slug, fileName, iconOnly = false }: { slug: string; fileName: string; iconOnly?: boolean }) {
  const [busy, setBusy] = useState(false);

  async function download() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/quotes/${encodeURIComponent(slug)}/opengraph-image?download=1&t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      // Fallback: open the image in a new tab with cache buster.
      window.open(`/quotes/${encodeURIComponent(slug)}/opengraph-image?download=1&t=${Date.now()}`, "_blank", "noopener");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={download}
      disabled={busy}
      aria-label="Download quote image"
      title="Download quote image"
      className={
        iconOnly
          ? "grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-accent transition-colors disabled:opacity-50"
          : "inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-accent transition-colors disabled:opacity-50"
      }
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {!iconOnly && "Download"}
    </button>
  );
}
