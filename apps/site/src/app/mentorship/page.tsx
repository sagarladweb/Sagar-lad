import type { Metadata } from "next";
import Image from "next/image";
import { SITE, pageMetadata } from "@/lib/site";
import { getProfileAvatar } from "@/lib/profile";
import { JsonLd } from "@/components/JsonLd";
import { MentorshipClient } from "./MentorshipClient";

export const metadata: Metadata = pageMetadata({
  title: "1:1 Mentorship with Sagar Lad — Mindset, Career & Productivity",
  description:
    "Book a 1:1 mentorship session with Sagar Lad — direct guidance on mindset, career direction, productivity, and the MINDUP Framework. Practical, honest, no fluff.",
  path: "/mentorship",
});

export const revalidate = 604800;

export default async function MentorshipPage() {
  const profile = await getProfileAvatar();
  return (
    <div className="bg-background overflow-x-clip">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Mentorship", item: `${SITE.url}/mentorship` },
          ],
        }}
      />
      <MentorshipClient profileImage={profile.image} />
    </div>
  );
}
