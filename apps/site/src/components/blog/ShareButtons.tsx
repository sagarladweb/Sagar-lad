"use client";

import { useEffect, useState } from "react";
import { Link2, Check, MessageCircle, Share2 } from "lucide-react";

export function ShareButtons({
  title,
  slug,
  url,
  variant = "clean",
  showLabel = true,
}: {
  title: string;
  slug: string;
  url: string;
  variant?: "standalone" | "clean";
  showLabel?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(url);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setShareUrl(window.location.href);
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanShare(true);
    }
  }, []);

  const text = `${title} — from Sagar Lad`;
  const hrefs = {
    x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${shareUrl}`)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`,
  };

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share aborted
      }
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  const baseBtn =
    "inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs";

  const content = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
      {canShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          aria-label="Share article via device"
          className="inline-flex h-10 sm:h-11 items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 text-xs font-semibold text-brand transition-all hover:bg-brand/20 hover:scale-105 active:scale-95 shadow-xs"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
      )}

      <a
        href={hrefs.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
        className={`${baseBtn} hover:border-[#25D366]/60 hover:bg-[#25D366]/10 hover:text-[#25D366]`}
      >
        <MessageCircle className="h-4 w-4 text-[#25D366]" />
      </a>

      <a
        href={hrefs.x}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X (Twitter)"
        title="Share on X"
        className={`${baseBtn} hover:border-foreground/50 hover:bg-foreground/5 hover:text-foreground`}
      >
        <XIcon />
      </a>

      <a
        href={hrefs.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
        className={`${baseBtn} hover:border-[#0A66C2]/60 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]`}
      >
        <LinkedInIcon />
      </a>

      <a
        href={hrefs.email}
        aria-label="Share by email"
        title="Share by email"
        className={`${baseBtn} hover:border-brand/50 hover:bg-brand/10 hover:text-brand`}
      >
        <MailOutline />
      </a>

      <div className="relative">
        <button
          type="button"
          onClick={copyLink}
          aria-label="Copy link"
          title="Copy link"
          className={`${baseBtn} ${
            copied
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
              : "hover:border-foreground/50 hover:bg-foreground/5 hover:text-foreground"
          }`}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
        </button>
        {copied && (
          <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background shadow-lg animate-in fade-in zoom-in-95">
            Copied!
          </span>
        )}
      </div>
    </div>
  );

  if (variant === "clean") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {showLabel && (
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Share
          </span>
        )}
        {content}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/60 p-4 sm:p-5">
      {showLabel && (
        <div>
          <p className="text-sm font-semibold text-foreground">Share this article</p>
          <p className="text-xs text-muted-foreground">Pass along ideas worth spreading</p>
        </div>
      )}
      {content}
    </div>
  );
}

function MailOutline() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452z" />
    </svg>
  );
}