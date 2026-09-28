"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

// Storage key bumped (v2) so the old OS-following default saved earlier
// doesn't stick — fresh visitors now start in dark unless they pick light.
const STORE_KEY = "reading-theme-v2";

// One-button reading toggle: light ⇄ dark. The theme lives on <body> so the
// whole viewport goes dark (not just the article column), and it persists in
// localStorage so every article opens in the chosen theme.
export function ReadingToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  function apply(t: Theme) {
    document.body.dataset.readingTheme = t;
    try {
      localStorage.setItem(STORE_KEY, t);
    } catch {}
  }

  useEffect(() => {
    // Dark is the default reading experience; an explicit light choice wins.
    let initial: Theme = "dark";
    try {
      const saved = localStorage.getItem(STORE_KEY);
      initial = saved === "light" ? "light" : "dark";
    } catch {}
    setTheme(initial);
    apply(initial);
    // Leaving the article: drop the theme so the rest of the site (/blog,
    // home, …) always renders in the default light theme.
    return () => {
      delete document.body.dataset.readingTheme;
    };
  }, []);

  function switchTo(next: Theme) {
    setTheme(next);
    apply(next);
  }

  const next = theme === "light" ? "dark" : "light";
  return (
    <button
      type="button"
      onClick={() => switchTo(next)}
      title={`Switch to ${next} mode`}
      aria-label={`Switch to ${next} mode`}
      aria-pressed={theme === "dark"}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all duration-150 hover:text-foreground active:scale-95"
    >
      {theme === "light" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
    </button>
  );
}
