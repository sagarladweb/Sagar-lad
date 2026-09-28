import { unstable_cache } from "next/cache";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

export type GaDaily = {
  date: string;
  users: number;
  sessions: number;
  pageviews: number;
  avgEngagement: number;
  bounceRate: number;
};

export type GaAnalytics = {
  days: number;
  configured: boolean;
  totals: {
    users: number;
    newUsers: number;
    sessions: number;
    pageviews: number;
    events: number;
    avgEngagement: number;
    engagementRate: number;
    bounceRate: number;
  };
  daily: GaDaily[];
  topPages: { path: string; pageviews: number; users: number }[];
  topSources: { source: string; sessions: number }[];
  topDevices: { device: string; users: number }[];
  topCountries: { country: string; users: number; sessions: number }[];
  newVsReturning: { type: "new" | "returning"; users: number }[];
};

export type GaResult = { ok: true; data: GaAnalytics };

type GaConfig = {
  propertyId: string;
  credentials: { client_email: string; private_key: string };
};

export function getGaConfig(): GaConfig | null {
  const propertyId = process.env.GA_PROPERTY_ID;
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!propertyId || !raw) return null;
  try {
    const json = raw.trim().startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");
    const credentials = JSON.parse(json);
    if (!credentials.client_email || !credentials.private_key) return null;
    return { propertyId, credentials };
  } catch {
    return null;
  }
}

