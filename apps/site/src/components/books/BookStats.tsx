"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Users, Lightbulb, Pen, ExternalLink, Star, Tag } from "lucide-react";

type Book = {
  id: string;
  title: string;
  author: string | null;
  learning: string | null;
  tagline?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  buyUrl?: string | null;
  free?: boolean;
};

function useCountUp(target: number, duration = 1200, enabled = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled || target === 0) return;
    const start = performance.now();
    let raf: number;
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, enabled]);

  return count;
}

type StatItem = {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  mobileOnly?: boolean;
};

export function BookStats({ books, variant }: { books: Book[]; variant: "read" | "published" }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const stats: StatItem[] = variant === "read"
    ? (() => {
        const total = books.length;
        const uniqueAuthors = new Set(books.map((b) => b.author).filter(Boolean)).size;
        const withLearnings = books.filter((b) => b.learning).length;
        return [
          { icon: BookOpen, value: total, label: "Books Read" },
          { icon: Users, value: uniqueAuthors, label: "Authors" },
          { icon: Lightbulb, value: withLearnings, label: "Key Lessons" },
        ];
      })()
    : (() => {
        const total = books.length;
        const withDescription = books.filter((b) => b.description).length;
        const withBuyLink = books.filter((b) => b.buyUrl).length;
        const withTagline = books.filter((b) => b.tagline).length;
        return [
          { icon: Pen, value: total, label: "Published" },
          { icon: BookOpen, value: withDescription, label: "Detailed" },
          { icon: ExternalLink, value: withBuyLink, label: "On Amazon" },
          { icon: Tag, value: withTagline, label: "With Tagline" },
        ];
      })();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm"
    >
      <div className="grid grid-cols-3 divide-x divide-border">
        {stats.map((s, i) => (
          <div
            key={s.label + i}
            className={s.mobileOnly ? "hidden md:block" : ""}
          >
            <StatCard icon={s.icon} value={s.value} label={s.label} visible={visible} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  visible,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  visible: boolean;
}) {
  const count = useCountUp(value, 1200, visible);
  return (
    <div className="flex flex-col items-center gap-1 py-5 px-2 sm:px-3">
      <Icon className="w-4 h-4 text-brand mb-1" />
      <span className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground tabular-nums">
        {String(count).padStart(2, "0")}
      </span>
      <span className="text-[9px] sm:text-xs font-medium text-muted-foreground text-center">
        {label}
      </span>
    </div>
  );
}
