import { SITE, VISIBLE_POST_WHERE } from "@/lib/site";
import { getSiteSocials } from "@/lib/social-links";
import { getCategoriesWithFallback, getFeaturedPostsWithFallback, getActiveAnnouncement } from "@/lib/content";
import { getHomeHero } from "@/lib/hero";
import { prisma } from "@/lib/db";
import { JsonLd } from "@/components/JsonLd";

import { Hero } from "@/components/home/Hero";
import { FeaturedOn } from "@/components/home/FeaturedOn";
import { AboutMe } from "@/components/home/AboutMe";
import { TopicsGrid } from "@/components/home/TopicsGrid";
import { MindUp } from "@/components/home/MindUp";
import { MindUpBook } from "@/components/home/MindUpBook";
import { BlogPreview } from "@/components/home/BlogPreview";
import { Testimonials } from "@/components/home/Testimonials";
import { MentorshipCta } from "@/components/home/MentorshipCta";
import { NewsletterCta } from "@/components/home/NewsletterCta";
import { SagarGallery } from "@/components/home/SagarGallery";
import { LifeRazor } from "@/components/home/LifeRazor";
import { AnnouncementSection } from "@/components/home/AnnouncementSection";
import { AnnouncementPopup } from "@/components/home/AnnouncementPopup";
import { LazySection } from "@/components/home/LazySection";

export const revalidate = 300;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ announce_preview?: string; id?: string }>;
}) {
  const params = await searchParams;
  const previewMode = params.announce_preview;

  const fetchAnnouncement = params.id
    ? prisma.announcement.findUnique({ where: { id: params.id } }).catch(() => null)
    : getActiveAnnouncement();

  const results = await Promise.all([
    getFeaturedPostsWithFallback(VISIBLE_POST_WHERE, 4).catch(() => []),
    getSiteSocials().catch(() => []),
    getCategoriesWithFallback().catch(() => []),
    fetchAnnouncement.catch(() => null),
    getHomeHero().catch(() => null),
  ]);

  const [posts, socials, allCategories, announcement, hero] = results as [
    Awaited<ReturnType<typeof getFeaturedPostsWithFallback>>,
    Awaited<ReturnType<typeof getSiteSocials>>,
    Awaited<ReturnType<typeof getCategoriesWithFallback>>,
    Awaited<typeof fetchAnnouncement>,
    Awaited<ReturnType<typeof getHomeHero>>,
  ];

  const topicsWithViews = allCategories
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      postCount: (c._count?.posts ?? 0) + (c._count?.videos ?? 0),
    }))
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 10);

  if (previewMode === "section") {
    return (
      <div className="min-h-screen bg-background">
        {announcement && <AnnouncementSection announcement={announcement} />}
      </div>
    );
  }

  if (previewMode === "all") {
    return (
      <>
        <Hero hero={hero} />
        <LazySection delay={100}><FeaturedOn /></LazySection>
        <LazySection delay={200}><AboutMe /></LazySection>
        <LazySection delay={300}><MindUp /></LazySection>
        <LazySection delay={400}><TopicsGrid topics={topicsWithViews} /></LazySection>
        <LazySection delay={500}><MindUpBook /></LazySection>
        <LazySection delay={600}><BlogPreview posts={posts} showStats /></LazySection>
        <LazySection delay={700}><Testimonials /></LazySection>
        <LazySection delay={800}><MentorshipCta /></LazySection>
        <LazySection delay={900}><NewsletterCta /></LazySection>
        <LazySection delay={1000}><SagarGallery /></LazySection>
        <LazySection delay={1100}><LifeRazor /></LazySection>
        {announcement && <LazySection delay={1200}><AnnouncementSection announcement={announcement} /></LazySection>}
      </>
    );
  }

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: SITE.name,
          url: SITE.url,
          sameAs: socials.map((s) => s.href),
          knowsAbout: ["personal finance", "investing", "career", "data engineering"],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE.name,
          url: SITE.url,
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${SITE.url}/blog?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <Hero hero={hero} />
      <LazySection delay={100}><FeaturedOn /></LazySection>
      <LazySection delay={200}><AboutMe /></LazySection>
      <LazySection delay={300}><MindUp /></LazySection>
      <LazySection delay={400}><TopicsGrid topics={topicsWithViews} /></LazySection>
      <LazySection delay={500}><MindUpBook /></LazySection>
      <LazySection delay={600}><BlogPreview posts={posts} showStats /></LazySection>
      <LazySection delay={700}><Testimonials /></LazySection>
      <LazySection delay={800}><MentorshipCta /></LazySection>
      <LazySection delay={900}><NewsletterCta /></LazySection>
      <LazySection delay={1000}><SagarGallery /></LazySection>
      <LazySection delay={1100}><LifeRazor /></LazySection>
      {announcement && <LazySection delay={1200}><AnnouncementSection announcement={announcement} /></LazySection>}
      {announcement && <AnnouncementPopup announcement={announcement} />}
    </>
  );
}
