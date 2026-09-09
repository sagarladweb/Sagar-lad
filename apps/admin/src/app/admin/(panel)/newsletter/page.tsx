import { prisma } from "@/lib/db";
import { assertPhase2 } from "@/lib/phase";
import { Mail, Users, Send, PenLine, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { CampaignList } from "@/components/admin/CampaignList";

export const dynamic = "force-dynamic";

const DAILY_LIMIT = parseInt(process.env.DAILY_EMAIL_LIMIT || process.env.NEWSLETTER_DAILY_LIMIT || "300", 10);

export default async function NewsletterPage() {
  assertPhase2();

  let subscriberCount = 0;
  let campaignCount = 0;
  let sentToday = 0;
  let queued = 0;
  let inFlight = 0;
  let failedToday = 0;
  let recentCampaigns: {
    id: string;
    subject: string;
    createdAt: string;
    draft: boolean;
    sent: number;
    queued: number;
    sending: number;
    failed: number;
    total: number;
  }[] = [];

  try {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);

    const [subCount, campCount, sent, queue, flight, failed, recentRows] = await Promise.all([
      prisma.newsletterSubscriber.count({ where: { unsubscribed: false } }),
      prisma.newsletterCampaign.count(),
      prisma.newsletterDelivery.count({ where: { status: "SENT", sentAt: { gte: dayStart } } }),
      prisma.newsletterDelivery.count({ where: { status: "QUEUED" } }),
      prisma.newsletterDelivery.count({ where: { status: "SENDING" } }),
      prisma.newsletterDelivery.count({ where: { status: "FAILED", createdAt: { gte: dayStart } } }),
      prisma.newsletterCampaign.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          subject: true,
          createdAt: true,
          draft: true,
          deliveries: { select: { status: true } },
        },
      }),
    ]);

    subscriberCount = subCount;
    campaignCount = campCount;
    sentToday = sent;
    queued = queue;
    inFlight = flight;
    failedToday = failed;

    recentCampaigns = recentRows.map((r) => ({
      id: r.id,
      subject: r.subject,
      createdAt: r.createdAt.toISOString(),
      draft: r.draft,
      sent: r.deliveries.filter((d) => d.status === "SENT").length,
      queued: r.deliveries.filter((d) => d.status === "QUEUED").length,
      sending: r.deliveries.filter((d) => d.status === "SENDING").length,
      failed: r.deliveries.filter((d) => d.status === "FAILED").length,
      total: r.deliveries.length,
    }));
  } catch (err) {
    console.warn("[admin newsletter] DB query failed:", (err as Error).message);
  }

  const remaining = Math.max(0, DAILY_LIMIT - sentToday - inFlight);
  const usedPct = Math.round(((sentToday + inFlight) / DAILY_LIMIT) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Newsletter</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {subscriberCount} active subscribers
          </p>
        </div>
        <Link
          href="/admin/newsletter/compose"
          className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <PenLine className="w-4 h-4" />
          Compose
        </Link>
      </div>

      {/* Daily Quota Bar */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Daily quota</span>
          <span className="tabular-nums">{sentToday + inFlight} / {DAILY_LIMIT}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              usedPct > 90 ? "bg-red-500" : usedPct > 60 ? "bg-amber-500" : "bg-green-500"
            }`}
            style={{ width: `${Math.min(usedPct, 100)}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {sentToday} sent
          </span>
          {inFlight > 0 && (
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              {inFlight} sending
            </span>
          )}
          {queued > 0 && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Mail className="w-3.5 h-3.5" />
              {queued} queued
            </span>
          )}
          {failedToday > 0 && (
            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              {failedToday} failed
            </span>
          )}
          <span className="text-muted-foreground">
            {remaining} remaining today
          </span>
        </div>
      </div>

      {/* Recent campaigns */}
      <div>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Campaigns
        </h2>
        {recentCampaigns.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
            <Mail className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              No campaigns yet. Send your first newsletter!
            </p>
            <Link
              href="/admin/newsletter/compose"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              <PenLine className="w-3.5 h-3.5" />
              Compose now
            </Link>
          </div>
        ) : (
          <CampaignList campaigns={recentCampaigns} />
        )}
      </div>
    </div>
  );
}
