/**
 * Branding Configuration
 * ──────────────────────
 * Toggle `enabled` to switch between custom brand colors and defaults.
 * When disabled, the site falls back to the hardcoded CSS variables in globals.css.
 *
 * Colors are applied via CSS custom properties on <body> when enabled.
 */

export const branding = {
  /** Master toggle — set false to revert to default theme */
  enabled: true,

  light: {
    background: "#FAFAF8",
    foreground: "#000000",
    card: "#FAFAF8",
    cardForeground: "#000000",
    muted: "#f4f4f2",
    mutedForeground: "#6b6a63",
    accent: "#ffd51d",
    accentForeground: "#000000",
    accentStrong: "#0d21a1",
    brand: "#0d21a1",
    brandLight: "#3f88c5",
    border: "#e5e4e0",
  },

  dark: {
    background: "#0e0e10",
    foreground: "#f5f4f0",
    card: "#16161a",
    cardForeground: "#f5f4f0",
    muted: "#1f1f24",
    mutedForeground: "#9a998f",
    accent: "#ffd51d",
    accentForeground: "#000000",
    accentStrong: "#3f88c5",
    brand: "#3f88c5",
    brandLight: "#7fa8d9",
    border: "#26262c",
  },
} as const;

export type BrandingTheme = typeof branding.light;
