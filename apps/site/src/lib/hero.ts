import "server-only";
import { cache } from "react";
import {
  HERO_PRESETS,
  DEFAULT_HOME_HERO,
  type HomeHeroData,
  type HeroImageKey,
} from "./hero-types";

export * from "./hero-types";

// Static Home Hero without database query overhead
export const getHomeHero = cache(async (): Promise<HomeHeroData> => {
  return DEFAULT_HOME_HERO;
});
