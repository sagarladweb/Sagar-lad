"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, ChevronDown, ChevronUp, RotateCcw, ZoomIn, ZoomOut, Move } from "lucide-react";

type ImageTransform = {
  zoom: number;
  panX: number;
  panY: number;
  rotate: number;
};

type AllSettings = Record<string, ImageTransform>;

const STORAGE_KEY = "marathon-card-transforms";
const STORAGE_EVENT = "marathon-transforms-changed";

const DEFAULT_TRANSFORM: ImageTransform = { zoom: 1, panX: 0, panY: 0, rotate: 0 };

function loadAll(): AllSettings {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {}
  return {};
}

function saveAll(s: AllSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  queueMicrotask(() => window.dispatchEvent(new CustomEvent(STORAGE_EVENT)));
}

function getTransform(all: AllSettings, key: string): ImageTransform {
  return { ...DEFAULT_TRANSFORM, ...(all[key] ?? {}) };
}

type Props = {
  images: { key: string; src: string; alt: string; label: string }[];
};

export function RunnerCardSandbox({ images }: Props) {
  const [all, setAll] = useState<AllSettings>({});
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    setAll(loadAll());
  }, []);

  const active = images[activeIdx];
  const tx = getTransform(all, active.key);

  const updateField = useCallback(
    (field: keyof ImageTransform, value: number) => {
      setAll((prev) => {
        const next = { ...prev, [active.key]: { ...getTransform(prev, active.key), [field]: value } };
        saveAll(next);
        return next;
      });
    },
    [active.key]
  );

  const resetOne = () => {
    setAll((prev) => {
      const next = { ...prev, [active.key]: { ...DEFAULT_TRANSFORM } };
      saveAll(next);
      return next;
    });
  };

  const resetAll = () => {
    setAll({});
    saveAll({});
  };

  return (
    <div className="mt-4 border border-border rounded-xl bg-background overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-brand" />
          Image Adjustments
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-4 space-y-4 pt-3">
          {/* Image tabs */}
          <div className="flex gap-2 flex-wrap">
            {images.map((img, i) => (
              <button
                key={img.key}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeIdx === i
                    ? "bg-brand text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {img.label}
              </button>
            ))}
            <button
              type="button"
              onClick={resetOne}
              className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset This
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset All
            </button>
          </div>

          {/* Controls grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Zoom */}
            <div>
              <label className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1.5">
                <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3" /> Zoom</span>
                <span className="font-mono text-foreground">{tx.zoom.toFixed(1)}×</span>
              </label>
              <input
                type="range" min="0.5" max="3" step="0.1" value={tx.zoom}
                onChange={(e) => updateField("zoom", parseFloat(e.target.value))}
                className="w-full accent-[var(--brand)]"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span className="flex items-center gap-0.5"><ZoomOut className="w-2.5 h-2.5" /> 0.5×</span><span>3×</span>
              </div>
            </div>

            {/* Rotate */}
            <div>
              <label className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1.5">
                <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Rotate</span>
                <span className="font-mono text-foreground">{tx.rotate}°</span>
              </label>
              <input
                type="range" min="-180" max="180" step="1" value={tx.rotate}
                onChange={(e) => updateField("rotate", parseInt(e.target.value))}
                className="w-full accent-[var(--brand)]"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>-180°</span><span>180°</span>
              </div>
            </div>

            {/* Pan X */}
            <div>
              <label className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1.5">
                <span className="flex items-center gap-1"><Move className="w-3 h-3" /> Pan Left/Right</span>
                <span className="font-mono text-foreground">{tx.panX > 0 ? "+" : ""}{tx.panX}%</span>
              </label>
              <input
                type="range" min="-50" max="50" step="1" value={tx.panX}
                onChange={(e) => updateField("panX", parseInt(e.target.value))}
                className="w-full accent-[var(--brand)]"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>← Left</span><span>Right →</span>
              </div>
            </div>

            {/* Pan Y */}
            <div>
              <label className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1.5">
                <span className="flex items-center gap-1"><Move className="w-3 h-3" /> Pan Up/Down</span>
                <span className="font-mono text-foreground">{tx.panY > 0 ? "+" : ""}{tx.panY}%</span>
              </label>
              <input
                type="range" min="-50" max="50" step="1" value={tx.panY}
                onChange={(e) => updateField("panY", parseInt(e.target.value))}
                className="w-full accent-[var(--brand)]"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>↑ Up</span><span>Down ↓</span>
              </div>
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Quick Presets</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Default", zoom: 1, panX: 0, panY: 0, rotate: 0 },
                { label: "Zoom In", zoom: 1.5, panX: 0, panY: 0, rotate: 0 },
                { label: "Zoom Face", zoom: 1.8, panX: 0, panY: -10, rotate: 0 },
                { label: "Tilt L", zoom: 1.2, panX: 0, panY: 0, rotate: -5 },
                { label: "Tilt R", zoom: 1.2, panX: 0, panY: 0, rotate: 5 },
                { label: "Drift L", zoom: 1.1, panX: -15, panY: 0, rotate: 0 },
                { label: "Drift R", zoom: 1.1, panX: 15, panY: 0, rotate: 0 },
                { label: "Shift Up", zoom: 1.1, panX: 0, panY: -15, rotate: 0 },
                { label: "Shift Down", zoom: 1.1, panX: 0, panY: 15, rotate: 0 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setAll((prev) => {
                      const next = { ...prev, [active.key]: { zoom: p.zoom, panX: p.panX, panY: p.panY, rotate: p.rotate } };
                      saveAll(next);
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

          {/* Preview */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">Preview</label>
            <div className="flex gap-3">
              {images.map((img) => {
                const t = getTransform(all, img.key);
                const isActive = img.key === active.key;
                return (
                  <div key={img.key} className={`relative w-24 h-32 rounded-lg overflow-hidden border-2 flex-shrink-0 ${isActive ? "border-brand" : "border-border"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full"
                      style={{
                        objectFit: "cover",
                        objectPosition: "50% 30%",
                        transform: `scale(${t.zoom}) translate(${t.panX}%, ${t.panY}%) rotate(${t.rotate}deg)`,
                      }}
                    />
                    <div className="absolute bottom-1 inset-x-1 text-center">
                      <span className="text-[9px] font-bold text-white bg-black/50 rounded px-1">{img.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* JSON output for later coding */}
          <details className="group">
            <summary className="text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              Show saved JSON (for hardcoding later)
            </summary>
            <pre className="mt-2 p-3 rounded-lg bg-muted text-[11px] font-mono text-foreground overflow-x-auto">
              {JSON.stringify(all, null, 2) || "{}"}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

/** Hook: read transform for a specific image key */
export function useRunnerCardTransform(key: string): ImageTransform {
  const [tx, setTx] = useState<ImageTransform>(DEFAULT_TRANSFORM);

  useEffect(() => {
    function read() {
      const all = loadAll();
      setTx(getTransform(all, key));
    }
    read();
    const onChange = () => read();
    window.addEventListener(STORAGE_EVENT, onChange);
    return () => window.removeEventListener(STORAGE_EVENT, onChange);
  }, [key]);

  return tx;
}
