import { assertPhase2 } from "@/lib/phase";
import { prisma } from "@/lib/db";
import { ComposerClient } from "./ComposerClient";
import type { NewsletterDoc } from "@/components/newsletter-composer/types/editor";

export const dynamic = "force-dynamic";

export default async function NewsletterComposePage({
  searchParams,
}: {
  searchParams: Promise<{ draft?: string }>;
}) {
  assertPhase2();
  const params = await searchParams;
  const draftId = params.draft ?? null;

  let seedDoc: NewsletterDoc | null = null;

  if (draftId) {
    try {
      const campaign = await prisma.newsletterCampaign.findUnique({
        where: { id: draftId },
        select: { subject: true, contentJson: true },
      });
      if (campaign?.contentJson) {
        seedDoc = campaign.contentJson as unknown as NewsletterDoc;
      }
    } catch {
      // DB down or draft missing — fallback to fresh doc
    }
  }

  return <ComposerClient seedDoc={seedDoc} draftId={draftId} />;
}
