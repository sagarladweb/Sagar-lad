"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import type { HomeHeroData } from "@/lib/hero-types";
import { DEFAULT_HOME_HERO } from "@/lib/hero-types";

export function Hero({ hero }: { hero?: HomeHeroData }) {
  const root = useRef<HTMLElement>(null);
  const data = hero ?? DEFAULT_HOME_HERO;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Background image: subtle zoom-in
      tl.fromTo(
        "[data-hero-bg]",
        { scale: 1.05, opacity: 0.85 },
        { scale: 1, opacity: 1, duration: 1.4, ease: "power2.out" },
        0
      );

      // Subtitle: fade up (first)
      tl.fromTo(
        "[data-hero-sub]",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.1
      );

      // Name: word-by-word stagger (second)
      tl.fromTo(
        "[data-hero-word]",
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.08,
        },
        0.2
      );

      // Designation pill: fade up (third)
      tl.fromTo(
        "[data-hero-desig]",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.4
      );

      // Tagline: fade up (fourth)
      tl.fromTo(
        "[data-hero-tag]",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.55
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative -mt-16 min-h-[calc(100svh+4rem)] border-b border-border bg-foreground text-background overflow-hidden"
      aria-label="Introduction"
    >
      {/* Full-bleed landscape hero */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <Image
          data-hero-bg
          src={data.imageUrl}
          alt={data.title}
          fill
          priority
          className={`object-cover ${data.mobilePosition} ${data.tabletPosition} ${data.desktopPosition}`}
          sizes="100vw"
        />
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 min-h-[100svh] flex flex-col justify-end py-12 sm:py-32">
        <div className="max-w-3xl text-center sm:text-left mt-auto" style={{ display: "grid", gap: "0" }}>
          {/* Subtitle — first */}
          <p data-hero-sub className="mb-4 text-base sm:text-lg text-white/60 font-medium">
            {data.subtitle}
          </p>

          {/* Name — second */}
          <h1 className="mb-3">
            <span data-hero-word className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] text-[#ffd51d]">
              {data.title}
            </span>
          </h1>

          {/* Designation pill — third */}
          <div data-hero-desig className="mb-6">
            <span className="inline-block text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 border border-white/20 rounded-full px-4 py-1.5">
              {data.designation}
            </span>
          </div>

          {/* Tagline — one line */}
          <div data-hero-tag className="mb-8">
            <p className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white">
              {data.tagline1} — Change your <span className="text-[#ffd51d]">{data.tagline2.replace(/^Change your /i, "")}</span>, Change your <span className="text-[#ffd51d]">{data.tagline3.replace(/^Change your /i, "")}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
