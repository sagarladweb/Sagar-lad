"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDate } from "@/lib/site";
import { CommentForm } from "@/components/blog/CommentForm";

type Comment = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
};

const CHUNK_SIZE = 4;

export function CommentsSection({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/comments?postSlug=${encodeURIComponent(postSlug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setComments(data.comments);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load comments.");
      });
    return () => {
      cancelled = true;
    };
  }, [postSlug, reload]);

  const afterPosted = useCallback(() => {
    setReload((n) => n + 1);
    setVisibleCount(CHUNK_SIZE);
  }, []);

  const total = comments?.length ?? 0;
  const visibleComments = comments?.slice(0, visibleCount) ?? [];
  const hasMore = visibleCount < total;

  return (
    <section className="mt-10 sm:mt-14" aria-label="Comments section">
      {/* Comment form — always first */}
      <CommentForm postSlug={postSlug} onPosted={afterPosted} />

      {/* Header with total count */}
      <div className="flex items-center justify-between pb-3 border-b border-border mt-8 sm:mt-10">
        <h2 className="font-display text-lg sm:text-xl sm:text-2xl font-bold text-foreground">
          {total > 0
            ? `${total} ${total === 1 ? "Comment" : "Comments"}`
            : "Discussion"}
        </h2>
        {total > 0 && (
          <span className="text-xs text-muted-foreground font-mono">
            {total} posted
          </span>
        )}
      </div>

      {/* Comments list */}
      <div className="mt-5 sm:mt-6 space-y-3">
        {comments === null ? (
          <div className="rounded-2xl border border-border bg-card/40 p-5 sm:p-6 text-center text-sm text-muted-foreground">
            {error || "Loading comments…"}
          </div>
        ) : (
          <>
            {total === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 sm:p-8 text-center">
                <p className="text-sm font-semibold text-foreground">No comments yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Be the first to share your thoughts above!
                </p>
              </div>
            )}
            {visibleComments.map((c) => {
              const initial = (c.name || "A").trim().charAt(0).toUpperCase();
              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-border bg-card/60 p-3.5 sm:p-5 transition-all hover:border-border/80"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-display font-bold text-[11px] sm:text-xs shrink-0">
                      {initial}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                      <span className="font-semibold text-foreground text-sm">{c.name}</span>
                      <span className="text-muted-foreground/60" aria-hidden="true">·</span>
                      <time className="text-muted-foreground text-[11px]" dateTime={c.createdAt}>
                        {formatDate(new Date(c.createdAt))}
                      </time>
                    </div>
                  </div>
                  <p className="mt-2 sm:mt-2.5 text-sm leading-relaxed text-foreground/90 pl-9 sm:pl-11">
                    {c.content}
                  </p>
                </div>
              );
            })}
            {hasMore && (
              <button
                type="button"
                onClick={() => setVisibleCount((n) => n + CHUNK_SIZE)}
                className="w-full rounded-2xl border border-dashed border-border bg-card/40 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-brand/30 hover:bg-brand/5 transition-all"
              >
                Load more comments ({total - visibleCount} remaining)
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
