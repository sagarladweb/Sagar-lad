"use client";

import { useCallback, useEffect, useState } from "react";
import { ArchiveRestore, Trash2, Clock, Inbox } from "lucide-react";
import { showToast } from "@/components/admin/Toast";
import { showConfirm } from "@/components/admin/ConfirmDialog";
import { Button, IconButton } from "@/components/ui/Button";

type TrashRow = {
  id: string;
  entityType: string;
  title: string;
  createdAt: string;
  daysLeft: number;
  kind: "trash";
};

type PostRow = {
  id: string;
  title: string;
  slug: string;
  views: number;
  likes: number;
  deletedAt: string;
  daysLeft: number;
  kind: "post";
};

const TYPE_LABELS: Record<string, string> = {
  POST: "Post",
  ANNOUNCEMENT: "Announcement",
  BOOK: "Book",
  VIDEO: "Video",
  QUOTE: "Quote",
  CATEGORY: "Category",
  CAMPAIGN: "Campaign",
  SUBSCRIBER: "Subscriber",
  COMMENT: "Comment",
  ENQUIRY: "Enquiry",
};

function DaysLeft({ days }: { days: number }) {
  const urgent = days <= 3;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
        urgent
          ? "bg-red-500/10 text-red-600"
          : "bg-muted text-muted-foreground"
      }`}
      title="Permanently deleted after 15 days"
    >
      <Clock className="w-3 h-3" />
      {days}d left
    </span>
  );
}

export function ArchiveClient() {
  const [items, setItems] = useState<TrashRow[]>([]);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/trash");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.items ?? []);
      setPosts(data.posts ?? []);
    } catch {
      showToast("Could not load archive", undefined, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(action: "restore" | "purge", kind: "trash" | "post", id: string, title: string) {
    const ok = await showConfirm({
      title: action === "restore" ? "Restore this item?" : "Delete forever?",
      message:
        action === "restore"
          ? `Restore "${title}" back to where it was?`
          : `Permanently delete "${title}"? This cannot be undone — it will never be recoverable.`,
      confirmLabel: action === "restore" ? "Restore" : "Delete forever",
    });
    if (!ok) return;
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, kind, id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed");
      showToast(
        action === "restore" ? "Restored successfully" : "Permanently deleted",
        undefined,
        action === "restore" ? "success" : "info"
      );
      await load();
    } catch (err) {
      showToast("Action failed", err instanceof Error ? err.message : undefined, "error");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  const total = items.length + posts.length;
  if (total === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
        <Inbox className="w-8 h-8 mx-auto mb-3 opacity-40" />
        <p className="font-medium text-foreground">Archive is empty</p>
        <p className="mt-1 text-sm">Deleted posts, comments, books and more will appear here for 15 days.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {posts.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Deleted posts ({posts.length})
          </h2>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {posts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                    /{p.slug} · {p.views} views · {p.likes} likes
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <DaysLeft days={p.daysLeft} />
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={busyId === p.id}
                    onClick={() => run("restore", "post", p.id, p.title)}
                  >
                    <ArchiveRestore className="w-3.5 h-3.5" /> Restore
                  </Button>
                  <IconButton
                    variant="danger"
                    disabled={busyId === p.id}
                    title="Delete forever"
                    onClick={() => run("purge", "post", p.id, p.title)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {items.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Deleted items ({items.length})
          </h2>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {items.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {TYPE_LABELS[t.entityType] ?? t.entityType} · deleted{" "}
                    {new Date(t.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <DaysLeft days={t.daysLeft} />
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={busyId === t.id}
                    onClick={() => run("restore", "trash", t.id, t.title)}
                  >
                    <ArchiveRestore className="w-3.5 h-3.5" /> Restore
                  </Button>
                  <IconButton
                    variant="danger"
                    disabled={busyId === t.id}
                    title="Delete forever"
                    onClick={() => run("purge", "trash", t.id, t.title)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
