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
    label: "Executive Modern Suite",
    imageUrl: "/images/heroes/sagar-lad-author-mentor-guide-home-hero.webp",
    mobilePosition: "object-[76%_24%]",
    tabletPosition: "sm:object-[88%_22%]",
    desktopPosition: "lg:object-[0%_30%]",
  },
  hero_home: {
    key: "hero_home",
    label: "Executive Modern Suite",
    imageUrl: "/images/heroes/sagar-lad-author-mentor-guide-home-hero.webp",
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
  activeImage: "hero_home",
  imageUrl: "/images/heroes/sagar-lad-author-mentor-guide-home-hero.webp",
  mobilePosition: "object-[76%_24%]",
  tabletPosition: "sm:object-[88%_22%]",
  desktopPosition: "lg:object-[0%_30%]",
  designation: "Author · Public Speaker · Human Potential Advocate",
  title: "Sagar Lad",
  subtitle: "Your friend, mentor and Guide",
  tagline1: "MIND UP",
  tagline2: "Change your MIND",
  tagline3: "Change your life",
};
