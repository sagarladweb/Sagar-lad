"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";

export function ScrollAnimations() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  /* Phase 1: mark hydrated */
  useEffect(() => {
    setReady(true);
  }, []);

  /* Phase 2: run GSAP only after hydration + paint */
  useEffect(() => {
    if (!ready) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.body.classList.add("gsap-ready");
      document.querySelectorAll<HTMLElement>("[data-animate], [data-animate-item]").forEach((el) => {
        el.style.opacity = "1";
        el.style.filter = "none";
        el.style.transform = "none";
      });
      return;
    }

    let ctx: gsap.Context | null = null;
    let cancelled = false;
    let gsapInitialized = false;

    // Safety: if GSAP doesn't initialize within 1.5s, force .gsap-ready
    // so the CSS fallback animation kicks in immediately.
    const gsapTimeout = setTimeout(() => {
      if (!gsapInitialized && !cancelled) {
        document.body.classList.add("gsap-ready");
      }
    }, 1500);

    // Force all animated elements visible — used as safety net if GSAP fails
    function forceAllVisible() {
      document.querySelectorAll<HTMLElement>("[data-animate], [data-animate-item]").forEach((el) => {
        el.style.opacity = "1";
        el.style.filter = "none";
        el.style.transform = "none";
      });
    }

    // Double rAF: ensures GSAP runs after React hydration + browser paint
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (cancelled) return;

        try {
          ctx = gsap.context(() => {
            document.body.classList.add("gsap-ready");
            gsapInitialized = true;

            // ── Individual reveals ──────────────────────────────────────
            gsap.utils.toArray<HTMLElement>("[data-animate]").forEach((item) => {
              const variant = item.dataset.animate ?? "up";
              const delay = parseFloat(item.dataset.delay ?? "0");
              const reverse = item.hasAttribute("data-reverse");

              // Skip elements already visible (set by CSS fallback or reduced-motion)
              const cs = getComputedStyle(item);
              if (cs.opacity === "1" && cs.filter === "none") return;

              const to: gsap.TweenVars = (() => {
                switch (variant) {
                  case "image":
                    return { opacity: 1, scale: 1, duration: 1.1, ease: "power3.out" };
                  case "blur":
                    return { opacity: 1, filter: "blur(0px)", duration: 1, ease: "power2.out" };
                  default:
                    return { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "power3.out" };
                }
              })();

              const rect = item.getBoundingClientRect();
              const alreadyVisible = rect.top < window.innerHeight * 0.95 && rect.bottom > 0;

              if (alreadyVisible && delay === 0 && !reverse) {
                gsap.set(item, { opacity: 1, x: 0, y: 0, scale: 1, filter: "none" });
              } else {
                // Use .to() instead of .fromTo() — initial state is set via CSS
                gsap.to(item, {
                  ...to,
                  delay,
                  scrollTrigger: {
                    trigger: item,
                    start: "top 93%",
                    toggleActions: reverse ? "play none none reverse" : "play none none none",
                  },
                });
              }
            });

            // ── Staggered groups ────────────────────────────────────────
            gsap.utils.toArray<HTMLElement>("[data-animate-group]").forEach((group) => {
              const items = gsap.utils.toArray<HTMLElement>("[data-animate-item]", group);
              if (!items.length) return;

              const rect = group.getBoundingClientRect();
              const alreadyVisible = rect.top < window.innerHeight * 0.95 && rect.bottom > 0;

              if (alreadyVisible) {
                items.forEach((el) => {
                  el.style.opacity = "1";
                  el.style.filter = "none";
                  el.style.transform = "none";
                });
              } else {
                // Use .to() — initial state is set via CSS
                gsap.to(
                  items,
                  {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    duration: 0.75,
                    ease: "power3.out",
                    stagger: 0.1,
                    scrollTrigger: { trigger: group, start: "top 90%", toggleActions: "play none none none" },
                  }
                );
              }
            });

            // ── Parallax layers ─────────────────────────────────────────
            gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((layer) => {
              const speed = parseFloat(layer.dataset.parallax ?? "0.15");
              gsap.fromTo(
                layer,
                { y: `${-60 * speed}%` },
                {
                  y: `${60 * speed}%`,
                  ease: "none",
                  scrollTrigger: {
                    trigger: layer.closest("[data-parallax-wrap]") ?? layer,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.5,
                  },
                }
              );
            });
          });
        } catch {
          // GSAP failed — ensure all elements are visible via inline styles
          document.body.classList.add("gsap-ready");
          forceAllVisible();
        }
      });
    });

    return () => {
      cancelled = true;
      clearTimeout(gsapTimeout);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      document.body.classList.remove("gsap-ready");
      ctx?.revert();
    };
  }, [ready, pathname]);

  return null;
}
