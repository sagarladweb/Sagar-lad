import type { Metadata } from "next";
import MindUpScoreClient from "./MindUpScoreClient";

export const metadata: Metadata = {
  title: "MIND UP Score Assessment | Sagar Lad",
  description:
    "Discover your personal MIND UP score across 6 core life dimensions: Mindset, Health, Relationships, Skills & Work, Potential, and Progress. Take the 2-minute assessment.",
  openGraph: {
    title: "MIND UP Score Assessment | Sagar Lad",
    description:
      "Discover your personal MIND UP score across 6 core life dimensions: Mindset, Health, Relationships, Skills & Work, Potential, and Progress. Take the 2-minute assessment.",
    url: "https://sagarlad.com/mindup-score",
    siteName: "Sagar Lad",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MIND UP Score Assessment | Sagar Lad",
    description:
      "Discover your personal MIND UP score across 6 core life dimensions. Take the 2-minute assessment.",
  },
};

export default function MindUpScorePage() {
  return <MindUpScoreClient />;
}
