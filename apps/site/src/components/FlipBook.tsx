"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, BookOpen } from "lucide-react";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

type PageFlipInstance = {
  flipNext: () => void;
  flipPrev: () => void;
  flip: (page: number) => void;
  getPageCount: () => number;
  getCurrentPageIndex: () => number;
  destroy: () => void;
};

type FlipBookProps = {
  title: string;
  author: string;
  pages: string[];
  coverImage: string;
  backCoverImage?: string;
  buyLink?: string;
};

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

export function FlipBook({ title, author, pages, coverImage, backCoverImage, buyLink }: FlipBookProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlipInstance | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [ready, setReady] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [visible, setVisible] = useState(false);
  const isMobile = useIsMobile();

  const allPages = [coverImage, ...pages, ...(backCoverImage ? [backCoverImage] : [])];

  const onFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
  }, []);

  const onInit = useCallback((instance: PageFlipInstance) => {
    flipRef.current = instance;
    setTotalPages(instance.getPageCount());
    setReady(true);
  }, []);

  // Intersection observer for fade-in
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight") flipRef.current?.flipNext();
      else if (e.key === "ArrowLeft") flipRef.current?.flipPrev();
      else if (e.key === "Escape" && zoomed) setZoomed(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed]);

  // Double-click to zoom
  const onDoubleClick = useCallback(() => setZoomed((z) => !z), []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (flipRef.current) {
        try { flipRef.current.destroy(); } catch { /* ignore */ }
        flipRef.current = null;
      }
    };
  }, []);

  // Dimensions
  const width = isMobile ? 320 : 520;
  const height = isMobile ? 440 : 680;
  const mobilePageWidth = Math.floor(width * 0.95);
  const mobilePageHeight = Math.floor(height * 0.95);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      {/* Book title */}
      <div className="mb-6 text-center">
        <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">by {author}</p>
      </div>

      {/* Book container */}
      <div
        className="relative"
        onDoubleClick={onDoubleClick}
        style={{
          transform: zoomed ? "scale(1.4)" : "scale(1)",
          transformOrigin: "center center",
          transition: "transform 0.3s ease",
          cursor: zoomed ? "zoom-out" : "zoom-in",
        }}
      >
        {/* Floating shadow */}
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-[50%] bg-black/20 blur-xl"
          style={{ width: width * 0.7, height: 20 }}
        />

        {/* Book spine hint */}
        <div className="absolute -left-1 top-2 bottom-2 w-2 rounded-l bg-gradient-to-r from-neutral-700 to-neutral-600 z-10 hidden sm:block" />

        {/* FlipBook */}
        <div
          className="relative z-20"
          style={{ width, height, perspective: "2000px" }}
        >
          {typeof window !== "undefined" && (
            <HTMLFlipBook
              width={isMobile ? mobilePageWidth : width / 2}
              height={height}
              size="fixed"
              minWidth={280}
              maxWidth={600}
              minHeight={380}
              maxHeight={800}
              drawShadow
              flippingTime={600}
              usePortrait={isMobile}
              startZIndex={0}
              autoSize
              maxShadowOpacity={0.5}
              showCover
              mobileScrollSupport
              clickEventForward={false}
              useMouseEvents
              swipeDistance={30}
              showPageCorners={!isMobile}
              disableFlipByClick={false}
              className=""
              style={{}}
              startPage={0}
              onFlip={onFlip}
              onInit={onInit}
            >
              {allPages.map((src, i) => (
                <div key={i} className="bg-white overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${title} page ${i + 1}`}
                    loading={i < 3 ? "eager" : "lazy"}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              ))}
            </HTMLFlipBook>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex flex-col items-center gap-3">
        {/* Page counter */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BookOpen className="w-3.5 h-3.5" />
          <span className="font-mono tabular-nums">
            Page {Math.min(currentPage + 1, totalPages)} of {totalPages}
          </span>
          <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
            Preview Edition
          </span>
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => flipRef.current?.flipPrev()}
            disabled={currentPage <= 0}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-1">
            {allPages.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentPage ? "w-4 bg-brand" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => flipRef.current?.flipNext()}
            disabled={currentPage >= totalPages - 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom + Buy */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
          >
            {zoomed ? <ZoomOut className="w-3 h-3" /> : <ZoomIn className="w-3 h-3" />}
            {zoomed ? "Zoom Out" : "Zoom In"}
          </button>

          {buyLink && (
            <a
              href={buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              Buy on Amazon
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
