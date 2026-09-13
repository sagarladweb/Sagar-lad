"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center" style={{ width: 520, height: 680 }}>
      <div className="w-8 h-8 border-2 border-[#FACC15] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

type FlipBookProps = {
  title: string;
  author: string;
  coverImage: string;
  pages: string[];
  backCoverImage?: string;
  buyLink?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BookInstance = any;

export function FlipBook({ title, coverImage, pages, backCoverImage }: FlipBookProps) {
  const [instance, setInstance] = useState<BookInstance | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const allPages = [
    coverImage,
    ...pages,
    ...(backCoverImage ? [backCoverImage] : []),
  ];

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!instance) return;
      if (e.key === "ArrowRight") instance.flipNext?.();
      if (e.key === "ArrowLeft") instance.flipPrev?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [instance]);

  const onFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
  }, []);

  const onInit = useCallback((inst: BookInstance) => {
    setInstance(inst);
    setTotalPages(inst.getPageCount?.() ?? 0);
  }, []);

  // Responsive: smaller on mobile, larger on desktop
  const w = isMobile ? 280 : 480;
  const h = isMobile ? 400 : 640;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        style={{ width: w, height: h, perspective: "2000px" }}
        className="shrink-0"
      >
        <HTMLFlipBook
          width={w}
          height={h}
          size="fixed"
          startPage={0}
          minWidth={0}
          maxWidth={0}
          minHeight={0}
          maxHeight={0}
          maxShadowOpacity={0.3}
          showCover={true}
          mobileScrollSupport={true}
          flippingTime={400}
          useMouseEvents={true}
          drawShadow={true}
          showPageCorners={true}
          disableFlipByClick={false}
          usePortrait={isMobile}
          autoSize={false}
          clickEventForward={true}
          startZIndex={0}
          swipeDistance={30}
          renderOnlyPageLengthChange={false}
          onFlip={onFlip}
          onInit={onInit}
          className="mx-auto"
          style={{ background: "transparent" }}
        >
          {allPages.map((src, i) => (
            <div key={src} className="bg-white overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${title} page ${i + 1}`}
                loading={i < 3 ? "eager" : "lazy"}
                className="w-full h-full object-contain"
                draggable={false}
              />
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 shrink-0">
        <button
          type="button"
          onClick={() => instance?.flipPrev?.()}
          disabled={currentPage <= 0}
          className="text-xs text-neutral-500 hover:text-white disabled:opacity-30 transition-colors"
        >
          ← Prev
        </button>
        <span className="text-xs font-mono text-neutral-400 tabular-nums">
          {currentPage + 1} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => instance?.flipNext?.()}
          disabled={currentPage >= totalPages - 1}
          className="text-xs text-neutral-500 hover:text-white disabled:opacity-30 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
