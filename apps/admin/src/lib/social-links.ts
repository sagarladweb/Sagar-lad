import { cache } from "react";
import { prisma } from "@/lib/db";

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

export const getSiteSocials = cache(async (): Promise<SocialLink[]> => {
  let rows;
  try {
    rows = await prisma.socialLink.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  } catch (err) {
    console.warn("[social-links] DB unavailable, returning empty:", (err as Error).message);
    return [];
  }
  return rows
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
});
