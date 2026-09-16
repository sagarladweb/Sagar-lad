"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Quote,
  Images,
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
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "@/components/admin/Toast";

type LifeRazorData = {
  id: string;
  pill: string;
  heading: string;
  accent: string;
  description: string;
};

type GalleryImage = {
  src: string;
  alt: string;
};

type SpeakingGalleryData = {
  id: string;
  enabled: boolean;
  images: GalleryImage[];
};

const DEFAULT_SPEAKING_GALLERY: SpeakingGalleryData = {
  id: "default",
  enabled: true,
  images: [
    { src: "/images/speaking/main-full-width.webp", alt: "Sagar Lad delivering a keynote" },
    { src: "/images/speaking/candid.webp", alt: "Sagar Lad candid" },
    { src: "/images/speaking/candid-speaking.webp", alt: "Sagar Lad speaking" },
    { src: "/images/speaking/candid-presentation.webp", alt: "Sagar Lad presenting" },
    { src: "/images/speaking/too-close.webp", alt: "Sagar Lad portrait" },
    { src: "/images/speaking/sagar-lad-tedx-talk-aim.webp", alt: "Sagar Lad at TEDx" },
  ],
};

const POPULAR_SPEAKING_PRESETS = [
  { label: "Main Keynote", src: "/images/speaking/main-full-width.webp" },
  { label: "Candid Stage", src: "/images/speaking/candid.webp" },
  { label: "Speaking Close", src: "/images/speaking/candid-speaking.webp" },
  { label: "Presentation", src: "/images/speaking/candid-presentation.webp" },
  { label: "Portrait", src: "/images/speaking/too-close.webp" },
  { label: "TEDx Red Dot", src: "/images/speaking/sagar-lad-tedx-talk-aim.webp" },
  { label: "Keynote Hero", src: "/images/heroes/Speaking_hero.webp" },
];

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40 transition-all";
const labelCls = "block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5";

