"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { Hash, BookOpen, Video, Quote, Share2, Loader2 } from "lucide-react";

const ContentManager = dynamic(() => import("@/components/admin/ContentManager").then(m => ({ default: m.ContentManager })), { ssr: false });
const BooksManager = dynamic(() => import("@/components/admin/BooksManager").then(m => ({ default: m.BooksManager })), { ssr: false });
const VideosManager = dynamic(() => import("@/components/admin/VideosManager").then(m => ({ default: m.VideosManager })), { ssr: false });
const QuotesManager = dynamic(() => import("@/components/admin/QuotesManager").then(m => ({ default: m.QuotesManager })), { ssr: false });
const SocialManager = dynamic(() => import("@/components/admin/SocialManager").then(m => ({ default: m.SocialManager })), { ssr: false });

const TABS = [
  { value: "topics", label: "Topics", icon: Hash },
  { value: "books", label: "Books", icon: BookOpen },
  { value: "videos", label: "Videos", icon: Video },
  { value: "quotes", label: "Quotes", icon: Quote },
  { value: "social", label: "Social", icon: Share2 },
] as const;

type Tab = (typeof TABS)[number]["value"];

function isTab(value: string | undefined): value is Tab {
  return TABS.some((x) => x.value === value);
}

export function ContentHub({ initialTab }: { initialTab?: string }) {
  const [tab, setTab] = useState<Tab>(isTab(initialTab) ? initialTab : "topics");

  function switchTab(t: Tab) {
    setTab(t);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", t);
    window.history.replaceState(null, "", url.toString());
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-full bg-muted p-1 w-fit">
        {TABS.map((t) => {
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => switchTab(t.value)}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                active
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}>
        {tab === "topics" && <ContentManager />}
        {tab === "books" && <BooksManager initialFilter="ALL" />}
        {tab === "videos" && <VideosManager />}
        {tab === "quotes" && <QuotesManager />}
        {tab === "social" && <SocialManager />}
      </Suspense>
    </div>
  );
}