function num(value?: string | number | null): number {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

// Normalise raw GA session sources into real display names and merge
// duplicates (instagram.com + ig.com + l.instagram.com → Instagram, etc.)
// so the Top sources card never shows "(direct)" or double entries.
function prettySource(raw: string): string {
  const s = raw.trim().toLowerCase();
  if (!s || s === "(direct)" || s === "(none)" || s === "direct") return "Direct";
  if (s.includes("google")) return "Google Search";
  if (s.includes("youtube")) return "YouTube";
  if (s.includes("facebook") || /(^|\.)fb\.com$/.test(s) || s === "fb" || s.startsWith("lm.facebook"))
    return "Facebook";
  if (s.includes("instagram") || /(^|\.)ig\.com$/.test(s) || s === "ig") return "Instagram";
  if (s.includes("linkedin") || s.includes("lnkd")) return "LinkedIn";
  if (s.includes("twitter") || s === "x.com" || s.endsWith(".x.com") || s === "t.co")
    return "X (Twitter)";
  if (s.includes("threads")) return "Threads";
  if (s.includes("bing")) return "Bing";
  if (s.includes("yahoo")) return "Yahoo";
  if (s.includes("duckduckgo")) return "DuckDuckGo";
  if (s.includes("pinterest")) return "Pinterest";
  if (s.includes("reddit")) return "Reddit";
  if (s.includes("whatsapp") || s === "wa.me") return "WhatsApp";
  if (s.includes("telegram") || s === "t.me") return "Telegram";
  if (s.includes("newsletter") || s.includes("email") || s.includes("mail")) return "Newsletter";
  if (s.includes("github")) return "GitHub";
  if (s.includes("chatgpt") || s.includes("openai")) return "ChatGPT";
  // Fallback: prettify the hostname (strip www. + TLD, Title Case).
  const host = s.replace(/^www\./, "").split("/")[0];
  const first = host.split(".")[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

// Pages that must never appear in Top pages: sandbox experiments and
// demo/seed posts. Top pages stays a clean list of the site's real pages.
// Extend this list any time a new scratch/demo page shows up in GA.
const TOP_PAGE_EXCLUDE = [
  /sandbox/i,
  /\/demo/i,
  /\/test/i,
  /nice-guy-good-man/i,
  /from-promise-to-reality/i,
  /human-magnet/i,
  /brainflix/i,
  /what-if-nothing-is-good-or-bad/i,
  /positive-attitude-your-passport/i,
];

function isExcludedPage(path: string): boolean {
  return TOP_PAGE_EXCLUDE.some((re) => re.test(path));
}

// Premium display names for page paths: "/" → "Home", "/blog" → "Blog",
// "/blog/my-post" → "Blog / My Post". Keeps the raw path for reference.
export function prettyPagePath(path: string): string {
  if (!path || path === "/") return "Home";
  const titleCase = (s: string) =>
    s
      .split("-")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
      .slice(0, 48);
  const KNOWN: Record<string, string> = {
    blog: "Blog",
    contact: "Contact",
    books: "Books",
    videos: "Videos",
    quotes: "Quotes",
    newsletter: "Newsletter",
    about: "About",
    hire: "Hire Me",
    speaking: "Speaking",
    press: "Press",
    mindup: "MindUp",
    "mindup-score": "MindUp Score",
    ebook: "E-book",
  };
  const parts = path.split("?")[0].split("#")[0].split("/").filter(Boolean);
  return parts
    .map((p, i) => (i === 0 && KNOWN[p.toLowerCase()] ? KNOWN[p.toLowerCase()] : titleCase(p)))
    .join("  /  ");
}

function toIsoDate(ymd: string): string {
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

// GA4 returns bounceRate / engagementRate as proportions (0..1) — normalise to
// whole percents so callers can display them directly.
function toPercent(value?: string | number | null): number {
  return Math.round(num(value) * 100);
}

function zeroAnalytics(days: number): GaResult {
  const now = new Date();
  const daily: GaDaily[] = Array.from({ length: days }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      date: d.toISOString().slice(0, 10),
      users: 0,
      sessions: 0,
      pageviews: 0,
      avgEngagement: 0,
      bounceRate: 0,
    };
  });
  return {
    ok: true,
    data: {
      days,
      configured: false,
      totals: {
        users: 0,
        newUsers: 0,
        sessions: 0,
        pageviews: 0,
        events: 0,
        avgEngagement: 0,
        engagementRate: 0,
        bounceRate: 0,
      },
      daily,
      topPages: [],
      topSources: [],
      topDevices: [],
      topCountries: [],
      newVsReturning: [
        { type: "new", users: 0 },
        { type: "returning", users: 0 },
      ],
    },
  };
}

async function fetchGaAnalytics(days: number): Promise<GaResult> {
  const config = getGaConfig();
  if (!config) return zeroAnalytics(days);

  const client = new BetaAnalyticsDataClient({
    credentials: config.credentials,
    projectId: config.credentials.client_email.split("@")[1] ?? undefined,
  });

  const dateRanges = [{ startDate: `${days}daysAgo`, endDate: "today" }];

  try {
    const [
      [overview],
      [pages],
      [sources],
      [devices],
      [countries],
      [newVsReturning],
    ] = await Promise.all([
      client.runReport({
        property: `properties/${config.propertyId}`,
        dateRanges,
        dimensions: [{ name: "date" }],
        metrics: [
          { name: "totalUsers" },
          { name: "newUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "eventCount" },
          { name: "averageSessionDuration" },
          { name: "engagementRate" },
          { name: "bounceRate" },
        ],
        orderBys: [{ dimension: { dimensionName: "date", orderType: "NUMERIC" }, desc: false }],
      }),
      client.runReport({
        property: `properties/${config.propertyId}`,
        dateRanges,
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 25,
      }),
      client.runReport({
        property: `properties/${config.propertyId}`,
        dateRanges,
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 25,
      }),
      client.runReport({
        property: `properties/${config.propertyId}`,
        dateRanges,
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "totalUsers" }, { name: "sessions" }],
        orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
        limit: 5,
      }),
      client.runReport({
        property: `properties/${config.propertyId}`,
        dateRanges,
        dimensions: [{ name: "country" }],
        metrics: [{ name: "totalUsers" }, { name: "sessions" }],
        orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
        limit: 6,
      }),
      client.runReport({
        property: `properties/${config.propertyId}`,
        dateRanges,
        dimensions: [{ name: "newVsReturning" }],
        metrics: [{ name: "totalUsers" }],
      }),
    ]);

    const overviewRows = overview?.rows ?? [];
    const daily: GaDaily[] = overviewRows.map((row) => ({      date: toIsoDate(row.dimensionValues?.[0]?.value ?? ""),
      users: num(row.metricValues?.[0]?.value),
      sessions: num(row.metricValues?.[2]?.value),
      pageviews: num(row.metricValues?.[3]?.value),
      avgEngagement: num(row.metricValues?.[5]?.value),
      bounceRate: toPercent(row.metricValues?.[7]?.value),
    }));

    const sessions = daily.reduce((acc, d) => acc + d.sessions, 0);
    const avgEngagement = sessions
      ? daily.reduce((acc, d) => acc + d.sessions * d.avgEngagement, 0) / sessions
      : 0;

    return {
      ok: true,
      data: {
        days,
        configured: true,
        totals: {
          users: daily.reduce((acc, d) => acc + d.users, 0),
          newUsers: num(overviewRows.reduce((acc, row) => acc + num(row.metricValues?.[1]?.value), 0)),
          sessions,
          pageviews: daily.reduce((acc, d) => acc + d.pageviews, 0),
          events: num(overviewRows.reduce((acc, row) => acc + num(row.metricValues?.[4]?.value), 0)),
          avgEngagement,
          engagementRate: toPercent(
            overviewRows.reduce((acc, row) => acc + num(row.metricValues?.[6]?.value), 0) /
              Math.max(1, overviewRows.length)
          ),
          bounceRate: sessions
            ? daily.reduce((acc, d) => acc + d.sessions * d.bounceRate, 0) / sessions
            : 0,
        },
        daily,
        topPages: (pages?.rows ?? [])
          .filter((row) => !isExcludedPage(row.dimensionValues?.[0]?.value ?? "/"))
          .map((row) => ({
            path: row.dimensionValues?.[0]?.value ?? "/",
            pageviews: num(row.metricValues?.[0]?.value),
            users: num(row.metricValues?.[1]?.value),
          })),
        topSources: (() => {
          const merged = new Map<string, number>();
          for (const row of sources?.rows ?? []) {
            const name = prettySource(row.dimensionValues?.[0]?.value ?? "(direct)");
            merged.set(name, (merged.get(name) ?? 0) + num(row.metricValues?.[0]?.value));
          }
          return Array.from(merged.entries())
            .map(([source, sessions]) => ({ source, sessions }))
            .sort((a, b) => b.sessions - a.sessions);
        })(),
        topDevices: (devices?.rows ?? []).map((row) => ({
          device: row.dimensionValues?.[0]?.value ?? "(unknown)",
          users: num(row.metricValues?.[0]?.value),
        })),
        topCountries: (countries?.rows ?? []).map((row) => ({
          country: row.dimensionValues?.[0]?.value ?? "(unknown)",
          users: num(row.metricValues?.[0]?.value),
          sessions: num(row.metricValues?.[1]?.value),
        })),
        newVsReturning: (() => {
          const merged = new Map<string, number>();
          for (const row of newVsReturning?.rows ?? []) {
            const type = row.dimensionValues?.[0]?.value === "new" ? "new" : "returning";
            merged.set(type, (merged.get(type) ?? 0) + num(row.metricValues?.[0]?.value));
          }
          return Array.from(merged.entries()).map(([type, users]) => ({
            type: type as "new" | "returning",
            users,
          }));
        })(),
      },
    };
  } catch (err) {
    console.error("GA analytics fetch failed:", err);
    return zeroAnalytics(days);
  }
}

export async function getGaAnalytics(days: number): Promise<GaResult> {
  return unstable_cache(async () => fetchGaAnalytics(days), ["ga-analytics", String(days)], {
    revalidate: 900,
  })();
}
