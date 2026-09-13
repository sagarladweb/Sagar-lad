"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center" style={{ width: 480, height: 640 }}>
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
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Keyboard — always active when component mounts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (!instance) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        instance.flipNext?.();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        instance.flipPrev?.();
      }
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

  const w = isMobile ? 280 : 480;
  const h = isMobile ? 380 : 640;

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center gap-3">
      {/* Book with side arrows on desktop */}
      <div className="flex items-center gap-3">
        {/* Left arrow */}
        {!isMobile && (
          <button
            type="button"
            onClick={() => instance?.flipPrev?.()}
            disabled={currentPage <= 0}
            aria-label="Previous page"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/5 text-white disabled:opacity-20 hover:bg-white/10 transition-colors shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Book */}
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

        {/* Right arrow */}
        {!isMobile && (
          <button
            type="button"
            onClick={() => instance?.flipNext?.()}
            disabled={currentPage >= totalPages - 1}
            aria-label="Next page"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/5 text-white disabled:opacity-20 hover:bg-white/10 transition-colors shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Bottom controls */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Mobile arrows */}
        {isMobile && (
          <>
            <button
              type="button"
              onClick={() => instance?.flipPrev?.()}
              disabled={currentPage <= 0}
              aria-label="Previous page"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/5 text-white disabled:opacity-20"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
        <span className="text-xs font-mono text-neutral-400 tabular-nums select-none">
          {currentPage + 1} / {totalPages}
        </span>
        {isMobile && (
          <button
            type="button"
            onClick={() => instance?.flipNext?.()}
            disabled={currentPage >= totalPages - 1}
            aria-label="Next page"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/5 text-white disabled:opacity-20"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
