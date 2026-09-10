"use client";

import { useRef } from "react";
import Image from "next/image";
import { Globe } from "lucide-react";
import { useSocials, type EnrichedSocial } from "@/components/SocialLinksContext";

function SocialItem({ s }: { s: EnrichedSocial }) {
  const Icon = s.icon;
  return (
    <a
      href={s.href}
      target="_blank"
      rel="noopener noreferrer"
      className="card-hover group inline-flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2 text-sm"
    >
      <span
        className="grid h-8 w-8 place-items-center rounded-full bg-muted/70 overflow-hidden transition-colors group-hover:bg-brand-light/15"
        style={{ color: s.color }}
      >
        {s.logoUrl ? (
          <Image src={s.logoUrl} alt="" width={32} height={32} className="h-full w-full object-cover" unoptimized />
        ) : Icon ? (
          <Icon className="w-4 h-4 transition-colors group-hover:text-brand" />
        ) : (
          <Globe className="w-4 h-4 transition-colors group-hover:text-brand" />
        )}
      </span>
      <span className="font-semibold">
        <span className="sm:hidden">{s.label}</span>
        <span className="hidden sm:inline">{s.handle ?? s.label}</span>
        <span className="ml-2 text-xs font-normal text-muted-foreground group-hover:text-brand transition-colors">
          <span className="sm:hidden">{s.handle}</span>
          <span className="hidden sm:inline">{s.label}</span>
        </span>
      </span>
    </a>
  );
}

export function SocialLinks({ order }: { order?: string[] }) {
  const allSocials = useSocials();
  const trackRef = useRef<HTMLDivElement>(null);

  // Pause/resume via inline style so hover-stop works regardless of CSS load.
  const setPaused = (paused: boolean) => {
    const el = trackRef.current;
    if (el) el.style.animationPlayState = paused ? "paused" : "running";
  };

  if (allSocials.length === 0) return null;

  // Optional explicit ordering, e.g. for a curated marquee on a specific page.
  const list = order
    ? order
        .map((k) => allSocials.find((s) => s.key === k))
        .filter((s): s is EnrichedSocial => !!s)
    : allSocials;

  // Duplicate the list so the -50% translate loops seamlessly.
  const loop = [...list, ...list];

  return (
    <div className="marquee-mask w-full overflow-hidden">
      <div
        ref={trackRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="flex w-max gap-3 animate-marquee py-2 hover:[animation-play-state:paused]"
        style={{ animationDuration: "45s" }}
      >
        {loop.map((s, i) => (
          <SocialItem key={`${s.label}-${i}`} s={s} />
        ))}
      </div>
    </div>
  );
}
