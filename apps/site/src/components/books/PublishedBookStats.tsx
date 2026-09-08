"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Pen, Tag, ExternalLink } from "lucide-react";

type Book = {
  id: string;
  title: string;
  author: string | null;
  tagline: string | null;
  description: string | null;
  buyUrl: string | null;
  free: boolean;
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

export function PublishedBookStats({ books }: { books: Book[] }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const total = books.length;
  const withDescription = books.filter((b) => b.description).length;
  const withBuyLink = books.filter((b) => b.buyUrl).length;
  const freeBooks = books.filter((b) => b.free).length;

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

  const tCount = useCountUp(total, 1200, visible);
  const dCount = useCountUp(withDescription, 1200, visible);
  const bCount = useCountUp(withBuyLink, 1200, visible);
  const fCount = useCountUp(freeBooks, 1200, visible);

  return (
    <div
      ref={ref}
      className="mt-10 rounded-2xl border border-border bg-card/60 backdrop-blur-sm"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
        <Stat icon={BookOpen} value={tCount} label="Published" />
        <Stat icon={Pen} value={dCount} label="Detailed" />
        <Stat icon={ExternalLink} value={bCount} label="On Amazon" />
        <Stat icon={Tag} value={fCount} label="Free" />
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 py-5 px-3">
      <Icon className="w-4 h-4 text-brand mb-1" />
      <span className="font-display text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
