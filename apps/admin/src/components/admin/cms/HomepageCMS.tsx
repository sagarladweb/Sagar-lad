"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Quote,
  Save,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Check,
} from "lucide-react";
import { toast } from "@/components/admin/Toast";

type LifeRazorData = {
  id: string;
  pill: string;
  heading: string;
  accent: string;
  description: string;
};

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40 transition-all";
const labelCls = "block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5";

export function HomepageCMS() {
  // LifeRazor state
  const [lifeRazor, setLifeRazor] = useState<LifeRazorData | null>(null);
  const [lrLoading, setLrLoading] = useState(true);
  const [lrSaving, setLrSaving] = useState(false);
  const [lrSaved, setLrSaved] = useState(false);

  // Load LifeRazor
  const loadLifeRazor = useCallback(async () => {
    try {
      setLrLoading(true);
      const res = await fetch("/api/admin/liferazor", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.lifeRazor) {
          setLifeRazor(data.lifeRazor);
        }
      }
    } catch {
      toast.error("Failed to load Life Razor content.");
    } finally {
      setLrLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLifeRazor();
  }, [loadLifeRazor]);

  // Save Life Razor
  const handleSaveLifeRazor = async () => {
    if (!lifeRazor) return;
    try {
      setLrSaving(true);
      setLrSaved(false);
      const res = await fetch("/api/admin/liferazor", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lifeRazor),
      });

      if (res.ok) {
        const data = await res.json();
        setLifeRazor(data.lifeRazor);
        setLrSaved(true);
        toast.success("Life Razor section updated and revalidated successfully!");
        setTimeout(() => setLrSaved(false), 2500);
      } else {
        toast.error("Failed to save Life Razor updates.");
      }
    } catch {
      toast.error("Network error while saving Life Razor.");
    } finally {
      setLrSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Website CMS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage visuals, hero calibration, and quotes sections.
          </p>
        </div>
      </div>

      {/* LIFE RAZOR */}
      <div className="space-y-8">
        {lrLoading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-3 text-accent" />
            Loading Life Razor data...
          </div>
        ) : !lifeRazor ? (
          <div className="p-8 text-center text-muted-foreground rounded-2xl border border-border">
            Failed to load Life Razor. Please try again.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            <div className="xl:col-span-6 space-y-6">
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
                <h2 className="font-display text-base sm:text-lg font-bold">Life Razor Copy</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This section sits on the homepage under the featured hero, guiding readers with a core mental model.
                </p>

                <div className="space-y-4 pt-1">
                  <div>
                    <label className={labelCls}>Pill / Badge Label</label>
                    <input
                      type="text"
                      value={lifeRazor.pill}
                      onChange={(e) => setLifeRazor({ ...lifeRazor, pill: e.target.value })}
                      placeholder="CURRENT LIFE RAZOR"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Main Heading</label>
                    <input
                      type="text"
                      value={lifeRazor.heading}
                      onChange={(e) => setLifeRazor({ ...lifeRazor, heading: e.target.value })}
                      placeholder="Say yes to what expands you."
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Accent Span Text (Colored Highlight)</label>
                    <input
                      type="text"
                      value={lifeRazor.accent}
                      onChange={(e) => setLifeRazor({ ...lifeRazor, accent: e.target.value })}
                      placeholder="Say no to what doesn't."
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Description / Supporting Note</label>
                    <textarea
                      rows={4}
                      value={lifeRazor.description}
                      onChange={(e) => setLifeRazor({ ...lifeRazor, description: e.target.value })}
                      placeholder="A simple filter for time, energy, relationships, and capital..."
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveLifeRazor}
                  disabled={lrSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-all shadow-md disabled:opacity-50"
                >
                  {lrSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : lrSaved ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {lrSaving ? "Saving Life Razor..." : lrSaved ? "Saved & Live!" : "Publish Life Razor"}
                </button>

                {lrSaved && (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Homepage updated instantly
                  </span>
                )}
              </div>
            </div>

            <div className="xl:col-span-6 space-y-4 sticky top-6">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="font-display text-sm font-bold">Homepage Section Preview</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Matches the live section styling on <span className="font-mono">sagarlad.com</span>
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-background p-8 sm:p-12 text-center shadow-inner">
                  <p className="inline-block text-[11px] font-bold tracking-wider text-accent bg-accent/10 rounded-full px-4 py-1.5 uppercase">
                    {lifeRazor.pill || "CURRENT LIFE RAZOR"}
                  </p>

                  <h2 className="mt-7 font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-foreground">
                    {lifeRazor.heading}{" "}
                    <span className="text-accent font-extrabold">{lifeRazor.accent}</span>
                  </h2>

                  <p className="mt-5 mx-auto max-w-lg text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {lifeRazor.description}
                  </p>
                </div>

                <div className="p-3 bg-muted/40 rounded-xl border border-border/70 text-xs text-muted-foreground flex items-center justify-between">
                  <span>Updates both the desktop and mobile homepage feeds instantly.</span>
                  <a
                    href="http://localhost:3000"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
                  >
                    Visit Site <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
