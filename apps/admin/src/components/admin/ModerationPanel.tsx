"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Trash2, Download, Search, MessageCircle, Send, X } from "lucide-react";
import { Dropdown } from "@/components/ui/Dropdown";
import { Button, IconButton } from "@/components/ui/Button";
import { Badge, CountBadge } from "@/components/ui/Badge";
import { SITE } from "@/lib/site";
import { showToast } from "@/components/admin/Toast";

const BADGE_KEY = "admin-moderation-last-viewed";

type Subscriber = { id: string; email: string; createdAt: string };
type Comment = {
  id: string;
  name: string;
  email: string | null;
  ip: string | null;
  userAgent: string | null;
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
  onDelete,
}: {
  enquiries: Enquiry[];
  onDelete: (id: string) => void;
}) {
  if (enquiries.length === 0) {
    return <EmptyState text="No inquiries yet." />;
  }

  return (
    <ul className="divide-y divide-border border-y border-border">
      {enquiries.map((e) => (
        <li key={e.id} className="py-4 flex items-start justify-between gap-4">
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
                <IconButton
                  variant="ghost"
                  onClick={() => {
                    setReplyTo(replyTo === c.id ? null : c.id);
                    setReplyContent("");
                  }}
                  title="Reply as Sagar Lad"
                  className={replyTo === c.id ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-accent"}
                >
                  <MessageCircle className="w-4 h-4" />
                </IconButton>
                <IconButton variant="danger" onClick={() => onDelete(c.id)} title="Delete comment">
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              </div>
            </div>

            {/* Comment body */}
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.content}</p>

            {/* Meta row */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
              {c.ip && (
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-muted-foreground">
                  IP: {c.ip}
                </span>
              )}
              {c.userAgent && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground truncate max-w-[200px] sm:max-w-[280px]" title={c.userAgent}>
                  UA: {c.userAgent}
                </span>
              )}
              {c.email && (
                <a href={`mailto:${c.email}`} className="text-muted-foreground hover:text-accent sm:hidden">
                  {c.email}
                </a>
              )}
            </div>

            {/* Reply form — inline */}
            {replyTo === c.id && (
              <div className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-accent">Replying as Sagar Lad</span>
                  <button type="button" onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply…"
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent resize-y"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={replyLoading || !replyContent.trim()}
                    onClick={() => submitReply(c)}
                    className="inline-flex items-center gap-2 rounded-full bg-accent text-black px-4 py-1.5 text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                  >
                    {replyLoading ? "Posting…" : <><Send className="w-3 h-3" /> Reply</>}
                  </button>
                  <span className="text-[11px] text-muted-foreground">{replyContent.length}/1000</span>
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Community</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review blog comments, newsletter subscribers, contact form and speaking inquiries.
        </p>
      </header>

      <div className="flex gap-2 border-b border-border">
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
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
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

      {!data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : tab === "Comments" ? (
        <div>
          {data.comments.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={data.comments.length > 0 && data.comments.every((c) => selected.has(c.id))}
                  onChange={() => toggleAll(data.comments.map((c) => c.id))}
                  className="accent-[var(--accent)]"
                />
                Select all
              </label>
              {selected.size > 0 && (
                <>
                  <span className="text-xs text-muted-foreground">{selected.size} selected</span>
                  <div className="w-52">
                    <Dropdown
                      id="comment-actions"
                      label="Bulk actions"
                      value=""
                      onChange={(v) => {
                        if (v === "delete") act("comment", [...selected]);
                      }}
                      placeholder="With selected…"
                      options={[{ value: "delete", label: "Delete selected" }]}
                    />
                  </div>
                </>
              )}
              <Button variant="secondary" size="sm" onClick={exportCommentsCsv} className="ml-auto">
                <Download className="w-4 h-4" /> Export CSV
              </Button>
            </div>
          )}
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
                className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <Button variant="secondary" size="sm" onClick={exportSubscribersCsv} disabled={data.subscribers.length === 0}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
          {filteredSubscribers.length === 0 ? (
            <EmptyState text={subscriberFilter ? "No subscribers match your filter." : "No subscribers yet."} />
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {filteredSubscribers.map((s) => (
                <li key={s.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm truncate">{s.email}</p>
                    <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</p>
                  </div>
                  <IconButton variant="danger" onClick={() => act("subscriber", [s.id])} title="Remove subscriber">
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : tab === "Contact" ? (
        <div>
          <div className="mb-4 flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (!data) return;
                download("contact-enquiries.csv", [
                  ["Name", "Email", "Phone", "Organization", "Type", "Event date", "Message", "Received at"],
                  ...contactEnquiries.map((e) => [
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
              }}
              disabled={contactEnquiries.length === 0}
            >
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
          <EnquiryList enquiries={contactEnquiries} onDelete={(id) => act("enquiry", [id])} />
        </div>
      ) : (
        <div>
          <div className="mb-4 flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (!data) return;
                download("speaking-enquiries.csv", [
                  ["Name", "Email", "Phone", "Organization", "Type", "Event date", "Message", "Received at"],
                  ...speakingEnquiries.map((e) => [
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
              }}
              disabled={speakingEnquiries.length === 0}
            >
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
          <EnquiryList enquiries={speakingEnquiries} onDelete={(id) => act("enquiry", [id])} />
        </div>
      )}
    </div>
  );
}
