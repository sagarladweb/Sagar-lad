import type { Metadata } from "next";
import { SITE, pageMetadata } from "@/lib/site";
import { getQuotesWithFallback } from "@/lib/content";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Quotes",
  description:
    "Short ideas on habits, confidence, money and happiness from Sagar Lad's writing and talks.",
  path: "/quotes",
});

export const revalidate = 604800;

const TAG_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  mindset: { bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", border: "border-amber-500/20" },
  money: { bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-500/20" },
  career: { bg: "bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", border: "border-blue-500/20" },
  life: { bg: "bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", border: "border-rose-500/20" },
  habits: { bg: "bg-violet-500/10", text: "text-violet-700 dark:text-violet-400", border: "border-violet-500/20" },
  confidence: { bg: "bg-orange-500/10", text: "text-orange-700 dark:text-orange-400", border: "border-orange-500/20" },
  happiness: { bg: "bg-pink-500/10", text: "text-pink-700 dark:text-pink-400", border: "border-pink-500/20" },
  discipline: { bg: "bg-cyan-500/10", text: "text-cyan-700 dark:text-cyan-400", border: "border-cyan-500/20" },
  growth: { bg: "bg-lime-500/10", text: "text-lime-700 dark:text-lime-400", border: "border-lime-500/20" },
  focus: { bg: "bg-indigo-500/10", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-500/20" },
};

function getTagStyle(tag: string) {
  const key = tag.toLowerCase();
  return TAG_STYLES[key] ?? { bg: "bg-accent/10", text: "text-accent-strong", border: "border-accent/20" };
}

export default async function QuotesPage() {
  const quotes = await getQuotesWithFallback();

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

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--accent)/5,transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-16 md:py-24 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-accent-strong bg-accent/10 rounded-full px-4 py-1.5 mb-6">
            Words to live by
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            Ideas to carry<br className="hidden sm:block" /> with you
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-muted-foreground leading-relaxed text-base sm:text-lg">
            Short lines on habits, confidence, money and happiness — distilled from
            the writing and talks.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="h-px w-8 bg-border" />
            <span>{quotes.length} quotes</span>
            <span className="h-px w-8 bg-border" />
          </div>
        </div>
      </header>

      {/* Quotes */}
      {quotes.length === 0 ? (
        <p className="mx-auto max-w-4xl px-4 sm:px-6 py-20 text-center text-muted-foreground">
          Quotes coming soon.
        </p>
      ) : (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
          {/* Featured first quote — full width */}
          {quotes[0] && (
            <figure className="relative mb-10 sm:mb-14 rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 via-background to-background p-8 sm:p-12">
              <div className="absolute top-6 left-8 text-6xl sm:text-8xl font-display text-accent/20 leading-none select-none" aria-hidden="true">
                &ldquo;
              </div>
              <blockquote className="relative font-display text-xl sm:text-2xl md:text-3xl font-medium leading-relaxed text-foreground max-w-3xl">
                {quotes[0].text}
              </blockquote>
              <figcaption className="mt-6 sm:mt-8 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getTagStyle(quotes[0].tag).bg} ${getTagStyle(quotes[0].tag).text} ${getTagStyle(quotes[0].tag).border}`}>
                  {quotes[0].tag}
                </span>
                <span className="text-sm text-muted-foreground font-medium">— Sagar Lad</span>
              </figcaption>
            </figure>
          )}

          {/* Remaining quotes — masonry-like grid */}
          <div className="columns-1 sm:columns-2 gap-5 sm:gap-6">
            {quotes.slice(1).map((q, i) => {
              const style = getTagStyle(q.tag);
              const isLong = q.text.length > 160;
              const isOdd = i % 3 === 0;

              return (
                <figure
                  key={q.id}
                  className={`break-inside-avoid mb-5 sm:mb-6 group relative rounded-2xl border border-border bg-card p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:border-accent/20 ${isOdd ? "sm:mt-0" : "sm:mt-3"}`}
                >
                  {/* Decorative quote mark */}
                  <div className="absolute top-4 right-5 text-4xl font-display text-accent/10 leading-none select-none group-hover:text-accent/20 transition-colors" aria-hidden="true">
                    &rdquo;
                  </div>

                  <blockquote className={`font-display font-medium leading-relaxed text-foreground ${isLong ? "text-base" : "text-lg sm:text-xl"}`}>
                    {q.text}
                  </blockquote>

                  <figcaption className="mt-5 sm:mt-6 flex items-center justify-between pt-4 border-t border-border/50">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${style.bg} ${style.text} ${style.border}`}>
                      {q.tag}
                    </span>
                    <span className="text-xs text-muted-foreground">— Sagar Lad</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
