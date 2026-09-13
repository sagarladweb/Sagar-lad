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

export function FlipBookSection({
  bookKey,
  onClose,
}: {
  bookKey: string;
  onClose: () => void;
}) {
  const data = FLIPBOOKS[bookKey];
  if (!data || typeof document === "undefined") return null;

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#090909]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 shrink-0 border-b border-white/5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#FACC15]">
            Preview Edition
          </p>
          <p className="text-sm font-bold text-white truncate">{data.title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {data.buyLink && (
            <a
              href={data.buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#FACC15] text-black px-4 py-2 text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buy Now</span>
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-400 transition-colors hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Book — centered in remaining space */}
      <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden px-2 sm:px-4">
        <FlipBook {...data} />
      </div>
    </div>,
    document.body
  );
}
