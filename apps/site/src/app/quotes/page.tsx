import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { SITE, pageMetadata } from "@/lib/site";
import { getQuotesWithFallback } from "@/lib/content";
import { JsonLd } from "@/components/JsonLd";
import { QuoteRenderer } from "@sagarlad/quote-card";
import { QuoteShareRow } from "@/components/quotes/QuoteShareRow";

export const metadata: Metadata = pageMetadata({
  title: "Quotes by Sagar Lad — On Mindset, Habits & Happiness",
  description:
    "Short ideas on mindset, habits, confidence, and happiness from Sagar Lad's writing and TEDx talks. Words to carry with you.",
  path: "/quotes",
});

export const revalidate = 604800;

const PER_PAGE = 24;

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const sp = await searchParams;
  const activeTag = (sp.tag ?? "").trim();
  const quotes = await getQuotesWithFallback();

  const filtered =
    activeTag.length > 0
      ? quotes.filter(
          (q) =>
            q.tag.toLowerCase().includes(activeTag.toLowerCase()) ||
            q.text.toLowerCase().includes(activeTag.toLowerCase())
        )
      : quotes;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const raw = Number(sp.page ?? 1);
  const page = Math.min(totalPages, Math.max(1, Number.isFinite(raw) ? Math.floor(raw) : 1));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const tagHref = (tag: string, p = 1) => {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/quotes${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Quotes", item: `${SITE.url}/quotes` },
          ],
        }}
      />

      {/* Slim hero */}
      <header className="relative overflow-hidden border-b border-border bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--accent)/5,transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-10 md:py-14 text-center">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Ideas to carry with you
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-muted-foreground leading-relaxed text-sm sm:text-base">
            Short lines on habits, confidence, and happiness.
          </p>

          {/* Search only */}
          <form action="/quotes" method="get" className="relative mx-auto mt-6 w-full max-w-xs" role="search">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              name="tag"
              defaultValue={activeTag}
              placeholder="Search quotes..."
              aria-label="Search quotes"
              className="w-full rounded-full border border-border bg-background py-2.5 pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </form>
        </div>
      </header>

      {visible.length === 0 ? (
        <p className="mx-auto max-w-4xl px-4 sm:px-6 py-20 text-center text-muted-foreground">
          No quotes{activeTag ? ` for “${activeTag}”` : ""} yet.{" "}
          {activeTag && (
            <Link href="/quotes" className="font-semibold text-accent-strong hover:underline">
              Clear search
            </Link>
          )}
        </p>
      ) : (
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
          {/* Single column, hairline dividers */}
          <div className="divide-y divide-border/40">
            {visible.map((q) => {
              const slug = q.slug ?? q.id;
              return (
                <article key={q.id} id={`quote-${q.id}`} className="scroll-mt-24 py-10 first:pt-0 last:pb-0 sm:py-12">
                  <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {q.tag}
                  </p>
                  <QuoteRenderer
                    text={q.text}
                    highlightText={q.highlightText}
                    highlightColor={(q.highlightColor as "yellow" | "blue" | null) ?? "yellow"}
                    author={q.author}
                    logoSrc="/logos/site-logo-black.png"
                  />
                  <div className="mt-4 flex items-center justify-end">
                    <QuoteShareRow
                      title={q.text.slice(0, 80)}
                      url={`${SITE.url}/quotes#quote-${q.id}`}
                      slug={slug}
                      fileName={`sagar-lad-${slug}.png`}
                    />
                  </div>
                </article>
              );
            })}
          </div>

          {totalPages > 1 && (
            <nav aria-label="Quote pages" className="mt-12 flex items-center justify-center gap-3">
              {page > 1 && (
                <Link
                  href={tagHref(activeTag, page - 1)}
                  className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                  ← Newer
                </Link>
              )}
              <span className="text-sm text-muted-foreground tabular-nums">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={tagHref(activeTag, page + 1)}
                  className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                  Older →
                </Link>
              )}
            </nav>
          )}
        </div>
      )}
    </>
  );
}
