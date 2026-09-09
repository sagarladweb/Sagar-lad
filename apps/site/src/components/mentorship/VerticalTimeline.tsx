"use client";

import { useEffect, useRef } from "react";

type Item = {
  icon: React.ElementType;
  title: string;
  description: string;
  highlight: string;
};

export function VerticalTimeline({ items }: { items: Item[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current!;
    const line = lineRef.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rows = container.querySelectorAll<HTMLElement>("[data-tl-row]");
    const dots = container.querySelectorAll<HTMLElement>("[data-tl-dot]");
    const cards = container.querySelectorAll<HTMLElement>("[data-tl-card]");

    let rafId = 0;

    function update() {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;

      // Trigger at 50% viewport (same as timeline.html)
      const triggerPoint = vh * 0.5;

      // Line fill
      let dist = triggerPoint - rect.top;
      dist = Math.max(0, Math.min(dist, rect.height));
      line.style.height = `${dist}px`;

      // Reveal cards + fill dots when line reaches them
      rows.forEach((row, i) => {
        const dot = dots[i];
        const card = cards[i];
        if (!dot || !card) return;

        const dotRect = dot.getBoundingClientRect();
        const dotCenter = dotRect.top + dotRect.height / 2;

        if (triggerPoint >= dotCenter) {
          // Active — card in, dot filled
          card.classList.remove("opacity-0", "translate-y-8");
          card.classList.add("opacity-100", "translate-y-0");
          dot.classList.remove("bg-background", "border-border", "scale-100");
          dot.classList.add("bg-brand", "border-brand", "scale-125");
        } else {
          // Inactive — card out, dot hollow
          card.classList.add("opacity-0", "translate-y-8");
          card.classList.remove("opacity-100", "translate-y-0");
          dot.classList.add("bg-background", "border-border", "scale-100");
          dot.classList.remove("bg-brand", "border-brand", "scale-125");
        }
      });
    }

    function onScroll() {
      rafId = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update(); // initial check

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto py-10">
      {/* ── Base track (light grey, 2px) ── */}
      <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-[2px] bg-border/60 -translate-x-1/2 rounded-full z-0" />

      {/* ── Progress fill (blue, 4px) ── */}
      <div
        ref={lineRef}
        className="absolute left-[30px] md:left-1/2 top-0 w-[4px] bg-brand -translate-x-1/2 rounded-full z-10 shadow-sm"
        style={{ height: 0 }}
      />

      {/* ── Items ── */}
      {items.map((item, i) => {
        const Icon = item.icon;
        const isLeft = i % 2 === 0;

        return (
          <div
            key={item.title}
            data-tl-row
            className="relative flex flex-col md:flex-row justify-between items-center w-full mb-16 md:mb-24 group"
          >
            {/* ── Dot ── */}
            <div
              data-tl-dot
              className="absolute left-[30px] md:left-1/2 w-3 h-3 bg-background border-[2px] border-border rounded-full -translate-x-1/2 scale-100 transition-all duration-500 ease-out z-20"
            />

            {/* ── Left slot ── */}
            <div
              className={`w-full md:w-[46%] ${
                isLeft
                  ? "pl-16 md:pl-0"
                  : "hidden md:block"
              }`}
            >
              {isLeft && (
                <div
                  data-tl-card
                  className="opacity-0 translate-y-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] p-6 md:p-8 rounded-2xl bg-card/80 backdrop-blur border border-border/60 text-left md:text-right cursor-default shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(13,33,161,0.1)]"
                >
                  <div className="inline-flex items-center justify-center md:ml-auto w-10 h-10 rounded-xl bg-brand/8 border border-brand/10 mb-3 transition-all duration-400 group-hover:bg-brand group-hover:border-brand group-hover:shadow-[0_4px_20px_rgba(13,33,161,0.2)]">
                    <Icon className="w-5 h-5 text-brand transition-all duration-400 group-hover:text-white group-hover:scale-110" />
                  </div>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              )}
            </div>

            {/* ── Right slot ── */}
            <div
              className={`w-full md:w-[46%] ${
                !isLeft
                  ? "pl-16 md:pl-0"
                  : "hidden md:block"
              }`}
            >
              {!isLeft && (
                <div
                  data-tl-card
                  className="opacity-0 translate-y-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] p-6 md:p-8 rounded-2xl bg-card/80 backdrop-blur border border-border/60 text-left cursor-default shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(13,33,161,0.1)]"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand/8 border border-brand/10 mb-3 transition-all duration-400 group-hover:bg-brand group-hover:border-brand group-hover:shadow-[0_4px_20px_rgba(13,33,161,0.2)]">
                    <Icon className="w-5 h-5 text-brand transition-all duration-400 group-hover:text-white group-hover:scale-110" />
                  </div>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
