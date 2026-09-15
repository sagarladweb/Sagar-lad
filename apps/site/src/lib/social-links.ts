import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma, dbSafe } from "@/lib/db";

export type SocialLink = {
  id: string;
  key: string;
  label: string;
  handle: string | null;
  href: string;
  icon: string;
  logoUrl: string | null;
  color: string | null;
  sortOrder: number;
};

const getSiteSocialsCached = unstable_cache(
  async (): Promise<SocialLink[]> => {
    const rows = await dbSafe(
      () =>
        prisma.socialLink.findMany({
          where: { active: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        }),
      []
    );
    return (rows ?? [])
      .filter(
        (r) =>
          r.key.toLowerCase() !== "telegram" &&
          r.label.toLowerCase() !== "telegram" &&
          r.icon.toLowerCase() !== "telegram"
      )
      .map((r) => ({
        id: r.id,
        key: r.key,
        label: r.label,
        handle: r.handle,
        href: r.href,
        icon: r.icon,
        logoUrl: r.logoUrl,
        color: r.color,
        sortOrder: r.sortOrder,
      }));
  },
  ["site-socials-v1"],
  { revalidate: 300, tags: ["socials"] }
);

export const getSiteSocials = cache(async (): Promise<SocialLink[]> => {
  return getSiteSocialsCached();
});
