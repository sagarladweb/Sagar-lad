"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";

type Campaign = {
  id: string;
  subject: string;
  createdAt: string;
};

type ArchiveResponse = {
  campaigns: Campaign[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  showArchive: boolean;
};

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return { month: MONTHS[d.getMonth()], day: d.getDate(), year: d.getFullYear() };
}

function groupByYear(campaigns: Campaign[]) {
  const groups: Record<number, Campaign[]> = {};
  for (const c of campaigns) {
    const year = new Date(c.createdAt).getFullYear();
    if (!groups[year]) groups[year] = [];
    groups[year].push(c);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, items]) => ({ year: Number(year), items }));
}

export function NewsletterArchive() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showArchive, setShowArchive] = useState(true);

  const fetchPage = useCallback(async (p: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/newsletter/archive?page=${p}`);
      const data: ArchiveResponse = await res.json();
      setShowArchive(data.showArchive !== false);
      setCampaigns((prev) => (append ? [...prev, ...data.campaigns] : data.campaigns));
      setTotalPages(data.totalPages);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  if (!showArchive) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <p className="text-muted-foreground">Newsletter archive is not available right now.</p>
      </div>
    );
  }

  const hasMore = page < totalPages;
  const groups = groupByYear(campaigns);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16">
      <header className="mb-8 sm:mb-12">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          All issues
        </h2>
      </header>

      {loading && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 w-16 bg-muted rounded mb-3" />
              <div className="h-3 w-3/4 bg-muted rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && campaigns.length === 0 && (
        <p className="text-center text-muted-foreground py-16">
          No newsletters published yet.
        </p>
      )}

      {!loading && (
        <div className="space-y-8 sm:space-y-10">
          {groups.map((group) => (
            <section key={group.year}>
              <h3 className="text-sm font-extrabold tracking-wider uppercase text-foreground mb-3 sm:mb-4 border-b border-border pb-2">
                {group.year}
              </h3>
              <div>
                {group.items.map((c) => (
                  <NewsletterRow key={c.id} campaign={c} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 sm:mt-12 text-center">
          <button
            type="button"
            onClick={() => {
              const next = page + 1;
              setPage(next);
              fetchPage(next, true);
            }}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
            {!loadingMore && <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Row — scroll-animated date, smooth hover ── */
function NewsletterRow({ campaign }: { campaign: Campaign }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { month, day } = formatDate(campaign.createdAt);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3, rootMargin: "0px 0px -50px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Link href={`/newsletter/${campaign.id}`} className="block">
      <div
        ref={rowRef}
        className="group flex items-start gap-3 sm:gap-4 py-4 sm:py-5 border-b border-border/50 last:border-b-0"
      >
        {/* Date */}
        <span
          className={`shrink-0 pt-0.5 w-12 sm:w-16 text-[11px] sm:text-xs font-semibold tracking-wider uppercase leading-none transition-all duration-500 ease-out ${
            isVisible ? "text-foreground font-extrabold" : "text-muted-foreground"
          }`}
        >
          {month} {day}
        </span>

        {/* Title — only this gets hover effects */}
        <span className="flex-1 text-sm sm:text-[15px] font-medium leading-snug relative">
          <span className="relative z-10 transition-colors duration-300 group-hover:text-foreground">
            {campaign.subject}
          </span>
          {/* Underline — grey, fades in on hover */}
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-border scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          {/* Yellow highlight — fades in on hover */}
          <span className="absolute inset-0 -mx-1 -my-0.5 rounded-sm bg-accent/0 group-hover:bg-accent/15 transition-colors duration-300" />
        </span>

        {/* Arrow */}
        <ArrowRight className="shrink-0 w-4 h-4 mt-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </Link>
  );
}
