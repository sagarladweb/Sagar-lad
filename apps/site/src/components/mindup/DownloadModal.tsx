"use client";

import { useState } from "react";
import { X, Download, Loader2, CheckCircle2, AlertCircle, BookOpen } from "lucide-react";
import type { RewardBook } from "./types";

export function DownloadModal({
  book,
  onClose,
}: {
  book: RewardBook;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit = name.trim() && email.trim() && terms && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/ebooks/download/${book.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subscribe: newsletter,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") ?? "";
      const fileNameMatch = disposition.match(/filename="?([^"]+)"?/);
      const fileName = fileNameMatch?.[1] ?? `${book.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDone(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {done ? (
          /* ── Success ── */
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#69A98D]/10 mb-5">
              <CheckCircle2 className="w-6 h-6 text-[#69A98D]" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              Downloaded!
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Check your downloads folder. Enjoy the read.
            </p>
            <button
              onClick={onClose}
              className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            {/* Book preview */}
            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-muted border border-border">
              {book.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-12 h-16 rounded-lg bg-border flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{book.title}</p>
                {book.tagline && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{book.tagline}</p>
                )}
                <p className="text-[11px] font-semibold text-brand mt-1 uppercase tracking-wider">Free Reward</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="dl-name" className="block text-sm font-medium text-foreground mb-1.5">
                  Name
                </label>
                <input
                  id="dl-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="dl-email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email
                </label>
                <input
                  id="dl-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  required
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Send me weekly insights on personal growth
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
                  required
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  I agree to the{" "}
                  <a href="/legal/privacy" target="_blank" className="underline hover:text-foreground">
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a href="/legal/terms" target="_blank" className="underline hover:text-foreground">
                    Terms &amp; Conditions
                  </a>
                </span>
              </label>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 text-sm text-[#D76E67] bg-[#D76E67]/5 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-6 btn-premium w-full flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-8 py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {loading ? "Downloading..." : "Download Ebook"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
