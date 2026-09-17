"use client";

import { useEffect } from "react";

/**
 * Fires the heartbeat on mount (client-side, non-blocking).
 * Replaces the server-side heartbeat() call in layout.tsx
 * so page render is never blocked by DB retries.
 */
export function HeartbeatMarker() {
  useEffect(() => {
    fetch("/api/cron/keepalive", { method: "GET" }).catch(() => {});
  }, []);
  return null;
}
