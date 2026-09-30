"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Pencil, Highlighter, X } from "lucide-react";
import { showConfirm } from "@/components/admin/ConfirmDialog";
import { showToast } from "@/components/admin/Toast";
import { Modal } from "@/components/ui/Modal";
import { Button, IconButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { inputCls } from "@/components/ui/Input";
import {
  QuoteRenderer,
  type HighlightColor,
} from "@sagarlad/quote-card";

type Quote = {
  id: string;
  text: string;
  tag: string;
  slug: string | null;
  highlightText: string | null;
  highlightColor: string | null;
  author: string | null;
  published: boolean;
};

type Draft = {
  text: string;
  tag: string;
  highlightText: string;
  highlightColor: HighlightColor;
  author: string;
  published: boolean;
};

const EMPTY: Draft = {
  text: "",
  tag: "",
  highlightText: "",
  highlightColor: "yellow",
  author: "",
  published: true,
};

export function QuotesManager() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/quotes");
      if (res.ok) {
        const data = await res.json();
        setQuotes(data.quotes);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startNew() {
    setEditing({ ...EMPTY });
    setEditingId(null);
  }

  function startEdit(q: Quote) {
    setEditing({
      text: q.text,
      tag: q.tag,
      highlightText: q.highlightText ?? "",
      highlightColor: q.highlightColor === "blue" ? "blue" : "yellow",
      author: q.author ?? "",
      published: q.published,
    });
    setEditingId(q.id);
  }

  function cancelEdit() {
    setEditing(null);
    setEditingId(null);
  }

  /** Take the text currently selected inside the textarea as the highlight. */
  function useSelectionAsHighlight() {
    const el = textRef.current;
    if (!el) return;
    const sel = el.value.slice(el.selectionStart ?? 0, el.selectionEnd ?? 0).trim();
    if (!sel) {
      showToast("Select a phrase inside the quote first.", undefined, "error");
      return;
    }
    if (sel.length > 200) {
      showToast("Keep the highlight under 200 characters.", undefined, "error");
      return;
    }
    setEditing((d) => (d ? { ...d, highlightText: sel } : d));
  }

  async function save() {
    if (!editing || !editing.text.trim() || !editing.tag.trim()) {
      showToast("Text and tag are required.", undefined, "error");
      return;
    }
    if (editing.highlightText && !editing.text.includes(editing.highlightText)) {
      showToast("Highlight must be an exact phrase from the quote.", undefined, "error");
      return;
    }
    setBusy(true);
    const payload = {
      ...(editingId ? { id: editingId } : {}),
      text: editing.text.trim(),
      tag: editing.tag.trim(),
      highlightText: editing.highlightText.trim() || null,
      highlightColor: editing.highlightColor,
      author: editing.author.trim() || null,
      published: editing.published,
    };
    const res = await fetch("/api/admin/quotes", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      showToast(data.error ?? "Something went wrong.", undefined, "error");
      return;
    }
    setEditing(null);
    setEditingId(null);
    showToast(editingId ? "Quote updated successfully." : "Quote added successfully.");
    await load();
  }

  async function remove(id: string) {
    const ok = await showConfirm({
      title: "Delete quote?",
      message: "This removes the quote from your site. This action cannot be undone.",
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/quotes?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setQuotes((q) => q.filter((x) => x.id !== id));
      if (editingId === id) {
        setEditing(null);
        setEditingId(null);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">
          {quotes.length} quote{quotes.length === 1 ? "" : "s"}
        </p>
        {!editing && (
          <Button onClick={startNew} className="ml-auto">
            <Plus className="w-4 h-4" /> Add quote
          </Button>
        )}
      </div>

      {editing && (
        <Modal
          open
          title={editingId ? "Edit quote" : "New quote"}
          subtitle="Write, highlight, preview, publish."
          onClose={cancelEdit}
          wide
          footer={
            <>
              <Button type="submit" form="quote-form" disabled={busy} loading={busy}>
                {editingId ? "Save changes" : "Publish quote"}
              </Button>
              <Button type="button" variant="secondary" onClick={cancelEdit} className="flex-1 sm:flex-none">
                Cancel
              </Button>
            </>
          }
        >
        <form
          id="quote-form"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-5"
        >
          <div>
            <label htmlFor="quote-text" className="block text-sm font-medium mb-1.5">Quote *</label>
            <textarea
              id="quote-text"
              ref={textRef}
              value={editing.text}
              onChange={(e) => setEditing({ ...editing, text: e.target.value })}
              rows={3}
              placeholder="Write your quote here..."
              className={inputCls}
              autoFocus
            />
          </div>

          <div>
            <span className="block text-sm font-medium mb-1.5">Highlight</span>
            {editing.highlightText ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm">
                  <Highlighter className="w-3.5 h-3.5 text-accent" />
                  &ldquo;{editing.highlightText}&rdquo;
                </span>
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, highlightText: "" })}
                  aria-label="Clear highlight"
                  className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Button type="button" variant="secondary" size="sm" onClick={useSelectionAsHighlight}>
                <Highlighter className="w-3.5 h-3.5" /> Use selected text
              </Button>
            )}
            <p className="mt-1.5 text-xs text-muted-foreground">
              Select a phrase inside the quote above, then tap the button.
            </p>
            <div className="mt-2 flex items-center gap-2" role="group" aria-label="Highlight color">
              {(["yellow", "blue"] as HighlightColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setEditing({ ...editing, highlightColor: c })}
                  aria-pressed={editing.highlightColor === c}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
                    editing.highlightColor === c
                      ? "border-accent bg-accent/15 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 rounded-full"
                    style={{ background: c === "yellow" ? "#FFCB00" : "#0D21A1" }}
                  />
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="quote-author" className="block text-sm font-medium mb-1.5">
                Author <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                id="quote-author"
                value={editing.author}
                onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                placeholder="Sagar Lad"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="quote-tag" className="block text-sm font-medium mb-1.5">Tag *</label>
              <input
                id="quote-tag"
                value={editing.tag}
                onChange={(e) => setEditing({ ...editing, tag: e.target.value })}
                placeholder="e.g. Work, Life, Focus"
                className={inputCls}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={editing.published}
              onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Published <span className="text-muted-foreground">(uncheck to save as draft)</span>
          </label>

          <div>
            <span className="block text-sm font-medium mb-1.5">Live preview</span>
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <QuoteRenderer
                text={editing.text || "Your quote appears here..."}
                highlightText={editing.highlightText || null}
                highlightColor={editing.highlightColor}
                author={editing.author || null}
                logoSrc="/logos/site-logo-black.png"
              />
            </div>
          </div>
        </form>
        </Modal>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : quotes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No quotes yet.</p>
      ) : (
        <ul className="space-y-3">
          {quotes.map((q) => (
            <li
              key={q.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card card-grad p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">&ldquo;{q.text}&rdquo;</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge variant="accent">{q.tag}</Badge>
                  {!q.published && <Badge variant="muted">Draft</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <IconButton onClick={() => startEdit(q)} title="Edit quote" aria-label={`Edit quote: ${q.text.slice(0, 40)}`}>
                  <Pencil className="w-4 h-4" />
                </IconButton>
                <IconButton variant="danger" onClick={() => remove(q.id)} title="Delete quote" aria-label="Delete quote">
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
