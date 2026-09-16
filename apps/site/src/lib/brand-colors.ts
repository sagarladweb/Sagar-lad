/**
 * Sagar Lad Brand Colors
 * ──────────────────────
 * Blue: #0d21a1 (primary brand)
 * Yellow: #ffd51d (accent)
 *
 * Usage:
 *   import { brandColors } from "@/lib/brand-colors";
 *   console.log brandColors.blue.hex); // "#0d21a1"
 */

export const brandColors = {
  blue: {
    hex: "#0d21a1",
    rgb: "rgb(13, 33, 161)",
    hsl: "hsl(232, 85%, 34%)",
    tailwind: "bg-[#0d21a1] text-[#0d21a1] border-[#0d21a1]",
    css: "var(--brand)",
  },
  yellow: {
    hex: "#ffd51d",
    rgb: "rgb(255, 213, 29)",
    hsl: "hsl(48, 100%, 56%)",
    tailwind: "bg-[#ffd51d] text-[#ffd51d] border-[#ffd51d]",
    css: "var(--accent)",
  },
  blueLight: {
    hex: "#3f88c5",
    rgb: "rgb(63, 136, 197)",
    hsl: "hsl(207, 50%, 51%)",
    tailwind: "bg-[#3f88c5] text-[#3f88c5] border-[#3f88c5]",
    css: "var(--brand-light)",
  },
} as const;
