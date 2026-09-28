import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Plus,
  FileText,
  Mail,
  TrendingUp,
  Radio,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Video,
  Quote,
  MessagesSquare,
  Globe,
  Smartphone,
  Monitor,
  Repeat,
} from "lucide-react";
import { getDashboardStats, getDashboardExtras, getSocialLinksForDashboard } from "@/lib/content";
import { getGaAnalytics, prettyPagePath } from "@/lib/analytics";
import { activityLabel, timeAgo, DEVICE_ACTIONS } from "@/lib/activity";
import { adminHeartbeat } from "@/lib/heartbeat";
import { formatCompact } from "@/lib/charts";
import { TrafficChart } from "@/components/admin/dashboard/TrafficChart";
import { SystemHealth } from "@/components/admin/dashboard/SystemHealth";
import { WorldMap } from "@/components/admin/dashboard/WorldMap";
import { KPISection } from "@/components/admin/dashboard/KPISection";
import { RecentPostsCard } from "@/components/admin/dashboard/RecentPostsCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
 
export const dynamic = "force-dynamic";
 
export default async function DashboardPage() {
  let recentPosts: { title: string; slug: string; published: boolean; views: number; likes: number }[] = [];
  let published = 0;
  let drafts = 0;
  let scheduled = 0;
  let socialLinks: { label: string; href: string; icon: string | null }[] = [];
  let extras: {
    activeSubs: number;
    lastCampaign: { subject: string; createdAt: Date; _count: { deliveries: number } } | null;
    queued: number;
    books: number;
    videos: number;
    quotes: number;
    pendingComments: number;
    activity: { action: string; createdAt: Date; device: string | null }[];
  } = {
    activeSubs: 0,
    lastCampaign: null,
    queued: 0,
    books: 0,
    videos: 0,
    quotes: 0,
    pendingComments: 0,
    activity: [],
  };

  const fallbackGa: { ok: true; data: import("@/lib/analytics").GaAnalytics } = {
    ok: true,
    data: {
      days: 14,
      configured: false,
      totals: { users: 0, newUsers: 0, sessions: 0, pageviews: 0, events: 0, avgEngagement: 0, engagementRate: 0, bounceRate: 0 },
      daily: [],
      topPages: [],
      topSources: [],
      topDevices: [],
      topCountries: [],
      newVsReturning: [],
    },
  };
  let ga = fallbackGa;

  try {
    adminHeartbeat();
    const [statsResult, extrasResult, gaResult, socialsResult] = await Promise.all([
      getDashboardStats(),
      getDashboardExtras(),
      getGaAnalytics(14).catch(() => fallbackGa),
      getSocialLinksForDashboard(),
    ]);

    const [, , , subs, recent] = statsResult;
    recentPosts = recent;
    extras = extrasResult;
    extras.activeSubs = subs;
    ga = gaResult;
    socialLinks = socialsResult;
  } catch (e) {
    console.error("Failed to load dashboard stats:", e);
  }
  const gaData = ga.data;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const maxSource = Math.max(...(gaData.topSources.map((s) => s.sessions) ?? [1]));
  const contentStats = [
    { label: "Books", value: extras.books, href: "/admin/content?tab=books", icon: BookOpen },
    { label: "Videos", value: extras.videos, href: "/admin/content?tab=videos", icon: Video },
    { label: "Quotes", value: extras.quotes, href: "/admin/content", icon: Quote },
    { label: "Comments", value: extras.pendingComments, href: "/admin/moderation", icon: MessagesSquare },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{greeting}, Sagar</h1>
          <p className="mt-1 text-sm text-muted-foreground">{today}</p>
        </div>
        <Link href="/admin/posts/new">
          <Button variant="primary">
            <Plus className="w-4 h-4" /> New post
          </Button>
        </Link>
      </header>

      {/* Analytics notice */}
      {!gaData.configured && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
          Analytics not connected yet. Add <code className="rounded bg-muted px-1.5 py-0.5 text-xs">GA_PROPERTY_ID</code> to your .env to see traffic data.
        </div>
      )}

      {/* KPI row */}
      <KPISection totals={gaData.totals} daily={gaData.daily} />

      {/* Traffic chart — full width */}
      <section>
        <TrafficChart initial={ga} />
      </section>

      {/* Top Sources + Content + Newsletter */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Top Sources — GA when available, social links as fallback */}
        <Card title="Top sources" icon={Radio}>
          {gaData.topSources.length > 0 ? (
            <ul className="space-y-3">
              {gaData.topSources.slice(0, 6).map((s) => (
                <li key={s.source}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{s.source}</span>
                    <span className="text-muted-foreground tabular-nums">{s.sessions}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <div className="h-1.5 rounded-full bg-accent transition-all duration-500" style={{ width: `${Math.max(4, (s.sessions / maxSource) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : socialLinks.length > 0 ? (
            <ul className="space-y-2">
              {socialLinks.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted/60 transition-colors"
                  >
                    <span className="font-medium">{s.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No sources configured.</p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
            <span>
              Engagement{" "}
              <span className="block font-semibold text-foreground tabular-nums">{gaData.totals.engagementRate}%</span>
            </span>
            <span>
              Bounce rate{" "}
              <span className="block font-semibold text-foreground tabular-nums">{gaData.totals.bounceRate.toFixed(1)}%</span>
            </span>
          </div>
        </Card>

        <Card title="Content" icon={FileText}>
          <ul className="space-y-1">
            {contentStats.map((s) => (
              <li key={s.label}>
                <Link href={s.href} className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm hover:bg-muted/60 transition-all duration-150">
                  <span className="inline-flex items-center gap-2.5 font-medium">
                    <s.icon className="w-4 h-4 text-accent" /> {s.label}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{s.value}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Newsletter" icon={Mail}>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active subscribers</span>
              <span className="font-semibold tabular-nums">{extras.activeSubs}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Queued to send</span>
              <span className="font-semibold tabular-nums">{extras.queued}</span>
            </div>
            {extras.lastCampaign && (
              <div className="border-t border-border pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Last broadcast</p>
                <p className="mt-1 truncate font-medium">{extras.lastCampaign.subject}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(extras.lastCampaign.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {extras.lastCampaign._count.deliveries} deliveries
                </p>
              </div>
            )}
          </div>
          <Link href="/admin/newsletter" className="mt-4 inline-flex items-center gap-1 text-sm text-accent font-medium hover:underline">
            Open newsletter <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </section>

      {/* System Health + Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <Card title="System Health" icon={RefreshCw}>
          <SystemHealth />
        </Card>

        <Card
          title="Recent activity"
          icon={RefreshCw}
          action={
            <Link href="/admin/activity" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          {extras.activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {extras.activity.map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate">{activityLabel(a.action)}</span>
                    {DEVICE_ACTIONS.has(a.action) && a.device && (
                      <span className="block truncate text-xs text-muted-foreground">{a.device}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{timeAgo(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* Recent posts — tap Views to switch to Top performing */}
      <section>
        <RecentPostsCard posts={recentPosts} />
      </section>

      {/* Top pages table — top 5 here, the rest on the full page */}
      {gaData.topPages.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Top pages</h2>
            {gaData.topPages.length > 5 && (
              <Link href="/admin/pages" className="inline-flex items-center gap-1 text-sm text-accent font-medium hover:underline">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
          <Card>
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Page</th>
                    <th className="px-5 py-3 text-right">Views</th>
                    <th className="px-5 py-3 text-right">Users</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {gaData.topPages.slice(0, 5).map((p) => (
                    <tr key={p.path} className="hover:bg-muted/30 transition-colors duration-150">
                      <td className="px-5 py-3">
                        <span className="block font-medium">{prettyPagePath(p.path)}</span>
                        {prettyPagePath(p.path) !== p.path && (
                          <span className="block text-xs text-muted-foreground tabular-nums">{p.path}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">{formatCompact(p.pageviews)}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{formatCompact(p.users)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}

    </div>
  );
}
