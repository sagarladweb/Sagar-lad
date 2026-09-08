"use client";

import { useEffect } from "react";

export function ViewTracker({ postSlug }: { postSlug: string }) {
  useEffect(() => {
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postSlug }),
    }).catch(() => {});
  }, [postSlug]);

  return null;
}
