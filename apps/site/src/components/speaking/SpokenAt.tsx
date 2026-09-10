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
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const seenRef = useRef(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!seenRef.current) {
          seenRef.current = true;
          if (entry.isIntersecting) return;
        }
        setInView(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Icon = event.icon;
  const filled = hovered || inView || tapped;

  return (
    <div
      ref={cardRef}
      className={`spoken-card group relative py-6 px-4 sm:px-6 rounded-xl border border-border/60 bg-card/30 cursor-pointer select-none ${filled ? "is-filled" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setTapped((t) => !t)}
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

        {/* Title: outline always visible, fill transitions via CSS */}
        <h3 className="spoken-title font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05]">
          {event.title}
        </h3>

        {/* Place pill */}
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
    <div data-animate suppressHydrationWarning>
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
          -webkit-text-stroke: 1.5px var(--muted-foreground, #94a3b8);
          -webkit-text-fill-color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          background-image: linear-gradient(var(--brand, #3b82f6), var(--brand, #3b82f6));
          background-size: 0% 100%;
          background-repeat: no-repeat;
          transition: background-size 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                      -webkit-text-stroke-color 0.4s ease,
                      letter-spacing 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.4s ease;
          -webkit-text-stroke-color: var(--muted-foreground, #94a3b8);
          letter-spacing: -0.02em;
          opacity: 0.5;
        }

        .spoken-card.is-filled .spoken-title {
          background-size: 100% 100%;
          -webkit-text-stroke-color: var(--brand, #3b82f6);
          letter-spacing: 0.02em;
          opacity: 1;
        }

        .spoken-place {
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.3s ease 0.15s, transform 0.3s ease 0.15s;
        }
        .spoken-card.is-filled .spoken-place {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .spoken-title {
            transition: none !important;
            background-size: 100% 100% !important;
            -webkit-text-fill-color: var(--foreground) !important;
            -webkit-text-stroke: 0 !important;
            letter-spacing: 0.02em !important;
            opacity: 1 !important;
          }
          .spoken-place {
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="grid grid-cols-1 gap-3">
        {EVENTS.map((event, i) => (
          <SpokenCard key={event.title} event={event} index={i} />
        ))}
      </div>
    </div>
  );
}
