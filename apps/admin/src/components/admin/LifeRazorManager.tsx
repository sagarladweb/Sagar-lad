"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Loader2 } from "lucide-react";

type LifeRazorData = {
  id: string;
  pill: string;
  heading: string;
  accent: string;
  description: string;
};

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40 transition-colors";
const labelCls = "block text-xs font-semibold text-muted-foreground mb-1";

export function LifeRazorManager() {
  const [data, setData] = useState<LifeRazorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/liferazor", { cache: "no-store" });
      const json = await res.json();
      setData(json.lifeRazor);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/liferazor", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pill: data.pill,
          heading: data.heading,
          accent: data.accent,
          description: data.description,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.lifeRazor);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">Failed to load LifeRazor data.</p>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <label className={labelCls}>Pill / Label</label>
        <input value={data.pill} onChange={(e) => setData({ ...data, pill: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Heading</label>
        <input value={data.heading} onChange={(e) => setData({ ...data, heading: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Accent Text</label>
        <input value={data.accent} onChange={(e) => setData({ ...data, accent: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} rows={4} className={inputCls} />
      </div>

      {/* Live preview */}
      <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
        <p className="inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">
          {data.pill}
        </p>
        <h3 className="mt-4 font-display text-2xl sm:text-3xl font-bold leading-tight">
          {data.heading}{" "}
          <span className="text-accent-strong">{data.accent}</span>
        </h3>
        <p className="mt-3 mx-auto max-w-lg text-sm text-muted-foreground leading-relaxed">
          {data.description}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-accent text-accent-foreground px-5 py-2 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
        {saved && <span className="text-xs text-green-600 font-medium">Updated successfully</span>}
      </div>
    </div>
  );
}
