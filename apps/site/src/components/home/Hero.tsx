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

      // Subtitle: fade up (first)
      tl.fromTo(
        "[data-hero-sub]",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.3
      );

      // Name: fade up (second)
      tl.fromTo(
        "[data-hero-word]",
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
        },
        0.45
      );

      // Designation pill: fade up (third)
      tl.fromTo(
        "[data-hero-desig]",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.65
      );

      // Tagline: fade up (fourth)
      tl.fromTo(
        "[data-hero-tag]",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.8
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

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 min-h-[100svh] flex flex-col justify-end pb-16 sm:pb-20 md:pb-24 pt-24 sm:pt-28">
        <div className="max-w-3xl text-center mt-auto">
          {/* Subtitle — first */}
          <p data-hero-sub className="mb-3 sm:mb-4 text-sm sm:text-base md:text-lg text-white/60 font-medium">
            {data.subtitle}
          </p>

          {/* Name — second */}
          <h1 className="mb-3 sm:mb-4">
            <span data-hero-word className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-[#ffd51d]">
              {data.title}
            </span>
          </h1>

          {/* Designation pill — third, hidden on mobile/tablet */}
          <div data-hero-desig className="mb-5 sm:mb-6 hidden lg:block">
            <span className="inline-block text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 border border-white/20 rounded-full px-4 py-1.5">
              {data.designation}
            </span>
          </div>

          {/* Tagline — MIND UP format */}
          <div data-hero-tag className="mb-6 sm:mb-8">
            <p className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
              {data.tagline1}
            </p>
            <p className="mt-1 font-display text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-white">
              Change your <span className="text-[#ffd51d]">{data.tagline2.replace(/^Change your /i, "")}</span>, Change your <span className="text-[#ffd51d]">{data.tagline3.replace(/^Change your /i, "")}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
