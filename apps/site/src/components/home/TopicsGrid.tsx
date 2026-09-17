"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  Rocket,
  MessagesSquare,
  Award,
  Scale,
  CalendarCheck,
  Smile,
  HeartPulse,
  Brain,
  Flame,
} from "lucide-react";
import { Pill } from "@/components/ui/Pill";

const ICONS: Record<string, typeof Brain> = {
  Mindset: Brain,
  "Emotional Intelligence": Scale,
  Habits: CalendarCheck,
  Confidence: Award,
  Motivation: Flame,
  Communication: MessagesSquare,
  Career: Rocket,
  Health: HeartPulse,
  Happiness: Smile,
  Anxiety: Activity,
};

type Topic = {
  id: string;
  name: string;
  slug: string;
  postCount: number;
};

const COACH_TOPICS: Topic[] = [
  { id: "1", name: "Mindset", slug: "mindset", postCount: 0 },
  { id: "2", name: "Emotional Intelligence", slug: "emotional-intelligence", postCount: 0 },
  { id: "3", name: "Habits", slug: "habits", postCount: 0 },
  { id: "4", name: "Confidence", slug: "confidence", postCount: 0 },
  { id: "5", name: "Motivation", slug: "motivation", postCount: 0 },
  { id: "6", name: "Communication", slug: "communication", postCount: 0 },
  { id: "7", name: "Career", slug: "career", postCount: 0 },
  { id: "8", name: "Health", slug: "health", postCount: 0 },
];

const SORT_ORDER = [
  "Mindset",
  "Emotional Intelligence",
  "Habits",
  "Confidence",
  "Motivation",
  "Communication",
  "Career",
  "Health",
  "Happiness",
  "Anxiety",
];

function sortTopics(topics: Topic[]) {
  return [...topics].sort((a, b) => {
    const idxA = SORT_ORDER.indexOf(a.name);
    const idxB = SORT_ORDER.indexOf(b.name);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });
}

function MarqueeTopicCard({ t }: { t: Topic }) {
  const Icon = ICONS[t.name] ?? Brain;
  return (
    <Link
      href={`/blog?category=${encodeURIComponent(t.slug)}`}
      className="card-hover group flex flex-col items-center justify-center text-center p-4 sm:p-9 rounded-xl border border-border bg-card shrink-0 h-[140px] w-[140px] sm:h-[220px] sm:w-[280px] select-none cursor-pointer snap-center"
    >
      <span className="grid h-9 w-9 sm:h-14 sm:w-14 place-items-center rounded-full bg-muted text-muted-foreground mb-2 sm:mb-4 transition-all duration-300 group-hover:bg-brand/10 group-hover:text-brand">
        <Icon className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={1.5} />
      </span>
      <h3 className="font-display text-xs sm:text-lg font-semibold leading-snug text-foreground group-hover:text-foreground transition-colors duration-200 line-clamp-2">
        {t.name}
      </h3>
    </Link>
  );
}

export function TopicsGrid({ topics }: { topics: Topic[] }) {
  const items = topics.length > 0 ? sortTopics(topics) : COACH_TOPICS;
  const list = items.slice(0, 8);
  const doubled = [...list, ...list, ...list];
  const [cssPaused, setCssPaused] = useState(false);

  const pause = useCallback(() => setCssPaused(true), []);
  const resume = useCallback(() => setCssPaused(false), []);

  const onMouseOver = useCallback(
    (e: React.MouseEvent) => {
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      pause();
    },
    [pause],
  );
  const onMouseOut = useCallback(
    (e: React.MouseEvent) => {
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      resume();
    },
    [resume],
  );

  return (
    <section className="py-10 sm:py-14 md:py-16 border-b border-border bg-background overflow-hidden" aria-label="Explore Topics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <div className="w-full flex justify-center text-center">
          <Pill supportLine="Browse topics">Explore</Pill>
        </div>
        <h2 className="text-center font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mt-6 text-[#1e293b]">
          Unlock the full power of The Sagar Lad library
        </h2>
        <p className="mt-4 text-base text-[#94a3b8] leading-relaxed max-w-xl mx-auto">
          Find any moment, quote or advice you&apos;re looking for
        </p>
      </div>

      {/* Desktop: CSS marquee — pauses on hover, resumes immediately on leave */}
      <div className="mt-8 md:mt-12 relative overflow-hidden marquee-mask marquee-pauser no-scrollbar">
        <div
          className="hidden lg:flex w-max gap-6 animate-marquee py-3"
          style={{
            animationDuration: "50s",
            animationPlayState: cssPaused ? "paused" : "running",
          }}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
        >
          {doubled.map((t, i) => (
            <MarqueeTopicCard key={`${t.id}-${i}`} t={t} />
          ))}
        </div>

        {/* Mobile/tablet: swipeable carousel — one card at a time, snap scroll */}
        <div className="lg:hidden flex gap-3 py-3 px-4 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth">
          {list.map((t) => (
            <MarqueeTopicCard key={t.id} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
