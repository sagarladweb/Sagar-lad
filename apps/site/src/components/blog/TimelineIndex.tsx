"use client";

import { useState, useEffect, useRef } from "react";
import { List, X } from "lucide-react";

type Heading = { id: string; title: string; level: number };

export function TimelineIndex({ contentSelector }: { contentSelector: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const headingsRef = useRef<Heading[]>([]);

  useEffect(() => {
    const root = document.querySelector(contentSelector);
    if (!root) return;

    const els = root.querySelectorAll<HTMLElement>("h2, h3");
    const result: Heading[] = [];
    const seen = new Set<string>();

    els.forEach((el) => {
      let id = el.getAttribute("id");
      if (!id) {
        id = el.textContent
          ?.toLowerCase()
          .trim()
          .replace(/<[^>]+>/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/[\s_]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "") || `section-${result.length}`;
      }
      let uniqueId = id;
      let n = 1;
      while (seen.has(uniqueId)) {
        uniqueId = `${id}-${n++}`;
      }
      seen.add(uniqueId);
      el.id = uniqueId;
      result.push({
        id: uniqueId,
        title: el.textContent?.trim() ?? "",
        level: el.tagName === "H2" ? 2 : 3,
      });
    });

    setHeadings(result);
    headingsRef.current = result;
  }, [contentSelector]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = headingsRef.current.findIndex(
              (h) => h.id === entry.target.id
            );
            if (idx !== -1) setActiveIdx(idx);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    const timer = setTimeout(() => {
      document.querySelectorAll<HTMLElement>("h2[id], h3[id]").forEach((el) => {
        observer.observe(el);
      });
    }, 200);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [contentSelector]);

  useEffect(() => {
    if (!mobileOpen) return;
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [mobileOpen]);

  if (!headings.length) return null;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 84;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      {/* ═══════ DESKTOP: sticky sidebar TOC (lg+) ═══════ */}
      <nav
        className="hidden lg:block sticky top-24 self-start w-60 shrink-0 max-h-[calc(100vh-7.5rem)] flex flex-col"
        aria-label="Table of contents"
      >
        <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-border/70">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            On this page
          </p>
          <span className="text-[10px] font-medium font-mono text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded-full">
            {headings.length}
          </span>
        </div>

        <div className="relative overflow-y-auto pr-1 flex-1 max-h-[calc(100vh-11rem)]">
          {/* Left progress track */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border/80" />
          <div
            className="absolute left-0 top-0 w-0.5 bg-brand transition-all duration-300 ease-out"
            style={{
              height:
                activeIdx >= 0
                  ? `${((activeIdx + 1) / headings.length) * 100}%`
                  : "0%",
            }}
          />

          <ul className="space-y-1">
            {headings.map((h, i) => {
              const isActive = i === activeIdx;
              const isPast = i < activeIdx;

              return (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(h.id)}
                    className={`group w-full text-left text-[13px] leading-snug transition-all duration-200 rounded-r-lg ${
                      h.level === 3 ? "pl-5 text-[12.5px]" : "pl-3.5"
                    } pr-2 py-1.5 ${
                      isActive
                        ? "text-brand font-semibold bg-brand/5 border-l-2 border-brand -ml-px"
                        : isPast
                        ? "text-muted-foreground hover:text-foreground border-l-2 border-transparent -ml-px"
                        : "text-muted-foreground/70 hover:text-foreground border-l-2 border-transparent -ml-px"
                    }`}
                  >
                    <span className="line-clamp-2 group-hover:translate-x-0.5 transition-transform duration-150">
                      {h.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* ═══════ TABLET/MOBILE: Compact floating pill (Zero collision with ScrollTopButton) ═══════ */}
      <div
        className="fixed bottom-5 left-4 z-40 lg:hidden max-w-[calc(100vw-5.5rem)]"
        ref={panelRef}
      >
        {/* Expanded sheet */}
        {mobileOpen && (
          <div className="mb-3 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-border bg-card/98 backdrop-blur-2xl shadow-2xl overflow-hidden max-h-[55vh] flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0 bg-muted/40">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-brand" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Table of Contents
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close table of contents"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="py-2 overflow-y-auto flex-1 divide-y divide-border/30">
              {headings.map((h, i) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(h.id)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors ${
                      i === activeIdx
                        ? "text-brand font-semibold bg-brand/5"
                        : "text-muted-foreground active:bg-muted/50 hover:text-foreground"
                    } ${h.level === 3 ? "pl-7 text-[13px]" : ""}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                        i === activeIdx
                          ? "bg-brand"
                          : i < activeIdx
                          ? "bg-brand/40"
                          : "bg-border"
                      }`}
                    />
                    <span className="line-clamp-2">{h.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pill trigger — positioned neatly on left side, free of right scroll button */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-border bg-card/95 backdrop-blur-xl shadow-lg px-3.5 py-2 transition-all active:scale-[0.97] hover:border-brand/40 text-foreground"
          aria-expanded={mobileOpen}
          aria-label="Table of contents"
        >
          <List className="w-3.5 h-3.5 text-brand shrink-0" />
          <span className="text-xs font-medium truncate max-w-[130px] sm:max-w-[180px]">
            {activeIdx >= 0 ? headings[activeIdx]?.title : "Contents"}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded-full shrink-0">
            {activeIdx >= 0 ? `${activeIdx + 1}/${headings.length}` : headings.length}
          </span>
        </button>
      </div>
    </>
  );
}
