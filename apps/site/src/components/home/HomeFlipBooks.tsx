"use client";

import { FlipBook } from "@/components/FlipBook";

const MINDUP = {
  title: "MindUp",
  author: "Parralex Studio",
  coverImage: "/images/books/Book-MINDUP/mindup-front.webp",
  backCoverImage: "/images/books/Book-MINDUP/mindup-back.webp",
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
  buyLink: "https://www.amazon.com/stores/author/B0B5R12SHN",
};

const AI_FOUNDRY = {
  title: "AI Foundry",
  author: "Parralex Studio",
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
  buyLink: "https://www.amazon.com/stores/author/B0B5R12SHN",
};

export function HomeFlipBooks() {
  return (
    <section className="bg-[#090909] py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-16 text-center">
          <p className="inline-block text-xs font-semibold tracking-wide text-[#FACC15] bg-[#FACC15]/10 rounded-full px-4 py-1.5">
            Preview
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            Flip through the pages.
          </h2>
          <p className="mt-3 text-sm text-neutral-400">
            Drag, swipe, or use arrow keys to preview each book.
          </p>
        </div>

        <div className="space-y-24">
          <FlipBook {...MINDUP} />
          <FlipBook {...AI_FOUNDRY} />
        </div>
      </div>
    </section>
  );
}
