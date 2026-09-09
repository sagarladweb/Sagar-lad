"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { Cloud, Globe, GraduationCap, Award } from "lucide-react";

const EVENTS = [
  { title: "Scottish Summit", place: "Scotland", role: "Tech conference", icon: Cloud },
  { title: "Azure Wales Group", place: "Wales", role: "Community meetup", icon: Globe },
  { title: "Indian Institute of Chemical Engineers", place: "Centre of Excellence", role: "Academic", icon: GraduationCap },
  { title: "Azure Summit", place: "Global", role: "International summit", icon: Award },
];

function SpokenCard({ event, index }: { event: typeof EVENTS[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [fillPercent, setFillPercent] = useState(0);
  const isMobile = useRef(false);
  const ticking = useRef(false);

  useEffect(() => {
    isMobile.current = window.matchMedia("(max-width: 1023px)").matches;
  }, []);

  const calcFill = useCallback(() => {
    if (!cardRef.current || isMobile.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const viewH = window.innerHeight;
    const start = viewH;
    const end = viewH * 0.3;
    const pct = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
    setFillPercent(pct);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(() => {
          calcFill();
          ticking.current = false;
        });
      }
    };

    if (!isMobile.current) {
      window.addEventListener("scroll", onScroll, { passive: true });
      calcFill();
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, [calcFill]);

  useEffect(() => {
    if (!cardRef.current) return;
    const mq = window.matchMedia("(max-width: 1023px)");

    if (!mq.matches) {
      // Desktop: just show filled on hover via CSS, no JS needed
      setFillPercent(0);
      return;
    }

    // Mobile/tablet: IntersectionObserver scroll-to-fill
    const thresholds = Array.from({ length: 20 }, (_, i) => i / 19);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setFillPercent(entry.intersectionRatio);
          }
        });
      },
      { threshold: thresholds, rootMargin: "0px 0px 100px 0px" }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const Icon = event.icon;

  return (
    <div
      ref={cardRef}
      className="spoken-card relative rounded-xl border border-border bg-card overflow-hidden group lg:border-transparent lg:bg-transparent"
      data-index={index}
    >
      {/* Card content — visible on mobile/tablet as a bordered card */}
      <div className="relative z-10 p-6 lg:p-0">
        <span className="absolute top-4 right-4 text-[10px] font-bold tabular-nums text-muted-foreground/30">
          {String(index + 1).padStart(2, "0")}
        </span>
        {/* Icon — visible on mobile, hidden on desktop */}
        <div className="lg:hidden w-12 h-12 rounded-lg bg-brand/10 text-brand grid place-items-center mb-4">
          <Icon className="w-5 h-5" />
        </div>

        {/* Title: hollow → filled on desktop hover, scroll-fill on mobile */}
        <h3
          className="spoken-title font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-foreground"
          style={{
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            backgroundImage: "linear-gradient(var(--accent), var(--accent))",
            backgroundSize: isMobile.current ? `${fillPercent * 100}% 100%` : undefined,
            backgroundRepeat: "no-repeat",
          }}
        >
          {event.title}
        </h3>

        {/* Mobile/tablet: role + place pills below text */}
        <div className="lg:hidden mt-3 flex flex-wrap gap-2">
          <span className="inline-flex rounded-full bg-brand/8 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">
            {event.place}
          </span>
          <span className="inline-flex rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {event.role}
          </span>
        </div>

        {/* Desktop: role + place below title */}
        <div className="hidden lg:block mt-3">
          <p className="text-sm text-muted-foreground">{event.role}</p>
          <span className="mt-2 inline-flex rounded-full bg-brand/8 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">
            {event.place}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SpokenAt() {
  return (
    <div data-animate>
      <div className="max-w-2xl mb-10 text-center sm:text-left mx-auto sm:mx-0">
        <span className="inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">
          Where I&apos;ve spoken
        </span>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-accent-strong">
          On stage, around the world
        </h2>
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
          From local meetups to international summits — here are some of the rooms I&apos;ve had the privilege to speak in.
        </p>
      </div>

      <style>{`
        /* Desktop: hollow text by default, fills on hover */
        @media (min-width: 1024px) {
          .spoken-title {
            -webkit-text-fill-color: transparent;
            -webkit-background-clip: text;
            background-clip: text;
            background-image: linear-gradient(currentColor, currentColor);
            background-size: 0% 100%;
            background-repeat: no-repeat;
            transition: background-size 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .spoken-card:hover .spoken-title {
            background-size: 100% 100%;
            -webkit-text-fill-color: transparent;
          }
          .spoken-card {
            transition: background-color 0.3s ease, box-shadow 0.3s ease;
          }
          .spoken-card:hover {
            background-color: var(--card);
            box-shadow: 0 4px 24px -8px rgba(0, 0, 0, 0.08);
          }
        }
        /* Mobile/tablet: JS controls backgroundSize via inline style */
        @media (max-width: 1023px) {
          .spoken-title {
            -webkit-text-fill-color: transparent;
            -webkit-background-clip: text;
            background-clip: text;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .spoken-title {
            transition: none !important;
            background-size: 100% 100% !important;
            -webkit-text-fill-color: var(--foreground) !important;
          }
        }
      `}</style>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {EVENTS.map((event, i) => (
          <SpokenCard key={event.title} event={event} index={i} />
        ))}
      </div>
    </div>
  );
}
