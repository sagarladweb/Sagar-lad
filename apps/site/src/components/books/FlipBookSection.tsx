"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ShoppingBag } from "lucide-react";
import { FlipBook } from "@/components/FlipBook";

export type FlipBookData = {
  title: string;
  author: string;
  coverImage: string;
  pages: string[];
  backCoverImage?: string;
  buyLink?: string;
};

export const FLIPBOOKS: Record<string, FlipBookData> = {
  MindUp: {
    title: "MindUp",
    author: "Sagar Lad",
    coverImage: "/images/books/Book-MINDUP/mindup-front.webp",
    pages: [
      "/images/books/Book-MINDUP/1.webp",
      "/images/books/Book-MINDUP/2.webp",
      "/images/books/Book-MINDUP/3.webp",
      "/images/books/Book-MINDUP/4.webp",
      "/images/books/Book-MINDUP/5.webp",
      "/images/books/Book-MINDUP/6.webp",
      "/images/books/Book-MINDUP/7.webp",
      "/images/books/Book-MINDUP/8.webp",
      "/images/books/Book-MINDUP/9.webp",
      "/images/books/Book-MINDUP/10.webp",
    ],
    backCoverImage: "/images/books/Book-MINDUP/mindup-back.webp",
    buyLink: "https://www.amazon.com/stores/author/B0B5R12SHN/allbooks",
  },
  "AI Foundry": {
    title: "AI Foundry",
    author: "Sagar Lad",
    coverImage: "/images/books/Book-AI foundry/azure-front.webp",
    pages: [
      "/images/books/Book-AI foundry/A 1.webp",
      "/images/books/Book-AI foundry/A 2.webp",
      "/images/books/Book-AI foundry/A 3.webp",
      "/images/books/Book-AI foundry/A 4.webp",
      "/images/books/Book-AI foundry/A 5.webp",
      "/images/books/Book-AI foundry/A 6.webp",
      "/images/books/Book-AI foundry/A 7.webp",
      "/images/books/Book-AI foundry/A 8.webp",
      "/images/books/Book-AI foundry/A 9.webp",
    ],
    backCoverImage: "/images/books/Book-AI foundry/azure-back.svg",
    buyLink: "https://www.amazon.com/stores/author/B0B5R12SHN/allbooks",
  },
};

export function getFlipbookKey(title?: string | null): string | null {
  if (!title) return null;
  const lower = title.toLowerCase();
  if (lower.includes("mind up") || lower.includes("mindup")) return "MindUp";
  if (lower.includes("foundry") || lower.includes("azure")) return "AI Foundry";
  if (FLIPBOOKS[title]) return title;
  return null;
}

export function FlipBookSection({
  bookKey,
  onClose,
}: {
  bookKey: string;
  onClose: () => void;
}) {
  const data = FLIPBOOKS[bookKey];

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!data || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[#080c14] text-white select-none overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Live book preview: ${data.title}`}
    >
      {/* Ambient Reading Glow Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(250,204,21,0.08)_0%,rgba(15,23,42,0.85)_55%,#04070d_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.4) 0.5px, transparent 0.5px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Sleek Top Floating Controls: Book Title on Left, Buy & Close on Right */}
      <div className="relative z-50 flex items-center justify-between px-4 sm:px-8 pt-4 sm:pt-6 shrink-0 pointer-events-none">
        {/* Book Title & Author */}
        <div className="pointer-events-auto flex items-baseline gap-2.5 bg-black/40 backdrop-blur-md px-3.5 sm:px-4 py-2 rounded-full border border-white/10 shadow-lg">
          <span className="font-display font-bold text-white text-sm sm:text-base tracking-tight">
            {data.title}
          </span>
          <span className="hidden sm:inline-block text-xs text-neutral-400 font-medium">
            by {data.author}
          </span>
        </div>

        {/* Action Controls: Buy Book CTA + Close */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          {data.buyLink && (
            <a
              href={data.buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#FACC15] text-black px-3.5 sm:px-4 py-2 text-xs font-bold shadow-lg hover:bg-[#ffe043] transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buy Book</span>
            </a>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close book preview"
            title="Close (Esc)"
            className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border border-white/20 bg-black/60 text-white/80 backdrop-blur-md transition-all hover:scale-105 hover:bg-black/90 hover:text-white hover:border-white/40 active:scale-95 shadow-xl"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Book Stage — Centered in viewport */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-0 overflow-hidden px-2 sm:px-6 py-2 sm:py-4">
        <FlipBook {...data} />
      </div>
    </div>,
    document.body
  );
}
