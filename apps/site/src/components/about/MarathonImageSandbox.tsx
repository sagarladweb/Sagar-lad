"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Monitor, Tablet, Smartphone, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

type Breakpoint = "mobile" | "tablet" | "desktop";

type ImageSetting = {
  objectPosition: string;
  objectFit: "cover" | "contain" | "fill";
};

type SandboxSettings = {
  mobile: ImageSetting;
  tablet: ImageSetting;
  desktop: ImageSetting;
};

const DEFAULTS: SandboxSettings = {
  mobile:  { objectPosition: "50% 30%", objectFit: "cover" },
  tablet:  { objectPosition: "50% 30%", objectFit: "cover" },
  desktop: { objectPosition: "50% 30%", objectFit: "cover" },
};

const STORAGE_KEY = "marathon-image-settings";

function loadSettings(): SandboxSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

function saveSettings(s: SandboxSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
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

const BP_WIDTHS: Record<Breakpoint, string> = {
  mobile: "w-[375px]",
  tablet: "w-[768px]",
  desktop: "w-full",
};

type Props = {
  images: { src: string; alt: string; label: string }[];
  /** Current active breakpoint determined by window width */
  activeBreakpoint: Breakpoint;
  /** Called when settings change — parent re-renders cards with new values */
  onSettingsChange: (settings: SandboxSettings) => void;
};

export function MarathonImageSandbox({ images, activeBreakpoint, onSettingsChange }: Props) {
  const [settings, setSettings] = useState<SandboxSettings>(DEFAULTS);
  const [open, setOpen] = useState(false);
  const [editingBp, setEditingBp] = useState<Breakpoint>(activeBreakpoint);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    onSettingsChange(loaded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback(
    (bp: Breakpoint, key: keyof ImageSetting, value: string) => {
      setSettings((prev) => {
        const next = { ...prev, [bp]: { ...prev[bp], [key]: value } };
        saveSettings(next);
        onSettingsChange(next);
        return next;
      });
    },
    [onSettingsChange]
  );

  const reset = () => {
    setSettings(DEFAULTS);
    saveSettings(DEFAULTS);
    onSettingsChange(DEFAULTS);
  };

  const current = settings[editingBp];

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
          <div className="flex gap-2 pt-3">
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

          {/* Active indicator */}
          {editingBp === activeBreakpoint && (
            <p className="text-[11px] text-brand font-medium">
              ★ Active — changes apply live below
            </p>
          )}

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Object Position X */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Horizontal Position
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
                <span>Left</span>
                <span className="font-mono">{current.objectPosition.split(" ")[0]}</span>
                <span>Right</span>
              </div>
            </div>

            {/* Object Position Y */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Vertical Position
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
                <span>Top</span>
                <span className="font-mono">{current.objectPosition.split(" ")[1]}</span>
                <span>Bottom</span>
              </div>
            </div>

            {/* Object Fit */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Fit Mode
              </label>
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

            {/* Preset positions */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Quick Presets
              </label>
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

          {/* Preview */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Preview — {BP_LABELS[editingBp]}
            </p>
            <div className={`mx-auto ${BP_WIDTHS[editingBp]} max-w-full`}>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <div key={img.src} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full transition-all duration-300"
                      style={{
                        objectFit: current.objectFit,
                        objectPosition: current.objectPosition,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-2 inset-x-2 text-center">
                      <p className="text-[10px] font-bold text-white drop-shadow-md">{img.label}</p>
                    </div>
                  </div>
                ))}
              </div>
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
