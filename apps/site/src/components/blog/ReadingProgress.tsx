"use client";

import { useEffect, useRef, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const measure = () => {
      const contentEl = document.getElementById("post-content");
      if (contentEl) {
        const rect = contentEl.getBoundingClientRect();
        const startY = rect.top + window.scrollY - 120;
        const totalH = contentEl.offsetHeight;
        const scrollOffset = window.scrollY - startY;
        const denominator = totalH - window.innerHeight * 0.35;
        const pct = denominator > 0 ? scrollOffset / denominator : 0;
        setProgress(Math.min(1, Math.max(0, pct)));
      } else {
        const doc = document.documentElement;
        const maxScroll = doc.scrollHeight - window.innerHeight;
        const pct = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        setProgress(Math.min(1, Math.max(0, pct)));
      }
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        measure();
      });
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Use direct DOM update to avoid React render overhead on every frame
  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.transform = `scaleX(${progress})`;
    }
  }, [progress]);

  return (
    <div
      className="fixed top-16 left-0 right-0 z-40 h-1 pointer-events-none"
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-brand via-brand-light to-accent will-change-[transform] shadow-[0_1px_4px_rgba(13,33,161,0.2)]"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
