import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Hire Sagar Lad — Keynote Speaker & Book Writing Services",
  description:
    "Hire Sagar Lad for keynotes, workshops, executive panels, book writing, ghostwriting, and content development. Fast 24–48h turnaround. Direct inquiry.",
  path: "/hire-me",
});

export default function HireMeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
