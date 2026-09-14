import { redirect } from "next/navigation";

// Phase 1 delivery = Dashboard, Posts, Content, Settings.
// Phase 2+ unlocks CMS, Announcement, Newsletter, Community.
// If ADMIN_PHASE is "2", Phase 2 is unlocked. Otherwise defaults to Phase 1 ("1").
export const PHASE_1 = process.env.ADMIN_PHASE !== "2";

// Guard for Phase-2-only pages/routes so a direct URL still redirects to dashboard.
export function assertPhase2() {
  if (PHASE_1) redirect("/admin/dashboard");
}
