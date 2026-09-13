"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import {
  GraduationCap,
  Briefcase,
  Mic,
  PenTool,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Node = {
  year: string;
  title: string;
  word: string;
  description: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  image?: string;
  href?: string;
  hrefLabel?: string;
};

const nodes: Node[] = [
  {
    year: "2009",
    title: "School",
    word: "Dream Begins",
    description:
      "D.E Italia High School. A small town, a second-hand computer, and a kid who believed technology could change the world.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about.webp",
  },
  {
    year: "2009 – 2013",
    title: "Engineering",
    word: "Hustle",
    description:
      "BVM College of Engineering — Computer Science. Four years in the lab, not the classroom. Building things that broke, fixing them, and building again.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about-2.webp",
  },
  {
    year: "2013",
    title: "First Step",
    word: "Professional",
    description:
      "First Professional Step — TCS. From Gujarat to the world. First job, first flight, first taste of what was possible.",
    tag: "Career",
    icon: Briefcase,
    image: "/images/profile/about-4.webp",
  },
  {
    year: "2019 – 2020",
    title: "Data Science",
    word: "Reinvent",
    description:
      "Reinvent — IIIT Bangalore, Data Science. When the world stopped, I started learning. IIIT Bangalore opened a door I never knew existed.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/profile/about-5.webp",
  },
  {
    year: "2022 – 2026",
    title: "Six Books",
    word: "Giving Back",
    description:
      "Every book written at 2am, fueled by coffee and the hope that someone, somewhere, would find it useful.",
    tag: "Author",
    icon: PenTool,
    image: "/images/books/mindup-front.jpg",
    href: "/books",
    hrefLabel: "View all books",
  },
  {
    year: "2025 – 2026",
    title: "Gen AI",
    word: "Stay Curious",
    description:
      "Stay Curious — Purdue University, Masters in Gen AI. Back to being a student. Because the best leaders never stop learning.",
    tag: "Education",
    icon: GraduationCap,
    image: "/images/speaking/candid-presentation.webp",
  },
  {
    year: "2026",
    title: "TEDx Speaker",
    word: "Full Circle",
    description:
      "The kid who watched TED talks now stands on the stage. Proof that dreams deferred are not dreams denied.",
    tag: "Speaker",
    icon: Mic,
    image: "/images/heroes/tedx.webp",
  },
];

