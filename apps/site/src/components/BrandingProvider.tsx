"use client";

import { useEffect } from "react";
import { branding } from "@/lib/branding";

/**
 * Injects branding colors as CSS custom properties when enabled.
 * Mount once in the root layout.
 */
export function BrandingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!branding.enabled) return;

    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    const theme = isDark ? branding.dark : branding.light;

    root.style.setProperty("--background", theme.background);
    root.style.setProperty("--foreground", theme.foreground);
    root.style.setProperty("--card", theme.card);
    root.style.setProperty("--card-foreground", theme.cardForeground);
    root.style.setProperty("--muted", theme.muted);
    root.style.setProperty("--muted-foreground", theme.mutedForeground);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-foreground", theme.accentForeground);
    root.style.setProperty("--accent-strong", theme.accentStrong);
    root.style.setProperty("--brand", theme.brand);
    root.style.setProperty("--brand-light", theme.brandLight);
    root.style.setProperty("--border", theme.border);

    return () => {
      // Reset on unmount so defaults take over
      const keys = [
        "--background", "--foreground", "--card", "--card-foreground",
        "--muted", "--muted-foreground", "--accent", "--accent-foreground",
        "--accent-strong", "--brand", "--brand-light", "--border",
      ];
      keys.forEach((k) => root.style.removeProperty(k));
    };
  }, []);

  return <>{children}</>;
}
