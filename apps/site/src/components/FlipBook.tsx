"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  forwardRef,
} from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="h-9 w-9 rounded-full border-2 border-[#FACC15] border-t-transparent animate-spin" />
      <p className="text-xs font-medium tracking-wider text-neutral-400 uppercase">
        Loading Book Preview…
      </p>
    </div>
  ),
});

export type FlipBookProps = {
  title: string;
  author?: string;
  coverImage: string;
  pages: string[];
  backCoverImage?: string;
  buyLink?: string;
};

/* --- Page Component with Realistic Physical Paper & Spine Depth --- */
type PageProps = {
  src: string;
  pageIndex: number;
  totalPages: number;
  title: string;
  isCover: boolean;
  isBack: boolean;
  isSinglePage: boolean;
};

const BookPage = forwardRef<HTMLDivElement, PageProps>(
  (
    { src, pageIndex, title, isCover, isBack, isSinglePage },
    ref
  ) => {
    // In dual page spread, odd pages are on the left, even pages on the right
    const isLeftPage = !isSinglePage && pageIndex % 2 === 1;
    const isRightPage = !isSinglePage && pageIndex % 2 === 0;

    return (
      <div
        ref={ref}
        data-density={isCover || isBack ? "hard" : "soft"}
        className="page relative h-full w-full select-none overflow-hidden bg-[#fdfdfc]"
        style={{
          boxShadow: isSinglePage
            ? "0 16px 36px -12px rgba(0, 0, 0, 0.45)"
            : isLeftPage
            ? "inset -10px 0 18px -6px rgba(0,0,0,0.18), -8px 0 16px -8px rgba(0,0,0,0.3)"
            : "inset 10px 0 18px -6px rgba(0,0,0,0.18), 8px 0 16px -8px rgba(0,0,0,0.3)",
        }}
      >
        {/* Page Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${title} page ${pageIndex + 1}`}
          loading={pageIndex < 4 ? "eager" : "lazy"}
          className="h-full w-full object-contain pointer-events-none"
          draggable={false}
        />

        {/* Center Spine Gutter Shadows (Realistic Book Crease) */}
        {isLeftPage && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/25 via-black/8 to-transparent"
          />
        )}
        {isRightPage && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/25 via-black/8 to-transparent"
          />
        )}

        {/* Subtle Paper Texture Vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/[0.02] via-transparent to-black/[0.04]"
        />

        {/* Hardcover Sheen on Front and Back Covers */}
        {(isCover || isBack) && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20"
          />
        )}

        {/* Hardcover Spine Hinge Line */}
        {isCover && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-4 w-[2px] bg-black/25 shadow-sm"
          />
        )}
        {isBack && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-4 w-[2px] bg-black/25 shadow-sm"
          />
        )}

        {/* Internal Page Number Mark */}
        {!isCover && !isBack && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-2.5 ${
              isLeftPage ? "left-4" : "right-4"
            } text-[10px] font-mono tracking-widest text-black/40`}
          >
            {pageIndex}
          </div>
        )}
      </div>
    );
  }
);
BookPage.displayName = "BookPage";

export function FlipBook({
  title,
  coverImage,
  pages,
  backCoverImage,
}: FlipBookProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageFlipRef = useRef<any>(null);

  const [currentPage, setCurrentPage] = useState(0);

  // Dynamic adaptive dimensions state
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
    isSinglePage: boolean;
  }>({
    width: 320,
    height: 452,
    isSinglePage: true,
  });

  const allPages = [
    coverImage,
    ...pages,
    ...(backCoverImage ? [backCoverImage] : []),
  ];
  const totalPages = allPages.length;

  // Responsive sizing: Mobile (<768px) is strictly single page; Desktop (>=768px) is 2-page spread
  const updateDimensions = useCallback(() => {
    if (typeof window === "undefined") return;
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    // Mobile: single page portrait. Desktop: dual page spread.
    const isMobile = winW < 768;

    // Vertical budget: minus capsule (~80px) and top margins (~40px)
    const availableH = Math.max(260, winH - 140);

    if (isMobile) {
      // Single Page (Portrait) — Aspect ratio ~1 : 1.414
      const maxW = Math.max(240, winW - 32);
      let pageW = Math.min(maxW, 400);
      let pageH = Math.round(pageW * 1.414);

      if (pageH > availableH) {
        pageH = availableH;
        pageW = Math.round(pageH / 1.414);
      }

      setDimensions({
        width: Math.max(240, pageW),
        height: Math.max(340, pageH),
        isSinglePage: true,
      });
    } else {
      // Two-Page Spread (Desktop)
      // Reserve ~160px for left and right side arrow buttons
      const maxSpreadW = Math.max(500, winW - 160);
      let singleW = Math.min(Math.floor(maxSpreadW / 2), 480);
      let singleH = Math.round(singleW * 1.414);

      if (singleH > availableH) {
        singleH = availableH;
        singleW = Math.round(singleH / 1.414);
      }

      setDimensions({
        width: Math.max(250, singleW),
        height: Math.max(360, singleH),
        isSinglePage: false,
      });
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [updateDimensions]);

  // Safe accessor to the underlying PageFlip engine
  const getPageFlip = useCallback(() => {
    if (pageFlipRef.current) return pageFlipRef.current;
    if (bookRef.current?.pageFlip) {
      const pf = bookRef.current.pageFlip();
      if (pf) {
        pageFlipRef.current = pf;
        return pf;
      }
    }
    return null;
  }, []);

  // Reliable navigation handlers
  const handlePrev = useCallback(() => {
    const pf = getPageFlip();
    if (pf) {
      try {
        pf.flipPrev("top");
      } catch {
        pf.turnToPrevPage?.();
      }
    }
  }, [getPageFlip]);

  const handleNext = useCallback(() => {
    const pf = getPageFlip();
    if (pf) {
      try {
        pf.flipNext("top");
      } catch {
        pf.turnToNextPage?.();
      }
    }
  }, [getPageFlip]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlePrev, handleNext]);

  // Event handlers from react-pageflip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onInit = useCallback((e: any) => {
    const pf = e?.object || (bookRef.current?.pageFlip ? bookRef.current.pageFlip() : null);
    if (pf) {
      pageFlipRef.current = pf;
    }
    if (typeof e?.data?.page === "number") {
      setCurrentPage(e.data.page);
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFlip = useCallback((e: any) => {
    const pf = e?.object || (bookRef.current?.pageFlip ? bookRef.current.pageFlip() : null);
    if (pf) {
      pageFlipRef.current = pf;
    }
    if (typeof e?.data === "number") {
      setCurrentPage(e.data);
    }
  }, []);

  const { width: w, height: h, isSinglePage } = dimensions;
  const spreadWidth = isSinglePage ? w : w * 2;
  const readPct = totalPages > 0 ? Math.round(((currentPage + 1) / totalPages) * 100) : 0;
  const isOnLastPage = currentPage >= totalPages - 1;

  return (
    <div className="relative flex flex-col items-center justify-center gap-3 sm:gap-5 w-full max-w-full">
      {/* Book Stage with Left & Right Navigation Arrows */}
      <div className="relative flex items-center justify-center gap-3 sm:gap-6 max-w-full">
        {/* Left Desktop Side Arrow */}
        {!isSinglePage && (
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPage <= 0}
            aria-label="Previous page"
            title="Previous page (←)"
            className="group grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition-all hover:scale-105 hover:border-[#FACC15]/40 hover:bg-black/80 hover:text-[#FACC15] disabled:pointer-events-none disabled:opacity-20 shrink-0 shadow-2xl cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7 transition-transform group-hover:-translate-x-0.5" />
          </button>
        )}

        {/* Book Canvas Container */}
        <div
          style={{
            width: spreadWidth,
            height: h,
            perspective: "2400px",
          }}
          className="relative transition-[width,height] duration-300 ease-out shrink-0"
        >
          {/* Ambient Ground Shadow under the book */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 h-8 w-[92%] rounded-full bg-black/60 blur-xl"
          />

          <HTMLFlipBook
            ref={bookRef}
            key={`${w}-${h}-${isSinglePage}`}
            width={w}
            height={h}
            size="fixed"
            startPage={currentPage}
            minWidth={w}
            maxWidth={w}
            minHeight={h}
            maxHeight={h}
            maxShadowOpacity={0.45}
            showCover={true}
            mobileScrollSupport={true}
            flippingTime={600}
            useMouseEvents={true}
            drawShadow={true}
            showPageCorners={true}
            disableFlipByClick={false}
            usePortrait={isSinglePage}
            autoSize={false}
            clickEventForward={true}
            startZIndex={0}
            swipeDistance={25}
            renderOnlyPageLengthChange={false}
            onFlip={onFlip}
            onInit={onInit}
            className="mx-auto select-none"
            style={{ background: "transparent" }}
          >
            {allPages.map((src, i) => (
              <BookPage
                key={`page-${i}-${src}`}
                src={src}
                pageIndex={i}
                totalPages={allPages.length}
                title={title}
                isCover={i === 0}
                isBack={i === allPages.length - 1}
                isSinglePage={isSinglePage}
              />
            ))}
          </HTMLFlipBook>
        </div>

        {/* Right Desktop Side Arrow */}
        {!isSinglePage && (
          <button
            type="button"
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
            aria-label="Next page"
            title="Next page (→)"
            className="group grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition-all hover:scale-105 hover:border-[#FACC15]/40 hover:bg-black/80 hover:text-[#FACC15] disabled:pointer-events-none disabled:opacity-20 shrink-0 shadow-2xl cursor-pointer"
          >
            <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Bottom Floating Capsule: Previous Arrow, Page Counter, Percentage, Next Arrow */}
      <div className="relative z-20 flex items-center justify-center w-full px-4 pt-1">
        <div className="inline-flex items-center gap-2.5 sm:gap-4 rounded-full bg-neutral-900/90 border border-white/15 px-3.5 sm:px-5 py-2 backdrop-blur-xl shadow-2xl text-white">
          {/* Previous Page Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPage <= 0}
            aria-label="Previous page"
            title="Previous page"
            className="grid h-8 w-8 place-items-center rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Page Counter: Page X / Y */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono font-medium select-none px-1">
            <span className="text-white tabular-nums">
              Page {currentPage + 1}
            </span>
            <span className="text-white/40">/</span>
            <span className="text-neutral-400 tabular-nums">
              {totalPages}
            </span>
          </div>

          {/* Read Percentage */}
          <div className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] sm:text-xs font-mono font-bold text-[#FACC15] select-none tabular-nums tracking-wide">
            {readPct}%
          </div>

          {/* Next Page Arrow */}
          <button
            type="button"
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
            aria-label="Next page"
            title="Next page"
            className="grid h-8 w-8 place-items-center rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Back cover close overlay — fades in when on last page */}
      <div
        className={`absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-700 pointer-events-none ${
          isOnLastPage ? "opacity-100" : "opacity-0"
        }`}
        style={{ pointerEvents: isOnLastPage ? "auto" : "none" }}
      >
        <p className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
          The End
        </p>
        <p className="text-sm text-white/60 mb-8">
          Thanks for previewing this book
        </p>
      </div>
    </div>
  );
}
