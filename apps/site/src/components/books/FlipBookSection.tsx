"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
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

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#090909]">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-white/5 p-2.5 text-neutral-400 transition-colors hover:text-white backdrop-blur-sm"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="w-full h-full overflow-y-auto">
        <FlipBook {...data} />
      </div>
    </div>,
    document.body
  );
}
