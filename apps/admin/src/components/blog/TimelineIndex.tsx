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
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop: sticky sidebar TOC */}
      <nav
        className="hidden lg:block sticky top-28 self-start w-56 shrink-0"
        aria-label="Table of contents"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">
          On this page
        </p>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
          <div
            className="absolute left-0 top-0 w-px bg-brand transition-all duration-300"
            style={{
              height:
                activeIdx >= 0
                  ? `${((activeIdx + 1) / headings.length) * 100}%`
                  : "0%",
            }}
          />
          <ul className="space-y-0.5">
            {headings.map((h, i) => {
              const isActive = i === activeIdx;
              const isPast = i < activeIdx;
              return (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(h.id)}
                    className={`w-full text-left text-[13px] leading-snug transition-all duration-200 rounded-r-md ${
                      h.level === 3 ? "pl-6" : "pl-4"
                    } pr-2 py-[7px] ${
                      isActive
                        ? "text-brand font-semibold bg-brand/5 border-l-2 border-brand -ml-px"
                        : isPast
                        ? "text-muted-foreground hover:text-foreground border-l-2 border-transparent -ml-px"
                        : "text-muted-foreground/60 hover:text-foreground border-l-2 border-transparent -ml-px"
                    }`}
                  >
                    <span className="line-clamp-2">{h.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile/tablet: floating pill */}
      <div className="fixed bottom-5 left-4 right-4 z-50 lg:hidden" ref={panelRef}>
        {mobileOpen && (
          <div className="mb-2 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden max-h-[55vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between shrink-0">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                On this page
              </p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="py-2 overflow-y-auto flex-1">
              {headings.map((h, i) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(h.id)}
                    className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm text-left transition-colors ${
                      i === activeIdx
                        ? "text-brand font-semibold bg-brand/5"
                        : "text-muted-foreground active:bg-muted/50"
                    } ${h.level === 3 ? "pl-9" : ""}`}
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
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl px-4 py-3 transition-all active:scale-[0.98]"
        >
          <List className="w-4 h-4 text-brand shrink-0" />
          <span className="flex-1 min-w-0 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block leading-none mb-0.5">
              Sections
            </span>
            <span className="text-sm font-medium text-foreground truncate block">
              {activeIdx >= 0 ? headings[activeIdx]?.title : headings[0]?.title}
            </span>
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {headings.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === activeIdx
                    ? "bg-brand"
                    : i < activeIdx
                    ? "bg-brand/40"
                    : "bg-border"
                }`}
              />
            ))}
          </div>
        </button>
      </div>
    </>
  );
}
