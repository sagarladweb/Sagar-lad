import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma, dbSafe } from "@/lib/db";
import { DESIGNATION } from "@/lib/site";
import {
  HERO_PRESETS,
  DEFAULT_HOME_HERO,
  type HomeHeroData,
  type HeroImageKey,
} from "./hero-types";

export * from "./hero-types";

const getHomeHeroCached = unstable_cache(
  async (): Promise<HomeHeroData> => {
    const row = await dbSafe(
      () => prisma.homeHero.findUnique({ where: { id: "default" } }),
      null
    );
    if (!row) return DEFAULT_HOME_HERO;
    const activeKey = (row.activeImage as HeroImageKey) in HERO_PRESETS
      ? (row.activeImage as HeroImageKey)
      : "hero_sagar_lad";
    const preset = HERO_PRESETS[activeKey] ?? HERO_PRESETS.hero_sagar_lad;

    return {
      id: row.id,
      activeImage: activeKey,
      imageUrl: row.imageUrl || preset.imageUrl,
      mobilePosition: row.mobilePosition || preset.mobilePosition,
      tabletPosition: row.tabletPosition || preset.tabletPosition,
      desktopPosition: row.desktopPosition || preset.desktopPosition,
      designation: row.designation || "Author · Public Speaker · Human Potential Advocate",
      title: row.title || "Sagar Lad",
      subtitle: row.subtitle || "Your friend, mentor and Guide",
      tagline1: row.tagline1 || "MIND UP",
      tagline2: row.tagline2 || "Change your MIND",
      tagline3: row.tagline3 || "Change your life",
    };
  },
  ["site-home-hero-v1"],
  { revalidate: process.env.NODE_ENV === "production" ? 300 : 0, tags: ["hero"] }
);

export const getHomeHero = cache(async (): Promise<HomeHeroData> => {
  return getHomeHeroCached();
});
