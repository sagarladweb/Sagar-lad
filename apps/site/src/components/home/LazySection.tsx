"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  className?: string;
}

export function LazySection({ children, className }: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.setAttribute("data-lazy-init", "");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("lazy-visible");
        } else {
          el.classList.remove("lazy-visible");
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`lazy-section ${className ?? ""}`}>
      {children}
    </div>
  );
}
