"use client";

import { useRef, useState, useEffect } from "react";
import { Mic, HeartHandshake, CheckCircle2 } from "lucide-react";

const MEMBERSHIPS = [
  {
    title: "Toastmasters",
    desc: "Trained in communication & leadership",
    detail: "Mastering Communication",
    detailText:
      "Trained in high-level communication, structured leadership, and public speaking methodologies to connect with any audience.",
    icon: Mic,
  },
  {
    title: "Lions Club",
    desc: "Serving communities beyond the stage",
    detail: "Community Service",
    detailText:
      "Dedicated to serving communities beyond the stage, fostering real-world impact, and building connections that drive positive change.",
    icon: HeartHandshake,
  },
];

function MobilePill({ membership, index }: { membership: typeof MEMBERSHIPS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Icon = membership.icon;

  return (
    <div
      ref={ref}
      suppressHydrationWarning
      className={`bg-card border border-border rounded-2xl p-4 flex items-start gap-4 transition-all duration-700 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      {/* Icon */}
      <div className="shrink-0 w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-display text-sm font-bold text-foreground">
            {membership.title}
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent-strong">
            <CheckCircle2 className="w-2.5 h-2.5" /> Verified
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          {membership.desc}
        </p>
      </div>
    </div>
  );
}

export function BackgroundSection() {
  const [active, setActive] = useState(0);

  return (
    <div data-animate suppressHydrationWarning>
      <div className="max-w-2xl mb-10 text-center sm:text-left mx-auto sm:mx-0">
        <span className="inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">
          Background
        </span>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-accent-strong">
          Certified &amp; connected
        </h2>
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
          Backed by real training, real certifications, and active roles in
          global tech communities.
        </p>
      </div>

      {/* ── Mobile & Tablet: Direct Pills with Scroll Animation ───── */}
      <div className="lg:hidden flex flex-col gap-3">
        {MEMBERSHIPS.map((m, i) => (
          <MobilePill key={m.title} membership={m} index={i} />
        ))}
      </div>

      {/* ── Desktop: Variation 1 — The Invisible Split ──────────────── */}
      <div className="hidden lg:grid grid-cols-2 min-h-[300px] gap-4">
        {/* LEFT: Triggers (Icon + Name) */}
        <div className="flex flex-col justify-center gap-2 pr-8">
          {MEMBERSHIPS.map((m, i) => {
            const Icon = m.icon;
            const isActive = active === i;
            return (
              <button
                key={m.title}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                suppressHydrationWarning
                className="group cursor-pointer outline-none text-left"
                tabIndex={0}
              >
                <div
                  className={`flex items-center gap-6 p-4 -ml-4 rounded-2xl transition-colors duration-300 ${
                    isActive ? "bg-muted/50" : "hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`w-16 h-16 shrink-0 rounded-full flex items-center justify-center border transition-all duration-500 ${
                      isActive
                        ? "bg-accent border-accent text-accent-foreground scale-110 shadow-lg"
                        : "bg-card border-border text-foreground"
                    }`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3
                    className={`text-3xl font-display font-bold transition-all duration-500 ${
                      isActive
                        ? "text-accent-strong translate-x-2"
                        : "text-muted-foreground"
                    }`}
                  >
                    {m.title}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT: Dynamic Details */}
        <div className="flex items-center relative">
          {MEMBERSHIPS.map((m, i) => {
            const isActive = active === i;
            return (
              <div
                key={m.title}
                suppressHydrationWarning
                className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ease-out ${
                  isActive
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8 pointer-events-none"
                }`}
              >
                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full shadow-lg w-fit mb-6 ${
                    i === 0
                      ? "bg-foreground text-background"
                      : "bg-accent text-accent-foreground"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Verified{" "}
                  {i === 0 ? "Training" : "Member"}
                </span>
                <h4 className="text-2xl font-display font-bold text-accent-strong mb-3">
                  {m.detail}
                </h4>
                <p className="text-muted-foreground text-base max-w-md leading-relaxed">
                  {m.detailText}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
