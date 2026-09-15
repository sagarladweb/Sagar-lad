"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function LazySection({ children, delay = 0, className }: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const timer = setTimeout(() => {
      el.classList.add("lazy-visible");
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div ref={ref} className={`lazy-section ${className ?? ""}`}>
      {children}
    </div>
  );
}
