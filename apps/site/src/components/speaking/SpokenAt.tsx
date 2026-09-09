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

  const calcFill = useCallback(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const viewH = window.innerHeight;
    const start = viewH;
    const end = viewH * 0.35;
    const pct = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
    setFillPercent(pct);
  }, []);

  // Scroll-driven fill for mobile/tablet
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    if (!mq.matches) return; // Desktop: CSS hover handles everything

    const onScroll = () => {
      requestAnimationFrame(calcFill);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    calcFill();
    return () => window.removeEventListener("scroll", onScroll);
  }, [calcFill]);

  // IntersectionObserver for mobile (resets on scroll out)
  useEffect(() => {
    if (!cardRef.current) return;
    const mq = window.matchMedia("(max-width: 1023px)");
    if (!mq.matches) return;

    const thresholds = Array.from({ length: 20 }, (_, i) => i / 19);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setFillPercent(entry.isIntersecting ? entry.intersectionRatio : 0);
        });
      },
      { threshold: thresholds, rootMargin: "0px 0px -50px 0px" }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const Icon = event.icon;
  const isFilled = fillPercent > 0.85;

  return (
    <div
      ref={cardRef}
      className="spoken-card group relative py-6"
      style={{ "--fill": `${fillPercent * 100}%` } as React.CSSProperties}
      data-filled={isFilled}
      data-index={index}
    >
      <div className="relative">
        {/* Icon + role text (no pill, just plain text) */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand grid place-items-center shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-sm text-muted-foreground">{event.role}</span>
        </div>

        {/* Title: outlined text with hover/scroll fill */}
        <h3 className="spoken-title font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
          {event.title}
        </h3>

        {/* Place pill — desktop: shows on hover via CSS; mobile: shows when filled via JS */}
        <div className="spoken-place mt-3">
          <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">
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
        /* ── All screens: base text style ── */
        .spoken-title {
          -webkit-text-stroke: 1px var(--muted-foreground, #94a3b8);
          -webkit-text-fill-color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          background-image: linear-gradient(var(--brand, #3b82f6), var(--brand, #3b82f6));
          background-size: 0% 100%;
          background-repeat: no-repeat;
          transition: background-size 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                      -webkit-text-stroke 0.4s ease;
        }

        /* ── Desktop: hover fills + brightens stroke + shows place pill ── */
        @media (min-width: 1024px) {
          .spoken-card:hover .spoken-title {
            background-size: 100% 100%;
            -webkit-text-stroke: 1px var(--brand, #3b82f6);
          }
          .spoken-place {
            opacity: 0;
            transform: translateY(8px);
            transition: opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s;
          }
          .spoken-card:hover .spoken-place {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ── Mobile/tablet: JS sets --fill via inline style ── */
        @media (max-width: 1023px) {
          .spoken-title {
            background-size: var(--fill, 0%) 100%;
          }
          .spoken-place {
            opacity: 0;
            transform: translateY(8px);
            transition: opacity 0.4s ease, transform 0.4s ease;
          }
          /* When JS sets fill > 85%, the parent SpokenCard gets data-filled */
          .spoken-card[data-filled="true"] .spoken-title {
            -webkit-text-stroke: 1px var(--brand, #3b82f6);
          }
          .spoken-card[data-filled="true"] .spoken-place {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .spoken-title {
            transition: none !important;
            background-size: 100% 100% !important;
            -webkit-text-fill-color: var(--foreground) !important;
            -webkit-text-stroke: 0 !important;
          }
          .spoken-place {
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="grid grid-cols-1 gap-2">
        {EVENTS.map((event, i) => (
          <SpokenCard key={event.title} event={event} index={i} />
        ))}
      </div>
    </div>
  );
}