export function Timeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackScrollRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [lineCoords, setLineCoords] = useState<{
    startX: number;
    totalW: number;
    activeW: number;
    topY: number;
  }>({
    startX: 0,
    totalW: 0,
    activeW: 0,
    topY: 44,
  });

  // Calculate pixel-perfect alignment of the background line and active progressive line
  const updateLinePositions = useCallback(() => {
    const dots = dotRefs.current;
    const firstBtn = dots[0];
    const lastBtn = dots[nodes.length - 1];
    const currentBtn = dots[activeIdx];
    if (!firstBtn || !lastBtn || !currentBtn) return;

    // Use exact geometric offsetLeft + offsetWidth/2 relative to the track parent
    const firstCenter = firstBtn.offsetLeft + firstBtn.offsetWidth / 2;
    const lastCenter = lastBtn.offsetLeft + lastBtn.offsetWidth / 2;
    const currentCenter = currentBtn.offsetLeft + currentBtn.offsetWidth / 2;

    const totalW = Math.max(0, lastCenter - firstCenter);
    const activeW = Math.max(0, currentCenter - firstCenter);

    setLineCoords({
      startX: firstCenter,
      totalW,
      activeW,
      topY: 44,
    });
  }, [activeIdx]);

  // Center selected dot in horizontal scroll container
  const centerDotInView = useCallback((index: number) => {
    const dot = dotRefs.current[index];
    const container = trackScrollRef.current;
    if (dot && container) {
      const target = dot.offsetLeft - container.offsetWidth / 2 + dot.offsetWidth / 2;
      container.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    }
  }, []);

  // ── Auto-scroll: advance every 5s only when section is in viewport ──
  const isInViewRef = useRef(false);
  const manualPauseRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoScroll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!isInViewRef.current || manualPauseRef.current) return;
      setActiveIdx((prev) => {
        const next = prev < nodes.length - 1 ? prev + 1 : 0;
        centerDotInView(next);
        return next;
      });
    }, 5000);
  }, [centerDotInView]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          manualPauseRef.current = false;
          startAutoScroll();
        } else if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoScroll]);

  // Pause auto-scroll on manual interaction, resume after 10s
  const pauseAutoScroll = useCallback(() => {
    manualPauseRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTimeout(() => {
      manualPauseRef.current = false;
      if (isInViewRef.current) startAutoScroll();
    }, 10000);
  }, [startAutoScroll]);

  const selectMilestone = useCallback(
    (index: number) => {
      pauseAutoScroll();
      setActiveIdx(index);
      centerDotInView(index);
    },
    [centerDotInView, pauseAutoScroll]
  );

  const handlePrev = useCallback(() => {
    pauseAutoScroll();
    setActiveIdx((prev) => {
      const next = prev > 0 ? prev - 1 : nodes.length - 1;
      centerDotInView(next);
      return next;
    });
  }, [centerDotInView, pauseAutoScroll]);

  const handleNext = useCallback(() => {
    pauseAutoScroll();
    setActiveIdx((prev) => {
      const next = prev < nodes.length - 1 ? prev + 1 : 0;
      centerDotInView(next);
      return next;
    });
  }, [centerDotInView, pauseAutoScroll]);

  // Update line positions on mount, active index change, and resize
  useEffect(() => {
    updateLinePositions();
    const handleResize = () => updateLinePositions();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateLinePositions]);

  // Keyboard navigation (Left / Right arrow keys)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlePrev, handleNext]);

  // GSAP Entrance Scroll Animation
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-tl-header]",
        { opacity: 0, y: 32, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 82%" },
        }
      );

      gsap.fromTo(
        "[data-tl-rail]",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          delay: 0.15,
          scrollTrigger: { trigger: el, start: "top 80%" },
        }
      );

      gsap.fromTo(
        "[data-tl-dot-node]",
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.45,
          stagger: 0.08,
          ease: "back.out(2)",
          delay: 0.25,
          scrollTrigger: { trigger: el, start: "top 80%" },
        }
      );

      gsap.fromTo(
        "[data-tl-card]",
        { opacity: 0, y: 30, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.35,
          scrollTrigger: { trigger: el, start: "top 80%" },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  const activeNode = nodes[activeIdx];
  const Icon = activeNode.icon;

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 border-b border-border bg-background overflow-hidden"
      aria-label="Journey timeline"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* ── Section Header ── */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14" data-tl-header>
          <span className="inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">
            Where it started
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
            Key moments along the way
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Click or tap any milestone to explore each chapter of the journey.
          </p>
        </div>

        {/* ── Unified Interactive Timeline Rail ── */}
        <div data-tl-rail className="relative mb-8 sm:mb-12">
          {/* Horizontally Scrollable Rail */}
          <div
            ref={trackScrollRef}
            className="overflow-x-auto no-scrollbar py-6 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="relative min-w-max flex items-center justify-between gap-8 sm:gap-12 md:gap-16 px-6">
              {/* 1. Background Dotted Track Line (crossing the points) */}
              <svg
                className="absolute pointer-events-none"
                style={{
                  left: `${lineCoords.startX}px`,
                  width: `${lineCoords.totalW}px`,
                  top: `${lineCoords.topY - 3}px`,
                  height: "6px",
                  overflow: "visible",
                }}
              >
                <line
                  x1="0"
                  y1="3"
                  x2={lineCoords.totalW}
                  y2="3"
                  stroke="currentColor"
                  className="text-border/80"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                />
                {/* 2. Yellow Progressive Dotted Animated Line */}
                <line
                  x1="0"
                  y1="3"
                  x2={lineCoords.activeW}
                  y2="3"
                  stroke="#ffd51d"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  style={{
                    transition: "x2 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    animation: "tlDottedMove 1.2s linear infinite",
                    filter: "drop-shadow(0 0 4px rgba(255, 213, 29, 0.6))",
                  }}
                />
              </svg>

              {/* Milestone Dots (Points in Blue Colour) */}
              {nodes.map((n, i) => {
                const isActive = activeIdx === i;
                const isPast = i < activeIdx;

                return (
                  <button
                    key={`timeline-node-${n.title}`}
                    ref={(el) => {
                      dotRefs.current[i] = el;
                    }}
                    type="button"
                    onClick={() => selectMilestone(i)}
                    className="relative flex flex-col items-center group cursor-pointer focus:outline-none shrink-0"
                    aria-label={`${n.title} (${n.year})`}
                  >
                    {/* Row 1: Year Label Above */}
                    <div className="h-6 flex items-center justify-center mb-1">
                      <span
                        className={`text-xs font-bold tracking-wider uppercase transition-colors duration-300 ${
                          isActive
                            ? "text-[#0d21a1] font-extrabold scale-105"
                            : isPast
                            ? "text-foreground"
                            : "text-muted-foreground/75 group-hover:text-foreground"
                        }`}
                      >
                        {n.year}
                      </span>
                    </div>

                    {/* Row 2: Dot Node Container (Aligned with Line) */}
                    <div
                      data-tl-dot-node
                      className="relative w-8 h-8 flex items-center justify-center"
                    >
                      {/* Active Outer Glow Pulse */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-full bg-[#0d21a1]/20 animate-ping pointer-events-none" />
                      )}

                      {/* Dot Button (All in Blue Colour #0d21a1) */}
                      <div
                        data-dot-circle
                        className={`rounded-full border-[2.5px] transition-all duration-300 ease-out flex items-center justify-center ${
                          isActive
                            ? "w-6 h-6 bg-[#0d21a1] border-white dark:border-background shadow-md shadow-[#0d21a1]/40 scale-110"
                            : isPast
                            ? "w-4 h-4 bg-[#0d21a1] border-[#0d21a1]"
                            : "w-4 h-4 bg-white dark:bg-[#0d21a1]/20 border-[#0d21a1] group-hover:scale-110"
                        }`}
                      >
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-[#ffd51d]" />
                        )}
                      </div>
                    </div>

                    {/* Row 3: Keyword & Title Below */}
                    <div className="mt-2 flex flex-col items-center text-center max-w-[100px]">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                          isActive ? "text-[#0d21a1]" : "text-muted-foreground"
                        }`}
                      >
                        {n.word}
                      </span>
                      <span
                        className={`text-xs font-semibold mt-0.5 line-clamp-1 transition-colors duration-200 ${
                          isActive ? "text-foreground" : "text-muted-foreground/80"
                        }`}
                      >
                        {n.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Premium Milestone Showcase Card (Very Light Shadow, No Top Line, No Sparkles) ── */}
        <div data-tl-card className="relative">
          <div className="relative rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md shadow-[0_2px_14px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Left Column: Image with Visual Badges */}
              <div className="lg:col-span-5 relative min-h-[240px] sm:min-h-[280px] lg:min-h-[380px] bg-muted/40 overflow-hidden">
                {activeNode.image ? (
                  <Image
                    key={`img-${activeNode.title}`}
                    src={activeNode.image}
                    alt={activeNode.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Icon className="w-16 h-16 text-muted-foreground/40" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                {/* Tag & Year Floating Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{activeNode.tag}</span>
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-xs font-bold uppercase tracking-wider text-white/80">
                    {activeNode.word}
                  </div>
                  <div className="font-display text-xl sm:text-2xl font-bold leading-tight">
                    {activeNode.title}
                  </div>
                </div>
              </div>

              {/* Right Column: Narrative Story & Chapter Details */}
              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-border/60">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand/10 text-[#0d21a1] text-xs font-bold uppercase tracking-wider">
                      <span>{activeNode.year}</span>
                    </div>
                  </div>

                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-snug">
                    {activeNode.title}: {activeNode.word}
                  </h3>

                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {activeNode.description}
                  </p>
                </div>

                {/* Bottom Action / Link & Arrows on Card */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-border/60">
                  {activeNode.href ? (
                    <Link
                      href={activeNode.href}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-brand/90 transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{activeNode.hrefLabel || "Learn More"}</span>
                    </Link>
                  ) : (
                    <div className="hidden lg:block" />
                  )}

                  {/* Previous and Next Navigation Arrows on Card (Mobile & Tablet: Prev on left, Next on right) */}
                  <div className="w-full lg:w-auto flex items-center justify-between lg:justify-end gap-3 lg:ml-auto">
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="Previous chapter"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card/80 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer min-w-[100px]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Next chapter"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card/80 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer min-w-[100px]"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes tlDottedMove {
          from {
            stroke-dashoffset: 24;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}} />
    </section>
  );
}
