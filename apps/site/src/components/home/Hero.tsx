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

      // Designation pill: fade up
      tl.fromTo(
        "[data-hero-desig]",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.1
      );

      // Name: word-by-word stagger
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

      // Subtitle: fade up
      tl.fromTo(
        "[data-hero-sub]",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.4
      );

      // Tagline: fade up
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
          {/* Designation pill */}
          <div data-hero-desig className="mb-4">
            <span className="inline-block text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-white/70 border border-white/20 rounded-full px-5 py-1.5">
              {data.designation}
            </span>
          </div>

          {/* Name */}
          <h1 className="mb-2">
            <span data-hero-word className="font-display text-6xl sm:text-7xl md:text-8xl font-bold leading-[1.1] text-[#ffd51d]">
              {data.title}
            </span>
          </h1>

          {/* Subtitle */}
          <p data-hero-sub className="mb-6 text-lg sm:text-xl text-white/60 font-medium">
            {data.subtitle}
          </p>

          {/* Tagline */}
          <div data-hero-tag className="mb-8">
            <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              {data.tagline1}
            </p>
            <p className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Change your <span className="text-[#ffd51d]">{data.tagline2.replace(/^Change your /i, "")}</span>
            </p>
            <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Change your <span className="text-[#ffd51d]">{data.tagline3.replace(/^Change your /i, "")}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
