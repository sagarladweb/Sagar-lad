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

const INITIAL_COUNT = 4;

export function CommentsSection({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

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
    setShowAll(true);
  }, []);

  const visibleComments = showAll
    ? comments
    : comments?.slice(0, INITIAL_COUNT);
  const hiddenCount = comments ? comments.length - INITIAL_COUNT : 0;

  return (
    <section className="mt-14" aria-label="Comments section">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          {comments && comments.length > 0
            ? `${comments.length} ${comments.length === 1 ? "Comment" : "Comments"}`
            : "Discussion"}
        </h2>
        {comments && comments.length > 0 && (
          <span className="text-xs text-muted-foreground font-mono">
            {comments.length} posted
          </span>
        )}
      </div>

      <div className="mt-6 space-y-3.5">
        {comments === null ? (
          <div className="rounded-2xl border border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
            {error || "Loading comments…"}
          </div>
        ) : (
          <>
            {comments.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
                <p className="text-sm font-semibold text-foreground">No comments yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start the conversation below!
                </p>
              </div>
            )}
            {visibleComments?.map((c) => {
              const initial = (c.name || "A").trim().charAt(0).toUpperCase();
              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-border bg-card/60 p-4 sm:p-5 transition-all hover:border-border/80"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-display font-bold text-xs shrink-0">
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
                  <p className="mt-2.5 text-sm leading-relaxed text-foreground/90 pl-11">
                    {c.content}
                  </p>
                </div>
              );
            })}
            {!showAll && hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="w-full rounded-2xl border border-dashed border-border bg-card/40 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-brand/30 hover:bg-brand/5 transition-all"
              >
                View all {comments.length} comments
              </button>
            )}
          </>
        )}
      </div>

      <CommentForm postSlug={postSlug} onPosted={afterPosted} />
    </section>
  );
}
