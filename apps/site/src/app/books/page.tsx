import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getPublishedBooks } from "@/lib/content";
import { SITE, pageMetadata } from "@/lib/site";
import { BookLibrary } from "@/components/books/BookLibrary";
import { JsonLd } from "@/components/JsonLd";
import { Pill } from "@/components/ui/Pill";

export const metadata: Metadata = pageMetadata({
  title: "Books by Sagar Lad",
  description:
    "Practical data & cloud books by Sagar Lad — Azure, Databricks and modern data architecture. Browse the full catalogue on Amazon.",
  path: "/books",
});

export const revalidate = 604800;

const AMAZON_AUTHOR_URL =
  "https://www.amazon.com/stores/author/B0B5R12SHN/allbooks?ccs_id=0ebd2f24-24b0-4f50-bbc5-e74510a792dd";

export default async function BooksPage() {
  const books = await getPublishedBooks("PUBLISHED");
  const total = books.length;

  return (
    <div className="overflow-x-clip">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Books by Sagar Lad",
          description: "Practical data & cloud books by Sagar Lad — Azure, Databricks and modern data architecture.",
          url: `${SITE.url}/books`,
          author: { "@type": "Person", name: "Sagar Lad", url: SITE.url },
        }}
      />

      {/* -------- The Library -------- */}
      <section className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14 md:pt-20 md:pb-24">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:justify-between sm:text-left gap-4">
            <div>
              <Pill supportLine="All books">All books</Pill>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Every book, on one shelf.
              </h2>
            </div>
            <p className="text-sm text-muted-foreground tabular-nums">
              {String(total).padStart(2, "0")} titles
            </p>
          </div>

          <div className="mt-10">
            <BookLibrary books={books} variant="published" />
          </div>
        </div>
      </section>

      {/* -------- Colophon -------- */}
      <section className="bg-background">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 md:py-24">
          <Pill supportLine="Details">Details</Pill>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            All titles are available on Amazon in paperback and Kindle.
          </p>
          <a
            href={AMAZON_AUTHOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground underline decoration-brand-light decoration-2 underline-offset-4 transition-colors hover:text-brand"
          >
            amazon.com/stores/author/B0B5R12SHN <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
