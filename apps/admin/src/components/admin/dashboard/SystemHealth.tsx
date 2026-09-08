"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Database,
  Globe,
  Link2,
  Mail,
  BarChart3,
  HardDrive,
  Settings,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

type HealthStatus = "ok" | "warn" | "error";
type HealthCheck = {
  label: string;
  status: HealthStatus;
  message: string;
  latencyMs?: number;
};
type HealthResponse = {
  status: HealthStatus;
  timestamp: string;
  checks: HealthCheck[];
};

const CHECK_ICONS: Record<string, typeof Database> = {
  Database,
  Website: Globe,
  "Shared Data": Link2,
  "Brevo (Email)": Mail,
  "Google Analytics": BarChart3,
  "Supabase Storage": HardDrive,
  Environment: Settings,
};

const STATUS_CONFIG: Record<HealthStatus, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  ok: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Connected" },
  warn: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", label: "Warning" },
  error: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Failed" },
};

const PRIORITY: Record<HealthStatus, number> = { error: 0, warn: 1, ok: 2 };

export function SystemHealth() {
  const [data, setData] = useState<HealthResponse | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/health", { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const sorted = data?.checks
    ? [...data.checks].sort((a, b) => PRIORITY[a.status] - PRIORITY[b.status])
    : [];
  const shown = sorted.slice(0, 4);
  const remaining = sorted.length - shown.length;
  const okCount = data?.checks.filter((c) => c.status === "ok").length ?? 0;
  const totalChecks = data?.checks.length ?? 0;

  return (
    <div className="space-y-4">
      {/* Status summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              data?.status === "ok" ? "bg-emerald-500" : data?.status === "warn" ? "bg-amber-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium">
            {data ? `${okCount}/${totalChecks} systems healthy` : "Checking…"}
          </span>
        </div>
        {data && (
          <span className="text-xs text-muted-foreground">
            {data.status === "ok" ? "All good" : data.status === "warn" ? "Needs attention" : "Issues found"}
          </span>
        )}
      </div>

      {/* Check cards grid */}
      {shown.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shown.map((check) => {
            const Icon = CHECK_ICONS[check.label] ?? Settings;
            const cfg = STATUS_CONFIG[check.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={check.label}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-3"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{check.label}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StatusIcon className={`w-3 h-3 ${cfg.color}`} />
                    <span className="text-xs text-muted-foreground">{cfg.label}</span>
                    {check.latencyMs !== undefined && (
                      <span className="text-[10px] text-muted-foreground tabular-nums">· {check.latencyMs}ms</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : data ? (
        <p className="text-sm text-muted-foreground">No checks available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[60px] rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      )}

      {/* Remaining + View all */}
      <div className="flex items-center justify-between pt-1">
        {remaining > 0 && (
          <span className="text-xs text-muted-foreground">
            +{remaining} more {remaining === 1 ? "check" : "checks"}
          </span>
        )}
        <Link
          href="/admin/settings#health"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto"
        >
          View all checks <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
