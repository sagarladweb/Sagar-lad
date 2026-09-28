"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, Trophy } from "lucide-react";
import { PublishedBadge } from "@/components/ui/Badge";

export type RecentPost = {
  title: string;
  slug: string;
  published: boolean;
  views: number;
  likes: number;
};

// Recent posts with a Views ⇄ Top performing toggle. Tapping the "Views"
// column header (or the pill) re-sorts by views so the best posts surface.
export function RecentPostsCard({ posts }: { posts: RecentPost[] }) {
  const [top, setTop] = useState(false);
  const shown = top
    ? [...posts].sort((a, b) => b.views - a.views).slice(0, 5)
    : posts.slice(0, 5);

  if (posts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No posts yet.{" "}
        <Link href="/admin/posts/new" className="text-accent font-medium">
          Write your first one →
        </Link>
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {top ? "Top performing" : "Recent posts"}
        </h2>
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-1 text-sm text-accent font-medium hover:underline"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">
              <button
                onClick={() => setTop((v) => !v)}
                title={top ? "Back to recent posts" : "Show top performing posts"}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold normal-case tracking-normal transition-colors ${
                  top
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted hover:text-foreground"
                }`}
              >
                {top && <Trophy className="w-3 h-3" />}
                {top ? "Top performing" : "Views"}
              </button>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {shown.map((p, i) => (
            <tr key={p.slug} className="hover:bg-muted/30 transition-colors duration-150">
              <td className="px-4 py-3 font-medium">
                <span className="inline-flex items-center gap-2">
                  {top && (
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-[11px] font-bold text-accent tabular-nums">
                      {i + 1}
                    </span>
                  )}
                  {p.title}
                </span>
              </td>
              <td className="px-4 py-3">
                <PublishedBadge published={p.published} />
              </td>
              <td className="px-4 py-3 tabular-nums text-right">
                <span className="inline-flex items-center justify-end gap-1">
                  <Eye className="w-3 h-3 text-muted-foreground" />
                  {p.views}
                  {top && (
                    <span className="text-xs text-muted-foreground">· {p.likes} likes</span>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
