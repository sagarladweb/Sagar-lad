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
    "id": "about-hero",
    "name": "About Me Hero",
    "section": "About Page",
    "src": "/images/heroes/sagar-lad-author-keynote-speaker-about-hero.webp",
    "mobile": {
      "x": 79,
      "y": 38,
      "scale": 100
    },
    "tablet": {
      "x": 71,
      "y": 27,
      "scale": 103
    },
    "desktop": {
      "x": 70,
      "y": 35,
      "scale": 103
    },
    "tailwind": "object-cover object-[79%_38%] sm:object-[71%_27%] lg:object-[70%_35%]"
  },
  "speaking-hero": {
    "id": "speaking-hero",
    "name": "Public Speaking Hero",
    "section": "Speaking Page",
    "src": "/images/heroes/Speaking_hero.webp",
    "mobile": {
      "x": 65,
      "y": 48,
      "scale": 100
    },
    "tablet": {
      "x": 64,
      "y": 50,
      "scale": 101
    },
    "desktop": {
      "x": 65,
      "y": 52,
      "scale": 101
    },
    "tailwind": "object-cover object-[65%_48%] sm:object-[64%_50%] lg:object-[65%_52%]"
  },
  "home-hero": {
    "id": "home-hero",
    "name": "Home Page Hero",
    "section": "Homepage",
    "src": "/images/heroes/sagar-lad-author-mentor-guide-home-hero.webp",
    "mobile": {
      "x": 74,
      "y": 50,
      "scale": 100
    },
    "tablet": {
      "x": 83,
      "y": 50,
      "scale": 100
    },
    "desktop": {
      "x": 66,
      "y": 48,
      "scale": 101
    },
    "tailwind": "object-cover object-[74%_center] sm:object-[83%_center] lg:object-[66%_48%]"
  },
  "about-quote": {
    "id": "about-quote",
    "name": "Mindset Quote Card",
    "section": "About Page",
    "src": "/images/about/sagar-lad-mindup-quote-inspiration.webp",
    "mobile": {
      "x": 88,
      "y": 60,
      "scale": 115
    },
    "tablet": {
      "x": 76,
      "y": 55,
      "scale": 104
    },
    "desktop": {
      "x": 83,
      "y": 65,
      "scale": 117
    },
    "tailwind": "object-cover object-[88%_60%] sm:object-[76%_55%] lg:object-[83%_65%]"
  },
  "about-sagar": {
    "id": "about-sagar",
    "name": "About Sagar Section",
    "section": "Homepage",
    "src": "/images/about/sagar-lad-author-speaker-human-potential-about.webp",
    "mobile": {
      "x": 50,
      "y": 50,
      "scale": 100
    },
    "tablet": {
      "x": 50,
      "y": 50,
      "scale": 100
    },
    "desktop": {
      "x": 50,
      "y": 50,
      "scale": 100
    },
    "tailwind": "object-cover object-center"
  },
  "newsletter": {
    "id": "newsletter",
    "name": "Newsletter CTA",
    "section": "Homepage",
    "src": "/images/newsletter/sagar-lad-newsletter-mindset-coffee.webp",
    "mobile": {
      "x": 43,
      "y": 20,
      "scale": 98
    },
    "tablet": {
      "x": 47,
      "y": 24,
      "scale": 100
    },
    "desktop": {
      "x": 46,
      "y": 23,
      "scale": 100
    },
    "tailwind": "object-cover object-[43%_20%] sm:object-[47%_24%] lg:object-[46%_23%]"
  },
  "casual-1": {
    "id": "casual-1",
    "name": "Friend Sagar 1 (Casual)",
    "section": "Homepage Gallery",
    "src": "/images/profile/sagar-lad-friend-mentor-casual-outdoor-1.webp",
    "mobile": {
      "x": 52,
      "y": 42,
      "scale": 100
    },
    "tablet": {
      "x": 50,
      "y": 44,
      "scale": 100
    },
    "desktop": {
      "x": 50,
      "y": 46,
      "scale": 104
    },
    "tailwind": "object-cover object-[52%_42%] sm:object-[50%_44%] lg:object-[50%_46%]"
  },
  "casual-2": {
    "id": "casual-2",
    "name": "Friend Sagar 2 (Casual)",
    "section": "Homepage Gallery",
    "src": "/images/profile/sagar-lad-friend-mentor-casual-outdoor-2.webp",
    "mobile": {
      "x": 50,
      "y": 59,
      "scale": 100
    },
    "tablet": {
      "x": 50,
      "y": 60,
      "scale": 100
    },
    "desktop": {
      "x": 50,
      "y": 62,
      "scale": 100
    },
    "tailwind": "object-cover object-[50%_59%] sm:object-[50%_60%] lg:object-[50%_62%]"
  },
  "casual-3": {
    "id": "casual-3",
    "name": "Friend Sagar 3 (Casual)",
    "section": "Homepage Gallery",
    "src": "/images/profile/sagar-lad-friend-mentor-casual-outdoor-3.webp",
    "mobile": {
      "x": 18,
      "y": 53,
      "scale": 103
    },
    "tablet": {
      "x": 28,
      "y": 59,
      "scale": 100
    },
    "desktop": {
      "x": 50,
      "y": 58,
      "scale": 100
    },
    "tailwind": "object-cover object-[18%_53%] sm:object-[28%_59%] lg:object-[50%_58%]"
  },
  "casual-friend": {
    "id": "casual-friend",
    "name": "Friend Sagar (Nirvana)",
    "section": "Homepage Gallery",
    "src": "/images/profile/sagar-lad-friend-mentor-casual-outdoor-friend.webp",
    "mobile": {
      "x": 50,
      "y": 25,
      "scale": 100
    },
    "tablet": {
      "x": 50,
      "y": 25,
      "scale": 100
    },
    "desktop": {
      "x": 50,
      "y": 25,
      "scale": 100
    },
    "tailwind": "object-cover object-[50%_25%]"
  },
  "contact-hero": {
    "id": "contact-hero",
    "name": "Contact Hero Portrait",
    "section": "Contact Page",
    "src": "/images/contact/sagar-lad-keynote-speaker-contact-portrait.png",
    "mobile": {
      "x": 51,
      "y": 61,
      "scale": 100
    },
    "tablet": {
      "x": 51,
      "y": 58,
      "scale": 100
    },
    "desktop": {
      "x": 52,
      "y": 34,
      "scale": 100
    },
    "tailwind": "object-cover object-[51%_61%] sm:object-[51%_58%] lg:object-[52%_34%]"
  }
};
