"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type ShareButtonsProps = {
  score: number;
  name: string;
  pillars: { id: string; score: number }[];
  status: string;
};

function buildOgUrl(params: ShareButtonsProps) {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const qs = new URLSearchParams({
    name: params.name || "Explorer",
    score: String(params.score),
    status: params.status,
  });
  for (const p of params.pillars) {
    qs.set(p.id.toLowerCase(), String(p.score));
  }
  return `${base}/api/og/mindup?${qs.toString()}`;
}

function buildShareText(score: number) {
  return `I scored ${score}/100 on the MIND UP™ Personal Growth Assessment by Sagar Lad. Discover your strongest and weakest pillars — take the quiz now!`;
}

export function MindUpShareButtons({
  score,
  userName,
  pillars,
  status,
}: {
  score: number;
  userName: string;
  pillars: { id: string; score: number }[];
  status: string;
}) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/mindup-score`;
  const text = buildShareText(score);
  const ogParams: ShareButtonsProps = { score, name: userName, pillars, status };
  const ogUrl = buildOgUrl(ogParams);

  const hrefs = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
  };

  async function downloadImage(): Promise<Blob | null> {
    try {
      setDownloading(true);
      const res = await fetch(ogUrl);
      if (!res.ok) return null;
      return await res.blob();
    } catch {
      return null;
    } finally {
      setDownloading(false);
    }
  }

  async function shareToInstagram() {
    const blob = await downloadImage();
    if (!blob) return;

    const file = new File([blob], "mindup-score.png", { type: "image/png" });

    if (navigator.share && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `My MIND UP™ Score: ${score}/100`,
          text: text,
          files: [file],
        });
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2000);
        return;
      } catch {
        // User cancelled or not supported — fall through to download
      }
    }

    // Fallback: download the image
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindup-score.png";
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }

  async function shareToStory() {
    const blob = await downloadImage();
    if (!blob) return;

    const file = new File([blob], "mindup-story.png", { type: "image/png" });

    if (navigator.share && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: `My MIND UP™ Score: ${score}/100`,
          text: text,
          files: [file],
        });
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2000);
        return;
      } catch {
        // Fall through
      }
    }

    // Fallback: download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindup-story.png";
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }

  const baseBtn =
    "inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs";

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
      {/* LinkedIn */}
      <a
        href={hrefs.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
        className={`${baseBtn} hover:border-[#0A66C2]/60 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452z" />
        </svg>
      </a>

      {/* X / Twitter */}
      <a
        href={hrefs.x}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        title="Share on X"
        className={`${baseBtn} hover:border-foreground/50 hover:bg-foreground/5 hover:text-foreground`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* Instagram Post */}
      <button
        type="button"
        onClick={shareToInstagram}
        disabled={downloading}
        aria-label="Share to Instagram Post"
        title="Share to Instagram"
        className={`${baseBtn} hover:border-[#E4405F]/60 hover:bg-[#E4405F]/10 hover:text-[#E4405F] disabled:opacity-50`}
      >
        {downloaded ? (
          <Check className="h-4 w-4 text-emerald-500" />
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        )}
      </button>

      {/* Instagram Story */}
      <button
        type="button"
        onClick={shareToStory}
        disabled={downloading}
        aria-label="Share to Instagram Story"
        title="Share to Instagram Story"
        className={`${baseBtn} hover:border-[#E4405F]/60 hover:bg-[#E4405F]/10 hover:text-[#E4405F] disabled:opacity-50`}
      >
        {downloaded ? (
          <Check className="h-4 w-4 text-emerald-500" />
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12a4 4 0 0 1 8 0" />
            <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
          </svg>
        )}
      </button>
    </div>
  );
}
