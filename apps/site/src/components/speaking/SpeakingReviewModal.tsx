"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Star, Send, CheckCircle, X } from "lucide-react";

function ReviewForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-3">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
        <p className="font-display text-lg font-bold text-foreground">Thank you!</p>
        <p className="text-sm text-muted-foreground">
          Your review has been submitted and will appear after moderation.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim() || !review.trim() || rating === 0) return;
        setSubmitted(true);
      }}
      className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4"
    >
      <div className="space-y-1.5">
        <p className="font-display text-lg font-bold text-foreground">
          Share Your Experience
        </p>
        <p className="text-xs text-muted-foreground">
          Your feedback helps others find the right speaker.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="speaking-reviewer-name" className="text-xs font-semibold text-foreground/70">
          Your Name
        </label>
        <input
          id="speaking-reviewer-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rahul Kumar"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground/70">Rating</label>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="relative flex">
              <button
                type="button"
                onClick={() => setRating(s - 0.5)}
                onMouseEnter={() => setHovered(s - 0.5)}
                onMouseLeave={() => setHovered(0)}
                className="relative w-4 h-5 sm:w-5 sm:h-6 cursor-pointer overflow-hidden"
              >
                <Star className={`absolute inset-0 w-5 h-6 sm:w-6 sm:h-7 transition-colors ${
                  (hovered || rating) >= s - 0.5
                    ? "fill-accent text-accent"
                    : "text-muted-foreground/25"
                }`} />
              </button>
              <button
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                className="relative w-4 h-5 sm:w-5 sm:h-6 cursor-pointer overflow-hidden -ml-4 sm:-ml-5"
              >
                <Star className={`absolute inset-0 w-5 h-6 sm:w-6 sm:h-7 transition-colors ${
                  (hovered || rating) >= s
                    ? "fill-accent text-accent"
                    : "text-muted-foreground/25"
                }`} />
              </button>
            </div>
          ))}
          {(hovered || rating) > 0 && (
            <span className="ml-2 text-xs text-muted-foreground self-center tabular-nums">
              {hovered || rating}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="speaking-review-text" className="text-xs font-semibold text-foreground/70">
          Your Review
        </label>
        <textarea
          id="speaking-review-text"
          required
          rows={3}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="How was the speaking experience?"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!name.trim() || !review.trim() || rating === 0}
          className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3 text-sm font-bold shadow-sm hover:scale-[1.03] transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          Submit Review
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function SpeakingReviewButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-lg border border-border px-3 py-1.5"
      >
        Write a Review
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Write a review"
        >
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl z-10">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="p-5 sm:p-6">
              <ReviewForm onClose={() => setOpen(false)} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
