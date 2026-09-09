"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { GaResult } from "@/lib/analytics";
import { chartGeometry, niceScale, formatCompact } from "@/lib/charts";

const RANGES = [
  { label: "7D", days: 7 },
  { label: "14D", days: 14 },
  { label: "28D", days: 28 },
  { label: "ALL", days: 90 },
] as const;

function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const SVG_W = 800;
const SVG_H = 300;
const PAD = { top: 20, right: 12, bottom: 44, left: 52 };
const CHART_W = SVG_W - PAD.left - PAD.right;
const CHART_H = SVG_H - PAD.top - PAD.bottom;

export function TrafficChart({ initial }: { initial: GaResult }) {
  const [days, setDays] = useState<number>(initial.data?.days ?? 14);
  const [result, setResult] = useState<GaResult>(initial);
  const [loading, setLoading] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setHoverX(null);
    fetch(`/api/admin/analytics?days=${days}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setResult(data as GaResult);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [days]);

  const data = result.ok ? result.data : null;
  const sessions = data?.daily.map((d) => d.sessions) ?? [];
  const pageviews = data?.daily.map((d) => d.pageviews) ?? [];
  const dailyLen = data?.daily.length ?? 0;

  const rawMax = Math.max(...sessions, ...pageviews, 1);
  const { max: yMax, ticks } = niceScale(rawMax, 5);

  const sGeo = chartGeometry(sessions, CHART_W, CHART_H, yMax, PAD.left);
  const pGeo = chartGeometry(pageviews, CHART_W, CHART_H, yMax, PAD.left);

  const labelEvery = Math.max(1, Math.ceil(dailyLen / 7));

  function xPos(i: number) {
    return dailyLen > 1
      ? PAD.left + (i * CHART_W) / (dailyLen - 1)
      : PAD.left + CHART_W / 2;
  }

  function yPos(val: number) {
    return PAD.top + CHART_H - (val / yMax) * CHART_H;
  }

  // Interpolate between two data values
  function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  // Convert SVG mouse X to interpolated data point
  function getHoverData(svgX: number) {
    if (!data || dailyLen === 0) return null;

    // Clamp to chart area
    const clamped = Math.max(PAD.left, Math.min(SVG_W - PAD.right, svgX));

    if (dailyLen === 1) {
      return {
        x: xPos(0),
        date: data.daily[0].date,
        sessions: data.daily[0].sessions,
        pageviews: data.daily[0].pageviews,
      };
    }

    // Find the fractional index
    const fraction = (clamped - PAD.left) / CHART_W;
    const exactIdx = fraction * (dailyLen - 1);
    const i0 = Math.floor(exactIdx);
    const i1 = Math.min(i0 + 1, dailyLen - 1);
    const t = exactIdx - i0;

    const d0 = data.daily[i0];
    const d1 = data.daily[i1];

    return {
      x: clamped,
      date: t < 0.5 ? d0.date : d1.date,
      sessions: Math.round(lerp(d0.sessions, d1.sessions, t)),
      pageviews: Math.round(lerp(d0.pageviews, d1.pageviews, t)),
    };
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = ((e.clientX - rect.left) / rect.width) * SVG_W;
      setHoverX(svgX);
    },
    []
  );

  const handleMouseLeave = useCallback(() => setHoverX(null), []);

  const hovered = hoverX !== null ? getHoverData(hoverX) : null;

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">Traffic</h2>
          <p className="text-xs text-muted-foreground">Sessions vs pageviews</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-muted p-1">
          {RANGES.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setDays(r.days)}
              aria-pressed={days === r.days}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                days === r.days
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" /> Sessions
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sky-500" /> Pageviews
        </span>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3">
          <div className="h-3 w-16 sk-item rounded-full" />
          <div className="h-[280px] w-full sk-item rounded-xl" />
        </div>
      ) : !data || dailyLen === 0 ? (
        <div className="mt-4 grid h-[280px] place-items-center text-center text-sm text-muted-foreground">
          No analytics data yet.
        </div>
      ) : (
        <div className="relative mt-3">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full block"
            role="img"
            aria-label="Traffic chart"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="ga-sessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="ga-pageviews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Y-axis grid + labels */}
            {ticks.map((tick) => (
              <g key={`y-${tick}`}>
                <line
                  x1={PAD.left}
                  x2={SVG_W - PAD.right}
                  y1={yPos(tick)}
                  y2={yPos(tick)}
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={PAD.left - 8}
                  y={yPos(tick) + 4}
                  fontSize="11"
                  fill="var(--muted-foreground)"
                  textAnchor="end"
                >
                  {formatCompact(tick)}
                </text>
              </g>
            ))}

            {/* Baseline */}
            <line
              x1={PAD.left}
              x2={SVG_W - PAD.right}
              y1={yPos(0)}
              y2={yPos(0)}
              stroke="var(--border)"
              strokeWidth="1"
            />

            {/* Area fills */}
            {pGeo.area && <path d={pGeo.area} fill="url(#ga-pageviews)" />}
            {sGeo.area && <path d={sGeo.area} fill="url(#ga-sessions)" />}

            {/* Lines */}
            {pGeo.line && (
              <path d={pGeo.line} fill="none" stroke="#0ea5e9" strokeWidth="1.5" />
            )}
            {sGeo.line && (
              <path d={sGeo.line} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
            )}

            {/* X-axis labels + vertical guides */}
            {data.daily.map((d, i) => {
              if (i % labelEvery !== 0 && i !== dailyLen - 1) return null;
              const x = xPos(i);
              return (
                <g key={d.date}>
                  <line
                    x1={x}
                    y1={PAD.top}
                    x2={x}
                    y2={PAD.top + CHART_H}
                    stroke="var(--border)"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                    opacity="0.3"
                  />
                  <text
                    x={x}
                    y={SVG_H - 10}
                    fontSize="11"
                    fill="var(--muted-foreground)"
                    textAnchor="middle"
                  >
                    {shortDate(d.date)}
                  </text>
                </g>
              );
            })}

            {/* Hover crosshair + dots */}
            {hovered && (
              <>
                <line
                  x1={hovered.x}
                  y1={PAD.top}
                  x2={hovered.x}
                  y2={PAD.top + CHART_H}
                  stroke="var(--foreground)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.4"
                />
                <circle
                  cx={hovered.x}
                  cy={yPos(hovered.sessions)}
                  r="4"
                  fill="var(--accent)"
                  stroke="var(--background)"
                  strokeWidth="2"
                />
                <circle
                  cx={hovered.x}
                  cy={yPos(hovered.pageviews)}
                  r="4"
                  fill="#0ea5e9"
                  stroke="var(--background)"
                  strokeWidth="2"
                />
              </>
            )}
          </svg>

          {/* HTML tooltip */}
          {hovered && (
            <div
              className="pointer-events-none absolute z-50 rounded-xl border border-border bg-card px-4 py-3 text-xs shadow-xl"
              style={{
                left: `${(hovered.x / SVG_W) * 100}%`,
                top: `${(yPos(hovered.sessions) / SVG_H) * 100}%`,
                transform: hovered.x > SVG_W * 0.65
                  ? "translate(-110%, -130%)"
                  : "translate(10%, -130%)",
              }}
            >
              <div className="mb-2 border-b border-border pb-1.5 font-semibold text-foreground">
                {shortDate(hovered.date)}
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-muted-foreground">Sessions</span>
                <span className="ml-auto font-semibold text-foreground">{hovered.sessions}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                <span className="text-muted-foreground">Pageviews</span>
                <span className="ml-auto font-semibold text-foreground">{hovered.pageviews}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
