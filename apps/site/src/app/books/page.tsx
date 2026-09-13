import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getPublishedBooks } from "@/lib/content";
import { SITE, pageMetadata } from "@/lib/site";
import { BookLibrary } from "@/components/books/BookLibrary";
import { FlipBook } from "@/components/FlipBook";
import { JsonLd } from "@/components/JsonLd";

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
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Books", item: SITE.url + "/books" },
          ],
        }}
      />

      {/* -------- The Library -------- */}
      <section className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-20 sm:px-6 md:pt-24 md:pb-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">
                All books
              </p>
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
          <p className="inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">
            Details
          </p>
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

      {/* -------- Live Book Previews -------- */}
      <FlipBook
        title="MindUp"
        author="Sagar Lad"
        coverImage="/images/books/Book-MINDUP/mindup-front.webp"
        pages={[
          "/images/books/Book-MINDUP/1.webp",
          "/images/books/Book-MINDUP/2.webp",
          "/images/books/Book-MINDUP/3.webp",
          "/images/books/Book-MINDUP/4.webp",
          "/images/books/Book-MINDUP/5.webp",
          "/images/books/Book-MINDUP/6.webp",
          "/images/books/Book-MINDUP/7.webp",
          "/images/books/Book-MINDUP/8.webp",
          "/images/books/Book-MINDUP/9.webp",
          "/images/books/Book-MINDUP/10.webp",
        ]}
        backCoverImage="/images/books/Book-MINDUP/mindup-back.webp"
      />

      <FlipBook
        title="AI Foundry"
        author="Sagar Lad"
        coverImage="/images/books/Book-AI foundry/azure-front.webp"
        pages={[
          "/images/books/Book-AI foundry/A 1.webp",
          "/images/books/Book-AI foundry/A 2.webp",
          "/images/books/Book-AI foundry/A 3.webp",
          "/images/books/Book-AI foundry/A 4.webp",
          "/images/books/Book-AI foundry/A 5.webp",
          "/images/books/Book-AI foundry/A 6.webp",
          "/images/books/Book-AI foundry/A 7.webp",
          "/images/books/Book-AI foundry/A 8.webp",
          "/images/books/Book-AI foundry/A 9.webp",
        ]}
      />
    </div>
  );
}
