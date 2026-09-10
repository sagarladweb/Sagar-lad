import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Calendar,
} from "lucide-react";
import { SITE, pageMetadata } from "@/lib/site";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { GalleryCarousel } from "@/components/speaking/GalleryCarousel";
import { SpeakingTestimonials } from "@/components/speaking/SpeakingTestimonials";
import { AimFramework } from "@/components/speaking/AimFramework";
import { SpokenAt } from "@/components/speaking/SpokenAt";
import { BackgroundSection } from "@/components/speaking/BackgroundSection";
import { SpeakingExperience } from "@/components/speaking/SpeakingExperience";
import { SpeakingReviewButton } from "@/components/speaking/SpeakingReviewModal";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Public Speaking & Keynotes",
  description:
    "Sagar Lad delivers high-impact keynotes on AI & Data Leadership, Financial Mindset, and Career Growth at summits, tech conferences, and campuses worldwide.",
  path: "/speaking",
  ogImage: "/images/heroes/speaking.webp",
});

export const dynamic = "force-static";

export default function SpeakingPage() {
  return (
    <div className="bg-background overflow-x-clip">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Speaking", item: `${SITE.url}/speaking` },
          ],
        }}
      />
      {/* Stage Hero — full-bleed landscape, copy overlaid on the dark left zone */}
      <section className="relative -mt-16 min-h-[calc(100svh+4rem)] bg-foreground text-background overflow-hidden border-b border-border">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/images/heroes/speaking.webp"
            alt=""
            fill
            priority
            className="object-cover object-center hero-drift"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 min-h-[100svh] flex flex-col justify-end pb-20 sm:pb-28 pt-32">
          <div className="max-w-2xl space-y-5 text-center sm:text-left mx-auto sm:mx-0">
            <span className="btn-premium inline-flex items-center justify-center sm:justify-start rounded-full bg-accent px-4 py-1.5 text-xs font-semibold tracking-wide text-accent-foreground shadow-md">
              Speaking
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1] drop-shadow-md">
              Ideas that ignite rooms and transform mindsets.
            </h1>
            <p className="text-white/90 text-base sm:text-lg leading-relaxed max-w-2xl drop-shadow-sm font-medium">
              Delivering story-driven, actionable keynotes on AI leadership, financial freedom, and career momentum for summits, universities, and enterprise events worldwide.
            </p>
            <div className="pt-2 flex flex-col gap-4 items-center sm:flex-row sm:items-center">
              <Link
                href="/speaking/contact"
                className="btn-premium inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-7 py-3.5 text-sm font-semibold hover:opacity-95 shadow-xl w-full sm:w-auto"
              >
                Inquire about speaking <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TEDx Spotlight — the strongest proof, right after the hook */}
      <section className="relative py-20 md:py-28 border-b border-border bg-card/60 overflow-hidden" aria-label="Sagar's TEDx talk">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5 text-center lg:text-left" data-animate="left" suppressHydrationWarning>
              <span className="inline-flex items-center justify-center lg:justify-start rounded-full bg-brand-light/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand">
                Watch
              </span>
              <div className="mt-6">
                <p className="font-display text-lg sm:text-xl font-bold text-accent-strong">
                  Stop chasing AI. Start A.I.M.ing.
                </p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  A simple way to stop worrying about AI and actually start using it — at your own pace, in your own way.
                </p>
                <div className="mt-6">
                  <AimFramework />
                </div>
              </div>
            </div>
            <div className="lg:col-span-7" data-animate="right" suppressHydrationWarning>
              <VideoPlayer
                title="TEDx — The MIND UP message"
                src="https://youtu.be/A5CJpNDusAU?si=DyeRhRJKxUYsr_eL"
                thumb="/images/heroes/tedx.webp"
                platform="youtube"
                pauseOnLeave
                overlay={
                  <div
                    className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                    aria-hidden="true"
                  >
                    <span className="absolute bottom-4 left-5 text-[11px] font-semibold uppercase tracking-widest text-white/90">
                      Sagar Lad · Keynote &amp; Educator
                    </span>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* Videos & Photos — bento on desktop, horizontal snap carousel on mobile */}
      <section className="border-b border-border bg-muted/30 py-20 md:py-24 overflow-hidden" aria-label="Videos and photos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Mobile: horizontal snap carousel */}
          <div className="lg:hidden">
            <GalleryCarousel />
          </div>

          {/* Desktop: bento grid */}
          <div className="hidden lg:grid grid-cols-12 gap-3 sm:gap-4">
            {/* Large feature — left, spans 2 rows on desktop */}
            <div className="sm:col-span-2 lg:col-span-7 lg:row-span-2 rounded-xl overflow-hidden relative group min-h-[280px] sm:min-h-[400px] lg:min-h-0">
              <Image
                src="/images/speaking/main-full-width.webp"
                alt="Sagar Lad delivering a keynote"
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 58vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>

            {/* Top right */}
            <div className="sm:col-span-1 lg:col-span-5 rounded-xl overflow-hidden relative group aspect-[4/3] min-h-[200px]">
              <Image
                src="/images/speaking/candid.webp"
                alt="Sagar Lad candid"
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 42vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>

            {/* Bottom right */}
            <div className="sm:col-span-1 lg:col-span-5 rounded-xl overflow-hidden relative group aspect-[4/3] min-h-[200px]">
              <Image
                src="/images/speaking/candid-speaking.webp"
                alt="Sagar Lad speaking"
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 42vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>

            {/* Bottom row — 3 equal cards on desktop */}
            <div className="sm:col-span-2 lg:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { src: "/images/speaking/candid-presentation.webp", alt: "Sagar Lad presenting" },
                { src: "/images/speaking/too-close.webp", alt: "Sagar Lad portrait" },
                { src: "/images/heroes/tedx.webp", alt: "Sagar Lad at TEDx" },
              ].map((img) => (
                <div
                  key={img.src}
                  className="rounded-xl overflow-hidden relative group aspect-[4/3] min-h-[160px]"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 26vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stages & Credentials — visual-first animated cards */}
      <section className="border-b border-border bg-background py-20 md:py-24" aria-label="Stages and Credentials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
          {/* Events Hosted — visual cards */}
          <SpokenAt />

          {/* Memberships & Certifications — interactive expanding panels */}
          <BackgroundSection />
        </div>
      </section>

      {/* Professional Experience — how the engagement works, then the ask */}
      <section className="card-hover py-20 md:py-28 border-b border-border bg-card/40" aria-label="Professional experience">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl text-center sm:text-left mx-auto sm:mx-0" data-animate suppressHydrationWarning>
            <span className="inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">How it works</span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-accent-strong">Three simple steps</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              No confusion, no last-minute surprises. Here&apos;s exactly how we&apos;ll work together from start to finish.
            </p>
          </div>

          <div className="mt-12" data-animate-group suppressHydrationWarning>
            <SpeakingExperience />
          </div>

          {/* Desktop-only booking CTA card */}
          <div className="hidden lg:block mt-6">
            <div className="card-hover relative overflow-hidden rounded-lg border border-border bg-card p-8 sm:p-10 shadow-xl flex flex-row items-center gap-8" data-animate-item suppressHydrationWarning>
              <span aria-hidden="true" className="pointer-events-none absolute -top-24 -left-10 h-48 w-72 rounded-full bg-accent/15 blur-3xl" />
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-md bg-accent grid place-items-center text-accent-foreground">
                  <Calendar className="w-8 h-8" />
                </div>
              </div>
              <div className="relative flex-1 text-left space-y-3">
                <h3 className="font-display text-xl sm:text-2xl font-bold">Want Sagar at your next event?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Whether it&apos;s a conference, team offsite, university talk, or podcast — let&apos;s make it happen.
                </p>
                <Link
                  href="/speaking/contact"
                  className="btn-premium mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3.5 text-sm font-semibold hover:opacity-95 shadow-md"
                >
                  Contact For Speaking <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Organizer voices — marquee on mobile, grid on desktop */}
      <section className="py-20 md:py-28 bg-background" aria-label="What organizers say">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16" data-animate suppressHydrationWarning>
            <span className="inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">Kind words</span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-accent-strong">What people say</h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Honest feedback from organizers and attendees who&apos;ve experienced the talks firsthand.
            </p>
          </div>
          <SpeakingTestimonials />

          {/* Mobile/tablet only: review button + booking CTA */}
          <div className="lg:hidden mt-12 space-y-6 text-center">
            <SpeakingReviewButton />

            <div className="card-hover relative overflow-hidden rounded-lg border border-border bg-card p-8 shadow-xl">
              <span aria-hidden="true" className="pointer-events-none absolute -top-24 -left-10 h-48 w-72 rounded-full bg-accent/15 blur-3xl" />
              <div className="relative shrink-0 mx-auto mb-4">
                <div className="w-16 h-16 rounded-md bg-accent grid place-items-center text-accent-foreground">
                  <Calendar className="w-8 h-8" />
                </div>
              </div>
              <div className="relative space-y-3">
                <h3 className="font-display text-xl sm:text-2xl font-bold">Want Sagar at your next event?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Whether it&apos;s a conference, team offsite, university talk, or podcast — let&apos;s make it happen.
                </p>
                <Link
                  href="/speaking/contact"
                  className="btn-premium mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3.5 text-sm font-semibold hover:opacity-95 shadow-md w-full"
                >
                  Contact For Speaking <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}