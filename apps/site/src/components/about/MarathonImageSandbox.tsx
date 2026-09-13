"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Monitor, Tablet, Smartphone, RotateCcw, ChevronDown, ChevronUp, ZoomIn, ZoomOut, Move } from "lucide-react";

type Breakpoint = "mobile" | "tablet" | "desktop";

type ImageSetting = {
  objectPosition: string;
  objectFit: "cover" | "contain" | "fill";
  zoom: number;
  panX: number;
  panY: number;
  rotate: number;
};

type SandboxSettings = {
  mobile: ImageSetting;
  tablet: ImageSetting;
  desktop: ImageSetting;
};

const DEFAULT_IMAGE_SETTING: ImageSetting = {
  objectPosition: "50% 30%",
  objectFit: "cover",
  zoom: 1,
  panX: 0,
  panY: 0,
  rotate: 0,
};

const DEFAULTS: SandboxSettings = {
  mobile:  { ...DEFAULT_IMAGE_SETTING },
  tablet:  { ...DEFAULT_IMAGE_SETTING },
  desktop: { ...DEFAULT_IMAGE_SETTING },
};

const STORAGE_KEY = "marathon-image-settings";
const STORAGE_EVENT = "marathon-settings-changed";

function loadSettings(): SandboxSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with defaults so new fields are always present
      const merge = (s: Partial<ImageSetting> | undefined): ImageSetting => ({
        ...DEFAULT_IMAGE_SETTING,
        ...(s ?? {}),
      });
      return {
        mobile: merge(parsed.mobile),
        tablet: merge(parsed.tablet),
        desktop: merge(parsed.desktop),
      };
    }
  } catch {}
  return DEFAULTS;
}

