import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About Sagar Lad — Author, TEDx Speaker & Creator of MIND UP",
  description:
    "Sagar Lad is a TEDx speaker, published author, and creator of the MINDUP Framework. His journey from rock bottom to building a global community around The MIND UP Theory — on mindset, habits, and intentional living.",
  path: "/about",
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
