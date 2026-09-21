"use client";

import { useRef, useEffect } from "react";
import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { getClientToken } from "@/lib/client-token";
import { sanitizeText } from "@/lib/client-validators";

export function CommentForm({
  postSlug,
  onPosted,
  parentId,
  onCancel,
}: {
  postSlug: string;
  onPosted?: () => void;
  parentId?: string;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState({ name: "", content: "" });
  const [errors, setErrors] = useState<{ name?: string; content?: string }>({});
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isReply = Boolean(parentId);

  // Auto-focus textarea when reply form opens
  useEffect(() => {
    if (isReply && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isReply]);

  function validate(): boolean {
    const e: typeof errors = {};
    const name = sanitizeText(form.name);
    const content = form.content.trim();
    if (!name || name.length < 2) e.name = "Name is required";
    else if (name.length > 80) e.name = "Name must be under 80 characters";
    if (!content || content.length < 3) e.content = "Comment must be at least 3 characters";
    else if (content.length > 1000) e.content = "Comment must be under 1000 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setState("loading");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sanitizeText(form.name),
          content: form.content.trim(),
          postSlug,
          clientToken: getClientToken(),
          parentId: parentId || undefined,
        }),
      });
      if (res.ok) {
        setState("success");
        setForm({ name: "", content: "" });
        setErrors({});
        setMessage(isReply ? "Reply posted!" : "Thanks! Your comment has been posted.");
        onPosted?.();
      } else {
        const data = await res.json().catch(() => ({}));
        setState("error");
        setMessage(data.error ?? "Something went wrong.");
      }
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  }

  const charCount = form.content.length;
  const charColor = charCount > 900 ? "text-red-500" : charCount > 700 ? "text-amber-500" : "text-muted-foreground";

  return (
    <form
      onSubmit={onSubmit}
      className={`${
        isReply
          ? "space-y-3"
          : "mt-8 rounded-2xl border border-border bg-card/60 p-5 sm:p-6 space-y-4 shadow-sm"
      }`}
      noValidate
    >
      {!isReply && (
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Leave a comment</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Share your reflections or questions. Moderated for spam.
          </p>
        </div>
      )}

      {/* Name field — shown in main form, hidden in compact reply mode */}
      <div>
        <input
          type="text"
          value={form.name}
          onChange={(e) => {
            setForm({ ...form, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
          placeholder="Your name"
          aria-label="Your name"
          required
          className={`w-full rounded-xl border bg-background px-4 py-2.5 text-base sm:text-sm outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20 ${
            errors.name ? "border-red-500" : "border-border"
          }`}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      <div>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={form.content}
            onChange={(e) => {
              setForm({ ...form, content: e.target.value });
              if (errors.content) setErrors({ ...errors, content: undefined });
            }}
            placeholder={isReply ? "Write your reply…" : "Share your thoughts…"}
            aria-label={isReply ? "Reply" : "Comment"}
            required
            rows={isReply ? 3 : 4}
            className={`w-full rounded-xl border bg-background px-4 py-2.5 pr-12 text-base sm:text-sm outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20 resize-y ${
              errors.content ? "border-red-500" : "border-border"
            }`}
          />
          <span className={`absolute bottom-2.5 right-3 text-[11px] font-mono ${charColor}`}>
            {charCount}
          </span>
        </div>
        {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={state === "loading"}
          className={`inline-flex items-center gap-2 rounded-full text-white px-5 py-2 text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 ${
            isReply ? "bg-brand/90" : "bg-brand"
          }`}
        >
          {state === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isReply ? (
            <Send className="w-3.5 h-3.5" />
          ) : null}
          {isReply ? "Reply" : "Post comment"}
        </button>
        {isReply && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {state === "success" && (
        <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {message}
        </p>
      )}
      {state === "error" && (
        <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950/30 p-3 rounded-xl border border-red-200 dark:border-red-900/40">
          <AlertCircle className="w-4 h-4 shrink-0" /> {message}
        </p>
      )}
    </form>
  );
}
