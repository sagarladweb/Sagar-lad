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
  const [scrollFill, setScrollFill] = useState(0);
  const [hovered, setHovered] = useState(false);

  const calcFill = useCallback(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const raw = 1 - (rect.top / vh);
    const pct = Math.max(0, Math.min(1, (raw - 0.2) / 0.6));
    setScrollFill(pct);
  }, []);

  useEffect(() => {
    let raf: number;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(calcFill);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    calcFill();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [calcFill]);

  const Icon = event.icon;
  // Desktop: hover wins. Mobile: scroll wins.
  const fill = hovered ? 1 : scrollFill;
  const strokeProgress = Math.min(1, fill * 1.5);
  const placeOpacity = fill > 0.8 ? Math.min(1, (fill - 0.8) / 0.2) : 0;

  return (
    <div
      ref={cardRef}
      className="spoken-card group relative py-6"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-index={index}
    >
      <div className="relative">
        {/* Icon + role text */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand grid place-items-center shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-sm text-muted-foreground">{event.role}</span>
        </div>

        {/* Title: outlined → filled */}
        <h3
          className="spoken-title font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight"
          style={{
            backgroundSize: `${fill * 100}% 100%`,
            WebkitTextStroke: `${1 - strokeProgress}px var(--muted-foreground, #94a3b8)`,
          }}
        >
          {event.title}
        </h3>

        {/* Place pill — fades in when text is filled */}
        <div
          className="spoken-place mt-3"
          style={{ opacity: placeOpacity, transform: `translateY(${(1 - placeOpacity) * 8}px)` }}
        >
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
        .spoken-title {
          -webkit-text-fill-color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          background-image: linear-gradient(var(--brand, #3b82f6), var(--brand, #3b82f6));
          background-repeat: no-repeat;
          transition: background-size 0.15s ease-out, -webkit-text-stroke 0.2s ease-out;
        }
        .spoken-place {
          transition: opacity 0.3s ease, transform 0.3s ease;
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
