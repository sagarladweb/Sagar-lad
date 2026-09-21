import type { Metadata } from "next";
import { SITE, VISIBLE_POST_WHERE, pageMetadata } from "@/lib/site";
import { getSiteSocials } from "@/lib/social-links";
import { getCategoriesWithFallback, getFeaturedPostsWithFallback } from "@/lib/content";
import { getHomeHero } from "@/lib/hero";
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
import { LazySection } from "@/components/home/LazySection";

export const metadata: Metadata = pageMetadata({
  title: "Sagar Lad — Author, TEDx Speaker & Human Potential Advocate",
  description:
    "Sagar Lad is the author of The MIND UP Theory, a TEDx speaker, and creator of the MINDUP Framework — helping people build an unshakable mindset for career growth, relationships, and life.",
  path: "/",
});

export const revalidate = 60;

export default async function HomePage() {
  const results = await Promise.all([
    getFeaturedPostsWithFallback(VISIBLE_POST_WHERE, 4).catch(() => []),
    getSiteSocials().catch(() => []),
    getCategoriesWithFallback().catch(() => []),
    getHomeHero().catch(() => null),
  ]);

  const [posts, socials, allCategories, hero] = results as [
    Awaited<ReturnType<typeof getFeaturedPostsWithFallback>>,
    Awaited<ReturnType<typeof getSiteSocials>>,
    Awaited<ReturnType<typeof getCategoriesWithFallback>>,
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

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: SITE.name,
          url: SITE.url,
          sameAs: socials.map((s) => s.href),
          knowsAbout: ["mindset", "personal development", "career growth", "MIND UP Framework", "public speaking"],
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
      <LazySection><FeaturedOn /></LazySection>
      <LazySection><AboutMe /></LazySection>
      <LazySection><MindUp /></LazySection>
      <LazySection><TopicsGrid topics={topicsWithViews} /></LazySection>
      <LazySection><MindUpBook /></LazySection>
      <LazySection><BlogPreview posts={posts} showStats /></LazySection>
      <LazySection><Testimonials /></LazySection>
      <LazySection><MentorshipCta /></LazySection>
      <LazySection><NewsletterCta /></LazySection>
      <LazySection><SagarGallery /></LazySection>
      <LazySection><LifeRazor /></LazySection>
    </>
  );
}
