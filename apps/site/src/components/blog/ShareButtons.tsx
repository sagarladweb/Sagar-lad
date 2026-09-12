"use client";

import { useEffect, useState } from "react";
import { Link2, Check } from "lucide-react";

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

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const text = `${title} — from Sagar Lad`;
  const hrefs = {
    x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${shareUrl}`)}`,
  };

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
        href={hrefs.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
        className={`${baseBtn} hover:border-[#25D366]/60 hover:bg-[#25D366]/10 hover:text-[#25D366]`}
      >
        <MessageCircleIcon />
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

function MessageCircleIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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
