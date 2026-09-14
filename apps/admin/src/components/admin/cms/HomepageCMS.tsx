"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Quote,
  Save,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  Check,
  RotateCcw,
  Sliders,
} from "lucide-react";
import { toast } from "@/components/admin/Toast";

type HeroData = {
  id: string;
  activeImage: string;
  imageUrl: string;
  mobilePosition: string;
  tabletPosition: string;
  desktopPosition: string;
  designation: string;
  title: string;
  subtitle: string;
  tagline1: string;
  tagline2: string;
  tagline3: string;
};

type LifeRazorData = {
  id: string;
  pill: string;
  heading: string;
  accent: string;
  description: string;
};

const HERO_PRESETS: Record<
  string,
  {
    key: string;
    title: string;
    tag: string;
    description: string;
    imageUrl: string;
    mobilePosition: string;
    tabletPosition: string;
    desktopPosition: string;
  }
> = {
  hero_sagar_lad: {
    key: "hero_sagar_lad",
    title: "Wood Panel Signature",
    tag: "Signature Warm Tone",
    description: "Executive warm studio portrait calibrated for deep author & speaker presence.",
    imageUrl: "/images/heroes/hero_sagar_lad.webp",
    mobilePosition: "object-[66%_32%]",
    tabletPosition: "sm:object-[61%_24%]",
    desktopPosition: "lg:object-[0%_43%]",
  },
  hero_home: {
    key: "hero_home",
    title: "White Wall Modern Suite",
    tag: "High-Contrast Studio",
    description: "Crisp white studio portrait calibrated for high-impact clean aesthetics.",
    imageUrl: "/images/heroes/hero_home.webp",
    mobilePosition: "object-[76%_24%]",
    tabletPosition: "sm:object-[88%_22%]",
    desktopPosition: "lg:object-[0%_30%]",
  },
};

const DEFAULT_HERO: HeroData = {
  id: "default",
  activeImage: "hero_sagar_lad",
  imageUrl: HERO_PRESETS.hero_sagar_lad.imageUrl,
  mobilePosition: HERO_PRESETS.hero_sagar_lad.mobilePosition,
  tabletPosition: HERO_PRESETS.hero_sagar_lad.tabletPosition,
  desktopPosition: HERO_PRESETS.hero_sagar_lad.desktopPosition,
  designation: "Author · Public Speaker",
  title: "Sagar Lad",
  subtitle: "Your friend, mentor and Guide",
  tagline1: "MIND UP.",
  tagline2: "Change your MIND.",
  tagline3: "Change your life.",
};

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40 transition-all";
const labelCls = "block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5";

