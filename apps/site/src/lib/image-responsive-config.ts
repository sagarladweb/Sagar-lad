// Centralized Responsive Image Configuration for Sagar Lad Website
// Automatically updated via /sandbox or calibrated per breakpoint

export type ImageAlignmentSetting = {
  x: number;
  y: number;
  scale: number;
};

export type ImageBreakpointConfig = {
  id: string;
  name: string;
  section: string;
  src: string;
  mobile: ImageAlignmentSetting;
  tablet: ImageAlignmentSetting;
  desktop: ImageAlignmentSetting;
  tailwind: string;
};

export const DEFAULT_IMAGE_CONFIGS: Record<string, ImageBreakpointConfig> = {
  "about-hero": {
    id: "about-hero",
    name: "About Me Hero",
    section: "About Page",
    src: "/images/heroes/sagar-lad-author-keynote-speaker-about-hero.webp",
    mobile: { x: 77, y: 38, scale: 100 },
    tablet: { x: 80, y: 40, scale: 100 },
    desktop: { x: 50, y: 45, scale: 100 },
    tailwind: "object-cover object-[77%_38%] sm:object-[80%_40%] lg:object-[50%_45%]",
  },
  "speaking-hero": {
    id: "speaking-hero",
    name: "Public Speaking Hero",
    section: "Speaking Page",
    src: "/images/heroes/Speaking_hero.webp",
    mobile: { x: 65, y: 42, scale: 100 },
    tablet: { x: 77, y: 45, scale: 100 },
    desktop: { x: 50, y: 50, scale: 100 },
    tailwind: "object-cover object-[65%_42%] sm:object-[77%_45%] lg:object-[50%_50%]",
  },
  "home-hero": {
    id: "home-hero",
    name: "Home Page Hero",
    section: "Homepage",
    src: "/images/heroes/sagar-lad-author-mentor-guide-home-hero.webp",
    mobile: { x: 76, y: 24, scale: 100 },
    tablet: { x: 88, y: 22, scale: 100 },
    desktop: { x: 0, y: 30, scale: 100 },
    tailwind: "object-cover object-[76%_24%] sm:object-[88%_22%] lg:object-[0%_30%]",
  },
  "about-quote": {
    id: "about-quote",
    name: "Mindset Quote Card",
    section: "About Page",
    src: "/images/about/sagar-lad-mindup-quote-inspiration.webp",
    mobile: { x: 70, y: 25, scale: 100 },
    tablet: { x: 68, y: 25, scale: 100 },
    desktop: { x: 68, y: 25, scale: 100 },
    tailwind: "object-cover object-[70%_25%] md:object-[68%_25%]",
  },
  "about-sagar": {
    id: "about-sagar",
    name: "About Sagar Section",
    section: "Homepage",
    src: "/images/about/sagar-lad-author-speaker-human-potential-about.webp",
    mobile: { x: 50, y: 25, scale: 100 },
    tablet: { x: 50, y: 25, scale: 100 },
    desktop: { x: 50, y: 25, scale: 100 },
    tailwind: "object-cover object-[50%_25%]",
  },
  "newsletter": {
    id: "newsletter",
    name: "Newsletter CTA",
    section: "Homepage",
    src: "/images/newsletter/sagar-lad-newsletter-mindset-coffee.webp",
    mobile: { x: 50, y: 20, scale: 100 },
    tablet: { x: 50, y: 20, scale: 100 },
    desktop: { x: 50, y: 18, scale: 100 },
    tailwind: "object-cover object-[50%_20%] md:object-[50%_18%]",
  },
  "casual-1": {
    id: "casual-1",
    name: "Friend Sagar 1 (Casual)",
    section: "Homepage Gallery",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-1.webp",
    mobile: { x: 50, y: 30, scale: 100 },
    tablet: { x: 50, y: 30, scale: 100 },
    desktop: { x: 50, y: 30, scale: 100 },
    tailwind: "object-cover object-[50%_30%]",
  },
  "casual-2": {
    id: "casual-2",
    name: "Friend Sagar 2 (Casual)",
    section: "Homepage Gallery",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-2.webp",
    mobile: { x: 50, y: 25, scale: 100 },
    tablet: { x: 50, y: 25, scale: 100 },
    desktop: { x: 50, y: 25, scale: 100 },
    tailwind: "object-cover object-[50%_25%]",
  },
  "casual-3": {
    id: "casual-3",
    name: "Friend Sagar 3 (Casual)",
    section: "Homepage Gallery",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-3.webp",
    mobile: { x: 50, y: 30, scale: 100 },
    tablet: { x: 50, y: 30, scale: 100 },
    desktop: { x: 50, y: 30, scale: 100 },
    tailwind: "object-cover object-[50%_30%]",
  },
  "casual-4": {
    id: "casual-4",
    name: "Friend Sagar 4 (Casual)",
    section: "Homepage Gallery",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-4.webp",
    mobile: { x: 50, y: 35, scale: 100 },
    tablet: { x: 50, y: 35, scale: 100 },
    desktop: { x: 50, y: 35, scale: 100 },
    tailwind: "object-cover object-[50%_35%]",
  },
  "casual-5": {
    id: "casual-5",
    name: "Friend Sagar 5 (Casual)",
    section: "Homepage Gallery",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-5.webp",
    mobile: { x: 50, y: 25, scale: 100 },
    tablet: { x: 50, y: 25, scale: 100 },
    desktop: { x: 50, y: 25, scale: 100 },
    tailwind: "object-cover object-[50%_25%]",
  },
  "contact-hero": {
    id: "contact-hero",
    name: "Contact Hero Portrait",
    section: "Contact Page",
    src: "/images/contact/sagar-lad-keynote-speaker-contact-portrait.png",
    mobile: { x: 50, y: 50, scale: 100 },
    tablet: { x: 50, y: 50, scale: 100 },
    desktop: { x: 50, y: 50, scale: 100 },
    tailwind: "object-contain object-center",
  },
};
