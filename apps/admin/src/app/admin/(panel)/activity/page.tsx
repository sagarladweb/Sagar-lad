import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { getActivityHistory } from "@/lib/content";
import { activityLabel, timeAgo, DEVICE_ACTIONS } from "@/lib/activity";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ActivityPage() {
  const { entries, total } = await getActivityHistory(0, 200);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Activity History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} {total === 1 ? "event" : "events"} recorded
          </p>
        </div>
      </header>

      {/* Activity list */}
      <Card>
        {entries.length === 0 ? (
          <div className="py-12 text-center">
            <RefreshCw className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium truncate">{activityLabel(a.action)}</span>
                    {DEVICE_ACTIONS.has(a.action) && a.device && (
                      <span className="block text-xs text-muted-foreground truncate">{a.device}</span>
                    )}
                  </span>
                </div>
                <div className="shrink-0 flex items-center gap-4 text-xs text-muted-foreground">
                  {a.ip && <span className="tabular-nums">{a.ip}</span>}
                  <span className="tabular-nums whitespace-nowrap" title={formatDate(a.createdAt)}>
                    {timeAgo(a.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
