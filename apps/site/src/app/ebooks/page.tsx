import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { BookLibrary } from "@/components/books/BookLibrary";
import { JsonLd } from "@/components/JsonLd";
import { SITE, pageMetadata } from "@/lib/site";
import { getPublishedBooks } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Free eBooks & Guides — Mindset, Career & Productivity — Sagar Lad",
  description:
    "Free eBooks and guides by Sagar Lad on mindset, career growth, and productivity. Practical reads to help you build better habits and take meaningful action.",
  path: "/ebooks",
});

export const revalidate = 604800;

export default async function EbooksPage() {
  // Free eBook file links are never exposed to the client — downloads are gated
  // server-side via POST /api/ebooks/download/[id]. Strip buyUrl here so it
  // cannot leak into the HTML.
  const ebooks = (await getPublishedBooks("EBOOK")).map((b) =>
    b.free ? { ...b, buyUrl: null as string | null } : b
  );

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "eBooks & Guides — Sagar Lad",
          description: "Free eBooks and guides by Sagar Lad on mindset, career growth, and productivity.",
          url: `${SITE.url}/ebooks`,
          author: { "@type": "Person", name: "Sagar Lad", url: SITE.url },
        }}
      />
      <PageHeader
        eyebrow="eBooks"
        title="Guides you can start today"
        subtitle="Quick, practical reads to help you get moving — career and productivity."
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 pb-16 sm:pt-12 md:pt-16">
        <div className="text-center">
          {ebooks.length === 0 ? (
            <p className="text-muted-foreground">No eBooks yet.</p>
          ) : (
            <BookLibrary books={ebooks} variant="ebook" />
          )}
        </div>
      </div>
    </>
  );
}