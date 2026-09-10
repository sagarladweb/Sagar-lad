"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";

const STEPS = [
  {
    n: "01",
    title: "Reach out & align",
    text: "Share your event's theme, audience, and goals — I'll map the right talk, format, and length.",
    bullets: ["Kick-off call", "Theme & goals scoped"],
  },
  {
    n: "02",
    title: "We co-create",
    text: "A planning call shapes the narrative, then I deliver polished decks, bio, and media assets on day one.",
    bullets: ["Planning call", "Decks, bio & media ready"],
  },
  {
    n: "03",
    title: "Deliver & follow up",
    text: "An energetic session with live Q&A, plus a one-page takeaway sheet attendees can keep.",
    bullets: ["Live session + Q&A", "Takeaway sheet"],
  },
];

export function SpeakingExperience() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const updateActive = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.offsetWidth;
    const idx = Math.round(scrollLeft / cardWidth);
    setActive(Math.min(idx, STEPS.length - 1));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateActive, { passive: true });
    return () => el.removeEventListener("scroll", updateActive);
  }, [updateActive]);

  const scrollTo = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.offsetWidth, behavior: "smooth" });
  };

  return (
    <>
      {/* ── Mobile & Tablet: Step Carousel ─────────────────────── */}
      <div className="lg:hidden">
        {/* Step progress bar */}
        <div className="flex items-center justify-center gap-0 mb-6">
          {STEPS.map((step, i) => (
            <div key={step.n} className="flex items-center">
              <button
                onClick={() => scrollTo(i)}
                className={`flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer
                  ${i === active
                    ? "bg-accent text-accent-foreground scale-110 shadow-md"
                    : i < active
                      ? "bg-accent/20 text-accent-strong"
                      : "bg-muted text-muted-foreground"
                  }`}
              >
                {step.n}
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-8 sm:w-12 h-[2px] mx-1 rounded-full transition-colors duration-300 ${
                  i < active ? "bg-accent" : "bg-border"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Horizontal snap scroll */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 px-1 pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className="snap-center shrink-0 w-full"
            >
              <div className="relative bg-card border border-border rounded-2xl p-6 sm:p-7 h-full">
                {/* Step number + connector */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-grid place-items-center w-11 h-11 rounded-xl bg-accent/15 font-display text-base font-extrabold text-accent-strong">
                    {step.n}
                  </span>
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                  )}
                  <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                    {step.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {step.text}
                </p>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {step.bullets.map((b) => (
                    <li
                      key={b}
                      className="inline-flex items-center gap-1.5 text-[11px] text-foreground bg-foreground/5 px-2.5 py-1 rounded-full"
                    >
                      <CheckCircle2 className="w-3 h-3 text-accent" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer
                ${i === active
                  ? "w-5 h-1.5 bg-accent"
                  : "w-1.5 h-1.5 bg-border hover:bg-muted-foreground/40"
                }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── Desktop: existing card layout ────────────────────────── */}
      <div className="hidden lg:grid grid-cols-12 gap-6">
        {STEPS.map((step, i) => (
          <div
            key={step.n}
            className={`card-hover group rounded-lg border border-border bg-card p-7 sm:p-8 ${
              i === 0 ? "col-span-7" : "col-span-5"
            }`}
          >
            <span className="inline-grid place-items-center w-12 h-12 rounded-md bg-accent/15 font-display text-lg font-extrabold text-accent-strong">
              {step.n}
            </span>
            <h3 className="mt-4 font-display text-xl font-bold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.text}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {step.bullets.map((b) => (
                <li
                  key={b}
                  className="btn-premium inline-flex items-center gap-1.5 text-xs text-foreground bg-foreground/5 px-3 py-1.5 rounded-full"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
