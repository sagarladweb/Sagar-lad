import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE, pageMetadata } from "@/lib/site";
import { getQuoteBySlug } from "@/lib/content";
import { JsonLd } from "@/components/JsonLd";
import { QuoteRenderer } from "@sagarlad/quote-card";
import { quoteSeoTitle, quoteSeoDescription } from "@sagarlad/quote-card";
import { QuoteShareRow } from "@/components/quotes/QuoteShareRow";

export const revalidate = 604800;

type Props = { params: Promise<{ slug: string }> };

// No generateStaticParams: quote pages render on demand (ISR) so 1000+
// quotes never slow down a deploy.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const quote = await getQuoteBySlug(slug).catch(() => null);
  if (!quote) return {};
  const url = `${SITE.url}/quotes/${quote.slug ?? slug}`;
  const title = quoteSeoTitle(quote.text, quote.author);
  const description = quoteSeoDescription(quote.text, quote.tag, quote.author);
  return {
    ...pageMetadata({ title, description, path: `/quotes/${quote.slug ?? slug}` }),
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: SITE.name,
      images: [{ url: `${SITE.url}/quotes/${quote.slug ?? slug}/opengraph-image`, width: 1080, height: 1350, alt: `${quote.text} — Sagar Lad` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE.url}/quotes/${quote.slug ?? slug}/opengraph-image`],
    },
  };
}

export default async function QuotePage({ params }: Props) {
  const { slug } = await params;
  const quote = await getQuoteBySlug(slug).catch(() => null);
  if (!quote) notFound();

  const url = `${SITE.url}/quotes/${quote.slug ?? slug}`;
  const who = (quote.author ?? "Sagar Lad").trim() || "Sagar Lad";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Quotation",
          text: quote.text,
          author: { "@type": "Person", name: who, url: SITE.url },
          url,
          image: `${SITE.url}/quotes/${quote.slug ?? slug}/opengraph-image`,
          isPartOf: { "@type": "WebPage", url },
        }}
      />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20">
        {/* Crawlable HTML quote */}
        <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {quote.tag}
        </p>
        <h1 className="sr-only">{quote.text} — {who}</h1>

        <div className="mt-6">
          <QuoteRenderer
            text={quote.text}
            highlightText={quote.highlightText}
            highlightColor={(quote.highlightColor as "yellow" | "blue" | null) ?? "yellow"}
            author={quote.author}
            logoSrc="/logos/site-logo-black.png"
          />
        </div>

        <div className="mt-6 flex items-center justify-center">
          <QuoteShareRow
            title={quote.text.slice(0, 80)}
            url={url}
            slug={quote.slug ?? slug}
            fileName={`sagar-lad-${quote.slug ?? slug}.png`}
          />
        </div>
      </main>
    </>
  );
}
