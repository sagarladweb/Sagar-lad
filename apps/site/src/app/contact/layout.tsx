import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact Sagar Lad — Speaking, Writing & Collaboration",
  description:
    "Reach out to Sagar Lad for speaking engagements, book collaborations, mentorship inquiries, or general questions. Response within 24–48 hours.",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