function saveSettings(s: SandboxSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

const BP_ICONS: Record<Breakpoint, typeof Monitor> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

const BP_LABELS: Record<Breakpoint, string> = {
  mobile: "Mobile (< 640px)",
  tablet: "Tablet (640–1023px)",
  desktop: "Desktop (≥ 1024px)",
};

type Props = {
  images: { src: string; alt: string; label: string }[];
  activeBreakpoint: Breakpoint;
};

export function MarathonImageSandbox({ images, activeBreakpoint }: Props) {
  const [settings, setSettings] = useState<SandboxSettings>(DEFAULTS);
  const [open, setOpen] = useState(false);
  const [editingBp, setEditingBp] = useState<Breakpoint>(activeBreakpoint);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const update = useCallback(
    (bp: Breakpoint, key: keyof ImageSetting, value: string | number) => {
      setSettings((prev) => {
        const next = { ...prev, [bp]: { ...prev[bp], [key]: value } };
        saveSettings(next);
        return next;
      });
    },
    []
  );

  const reset = () => {
    setSettings(DEFAULTS);
    saveSettings(DEFAULTS);
  };

  const current = settings[editingBp];

  // Build CSS transform from zoom/pan/rotate
  const buildTransform = (s: ImageSetting) =>
    `scale(${s.zoom}) translate(${s.panX}%, ${s.panY}%) rotate(${s.rotate}deg)`;

  return (
    <div className="mt-4 border border-border rounded-xl bg-background overflow-hidden">
      {/* Toggle bar */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-brand" />
          Image Settings Sandbox
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-4 space-y-4">
          {/* Breakpoint tabs */}
          <div className="flex gap-2 pt-3 flex-wrap">
            {(["mobile", "tablet", "desktop"] as Breakpoint[]).map((bp) => {
              const Icon = BP_ICONS[bp];
              return (
                <button
                  key={bp}
                  type="button"
                  onClick={() => setEditingBp(bp)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    editingBp === bp
                      ? "bg-brand text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {bp.charAt(0).toUpperCase() + bp.slice(1)}
                </button>
              );
            })}
            <button
              type="button"
              onClick={reset}
              className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {editingBp === activeBreakpoint && (
            <p className="text-[11px] text-brand font-medium">
              ★ Active — changes apply live below
            </p>
          )}

          {/* ── Position & Fit ── */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Position & Fit</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Object Position X */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1"><Move className="w-3 h-3" /> Horizontal</span>
                  <span className="font-mono text-foreground">{current.objectPosition.split(" ")[0]}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={parseInt(current.objectPosition.split(" ")[0]) || 50}
                  onChange={(e) => {
                    const x = e.target.value;
                    const y = current.objectPosition.split(" ")[1] || "30%";
                    update(editingBp, "objectPosition", `${x}% ${y}`);
                  }}
                  className="w-full accent-[var(--brand)]"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>Left</span><span>Right</span>
                </div>
              </div>

              {/* Object Position Y */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1"><Move className="w-3 h-3" /> Vertical</span>
                  <span className="font-mono text-foreground">{current.objectPosition.split(" ")[1]}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={parseInt(current.objectPosition.split(" ")[1]) || 30}
                  onChange={(e) => {
                    const y = e.target.value;
                    const x = current.objectPosition.split(" ")[0] || "50%";
                    update(editingBp, "objectPosition", `${x} ${y}%`);
                  }}
                  className="w-full accent-[var(--brand)]"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>Top</span><span>Bottom</span>
                </div>
              </div>
            </div>

            {/* Fit + Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Fit Mode</label>
                <div className="flex gap-1.5">
                  {(["cover", "contain", "fill"] as const).map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => update(editingBp, "objectFit", fit)}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        current.objectFit === fit
                          ? "bg-brand text-white"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Quick Presets</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: "Top", pos: "50% 20%" },
                    { label: "Center", pos: "50% 50%" },
                    { label: "Bottom", pos: "50% 80%" },
                    { label: "Face", pos: "50% 25%" },
                    { label: "Left", pos: "20% 40%" },
                    { label: "Right", pos: "80% 40%" },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => update(editingBp, "objectPosition", p.pos)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                        current.objectPosition === p.pos
                          ? "bg-brand text-white"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Zoom, Pan, Rotate ── */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Zoom, Pan & Rotate</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Zoom */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3" /> Zoom</span>
                  <span className="font-mono text-foreground">{current.zoom.toFixed(1)}×</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={current.zoom}
                  onChange={(e) => update(editingBp, "zoom", parseFloat(e.target.value))}
                  className="w-full accent-[var(--brand)]"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-0.5"><ZoomOut className="w-2.5 h-2.5" /> 0.5×</span>
                  <span>3×</span>
                </div>
              </div>

              {/* Rotate */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Rotate</span>
                  <span className="font-mono text-foreground">{current.rotate}°</span>
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={current.rotate}
                  onChange={(e) => update(editingBp, "rotate", parseInt(e.target.value))}
                  className="w-full accent-[var(--brand)]"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>-180°</span><span>180°</span>
                </div>
              </div>

              {/* Pan X */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1"><Move className="w-3 h-3" /> Pan Horizontal</span>
                  <span className="font-mono text-foreground">{current.panX > 0 ? "+" : ""}{current.panX}%</span>
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={current.panX}
                  onChange={(e) => update(editingBp, "panX", parseInt(e.target.value))}
                  className="w-full accent-[var(--brand)]"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>← Left</span><span>Right →</span>
                </div>
              </div>

              {/* Pan Y */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1"><Move className="w-3 h-3" /> Pan Vertical</span>
                  <span className="font-mono text-foreground">{current.panY > 0 ? "+" : ""}{current.panY}%</span>
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={current.panY}
                  onChange={(e) => update(editingBp, "panY", parseInt(e.target.value))}
                  className="w-full accent-[var(--brand)]"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>↑ Up</span><span>Down ↓</span>
                </div>
              </div>
            </div>

            {/* Quick zoom/pan presets */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Quick Presets</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Reset All", zoom: 1, panX: 0, panY: 0, rotate: 0, pos: "50% 30%" },
                  { label: "Zoom In", zoom: 1.5, panX: 0, panY: 0, rotate: 0, pos: "50% 30%" },
                  { label: "Zoom Face", zoom: 1.8, panX: 0, panY: -10, rotate: 0, pos: "50% 20%" },
                  { label: "Tilt Left", zoom: 1.2, panX: 0, panY: 0, rotate: -5, pos: "50% 30%" },
                  { label: "Tilt Right", zoom: 1.2, panX: 0, panY: 0, rotate: 5, pos: "50% 30%" },
                  { label: "Drift Left", zoom: 1.1, panX: -15, panY: 0, rotate: 0, pos: "50% 30%" },
                  { label: "Drift Right", zoom: 1.1, panX: 15, panY: 0, rotate: 0, pos: "50% 30%" },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setSettings((prev) => {
                        const next = {
                          ...prev,
                          [editingBp]: {
                            objectPosition: p.pos,
                            objectFit: current.objectFit,
                            zoom: p.zoom,
                            panX: p.panX,
                            panY: p.panY,
                            rotate: p.rotate,
                          },
                        };
                        saveSettings(next);
                        return next;
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Preview — 80/20 card layout ── */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Preview — {BP_LABELS[editingBp]}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {images.map((img) => (
                <div key={img.src} className="rounded-xl overflow-hidden border border-border bg-background flex flex-col">
                  {/* Image: 80% */}
                  <div className="relative h-40 overflow-hidden flex-[4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full transition-all duration-300"
                      style={{
                        objectFit: current.objectFit,
                        objectPosition: current.objectPosition,
                        transform: buildTransform(current),
                      }}
                    />
                  </div>
                  {/* Content: 20% */}
                  <div className="flex-[1] px-2 py-2 text-center bg-background flex flex-col items-center justify-center">
                    <p className="text-sm font-extrabold text-accent-strong">{img.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Hook to detect current breakpoint */
export function useBreakpoint(): Breakpoint {
  if (typeof window === "undefined") return "desktop";
  if (window.innerWidth < 640) return "mobile";
  if (window.innerWidth < 1024) return "tablet";
  return "desktop";
}
