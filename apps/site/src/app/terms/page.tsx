import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { JsonLd } from "@/components/JsonLd";
import { SITE, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description:
    "Terms and conditions for using sagarlad.com — including content disclaimers, intellectual property, AI training restrictions, and limitations of liability.",
  path: "/terms",
});

export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Terms & Conditions — Sagar Lad",
          description:
            "Terms and conditions for using sagarlad.com — including content disclaimers, intellectual property, AI training restrictions, and limitations of liability.",
          url: `${SITE.url}/terms`,
          author: { "@type": "Person", name: "Sagar Lad", url: SITE.url },
          dateModified: "2026-10-01T00:00:00.000Z",
        }}
      />
      <PageHeader
        eyebrow="Legal"
        title="Terms & Conditions"
        subtitle="Effective Date: October, 2026"
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 space-y-10 text-sm text-muted-foreground leading-relaxed">
        <div className="rounded-2xl border border-border bg-card p-5 text-foreground font-medium">
          Welcome to SagarLad.com. By accessing or using this website, you agree to these terms.
        </div>

        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">1. Content &amp; Disclaimer</h2>
          <p>
            All blogs, videos, articles, opinions, quotes, educational materials and investing-related content are provided for general informational and educational purposes only. They do not constitute professional, financial, investment, legal, medical or psychological advice, or a recommendation to buy, sell or hold any investment. You are responsible for your own decisions and should seek qualified professional advice where appropriate.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">2. Intellectual Property</h2>
          <p>
            Unless otherwise stated, all original content, including text, videos, audio, graphics, designs and branding, belongs to Sagar Lad or its respective rights holders. Sharing links with attribution is welcome. Reproduction, redistribution, modification or commercial use without prior permission is prohibited, except as permitted by applicable law. Third-party materials remain subject to their respective rights and licenses.
          </p>
          <p className="mt-3 rounded-lg border border-brand/30 bg-brand/5 p-3.5 text-foreground font-medium">
            <strong>Artificial Intelligence (AI) Training Prohibition:</strong> Nobody may use, scrape, crawl, reproduce, extract, or process any content, text, data, videos, audio, or materials from this website to train, develop, fine-tune, or evaluate artificial intelligence (AI), machine learning models, or large language models (LLMs) without prior explicit written permission from Sagar Lad.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">3. Services &amp; Engagements</h2>
          <p>
            Mentorship, workshops, speaking engagements, consultations and other paid services may be governed by separate agreements. Where terms conflict, the applicable agreement prevails to the extent of the conflict.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">4. User Submissions</h2>
          <p>
            You are responsible for comments, feedback, testimonials and other materials you submit. Do not post unlawful, misleading, abusive, defamatory or infringing content. We may moderate or remove submissions in accordance with applicable law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">5. Assessments &amp; Certificates</h2>
          <p>
            Self-assessments, including MIND UP, and related scores, certificates, badges and rewards are intended for personal reflection and informational purposes only. They are not diagnoses, professional evaluations, accredited qualifications or guarantees of skills, abilities or outcomes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">6. Downloads &amp; Newsletter</h2>
          <p>
            Downloads are subject to their stated usage conditions and are generally intended for personal use unless otherwise specified. Newsletter subscriptions are voluntary where indicated and may be cancelled at any time through the unsubscribe link. Personal information is handled in accordance with our{" "}
            <Link href="/privacy" className="text-foreground underline underline-offset-4 hover:text-brand">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">7. Privacy Policy</h2>
          <p>
            Our{" "}
            <Link href="/privacy" className="text-foreground underline underline-offset-4 hover:text-brand">
              Privacy Policy
            </Link>{" "}
            explains how personal information is collected, used, stored, shared and protected, including information provided through downloads, forms and newsletter subscriptions. Please review it before submitting personal information.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">8. Financial Disclosures &amp; Third-Party Content</h2>
          <p>
            Where relevant, we may disclose sponsorships, affiliate relationships, financial interests or other material connections associated with our content. Investing-related content involves risk, and past performance does not guarantee future results. Third-party links and references are provided for convenience and do not necessarily imply endorsement.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">9. Limitation of Liability</h2>
          <p>
            To the extent permitted by applicable law, Sagar Lad shall not be liable for losses arising from reliance on website content, use of resources, service interruptions or third-party websites. Nothing in these terms excludes or limits liability where doing so is prohibited by law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">10. Content Protection &amp; Legal Compliance</h2>
          <p>
            We maintain appropriate records of original content, publication dates, source materials and relevant licenses where practicable. Users must respect applicable intellectual property rights. Nothing in these terms overrides applicable law or guarantees immunity from legal claims.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-2">11. Changes &amp; Applicable Law</h2>
          <p>
            We may update these terms by publishing a revised version on this website. Changes take effect from the stated effective date, subject to applicable law. These terms are governed by the laws of India, subject to applicable mandatory legal requirements.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card/60 p-5">
          <h2 className="font-display text-base font-bold text-foreground mb-1.5">Contact</h2>
          <p>
            For permissions, legal concerns or questions about these terms, please use the contact details provided on{" "}
            <Link href="/contact" className="text-foreground underline underline-offset-4 hover:text-brand font-medium">
              SagarLad.com
            </Link>
            .
          </p>
        </section>

        <p className="pt-4 border-t border-border text-xs text-muted-foreground">
          Effective Date: October, 2026
        </p>
      </div>
    </>
  );
}