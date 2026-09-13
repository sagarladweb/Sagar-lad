"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-[#090909]" style={{ width: 520, height: 680 }}>
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

export function FlipBook({
  title,
  author,
  coverImage,
  pages,
  backCoverImage,
  buyLink,
}: FlipBookProps) {
  const [instance, setInstance] = useState<BookInstance | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const lastTap = useRef(0);

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
      if (isZoomed && e.key === "Escape") {
        setIsZoomed(false);
        return;
      }
      if (!instance) return;
      if (e.key === "ArrowRight") instance.flipNext?.();
      if (e.key === "ArrowLeft") instance.flipPrev?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [instance, isZoomed]);

  const onFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
  }, []);

  const onInit = useCallback((inst: BookInstance) => {
    setInstance(inst);
    setTotalPages(inst.getPageCount?.() ?? 0);
  }, []);

  const handleDoubleTap = useCallback(() => {
    setIsZoomed((z) => !z);
  }, []);

  const onTouchEnd = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) handleDoubleTap();
    lastTap.current = now;
  }, [handleDoubleTap]);

  const w = isMobile ? 300 : 520;
  const h = isMobile ? 420 : 680;

  return (
    <div className="bg-[#090909] py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full"
      >
        <div className="relative mx-auto px-4" style={{ maxWidth: w + 40 }}>
          {/* Header */}
          <div className="text-center mb-6">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#FACC15] mb-1.5">
              Preview Edition
            </p>
            <h3 className="font-display text-xl font-bold text-white">{title}</h3>
            <p className="text-sm text-neutral-400 mt-0.5">{author}</p>
          </div>

          {/* Book */}
          <div
            className="mx-auto"
            style={{ width: w, height: h, perspective: "2000px" }}
            onTouchEnd={onTouchEnd}
            onDoubleClick={() => setIsZoomed((z) => !z)}
          >
            <div
              className={`transition-transform duration-300 origin-center ${
                isZoomed ? "scale-[1.6] z-50" : "scale-100"
              }`}
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
                maxShadowOpacity={0.25}
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
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-5">
            <button
              type="button"
              onClick={() => instance?.flipPrev?.()}
              disabled={currentPage <= 0}
              className="text-xs text-neutral-500 hover:text-white disabled:opacity-30 transition-colors"
            >
              ← Prev
            </button>
            <span className="text-xs font-mono text-neutral-400 tabular-nums">
              Page {currentPage + 1} of {totalPages}
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

          {buyLink && (
            <div className="text-center mt-4">
              <a
                href={buyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FACC15] hover:underline"
              >
                Get the full book →
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
