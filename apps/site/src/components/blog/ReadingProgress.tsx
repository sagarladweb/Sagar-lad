"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

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
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        measure();
      });
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

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
        className="h-full bg-gradient-to-r from-brand via-brand-light to-accent transition-[width] duration-100 ease-out shadow-[0_1px_4px_rgba(13,33,161,0.2)]"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}