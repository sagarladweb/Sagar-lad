"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const keyFor = (path: string) => `sl-scroll:${path}`;

function readSaved(path: string): number | null {
  try {
    const raw = sessionStorage.getItem(keyFor(path));
    if (raw == null) return null;
    const y = parseInt(raw, 10);
    return Number.isFinite(y) && y > 0 ? y : null;
  } catch {
    return null;
  }
}

// Any reload (normal or hard) wipes the memory — only true in-session
// navigations (links, back/forward) may restore.
function wipeIfReloaded() {
  try {
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav?.type !== "reload") return;
    const dead: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k?.startsWith("sl-scroll:") || k === "sl-stack") dead.push(k);
    }
    dead.forEach((k) => sessionStorage.removeItem(k));
  } catch {}
}

// Visit stack (capped) mirroring history. Lets a fresh full-document load
// tell "back to the previous page" apart from "forward link", where no
// popstate can ever arrive.
function readStack(): string[] {
  try {
    const raw = JSON.parse(sessionStorage.getItem("sl-stack") ?? "[]") as unknown;
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function pushStack(path: string) {
  try {
    const stack = readStack();
    if (stack[stack.length - 1] === path) return;
    sessionStorage.setItem("sl-stack", JSON.stringify([...stack, path].slice(-20)));
  } catch {}
}

function save(path: string) {
  try {
    sessionStorage.setItem(keyFor(path), String(window.scrollY));
  } catch {}
}

// Per-page scroll memory (this tab only — a reload wipes it).
// Forward navigation (links, CTAs) always starts at the top. Only
// back/forward-button traversals restore the remembered position.
let traverseArmed = false;

export function ScrollToTop() {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  // Enforcement window: while active, late top-scrollers (framework,
  // animations, images) get overridden — until the user scrolls manually.
  const enforceUntil = useRef(0);
  const enforceTarget = useRef(0);
  const programmaticAt = useRef(0);

  function goTo(y: number, enforceMs: number) {
    enforceTarget.current = y;
    programmaticAt.current = Date.now();
    // Instant: the stylesheet sets smooth scrolling, which would fight
    // rapid re-asserts and capture mid-animation positions.
    window.scrollTo({ top: y, behavior: "instant" });
    if (enforceMs > 0) enforceUntil.current = Date.now() + enforceMs;
  }

  // Track the settled scroll position under the current path. Debounced
  // (not throttled) so smooth-scroll glides never snapshot mid-animation.
  // Back/forward buttons fire popstate; link/CTA clicks don't — that's how
  // "going back" (restore) is told apart from "going somewhere" (top).
  useEffect(() => {
    const onPopState = () => {
      traverseArmed = true;
    };
    window.addEventListener("popstate", onPopState);
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      // Manual scroll by the user cancels any enforcement in progress.
      if (Date.now() - programmaticAt.current > 120) enforceUntil.current = 0;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        save(pathRef.current);
      }, 250);
    };
    // Final save when the tab hides (mobile back-swipes, tab switches).
    const onHide = () => save(pathRef.current);
    // Re-assert the target while the enforcement window is open.
    const guard = window.setInterval(() => {
      if (Date.now() > enforceUntil.current) return;
      if (Math.abs(window.scrollY - enforceTarget.current) > 4) {
        goTo(enforceTarget.current, 0);
      }
    }, 150);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      window.clearInterval(guard);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Route changes: back/forward restores, everything else starts at top.
  // lastPath tracks committed navigations so remounts (StrictMode, Fast
  // Refresh) can re-assert instead of wiping or misreading state.
  const lastPath = useRef<string | null>(null);
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    // A stale enforcement window from the previous page must never leak
    // onto the new one (that stranded fresh pages mid-scroll).
    enforceUntil.current = 0;
    // Anchor navigations are the browser's job — never interfere.
    if (window.location.hash) {
      lastPath.current = pathname;
      pathRef.current = pathname;
      pushStack(pathname);
      traverseArmed = false;
      return;
    }

    const prev = lastPath.current;
    if (prev == null) {
      // Fresh full load. A reload (normal or hard) starts blank.
      wipeIfReloaded();
    } else if (prev !== pathname) {
      // Genuine in-app navigation: persist the page we're leaving.
      save(prev);
    }
    // NOTE: same-path remounts save nothing (scrollY may be mid-restore).

    let wantRestore = false;
    if (prev == null || prev === pathname) {
      // Fresh load or remount: the visit stack tells back apart from
      // forward. popstate never reaches full-load documents, and SPA
      // navigations always change the path, so this branch can't
      // misclassify a forward link.
      try {
        const stack = readStack();
        wantRestore =
          stack[stack.length - 1] === pathname ||
          stack[stack.length - 2] === pathname;
      } catch {}
    } else {
      // In-app navigation: only a back/forward traversal (popstate) restores.
      wantRestore = traverseArmed;
      traverseArmed = false;
    }

    lastPath.current = pathname;
    pathRef.current = pathname;
    pushStack(pathname);

    const saved = wantRestore ? readSaved(pathname) : null;
    const targetY = saved ?? 0;
    // Enforce briefly (restores only) so late layout/animation resets can't
    // strand us elsewhere. Forward visits stay free for immediate scrolling.
    // 4s covers slow image/layout settles on long pages.
    const guardMs = saved != null ? 4000 : 0;
    goTo(targetY, guardMs);
    requestAnimationFrame(() => {
      goTo(targetY, guardMs);
      requestAnimationFrame(() => {
        if (Math.abs(window.scrollY - targetY) > 2) goTo(targetY, guardMs);
      });
    });
  }, [pathname]);

  return null;
}
