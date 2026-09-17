"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // Only force scroll on actual route changes, not same-page updates
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
    }

    // Aggressive: scroll immediately, then again after paint to beat GSAP/ScrollTrigger
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      // One more after next frame to catch late recalculations
      requestAnimationFrame(() => {
        if (window.scrollY !== 0) window.scrollTo(0, 0);
      });
    });
  }, [pathname]);

  return null;
}
