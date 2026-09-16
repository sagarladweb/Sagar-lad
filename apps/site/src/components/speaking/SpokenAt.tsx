"use client";
import { useRef, useState, useEffect } from "react";
import { Cloud, Globe, GraduationCap, Award } from "lucide-react";
import { Pill } from "@/components/ui/Pill";

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

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // IntersectionObserver with bidirectional tracking (animates in AND out in reverse)
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Icon = event.icon;
  const filled = hovered || inView || tapped;

  return (
    <div
      ref={cardRef}
      className={`spoken-card group relative py-6 px-4 sm:px-6 rounded-xl border select-none transition-all duration-500 cursor-pointer ${
        filled
          ? "border-brand/50 bg-card shadow-md shadow-brand/5 -translate-y-0.5 is-filled"
          : "border-border/60 bg-card/30 hover:border-brand/30 hover:bg-card/50"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setTapped((t) => !t)}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div className="relative">
        {/* Icon + role text */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-lg grid place-items-center shrink-0 transition-colors duration-400 ${
              filled ? "bg-brand text-white shadow-sm" : "bg-brand/10 text-brand"
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{event.role}</span>
        </div>

        {/* Title: crisp, high contrast and beautifully fills/reverses */}
        <h3
          className={`spoken-title font-display text-xl sm:text-2xl md:text-3xl font-extrabold leading-[1.15] tracking-wide transition-all duration-500 ${
            filled ? "text-brand translate-x-1" : "text-foreground"
          }`}
        >
          {event.title}
        </h3>

        {/* Place pill with smooth entrance & exit */}
        <div
          className={`spoken-place mt-3.5 transition-all duration-400 ease-out ${
            filled ? "opacity-100 translate-y-0" : "opacity-40 translate-y-1"
          }`}
        >
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors duration-400 ${
              filled ? "bg-brand text-white" : "bg-brand/10 text-brand"
            }`}
          >
            {event.place}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SpokenAt() {
  return (
    <div suppressHydrationWarning>
      <div className="max-w-2xl mb-10 text-center sm:text-left mx-auto sm:mx-0">
        <Pill supportLine="Where I've spoken">Where I&apos;ve spoken</Pill>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-accent-strong">
          On stage, around the world
        </h2>
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
          From local meetups to international summits — here are some of the rooms I&apos;ve had the privilege to speak in.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {EVENTS.map((event, i) => (
          <SpokenCard key={event.title} event={event} index={i} />
        ))}
      </div>
    </div>
  );
}
