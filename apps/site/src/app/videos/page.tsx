import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FaYoutube, FaInstagram } from "@/lib/icons";
import { SITE, pageMetadata } from "@/lib/site";
import { getPublishedVideosWithFallback } from "@/lib/content";
import { VideoFeed } from "@/components/video/VideoFeed";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Videos — Mindset, Career & Life Lessons — Sagar Lad",
  description:
    "Watch Sagar Lad's videos on mindset, career growth, relationships, and life lessons. New videos every week on YouTube — reels and clips play right here.",
  path: "/videos",
});

export const revalidate = 604800;

const PAGE_SIZE = 12;

export default async function VideosPage() {
  const videos = await getPublishedVideosWithFallback(PAGE_SIZE);

  return (
    <div className="overflow-x-clip">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Videos", item: `${SITE.url}/videos` },
          ],
        }}
      />
      <PageHeader
        eyebrow="Videos"
        title="Learn by watching"
        subtitle="New videos every week on YouTube — mindset, career, life and everything in between. Reels and clips play right here, in-page."
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 space-y-16">
        <section>
          <h2 className="mb-6 flex items-center gap-2 text-lg font-bold">
            <FaYoutube className="w-5 h-5 text-red-600" /> Videos
          </h2>
          <VideoFeed initial={videos} masonry />
        </section>

        <div className="rounded-xl bg-foreground text-background p-8 sm:p-12 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            Subscribe for the full library
          </h2>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <a
              href="https://www.youtube.com/@Sagarlad692"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold hover:opacity-90"
            >
              <FaYoutube className="w-4 h-4" /> Subscribe on YouTube
            </a>
            <a
              href="https://www.instagram.com/mindup_with__sagar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-background/30 px-6 py-3 text-sm font-semibold hover:bg-background/10 transition-colors"
            >
              <FaInstagram className="w-4 h-4" /> Follow on Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}