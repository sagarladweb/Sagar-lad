"use client";

import { useEffect, useState } from "react";

export function LiveTotalBlogViews({ initialViews = 0 }: { initialViews?: number }) {
  const [views, setViews] = useState<number>(initialViews);

  useEffect(() => {
    let cancelled = false;

    async function fetchLiveViews() {
      try {
        const res = await fetch("/api/views", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && typeof data.totalViews === "number" && data.totalViews > 0) {
          setViews(data.totalViews);
        }
      } catch {
        // Fall back to current state
      }
    }

    fetchLiveViews();
    const interval = setInterval(fetchLiveViews, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <dd
      className="font-extrabold text-foreground text-base sm:text-lg tabular-nums inline-flex items-center justify-center sm:justify-start gap-1.5"
      title={`${views.toLocaleString()} total blog views`}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
        aria-hidden="true"
      />
      {views.toLocaleString()}
    </dd>
  );
}
