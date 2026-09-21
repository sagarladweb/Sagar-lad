"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDate } from "@/lib/site";
import { CommentForm } from "@/components/blog/CommentForm";

type Reply = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  parentId: string | null;
};

type Comment = Reply & {
  replies: Reply[];
};

const ADMIN_NAME = "Sagar Lad";
const CHUNK_SIZE = 4;

function CommentItem({
  c,
  postSlug,
  onPosted,
}: {
  c: Comment;
  postSlug: string;
  onPosted: () => void;
}) {
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const initial = (c.name || "A").trim().charAt(0).toUpperCase();
  const isAdmin = c.name === ADMIN_NAME;

  return (
    <div>
      <div
        className={`rounded-2xl border bg-card/60 p-3.5 sm:p-5 transition-all hover:border-border/80 ${
          isAdmin
            ? "border-brand/30 bg-brand/[0.03]"
            : "border-border"
        }`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-display font-bold text-[11px] sm:text-xs shrink-0 ${
              isAdmin
                ? "bg-brand text-white"
                : "bg-brand/10 text-brand"
            }`}
          >
            {isAdmin ? (
              <img
                src="/favicon-48x48.png"
                alt="Sagar Lad"
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).nextElementSibling?.textContent ?? "";
                }}
              />
            ) : null}
            {isAdmin ? <span className="sr-only">SL</span> : initial}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
            <span className={`font-semibold text-sm ${isAdmin ? "text-brand" : "text-foreground"}`}>
              {c.name}
            </span>
            {isAdmin && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-brand/10 text-brand px-1.5 py-0.5 rounded-full">
                Author
              </span>
            )}
            <span className="text-muted-foreground/60" aria-hidden="true">·</span>
            <time className="text-muted-foreground text-[11px]" dateTime={c.createdAt}>
              {formatDate(new Date(c.createdAt))}
            </time>
          </div>
        </div>
        <p className="mt-2 sm:mt-2.5 text-sm leading-relaxed text-foreground/90 pl-9 sm:pl-11">
          {c.content}
        </p>
        {/* Reply button — only for top-level comments */}
        {!c.parentId && (
          <div className="mt-2 pl-9 sm:pl-11">
            <button
              type="button"
              onClick={() => setReplyTo(replyTo ? null : c.id)}
              className="text-[11px] font-medium text-muted-foreground hover:text-brand transition-colors"
            >
              {replyTo ? "Cancel reply" : "Reply"}
            </button>
          </div>
        )}
      </div>

      {/* Inline reply form */}
      {replyTo === c.id && (
        <div className="ml-9 sm:ml-11">
          <CommentForm
            postSlug={postSlug}
            parentId={c.id}
            onPosted={() => {
              setReplyTo(null);
              onPosted();
            }}
            onCancel={() => setReplyTo(null)}
          />
        </div>
      )}

      {/* Replies */}
      {c.replies && c.replies.length > 0 && (
        <div className="ml-6 sm:ml-8 mt-2 space-y-2 border-l-2 border-brand/10 pl-3 sm:pl-4">
          {c.replies.map((r) => {
            const rInitial = (r.name || "A").trim().charAt(0).toUpperCase();
            const rIsAdmin = r.name === ADMIN_NAME;
            return (
              <div
                key={r.id}
                className={`rounded-xl border bg-card/40 p-3 sm:p-4 ${
                  rIsAdmin ? "border-brand/30 bg-brand/[0.03]" : "border-border"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-display font-bold text-[10px] sm:text-[11px] shrink-0 ${
                      rIsAdmin ? "bg-brand text-white" : "bg-brand/10 text-brand"
                    }`}
                  >
                    {rIsAdmin ? <span>SL</span> : rInitial}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                    <span className={`font-semibold text-[13px] ${rIsAdmin ? "text-brand" : "text-foreground"}`}>
                      {r.name}
                    </span>
                    {rIsAdmin && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-brand/10 text-brand px-1.5 py-0.5 rounded-full">
                        Author
                      </span>
                    )}
                    <span className="text-muted-foreground/60" aria-hidden="true">·</span>
                    <time className="text-muted-foreground text-[11px]" dateTime={r.createdAt}>
                      {formatDate(new Date(r.createdAt))}
                    </time>
                  </div>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/85 pl-8 sm:pl-9.5">
                  {r.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  const replyCount = comments?.reduce((acc, c) => acc + (c.replies?.length ?? 0), 0) ?? 0;
  const allCount = total + replyCount;
  const visibleComments = comments?.slice(0, visibleCount) ?? [];
  const hasMore = visibleCount < total;

  return (
    <section className="mt-10 sm:mt-14" aria-label="Comments section">
      {/* Comment form — always first */}
      <CommentForm postSlug={postSlug} onPosted={afterPosted} />

      {/* Header with total count */}
      <div className="flex items-center justify-between pb-3 border-b border-border mt-8 sm:mt-10">
        <h2 className="font-display text-lg sm:text-xl sm:text-2xl font-bold text-foreground">
          {allCount > 0
            ? `${allCount} ${allCount === 1 ? "Comment" : "Comments"}`
            : "Discussion"}
        </h2>
        {allCount > 0 && (
          <span className="text-xs text-muted-foreground font-mono">
            {allCount} posted
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
            {allCount === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 sm:p-8 text-center">
                <p className="text-sm font-semibold text-foreground">No comments yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Be the first to share your thoughts above!
                </p>
              </div>
            )}
            {visibleComments.map((c) => (
              <CommentItem key={c.id} c={c} postSlug={postSlug} onPosted={afterPosted} />
            ))}
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
