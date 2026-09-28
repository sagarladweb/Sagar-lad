"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Trash2, Download, Search, MessageCircle, Send, X, MapPin, Smartphone, CheckSquare, Square } from "lucide-react";
import { Dropdown } from "@/components/ui/Dropdown";
import { IconButton } from "@/components/ui/Button";import { Badge, CountBadge } from "@/components/ui/Badge";
import { SITE } from "@/lib/site";
import { showToast } from "@/components/admin/Toast";
import { showConfirm } from "@/components/admin/ConfirmDialog";

const BADGE_KEY = "admin-moderation-last-viewed";

type Subscriber = { id: string; email: string; createdAt: string };
type Comment = {
  id: string;
  name: string;
  email: string | null;
  ip: string | null;
  userAgent: string | null;
  brand: string | null;
  location: string | null;
  content: string;
  approved: boolean;
  clientToken: string | null;
  userId: string | null;
  postId: string;
  parentId: string | null;
  createdAt: string;
  post: { title: string; slug: string };
};
type Enquiry = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  organization: string;
  eventDate: string | null;
  message: string | null;
  type: string;
  createdAt: string;
};

type Data = { subscribers: Subscriber[]; comments: Comment[]; enquiries: Enquiry[] };

const TABS = ["Comments", "Subscribers", "Contact", "Speaking"] as const;
type Tab = (typeof TABS)[number];

function tabFromUrl(): Tab {
  if (typeof window === "undefined") return "Comments";
  const t = new URLSearchParams(window.location.search).get("tab");
  return TABS.includes(t as Tab) ? (t as Tab) : "Comments";
}

function setTabInUrl(tab: Tab) {
  const url = new URL(window.location.href);
  url.searchParams.set("tab", tab);
  window.history.replaceState(null, "", url.toString());
}

function toCsv(rows: (string | number)[][]) {
  return rows
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell ?? "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    )
    .join("\n");
}

