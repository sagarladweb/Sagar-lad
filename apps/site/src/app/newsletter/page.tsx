import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { prisma, dbSafe } from "@/lib/db";
import { pageMetadata } from "@/lib/site";
import { NewsletterArchive } from "./NewsletterArchive";

export const metadata: Metadata = pageMetadata({
  title: "The Sagar Lad Letter — Weekly Insights on Career & Mindset",
  description:
    "The Sagar Lad Letter — one practical insight every week on career growth, mindset, and intentional living. No motivational fluff. No clickbait. Join thousands of readers.",
  path: "/newsletter",
});

export const revalidate = 300;

const getSubscriberCount = unstable_cache(
  async () =>
    dbSafe(
      () =>
        prisma.newsletterSubscriber.count({
          where: { unsubscribed: false },
        }),
      0
    ),
  ["newsletter-subscriber-count"],
  { revalidate: 3600, tags: ["content", "newsletter"] }
);

export default async function NewsletterPage() {
  const subscriberCount = await getSubscriberCount();

  return (
    <main>
      {/* Hero + Subscribe card */}
      <section className="border-b border-border bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-10 sm:pb-14">
          {/* Subscribe card with image */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)]">
            <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
              {/* Image column */}
              <div className="relative md:col-span-5 min-h-[220px] sm:min-h-[280px] md:min-h-full aspect-[4/3] md:aspect-auto overflow-hidden bg-muted/40">
                <img
                  src="/images/newsletter/sagar-lad-newsletter-mindset-coffee.webp"
                  alt="Sagar Lad Newsletter – One practical idea every week"
                  className="absolute inset-0 w-full h-full object-cover object-[43%_20%] sm:object-[47%_24%]"
                  loading="eager"
                />
                <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/50 via-black/15 to-transparent md:hidden pointer-events-none" />
              </div>

              {/* Form column */}
              <div
                className="md:col-span-7 flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10"
                style={{
                  background: "linear-gradient(180deg, #e8f0fe 0%, #f4f7fd 45%, #ffffff 85%)",
                }}
              >
                <div className="w-full text-center md:text-left max-w-md mx-auto md:mx-0">
                  <p className="text-xs font-semibold tracking-widest uppercase text-brand mb-2">
                    The Sagar Lad Letter
                  </p>
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-foreground">
                    Ideas that actually move the needle.
                  </h1>
                  <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                    One practical insight every week — on career and productivity.
                    living. No motivational fluff. No clickbait.
                    {subscriberCount > 0 && (
                      <> Join <strong className="text-foreground">{subscriberCount.toLocaleString()}+</strong> readers.</>
                    )}
                  </p>

                  <SubscribeFormInline />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Archive */}
      <section id="archive">
        <NewsletterArchive />
      </section>
    </main>
  );
}

/* ── Inline subscribe form (inside card) ── */
function SubscribeFormInline() {
  return (
    <form
      action="/api/newsletter"
      method="post"
      className="mt-6 space-y-3 max-w-md mx-auto md:mx-0"
    >
      <input
        type="email"
        name="email"
        required
        placeholder="your@email.com"
        aria-label="Email address"
        className="w-full rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors placeholder:text-muted-foreground/60"
      />
      <input type="hidden" name="acceptedTerms" value="true" />
      <button
        type="submit"
        className="rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold hover:opacity-95 transition-opacity w-full sm:w-auto"
      >
        Subscribe
      </button>
      <p className="text-xs text-muted-foreground">
        No spam. Unsubscribe anytime.
      </p>
    </form>
  );
}
