import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { QuizClient } from "@/components/mindup/QuizClient";

export const metadata: Metadata = {
  title: `MindUp Score — ${SITE.name}`,
  description:
    "Discover your MindUp Score. Take a quick 6-question assessment to find out which pillars of life you dominate and where you can grow.",
  alternates: { canonical: `${SITE.url}/mindup-score` },
  openGraph: {
    title: `MindUp Score — ${SITE.name}`,
    description:
      "Discover which pillars of the MindUp Theory you dominate and where you can grow.",
    url: `${SITE.url}/mindup-score`,
    type: "website",
    siteName: SITE.name,
  },
};

export default function MindUpScorePage() {
  return <QuizClient />;
}
