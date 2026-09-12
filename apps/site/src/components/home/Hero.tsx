"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { DESIGNATION } from "@/lib/site";

export function Hero() {
  const root = useRef<HTMLElement>(null);

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

      // Designation line: fade up + blur clear
      tl.fromTo(
        "[data-hero-desig]",
        { opacity: 0, y: 16, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8 },
        0.3
      );

      // Name: word-by-word stagger with blur clear
      tl.fromTo(
        "[data-hero-word]",
        { opacity: 0, y: 50, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1,
          stagger: 0.12,
        },
        0.5
      );

      // Tagline: fade up + blur clear
      tl.fromTo(
        "[data-hero-tag]",
        { opacity: 0, y: 24, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9 },
        1.0
      );

      // Subtitle: fade up
      tl.fromTo(
        "[data-hero-sub]",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.8 },
        1.2
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
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          data-hero-bg
          src="/images/heroes/hero-home.webp"
          alt=""
          fill
          priority
          className="object-cover object-[70%_85%] sm:object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 min-h-[100svh] flex flex-col justify-end py-12 sm:py-32">
        <div className="max-w-3xl text-center sm:text-left mt-auto" style={{ display: "grid", gap: "0" }}>
          {/* Pill */}
          <div data-hero-desig className="mb-4">
            <span className="inline-block text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-white/70 border border-white/20 rounded-full px-5 py-1.5">
              {DESIGNATION}
            </span>
          </div>

          {/* Name */}
          <h1 className="mb-2">
            <span data-hero-word className="font-display text-6xl sm:text-7xl md:text-8xl font-bold leading-[1.1] text-[#ffd51d]">
              Sagar Lad
            </span>
          </h1>

          {/* Subtitle */}
          <p data-hero-sub className="mb-6 text-lg sm:text-xl text-white/60 font-medium">
            A friend, mentor and Guide
          </p>

          {/* Tagline */}
          <div data-hero-tag className="mb-8">
            <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              MIND UP.{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Change your mind. Change your life.</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-[#ffd51d]/40 -z-0 rounded-sm" />
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