export function HomepageCMS() {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const initialTab = rawTab === "speaking" ? "speaking" : "liferazor";

  const [tab, setTab] = useState<"liferazor" | "speaking">(initialTab);

  // LifeRazor state
  const [lifeRazor, setLifeRazor] = useState<LifeRazorData | null>(null);
  const [lrLoading, setLrLoading] = useState(true);
  const [lrSaving, setLrSaving] = useState(false);
  const [lrSaved, setLrSaved] = useState(false);

  // Speaking Gallery state
  const [gallery, setGallery] = useState<SpeakingGalleryData>(DEFAULT_SPEAKING_GALLERY);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [gallerySaving, setGallerySaving] = useState(false);
  const [gallerySaved, setGallerySaved] = useState(false);
  const [galleryPreviewDevice, setGalleryPreviewDevice] = useState<"desktop" | "mobile">("desktop");

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

  // Load Speaking Gallery
  const loadGallery = useCallback(async () => {
    try {
      setGalleryLoading(true);
      const res = await fetch("/api/admin/speaking-gallery", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.gallery) {
          setGallery(data.gallery);
        }
      }
    } catch {
      toast.error("Failed to load speaking gallery.");
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLifeRazor();
    loadGallery();
  }, [loadLifeRazor, loadGallery]);

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

  // Save Speaking Gallery
  const handleSaveGallery = async () => {
    try {
      setGallerySaving(true);
      setGallerySaved(false);
      const res = await fetch("/api/admin/speaking-gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gallery),
      });

      if (res.ok) {
        const data = await res.json();
        setGallery(data.gallery);
        setGallerySaved(true);
        toast.success("Speaking gallery updated and revalidated successfully!");
        setTimeout(() => setGallerySaved(false), 2500);
      } else {
        toast.error("Failed to save speaking gallery.");
      }
    } catch {
      toast.error("Network error while saving speaking gallery.");
    } finally {
      setGallerySaving(false);
    }
  };

  // Update specific gallery image
  const updateGalleryImage = (index: number, field: "src" | "alt", val: string) => {
    setGallery((prev) => {
      const nextImages = [...prev.images];
      nextImages[index] = {
        ...nextImages[index],
        [field]: val,
      };
      return { ...prev, images: nextImages };
    });
  };

  return (
    <div className="space-y-8">
      {/* Header & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Website CMS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage visuals, hero calibration, quotes, and public speaking gallery sections.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border/80 self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setTab("liferazor")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              tab === "liferazor"
                ? "bg-background text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Quote className="w-3.5 h-3.5 text-accent" />
            Current Life Razor
          </button>
          <button
            type="button"
            onClick={() => setTab("speaking")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              tab === "speaking"
                ? "bg-background text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Images className="w-3.5 h-3.5 text-accent" />
            Speaking Gallery
          </button>
        </div>
      </div>

      {/* TAB 1: CURRENT LIFE RAZOR */}
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
      )}

      {/* TAB 3: SPEAKING GALLERY */}
      {tab === "speaking" && (
        <div className="space-y-8">
          {galleryLoading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-3 text-accent" />
              Loading Speaking Gallery...
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form & 6 Image Slots (7 cols) */}
              <div className="xl:col-span-7 space-y-6">
                {/* Visibility Toggle Card */}
                <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-base sm:text-lg font-bold">
                          Section Visibility on /speaking
                        </h2>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            gallery.enabled
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-neutral-500/10 text-neutral-500 border border-neutral-500/20"
                          }`}
                        >
                          {gallery.enabled ? "Visible on Site" : "Hidden from Site"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Control whether this photo gallery appears after the &ldquo;Watch&rdquo; section on the public speaking page.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setGallery((prev) => ({ ...prev, enabled: !prev.enabled }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        gallery.enabled
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {gallery.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {gallery.enabled ? "Section Enabled" : "Section Hidden"}
                    </button>
                  </div>
                </div>

                {/* 6 Image Slot Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-bold">
                      Gallery Images (6 Slots)
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      Desktop Bento Grid &middot; Mobile Snap Carousel
                    </span>
                  </div>

                  <div className="space-y-4">
                    {gallery.images.map((img, index) => {
                      const slotDescriptions = [
                        "Slot 1 · Large Primary Feature (Left 2-row span on desktop)",
                        "Slot 2 · Top Right Card (Desktop Bento)",
                        "Slot 3 · Middle Right Card (Desktop Bento)",
                        "Slot 4 · Bottom Grid Card 1",
                        "Slot 5 · Bottom Grid Card 2",
                        "Slot 6 · Bottom Grid Card 3",
                      ];

                      return (
                        <div
                          key={index}
                          className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-accent uppercase tracking-wider">
                              {slotDescriptions[index] || `Slot ${index + 1}`}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              Index #{index + 1}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                            {/* Thumbnail */}
                            <div className="sm:col-span-3">
                              <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-neutral-900 border border-border">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={img.src}
                                  alt={img.alt || `Gallery slot ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/images/speaking/main-full-width.webp";
                                  }}
                                />
                              </div>
                            </div>

                            {/* Inputs */}
                            <div className="sm:col-span-9 space-y-2.5">
                              <div>
                                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                                  Image Path or URL
                                </label>
                                <input
                                  type="text"
                                  value={img.src}
                                  onChange={(e) => updateGalleryImage(index, "src", e.target.value)}
                                  placeholder="/images/speaking/photo.webp"
                                  className={inputCls}
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                                  Alt Description (SEO &amp; Accessibility)
                                </label>
                                <input
                                  type="text"
                                  value={img.alt}
                                  onChange={(e) => updateGalleryImage(index, "alt", e.target.value)}
                                  placeholder="Sagar Lad speaking on stage"
                                  className={inputCls}
                                />
                              </div>

                              {/* Quick pick from available photos */}
                              <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                                <span className="text-muted-foreground">Quick pick:</span>
                                {POPULAR_SPEAKING_PRESETS.map((p) => (
                                  <button
                                    key={p.src}
                                    type="button"
                                    onClick={() => updateGalleryImage(index, "src", p.src)}
                                    className={`px-2 py-0.5 rounded-md border text-[10px] transition-colors ${
                                      img.src === p.src
                                        ? "bg-accent text-white border-accent"
                                        : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveGallery}
                    disabled={gallerySaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-all shadow-md disabled:opacity-50"
                  >
                    {gallerySaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : gallerySaved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {gallerySaving ? "Saving Gallery..." : gallerySaved ? "Saved & Live!" : "Publish Gallery Changes"}
                  </button>

                  {gallerySaved && (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> /speaking page updated instantly
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Live Responsive Preview (5 cols) */}
              <div className="xl:col-span-5 space-y-4 sticky top-6">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-sm font-bold">Live Gallery Preview</h3>
                      <p className="text-[11px] text-muted-foreground">
                        {gallery.enabled ? "Bento on desktop · Snap carousel on mobile" : "Section currently hidden"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
                      <button
                        type="button"
                        onClick={() => setGalleryPreviewDevice("desktop")}
                        title="Desktop view"
                        className={`p-1.5 rounded-lg transition-all ${
                          galleryPreviewDevice === "desktop"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setGalleryPreviewDevice("mobile")}
                        title="Mobile view"
                        className={`p-1.5 rounded-lg transition-all ${
                          galleryPreviewDevice === "mobile"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Preview Container */}
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 min-h-[380px] flex items-center justify-center">
                    {!gallery.enabled ? (
                      <div className="text-center p-8 text-neutral-500 space-y-2">
                        <EyeOff className="w-8 h-8 mx-auto opacity-50" />
                        <p className="text-xs font-semibold">Gallery Section is Hidden</p>
                        <p className="text-[11px] text-neutral-600">
                          Toggle on above to display the gallery on /speaking.
                        </p>
                      </div>
                    ) : galleryPreviewDevice === "desktop" ? (
                      /* Desktop Bento Simulation */
                      <div className="w-full grid grid-cols-12 gap-2 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                        {/* Slot 1: Large left feature (col 7, row 2) */}
                        <div className="col-span-7 row-span-2 aspect-[4/3] rounded-lg overflow-hidden relative bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={gallery.images[0]?.src}
                            alt="1"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/70 text-white font-mono px-1.5 py-0.5 rounded">
                            #1 Feature
                          </span>
                        </div>

                        {/* Slot 2: Top right */}
                        <div className="col-span-5 aspect-[4/3] rounded-lg overflow-hidden relative bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={gallery.images[1]?.src}
                            alt="2"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/70 text-white font-mono px-1.5 py-0.5 rounded">
                            #2
                          </span>
                        </div>

                        {/* Slot 3: Bottom right */}
                        <div className="col-span-5 aspect-[4/3] rounded-lg overflow-hidden relative bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={gallery.images[2]?.src}
                            alt="3"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/70 text-white font-mono px-1.5 py-0.5 rounded">
                            #3
                          </span>
                        </div>

                        {/* Slots 4, 5, 6: Bottom row */}
                        <div className="col-span-12 grid grid-cols-3 gap-2 pt-1">
                          {gallery.images.slice(3, 6).map((item, i) => (
                            <div
                              key={i}
                              className="aspect-[4/3] rounded-lg overflow-hidden relative bg-black"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item?.src}
                                alt={`Slot ${i + 4}`}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/70 text-white font-mono px-1.5 py-0.5 rounded">
                                #{i + 4}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Mobile Carousel Simulation */
                      <div className="w-[260px] space-y-3 bg-neutral-900/80 p-3 rounded-2xl border border-neutral-800">
                        <div className="aspect-[4/3] rounded-xl overflow-hidden relative bg-black shadow-lg">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={gallery.images[0]?.src}
                            alt="Carousel slide"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 text-white px-2 py-0.5 rounded-full font-mono">
                            Slide 1 of 6
                          </span>
                        </div>
                        <div className="flex justify-center gap-1.5 pt-1">
                          {gallery.images.map((_, i) => (
                            <span
                              key={i}
                              className={`h-1.5 rounded-full transition-all ${
                                i === 0 ? "w-5 bg-accent" : "w-1.5 bg-neutral-700"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-muted/40 rounded-xl border border-border/70 text-xs text-muted-foreground flex items-center justify-between">
                    <span>Live section appears on /speaking.</span>
                    <a
                      href="http://localhost:3000/speaking"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
                    >
                      Visit Speaking <ExternalLink className="w-3 h-3" />
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
