import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma, dbSafe } from "@/lib/db";
import { pageMetadata } from "@/lib/site";
import { NewsletterContent } from "./NewsletterContent";

type Props = { params: Promise<{ id: string }> };

async function getCampaign(id: string) {
  return dbSafe(
    () =>
      prisma.newsletterCampaign.findUnique({
        where: { id, draft: false },
        select: { id: true, subject: true, html: true, createdAt: true },
      }),
    null
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) return { title: "Newsletter not found" };
  return pageMetadata({
    title: campaign.subject,
    description: campaign.subject,
    path: `/newsletter/${id}`,
    type: "article",
  });
}

export default async function NewsletterIssuePage({ params }: Props) {
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) notFound();

  const date = new Date(campaign.createdAt);
  const formatted = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <a
          href="/newsletter"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← All newsletters
        </a>
      </div>

      <header className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-6 sm:pb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-brand mb-2">
          The Sagar Lad Letter
        </p>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          {campaign.subject}
        </h1>
        <time className="mt-3 block text-sm text-muted-foreground">{formatted}</time>
      </header>

      <NewsletterContent html={campaign.html} />

      {/* Subscribe CTA at bottom */}
      <section className="border-t border-border bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-brand mb-2">
            Enjoyed this?
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Get the next issue straight to your inbox.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            One practical insight every week — career, mindsetand intentional living.
          </p>
          <form
            action="/api/newsletter"
            method="post"
            className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="your@email.com"
              aria-label="Email address"
              className="flex-1 rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors placeholder:text-muted-foreground/60"
            />
            <input type="hidden" name="acceptedTerms" value="true" />
            <button
              type="submit"
              className="rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold hover:opacity-95 transition-opacity shrink-0"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </main>
  );
}
