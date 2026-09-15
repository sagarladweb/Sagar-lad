import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma, dbSafe } from "@/lib/db";

export type LifeRazorData = {
  id: string;
  pill: string;
  heading: string;
  accent: string;
  description: string;
};

const DEFAULT_LIFERAZOR: LifeRazorData = {
  id: "default",
  pill: "Current Life Razor",
  heading: "Be Dumb.",
  accent: "Don't worry about what others think.",
  description:
    'A razor is a rule you cut your life with. Mine is a reminder to stay curious, keep asking the "dumb" questions, and never let the noise of other people\'s opinions decide my next step.',
};

const getLifeRazorCached = unstable_cache(
  async (): Promise<LifeRazorData> => {
    const row = await dbSafe(() =>
      prisma.lifeRazor.findUnique({ where: { id: "default" } }),
      null
    );
    if (!row) return DEFAULT_LIFERAZOR;
    return {
      id: row.id,
      pill: row.pill,
      heading: row.heading,
      accent: row.accent,
      description: row.description,
    };
  },
  ["site-liferazor-v1"],
  { revalidate: 300, tags: ["liferazor"] }
);

export const getLifeRazor = cache(async (): Promise<LifeRazorData> => {
  return getLifeRazorCached();
});
