import { DESIGNATION } from "@/lib/site";

export type HeroImageKey = "hero_sagar_lad" | "hero_home";

export interface HeroPreset {
  key: HeroImageKey;
  label: string;
  imageUrl: string;
  mobilePosition: string;
  tabletPosition: string;
  desktopPosition: string;
}

export const HERO_PRESETS: Record<HeroImageKey, HeroPreset> = {
  hero_sagar_lad: {
    key: "hero_sagar_lad",
    label: "Classic Studio Portrait",
    imageUrl: "/images/heroes/hero_sagar_lad.webp",
    mobilePosition: "object-[66%_32%]",
    tabletPosition: "sm:object-[61%_24%]",
    desktopPosition: "lg:object-[0%_43%]",
  },
  hero_home: {
    key: "hero_home",
    label: "Executive Modern Suite",
    imageUrl: "/images/heroes/hero_home.webp",
    mobilePosition: "object-[76%_24%]",
    tabletPosition: "sm:object-[88%_22%]",
    desktopPosition: "lg:object-[0%_30%]",
  },
};

export interface HomeHeroData {
  id: string;
  activeImage: HeroImageKey;
  imageUrl: string;
  mobilePosition: string;
  tabletPosition: string;
  desktopPosition: string;
  designation: string;
  title: string;
  subtitle: string;
  tagline1: string;
  tagline2: string;
  tagline3: string;
}

export const DEFAULT_HOME_HERO: HomeHeroData = {
  id: "default",
  activeImage: "hero_sagar_lad",
  imageUrl: HERO_PRESETS.hero_sagar_lad.imageUrl,
  mobilePosition: HERO_PRESETS.hero_sagar_lad.mobilePosition,
  tabletPosition: HERO_PRESETS.hero_sagar_lad.tabletPosition,
  desktopPosition: HERO_PRESETS.hero_sagar_lad.desktopPosition,
  designation: DESIGNATION,
  title: "Sagar Lad",
  subtitle: "Your friend, mentor and Guide",
  tagline1: "MIND UP",
  tagline2: "Change your MIND",
  tagline3: "Change your life",
};