function download(filename: string, rows: (string | number)[][]) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border py-12 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function EnquiryList({
  enquiries,
  selected,
  onToggle,
  onDelete,
}: {
  enquiries: Enquiry[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (enquiries.length === 0) {
    return <EmptyState text="No inquiries yet." />;
  }

  return (
    <ul className="divide-y divide-border border-y border-border">
      {enquiries.map((e) => (
        <li key={e.id} className="py-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <input
              type="checkbox"
              checked={selected.has(e.id)}
              onChange={() => onToggle(e.id)}
              aria-label={`Select enquiry from ${e.firstName} ${e.lastName ?? ""}`}
              className="accent-[var(--accent)] mt-1 shrink-0"
            />
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">
                  {`${e.firstName} ${e.lastName ?? ""}`.trim()}
                </span>
                <Badge variant="muted">{e.type}</Badge>
                <time className="text-xs text-muted-foreground" dateTime={e.createdAt}>
                  {new Date(e.createdAt).toLocaleString()}
                </time>
              </div>
              <p className="text-sm">
                <a href={`mailto:${e.email}`} className="text-accent hover:underline">
                  {e.email}
                </a>
                {e.phone && <span className="text-muted-foreground"> · {e.phone}</span>}
              </p>
              <p className="text-sm text-muted-foreground">{e.organization}</p>
              {e.eventDate && (
                <p className="text-sm text-muted-foreground">
                  Event date: {new Date(e.eventDate).toLocaleDateString()}
                </p>
              )}
              {e.message && (
                <p className="text-sm text-muted-foreground leading-relaxed">{e.message}</p>
              )}
            </div>
          </div>
          <IconButton variant="danger" onClick={() => onDelete(e.id)} title="Delete inquiry">
            <Trash2 className="w-4 h-4" />
          </IconButton>
        </li>
      ))}
    </ul>
  );
}

function CommentList({
  comments,
  selected,
  onToggle,
  onDelete,
  onReplyDone,
}: {
  comments: Comment[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReplyDone: () => void;
}) {
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  // Separate top-level and replies
  const topLevel = comments.filter((c) => !c.parentId);
  const repliesByParent = new Map<string, Comment[]>();
  for (const c of comments) {
    if (c.parentId) {
      if (!repliesByParent.has(c.parentId)) repliesByParent.set(c.parentId, []);
      repliesByParent.get(c.parentId)!.push(c);
    }
  }

  async function submitReply(parentComment: Comment) {
    if (!replyContent.trim()) return;
    setReplyLoading(true);
    try {
      const res = await fetch("/api/admin/comments/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: parentComment.id, content: replyContent.trim() }),
      });
      if (res.ok) {
        setReplyTo(null);
        setReplyContent("");
        onReplyDone();
      }
    } finally {
      setReplyLoading(false);
    }
  }

  function renderReply(r: Comment) {
    const rIsAdmin = r.name === "Sagar Lad";
    return (
      <li key={r.id} className="py-3 pl-4 sm:pl-6 border-l-2 border-accent/20">
        <div className="flex items-start gap-2.5">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
            rIsAdmin ? "bg-accent text-black" : "bg-muted text-muted-foreground"
          }`}>
            {rIsAdmin ? (
              <span className="text-[10px] font-bold">SL</span>
            ) : (
              <span className="text-[10px] font-bold">{(r.name || "A").charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-semibold text-sm ${rIsAdmin ? "text-accent" : ""}`}>
                {r.name}
              </span>
              {rIsAdmin && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">
                  You
                </span>
              )}
              <time className="text-xs text-muted-foreground" dateTime={r.createdAt}>
                {new Date(r.createdAt).toLocaleString()}
              </time>
            </div>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{r.content}</p>
          </div>
        </div>
      </li>
    );
  }

  function renderComment(c: Comment) {
    const replies = repliesByParent.get(c.id) ?? [];
    return (
      <li key={c.id} className="py-4 sm:py-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <input
            type="checkbox"
            checked={selected.has(c.id)}
            onChange={() => onToggle(c.id)}
            aria-label={`Select comment by ${c.name}`}
            className="accent-[var(--accent)] mt-1 shrink-0"
          />
          <div className="flex-1 min-w-0">
            {/* Comment header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-semibold text-sm ${c.name === "Sagar Lad" ? "text-accent" : ""}`}>
                    {c.name}
                  </span>
                  {c.name === "Sagar Lad" && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="text-xs text-muted-foreground hover:text-accent hidden sm:inline">
                      {c.email}
                    </a>
                  )}
                  <time className="text-xs text-muted-foreground" dateTime={c.createdAt}>
                    {new Date(c.createdAt).toLocaleString()}
                  </time>
                </div>
                {/* Post title */}
                <div className="mt-0.5">
                  <a
                    href={`${SITE.url}/blog/${c.post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-accent font-medium"
                  >
                    on {c.post.title}
                  </a>
                </div>
              </div>
              {/* Actions — stack vertically on mobile */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setReplyTo(replyTo === c.id ? null : c.id);
                    setReplyContent("");
                  }}
                  aria-expanded={replyTo === c.id}
                  aria-label={replyTo === c.id ? "Close reply form" : `Reply to ${c.name}`}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                    replyTo === c.id
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "border border-border text-muted-foreground hover:border-accent hover:bg-accent/5 hover:text-foreground"
                  }`}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Reply
                </button>
                <IconButton variant="danger" onClick={() => onDelete(c.id)} title="Delete comment" aria-label={`Delete comment by ${c.name}`}>
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              </div>
            </div>

            {/* Comment body */}
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.content}</p>

            {/* Meta row — brand + location only, kept minimal */}
            {(c.brand || c.location) && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                {c.brand && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium">
                    <Smartphone className="h-3 w-3" aria-hidden="true" />
                    {c.brand}
                  </span>
                )}
                {c.location && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {c.location}
                  </span>
                )}
              </div>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`} className="mt-2 inline-block text-[11px] text-muted-foreground hover:text-accent sm:hidden">
                {c.email}
              </a>
            )}

            {/* Reply form — inline premium card */}
            {replyTo === c.id && (
              <div className="mt-4 max-w-2xl rounded-2xl border border-accent/25 bg-gradient-to-b from-accent/[0.07] to-transparent p-4 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)] sm:p-5">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                    SL
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">
                      Replying as Sagar Lad
                      <span className="ml-1.5 rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                        You
                      </span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      to {c.name} on “{c.post.title}”
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    aria-label="Close reply form"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <label htmlFor={`reply-${c.id}`} className="sr-only">
                  Your reply
                </label>
                <textarea
                  id={`reply-${c.id}`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value.slice(0, 1000))}
                  placeholder={`Write a kind reply to ${c.name}…`}
                  rows={3}
                  className="mt-3 min-h-24 w-full resize-y rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm leading-relaxed outline-none transition-all placeholder:text-muted-foreground/50 focus:border-accent focus:ring-2 focus:ring-accent/20"
                  autoFocus
                />
                <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {replyContent.length}/1000
                  </span>
                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={replyLoading || !replyContent.trim()}
                      onClick={() => submitReply(c)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2 text-xs font-bold text-accent-foreground shadow-sm transition-all hover:brightness-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {replyLoading ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      {replyLoading ? "Posting…" : "Post reply"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Replies thread */}
            {replies.length > 0 && (
              <ul className="mt-3 space-y-0">
                {replies.map((r) => renderReply(r))}
              </ul>
            )}
          </div>
        </div>
      </li>
    );
  }

  return (
    <ul className="divide-y divide-border border-y border-border">
      {topLevel.map((c) => renderComment(c))}
    </ul>
  );
}

export function ModerationPanel() {
  const [data, setData] = useState<Data | null>(null);
  const [tab, setTab] = useState<Tab>("Comments");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subscriberFilter, setSubscriberFilter] = useState("");
  const [newCounts, setNewCounts] = useState({ comments: 0, subscribers: 0, enquiries: 0 });

  // Sync tab from URL after hydration to avoid mismatch
  useEffect(() => {
    const t = tabFromUrl();
    setTab(t);
  }, []);

  const fetchNewCounts = useCallback(async () => {
    try {
      const saved = localStorage.getItem(BADGE_KEY);
      const since = saved ?? new Date().toISOString();
      const res = await fetch(`/api/admin/moderation/counts?since=${encodeURIComponent(since)}`);
      if (!res.ok) return;
      const d = await res.json();
      setNewCounts({ comments: d.comments ?? 0, subscribers: d.subscribers ?? 0, enquiries: d.enquiries ?? 0 });
    } catch {}
  }, []);

  // Fetch new counts on mount and every 30s
  useEffect(() => {
    fetchNewCounts();
    const interval = setInterval(fetchNewCounts, 30_000);
    return () => clearInterval(interval);
  }, [fetchNewCounts]);

  async function load(): Promise<boolean> {
    try {
      const res = await fetch("/api/admin/moderation");
      if (!res.ok) return false;
      setData(await res.json());
      return true;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function switchTab(t: Tab) {
    setTab(t);
    setSelected(new Set());
    setTabInUrl(t);
    // Update last viewed timestamp so sidebar badge and tab dots clear
    try {
      localStorage.setItem(BADGE_KEY, new Date().toISOString());
    } catch {}
    setNewCounts({ comments: 0, subscribers: 0, enquiries: 0 });
  }

  async function act(kind: "subscriber" | "comment" | "enquiry", ids: string[]) {
    if (!ids.length) return;
    const what =
      kind === "subscriber"
        ? `${ids.length} subscriber${ids.length === 1 ? "" : "s"}`
        : kind === "comment"
          ? `${ids.length} comment${ids.length === 1 ? "" : "s"}`
          : `${ids.length} ${ids.length === 1 ? "enquiry" : "enquiries"}`;
    const ok = await showConfirm({
      title: `Delete ${what}?`,
      message: `Are you sure you want to delete ${what}? It will move to the Archive box where you can restore it within 15 days.`,
    });
    if (!ok) return;
    const res = await fetch("/api/admin/moderation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, action: "delete", ids }),
    });
    if (!res.ok) {
      showToast("Action failed. Please try again.", undefined, "error");
      return;
    }
    setSelected(new Set());
    await load();
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(ids: string[]) {
    setSelected((prev) => {
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));
      const next = new Set(prev);
      ids.forEach((id) => {
        if (allSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  }

  function exportSubscribersCsv() {
    if (!data) return;
    download("subscribers.csv", [
      ["Email", "Subscribed at"],
      ...data.subscribers.map((s) => [s.email, new Date(s.createdAt).toLocaleString()]),
    ]);
  }

  function exportEnquiriesCsv(filename: string, rows: Enquiry[]) {
    download(filename, [
      ["Name", "Email", "Phone", "Organization", "Type", "Event date", "Message", "Received at"],
      ...rows.map((e) => [
        `${e.firstName} ${e.lastName ?? ""}`.trim(),
        e.email,
        e.phone ?? "",
        e.organization,
        e.type,
        e.eventDate ?? "",
        e.message ?? "",
        new Date(e.createdAt).toLocaleString(),
      ]),
    ]);
  }

  function exportCommentsCsv() {
    if (!data) return;
    download("comments.csv", [
      ["Name", "Email", "IP", "User Agent", "Post", "Comment", "Approved", "User ID", "Device token", "Received at"],
      ...data.comments.map((c) => [
        c.name,
        c.email ?? "",
        c.ip ?? "",
        c.userAgent ?? "",
        c.post.title,
        c.content,
        c.approved ? "Yes" : "No",
        c.userId ?? "",
        c.clientToken ?? "",
        new Date(c.createdAt).toLocaleString(),
      ]),
    ]);
  }

  const filteredSubscribers = useMemo(() => {
    if (!data) return [];
    const q = subscriberFilter.trim().toLowerCase();
    if (!q) return data.subscribers;
    return data.subscribers.filter((s) => s.email.toLowerCase().includes(q));
  }, [data, subscriberFilter]);

  const contactEnquiries = useMemo(
    () => data?.enquiries.filter((e) => e.type !== "PUBLIC_SPEAKING") ?? [],
    [data]
  );
  const speakingEnquiries = useMemo(
    () => data?.enquiries.filter((e) => e.type === "PUBLIC_SPEAKING") ?? [],
    [data]
  );

  const counts = {
    Comments: data?.comments.length ?? 0,
    Subscribers: data?.subscribers.length ?? 0,
    Contact: contactEnquiries.length,
    Speaking: speakingEnquiries.length,
  };

  // ── Unified tab-bar toolbar: select-all + bulk actions + export live in
  // the tabs row itself so the icons are identical on every tab. ──
  const activeKind: "comment" | "subscriber" | "enquiry" =
    tab === "Comments" ? "comment" : tab === "Subscribers" ? "subscriber" : "enquiry";
  const activeIds: string[] =
    tab === "Comments"
      ? (data?.comments.map((c) => c.id) ?? [])
      : tab === "Subscribers"
        ? filteredSubscribers.map((s) => s.id)
        : tab === "Contact"
          ? contactEnquiries.map((e) => e.id)
          : speakingEnquiries.map((e) => e.id);
  const activeSelected = activeIds.filter((id) => selected.has(id));
  const allSelected = activeIds.length > 0 && activeSelected.length === activeIds.length;

  function exportActive() {
    if (tab === "Comments") exportCommentsCsv();
    else if (tab === "Subscribers") exportSubscribersCsv();
    else if (tab === "Contact") exportEnquiriesCsv("contact-enquiries.csv", contactEnquiries);
    else exportEnquiriesCsv("speaking-enquiries.csv", speakingEnquiries);
  }

  function bulkDeleteSelected() {
    void act(activeKind, activeSelected);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Community</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review blog comments, newsletter subscribers, contact form and speaking inquiries.
        </p>
      </header>

      <div className="flex items-end justify-between gap-2 border-b border-border">
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {TABS.map((t) => {
            const hasNew =
              (t === "Comments" && newCounts.comments > 0) ||
              (t === "Subscribers" && newCounts.subscribers > 0) ||
              ((t === "Contact" || t === "Speaking") && newCounts.enquiries > 0);
            return (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  tab === t
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {t}
                  {hasNew && (
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  )}
                  <CountBadge count={counts[t]} active={tab === t} />
                </span>
              </button>
            );
          })}
        </div>
        {data && (
          <div className="flex shrink-0 items-center gap-1.5 pb-1.5">
            {activeSelected.length > 0 && (
              <span className="mr-0.5 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent tabular-nums">
                {activeSelected.length}
              </span>
            )}
            <IconButton
              variant="secondary"
              onClick={() => toggleAll(activeIds)}
              disabled={activeIds.length === 0}
              title={allSelected ? "Deselect all" : "Select all"}
              aria-label={allSelected ? `Deselect all ${tab.toLowerCase()}` : `Select all ${tab.toLowerCase()}`}
              aria-pressed={allSelected}
            >
              {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            </IconButton>
            {activeSelected.length > 0 && (
              <div className="w-40">
                <Dropdown
                  id="bulk-actions"
                  label="Bulk actions"
                  value=""
                  onChange={(v) => {
                    if (v === "delete") bulkDeleteSelected();
                  }}
                  placeholder="Actions…"
                  options={[{ value: "delete", label: "Delete selected" }]}
                />
              </div>
            )}
            <IconButton
              variant="secondary"
              onClick={exportActive}
              title={`Export ${tab.toLowerCase()} CSV`}
              aria-label={`Export ${tab.toLowerCase()} CSV`}
            >
              <Download className="h-4 w-4" />
            </IconButton>
          </div>
        )}
      </div>

      {!data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : tab === "Comments" ? (
        <div>
          {data.comments.length === 0 ? (
            <EmptyState text="No comments yet. Comments on blog posts will appear here automatically." />
          ) : (
            <CommentList
              comments={data.comments}
              selected={selected}
              onToggle={toggle}
              onDelete={(id) => act("comment", [id])}
              onReplyDone={load}
            />
          )}
        </div>
      ) : tab === "Subscribers" ? (
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative max-w-sm flex-1 min-w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                value={subscriberFilter}
                onChange={(e) => setSubscriberFilter(e.target.value)}
                placeholder="Filter by email…"
                aria-label="Filter subscribers by email"
                className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
          {filteredSubscribers.length === 0 ? (
            <EmptyState text={subscriberFilter ? "No subscribers match your filter." : "No subscribers yet."} />
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {filteredSubscribers.map((s) => (
                <li key={s.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={selected.has(s.id)}
                      onChange={() => toggle(s.id)}
                      aria-label={`Select subscriber ${s.email}`}
                      className="accent-[var(--accent)] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm truncate">{s.email}</p>
                      <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <IconButton variant="danger" onClick={() => act("subscriber", [s.id])} title="Remove subscriber" aria-label={`Remove subscriber ${s.email}`}>
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : tab === "Contact" ? (
        <div>
          <EnquiryList
            enquiries={contactEnquiries}
            selected={selected}
            onToggle={toggle}
            onDelete={(id) => act("enquiry", [id])}
          />
        </div>
      ) : (
        <div>
          <EnquiryList
            enquiries={speakingEnquiries}
            selected={selected}
            onToggle={toggle}
            onDelete={(id) => act("enquiry", [id])}
          />
        </div>
      )}
    </div>
  );
}
