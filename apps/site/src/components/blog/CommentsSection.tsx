"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X, ChevronDown } from "lucide-react";
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

function AdminAvatar({ size = "md" }: { size?: "sm" | "md" }) {
  const dims = size === "sm" ? "w-6 h-6" : "w-8 h-8";
  const text = size === "sm" ? "text-[10px]" : "text-xs";
  return (
    <div className={`${dims} rounded-full bg-brand text-white flex items-center justify-center font-display font-bold ${text} shrink-0 overflow-hidden`}>
      <img
        src="/favicon-48x48.png"
        alt="Sagar Lad"
        className="w-full h-full object-cover"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    </div>
  );
}

function UserAvatar({ name, isAdmin }: { name: string; isAdmin: boolean }) {
  const initial = (name || "A").trim().charAt(0).toUpperCase();
  if (isAdmin) return <AdminAvatar />;
  return (
    <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-display font-bold text-xs shrink-0">
      {initial}
    </div>
  );
}

function ReplyAvatar({ name, isAdmin }: { name: string; isAdmin: boolean }) {
  const initial = (name || "A").trim().charAt(0).toUpperCase();
  if (isAdmin) return <AdminAvatar size="sm" />;
  return (
    <div className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center font-display font-bold text-[10px] shrink-0">
      {initial}
    </div>
  );
}

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
  const [showReplies, setShowReplies] = useState(true);
  const replyFormRef = useRef<HTMLDivElement>(null);
  const isAdmin = c.name === ADMIN_NAME;
  const hasReplies = c.replies && c.replies.length > 0;

  useEffect(() => {
    if (replyTo && replyFormRef.current) {
      replyFormRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [replyTo]);

  return (
    <div className="group/comment">
      {/* Main comment card */}
      <div
        className={`rounded-2xl border bg-card/60 p-4 sm:p-5 transition-all ${
          isAdmin
            ? "border-brand/30 bg-brand/[0.03] shadow-sm shadow-brand/5"
            : "border-border hover:border-border/80"
        }`}
      >
        {/* Header row */}
        <div className="flex items-start gap-3">
          <UserAvatar name={c.name} isAdmin={isAdmin} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className={`font-semibold text-sm ${isAdmin ? "text-brand" : "text-foreground"}`}>
                {c.name}
              </span>
              {isAdmin && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand/10 text-brand px-1.5 py-0.5 rounded-full">
                  Author
                </span>
              )}
              <span className="text-muted-foreground/40" aria-hidden="true">·</span>
              <time className="text-muted-foreground text-[11px]" dateTime={c.createdAt}>
                {formatDate(new Date(c.createdAt))}
              </time>
            </div>
            {/* Comment body */}
            <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
              {c.content}
            </p>
            {/* Action row */}
            <div className="mt-3 flex items-center gap-3">
              {!c.parentId && (
                <button
                  type="button"
                  onClick={() => setReplyTo(replyTo ? null : c.id)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors rounded-full px-3 py-1 ${
                    replyTo
                      ? "bg-brand/10 text-brand"
                      : "text-muted-foreground hover:text-brand hover:bg-brand/5"
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  {replyTo ? "Cancel" : "Reply"}
                </button>
              )}
              {hasReplies && (
                <button
                  type="button"
                  onClick={() => setShowReplies(!showReplies)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showReplies ? "rotate-180" : ""}`} />
                  {c.replies.length} {c.replies.length === 1 ? "reply" : "replies"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reply form — slides in below the comment */}
      {replyTo === c.id && (
        <div ref={replyFormRef} className="ml-6 sm:ml-11 mt-2 mb-1">
          <div className="rounded-xl border border-brand/20 bg-brand/[0.02] p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground">
                Replying to <span className="text-foreground font-semibold">{c.name}</span>
              </p>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
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
        </div>
      )}

      {/* Replies thread */}
      {hasReplies && showReplies && (
        <div className="ml-5 sm:ml-8 mt-2 pl-4 sm:pl-5 border-l-2 border-brand/15 space-y-2">
          {c.replies.map((r) => {
            const rIsAdmin = r.name === ADMIN_NAME;
            return (
              <div
                key={r.id}
                className={`rounded-xl border p-3 sm:p-3.5 transition-all ${
                  rIsAdmin
                    ? "border-brand/25 bg-brand/[0.03] shadow-sm shadow-brand/5"
                    : "border-border/60 bg-card/40 hover:border-border/80"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <ReplyAvatar name={r.name} isAdmin={rIsAdmin} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className={`font-semibold text-[13px] ${rIsAdmin ? "text-brand" : "text-foreground"}`}>
                        {r.name}
                      </span>
                      {rIsAdmin && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-brand/10 text-brand px-1.5 py-0.5 rounded-full">
                          Author
                        </span>
                      )}
                      <span className="text-muted-foreground/40" aria-hidden="true">·</span>
                      <time className="text-muted-foreground text-[11px]" dateTime={r.createdAt}>
                        {formatDate(new Date(r.createdAt))}
                      </time>
                    </div>
                    <p className="mt-1.5 text-[13px] sm:text-sm leading-relaxed text-foreground/85">
                      {r.content}
                    </p>
                  </div>
                </div>
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

      {/* Header with count */}
      <div className="flex items-center justify-between pb-3 border-b border-border mt-8 sm:mt-10">
        <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
          {allCount > 0
            ? `${allCount} ${allCount === 1 ? "Comment" : "Comments"}`
            : "Discussion"}
        </h2>
        {allCount > 0 && (
          <span className="text-xs text-muted-foreground font-mono">
            {total} thread{total !== 1 ? "s" : ""}
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