export function HomepageCMS() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "liferazor" ? "liferazor" : "hero";

  const [tab, setTab] = useState<"hero" | "liferazor">(initialTab);

  // Hero state
  const [hero, setHero] = useState<HeroData>(DEFAULT_HERO);
  const [heroLoading, setHeroLoading] = useState(true);
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroSaved, setHeroSaved] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showAdvancedPositions, setShowAdvancedPositions] = useState(false);

  // LifeRazor state
  const [lifeRazor, setLifeRazor] = useState<LifeRazorData | null>(null);
  const [lrLoading, setLrLoading] = useState(true);
  const [lrSaving, setLrSaving] = useState(false);
  const [lrSaved, setLrSaved] = useState(false);

  // Load Hero
  const loadHero = useCallback(async () => {
    try {
      setHeroLoading(true);
      const res = await fetch("/api/admin/hero", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.hero) {
          setHero(data.hero);
        }
      }
    } catch {
      toast.error("Failed to load hero configuration.");
    } finally {
      setHeroLoading(false);
    }
  }, []);

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
    loadHero();
    loadLifeRazor();
  }, [loadHero, loadLifeRazor]);

  // Select Hero Preset
  const handleSelectHeroPreset = (key: string) => {
    const preset = HERO_PRESETS[key];
    if (!preset) return;

    setHero((prev) => ({
      ...prev,
      activeImage: key,
      imageUrl: preset.imageUrl,
      mobilePosition: preset.mobilePosition,
      tabletPosition: preset.tabletPosition,
      desktopPosition: preset.desktopPosition,
    }));
    toast.success(`Selected "${preset.title}". Responsive position calibrated automatically.`);
  };

  // Reset Calibrated Positions
  const handleResetPositions = () => {
    const preset = HERO_PRESETS[hero.activeImage] ?? HERO_PRESETS.hero_sagar_lad;
    setHero((prev) => ({
      ...prev,
      mobilePosition: preset.mobilePosition,
      tabletPosition: preset.tabletPosition,
      desktopPosition: preset.desktopPosition,
    }));
    toast.info("Reset positions to default calibration.");
  };

  // Save Hero
  const handleSaveHero = async () => {
    try {
      setHeroSaving(true);
      setHeroSaved(false);
      const res = await fetch("/api/admin/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hero),
      });

      if (res.ok) {
        const data = await res.json();
        setHero(data.hero);
        setHeroSaved(true);
        toast.success("Homepage Hero updated and revalidated successfully!");
        setTimeout(() => setHeroSaved(false), 2500);
      } else {
        toast.error("Failed to save hero updates.");
      }
    } catch {
      toast.error("Network error while saving hero updates.");
    } finally {
      setHeroSaving(false);
    }
  };

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
      {/* Header & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Homepage CMS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage homepage visual hero assets, calibrated responsive viewports, and featured quotes.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTab("hero")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              tab === "hero"
                ? "bg-background text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Hero Section
          </button>
          <button
            type="button"
            onClick={() => setTab("liferazor")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              tab === "liferazor"
                ? "bg-background text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Quote className="w-3.5 h-3.5 text-accent" />
            Current Life Razor
          </button>
        </div>
      </div>

      {/* TAB 1: HERO SECTION */}
      {tab === "hero" && (
        <div className="space-y-8">
          {heroLoading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-3 text-accent" />
              Loading hero settings...
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Left Column: Controls (7 cols) */}
              <div className="xl:col-span-7 space-y-6">
                {/* Image Selection Cards */}
                <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-base sm:text-lg font-bold">1. Select Hero Image</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Choose which hero portrait is active. Calibrated responsive coordinates auto-apply.
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                      Auto-Calibrated
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {Object.values(HERO_PRESETS).map((preset) => {
                      const isSelected = hero.activeImage === preset.key;
                      return (
                        <div
                          key={preset.key}
                          onClick={() => handleSelectHeroPreset(preset.key)}
                          className={`group relative flex flex-col cursor-pointer rounded-xl border p-3 transition-all ${
                            isSelected
                              ? "border-accent ring-2 ring-accent/20 bg-accent/[0.03] shadow-md"
                              : "border-border hover:border-border/80 hover:bg-muted/40"
                          }`}
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-neutral-900 mb-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={preset.imageUrl}
                              alt={preset.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                <Check className="w-3 h-3" /> Active
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                            {preset.tag}
                          </span>
                          <h3 className="font-display text-sm font-bold text-foreground mt-0.5">
                            {preset.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {preset.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Responsive coordinates summary */}
                  <div className="mt-4 rounded-xl bg-muted/40 border border-border/70 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-accent" /> Active Calibration
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAdvancedPositions(!showAdvancedPositions)}
                          className="text-[11px] font-semibold text-muted-foreground hover:text-foreground underline"
                        >
                          {showAdvancedPositions ? "Hide values" : "Edit values"}
                        </button>
                        <button
                          type="button"
                          onClick={handleResetPositions}
                          title="Reset to calibrated presets"
                          className="text-[11px] text-muted-foreground hover:text-accent flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="rounded-lg bg-background p-2 border border-border/60">
                        <span className="block font-medium text-muted-foreground text-[10px]">Mobile</span>
                        <code className="font-mono text-foreground font-semibold">{hero.mobilePosition}</code>
                      </div>
                      <div className="rounded-lg bg-background p-2 border border-border/60">
                        <span className="block font-medium text-muted-foreground text-[10px]">Tablet</span>
                        <code className="font-mono text-foreground font-semibold">{hero.tabletPosition}</code>
                      </div>
                      <div className="rounded-lg bg-background p-2 border border-border/60">
                        <span className="block font-medium text-muted-foreground text-[10px]">Desktop</span>
                        <code className="font-mono text-foreground font-semibold">{hero.desktopPosition}</code>
                      </div>
                    </div>

                    {showAdvancedPositions && (
                      <div className="pt-2 border-t border-border/60 space-y-2">
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground">Mobile Class</label>
                          <input
                            type="text"
                            value={hero.mobilePosition}
                            onChange={(e) => setHero({ ...hero, mobilePosition: e.target.value })}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground">Tablet Class</label>
                          <input
                            type="text"
                            value={hero.tabletPosition}
                            onChange={(e) => setHero({ ...hero, tabletPosition: e.target.value })}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground">Desktop Class</label>
                          <input
                            type="text"
                            value={hero.desktopPosition}
                            onChange={(e) => setHero({ ...hero, desktopPosition: e.target.value })}
                            className={inputCls}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Text & Content Management */}
                <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
                  <h2 className="font-display text-base sm:text-lg font-bold">2. Hero Copy & Taglines</h2>

                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Designation / Badge</label>
                      <input
                        type="text"
                        value={hero.designation}
                        onChange={(e) => setHero({ ...hero, designation: e.target.value })}
                        placeholder="Author · Public Speaker"
                        className={inputCls}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Name / Heading Title</label>
                        <input
                          type="text"
                          value={hero.title}
                          onChange={(e) => setHero({ ...hero, title: e.target.value })}
                          placeholder="Sagar Lad"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Subtitle</label>
                        <input
                          type="text"
                          value={hero.subtitle}
                          onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                          placeholder="Your friend, mentor and Guide"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={labelCls}>Tagline 1</label>
                        <input
                          type="text"
                          value={hero.tagline1}
                          onChange={(e) => setHero({ ...hero, tagline1: e.target.value })}
                          placeholder="MIND UP."
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Tagline 2</label>
                        <input
                          type="text"
                          value={hero.tagline2}
                          onChange={(e) => setHero({ ...hero, tagline2: e.target.value })}
                          placeholder="Change your MIND."
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Tagline 3</label>
                        <input
                          type="text"
                          value={hero.tagline3}
                          onChange={(e) => setHero({ ...hero, tagline3: e.target.value })}
                          placeholder="Change your life."
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveHero}
                    disabled={heroSaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-all shadow-md disabled:opacity-50"
                  >
                    {heroSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : heroSaved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {heroSaving ? "Publishing Changes..." : heroSaved ? "Saved & Live!" : "Publish Hero Changes"}
                  </button>

                  {heroSaved && (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Site cache revalidated
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Live Responsive Preview (5 cols) */}
              <div className="xl:col-span-5 space-y-4 sticky top-6">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-sm font-bold">Live Device Preview</h3>
                      <p className="text-[11px] text-muted-foreground">Simulate device aspect ratios & crop</p>
                    </div>

                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("desktop")}
                        title="Desktop view (16:9)"
                        className={`p-1.5 rounded-lg transition-all ${
                          previewDevice === "desktop"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("tablet")}
                        title="Tablet view"
                        className={`p-1.5 rounded-lg transition-all ${
                          previewDevice === "tablet"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Tablet className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("mobile")}
                        title="Mobile view"
                        className={`p-1.5 rounded-lg transition-all ${
                          previewDevice === "mobile"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Device Viewport Simulation */}
                  <div className="flex justify-center bg-neutral-950 p-4 rounded-xl border border-neutral-800 overflow-hidden min-h-[380px] items-center">
                    <div
                      className={`relative transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-neutral-800 bg-[#0a0f1d] text-white flex flex-col ${
                        previewDevice === "desktop"
                          ? "w-full aspect-[16/10]"
                          : previewDevice === "tablet"
                          ? "w-[85%] aspect-[4/5]"
                          : "w-[240px] aspect-[9/16]"
                      }`}
                    >
                      {/* Top browser/frame dot header */}
                      <div className="h-6 bg-neutral-900/90 border-b border-neutral-800/80 px-3 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500/80" />
                          <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                          <span className="w-2 h-2 rounded-full bg-green-500/80" />
                        </div>
                        <span className="text-[9px] text-neutral-400 font-mono">
                          {previewDevice === "desktop"
                            ? "desktop (lg)"
                            : previewDevice === "tablet"
                            ? "tablet (sm)"
                            : "mobile"}
                        </span>
                      </div>

                      {/* Main hero preview container */}
                      <div className="relative flex-1 w-full overflow-hidden flex flex-col">
                        {/* Background ambient radial */}
                        <div
                          className="absolute inset-0 pointer-events-none opacity-40"
                          style={{
                            background:
                              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(13,33,161,0.35), transparent 70%)",
                          }}
                        />

                        {/* Layout based on preview mode */}
                        {previewDevice === "desktop" ? (
                          <div className="relative z-10 grid grid-cols-12 h-full">
                            {/* Left Text */}
                            <div className="col-span-7 p-5 flex flex-col justify-center space-y-2">
                              <span className="text-[9px] font-bold tracking-widest text-[#5b7bfb] uppercase">
                                {hero.designation || "Author · Public Speaker"}
                              </span>
                              <h2 className="font-display text-lg font-bold leading-tight text-white">
                                {hero.title || "Sagar Lad"}
                              </h2>
                              <p className="text-[10px] text-neutral-300 leading-snug">
                                {hero.subtitle || "Your friend, mentor and Guide"}
                              </p>
                              <div className="pt-2 flex flex-col gap-0.5 text-[9px] font-semibold text-neutral-400">
                                <span>{hero.tagline1}</span>
                                <span>{hero.tagline2}</span>
                                <span className="text-white font-bold">{hero.tagline3}</span>
                              </div>
                            </div>

                            {/* Right Image */}
                            <div className="col-span-5 relative h-full overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={hero.imageUrl}
                                alt="Preview"
                                className={`w-full h-full object-cover ${
                                  hero.desktopPosition.replace("lg:", "") || "object-[0%_32%]"
                                }`}
                              />
                            </div>
                          </div>
                        ) : previewDevice === "tablet" ? (
                          <div className="relative z-10 flex flex-col h-full">
                            {/* Text Header */}
                            <div className="p-4 space-y-1.5 shrink-0 bg-gradient-to-b from-[#0a0f1d] to-transparent">
                              <span className="text-[9px] font-bold tracking-widest text-[#5b7bfb] uppercase">
                                {hero.designation}
                              </span>
                              <h2 className="font-display text-base font-bold text-white">
                                {hero.title}
                              </h2>
                              <p className="text-[10px] text-neutral-300">
                                {hero.subtitle}
                              </p>
                            </div>
                            {/* Image Container */}
                            <div className="relative flex-1 w-full overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={hero.imageUrl}
                                alt="Preview"
                                className={`w-full h-full object-cover ${
                                  hero.tabletPosition.replace("sm:", "") || "object-[86%_24%]"
                                }`}
                              />
                            </div>
                          </div>
                        ) : (
                          // Mobile Layout
                          <div className="relative z-10 flex flex-col h-full">
                            <div className="p-3 shrink-0 bg-[#0a0f1d]">
                              <span className="text-[8px] font-bold text-[#5b7bfb] uppercase">
                                {hero.designation}
                              </span>
                              <h2 className="font-display text-xs font-bold text-white leading-tight">
                                {hero.title}
                              </h2>
                            </div>
                            <div className="relative flex-1 w-full overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={hero.imageUrl}
                                alt="Preview"
                                className={`w-full h-full object-cover ${hero.mobilePosition || "object-[66%_32%]"}`}
                              />
                            </div>
                            <div className="p-2.5 shrink-0 bg-neutral-900/90 text-center text-[8px] text-neutral-300">
                              <span>{hero.tagline3}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-[11px] text-muted-foreground">
                    Live reflection of responsive classes & copy.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CURRENT LIFE RAZOR */}
      {tab === "liferazor" && (
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
              {/* Left Column: Form Fields (6 cols) */}
              <div className="xl:col-span-6 space-y-6">
                <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-base sm:text-lg font-bold">Life Razor Copy</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        This section sits on the homepage under the featured hero, guiding readers with a core mental model.
                      </p>
                    </div>
                  </div>

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

                {/* Actions */}
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

              {/* Right Column: High Fidelity Preview (6 cols) */}
              <div className="xl:col-span-6 space-y-4 sticky top-6">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-display text-sm font-bold">Homepage Section Preview</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Matches the live section styling on <span className="font-mono">sagarlad.com</span>
                    </p>
                  </div>

                  {/* High-Fidelity Preview Box */}
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
      )}
    </div>
  );
}
