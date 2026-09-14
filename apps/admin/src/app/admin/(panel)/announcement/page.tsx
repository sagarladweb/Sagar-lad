import { AnnouncementManager } from "@/components/admin/AnnouncementManager";
import { assertPhase2 } from "@/lib/phase";

export const metadata = { title: "Announcement · Sagar Lad Admin" };
export const dynamic = "force-dynamic";

export default function AnnouncementPage() {
  assertPhase2();
  return (
    <div className="h-full">
      <AnnouncementManager />
    </div>
  );
}
