"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Smartphone,
  Tablet,
  Monitor,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  X,
} from "lucide-react";

const STORAGE_KEY = "contact-hero-sandbox";

const DEVICES = [
  { name: "Mobile", icon: Smartphone, width: 375, height: 667 },
  { name: "Tablet", icon: Tablet, width: 768, height: 1024 },
  { name: "Desktop", icon: Monitor, width: 1280, height: 720 },
  { name: "Wide", icon: Monitor, width: 1440, height: 900 },
] as const;

type Settings = {
  device: number;
  zoom: number;
  posX: number;
  posY: number;
  objX: number;
  objY: number;
  maskStart: number;
  maskEnd: number;
};

const DEFAULTS: Settings = { device: 0, zoom: 100, posX: 0, posY: 0, objX: 50, objY: 50, maskStart: 0, maskEnd: 12 };

function load(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; } catch { return DEFAULTS; }
}

function save(s: Settings) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

export function ContactHeroSandbox() {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setS(load()); setMounted(true); }, []);

  const set = useCallback((patch: Partial<Settings>) => {
    setS((prev) => { const next = { ...prev, ...patch }; save(next); return next; });
  }, []);

  const reset = () => { setS(DEFAULTS); save(DEFAULTS); };

  const exportSettings = () => {
    const d = DEVICES[s.device];
    const out = { zoom: `${s.zoom}%`, translateX: `${s.posX}px`, translateY: `${s.posY}px`, objectPosition: `${s.objX}% ${s.objY}%`, maskStops: `${s.maskStart}%, ${s.maskEnd}%` };
    navigator.clipboard.writeText(JSON.stringify(out, null, 2));
    alert("Copied!");
  };

  if (!mounted) return null;

  const device = DEVICES[s.device];
  const previewScale = Math.min(1, 360 / device.width);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="fixed top-4 right-4 z-[100] rounded-full bg-amber-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-lg hover:bg-amber-400 transition-colors">
        Open Sandbox
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="relative ml-auto w-full max-w-sm bg-[#111] border-l border-amber-500/30 overflow-y-auto shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Hero Image Sandbox</span>
              <button type="button" onClick={() => setOpen(false)} className="text-neutral-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {/* Device tabs */}
              <div>
                <Label>Device</Label>
                <div className="grid grid-cols-4 gap-1 mt-1.5">
                  {DEVICES.map((d, i) => {
                    const Icon = d.icon;
                    return (
                      <button key={d.name} type="button" onClick={() => set({ device: i })}
                        className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[10px] font-semibold transition-colors ${s.device === i ? "bg-amber-500 text-black" : "bg-white/5 text-neutral-400 hover:text-white"}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {d.name}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1 text-[9px] text-neutral-600 font-mono">{device.width}×{device.height}</p>
              </div>

              {/* Zoom */}
              <Slider label="Zoom" value={s.zoom} min={50} max={200} step={5} unit="%" onChange={(v) => set({ zoom: v })} />

              {/* Move X */}
              <Slider label="Move X" value={s.posX} min={-200} max={200} step={5} unit="px" onChange={(v) => set({ posX: v })} />

              {/* Move Y */}
              <Slider label="Move Y" value={s.posY} min={-200} max={200} step={5} unit="px" onChange={(v) => set({ posY: v })} />

              {/* Object Position X */}
              <Slider label="Focus X" value={s.objX} min={0} max={100} step={5} unit="%" onChange={(v) => set({ objX: v })} />

              {/* Object Position Y */}
              <Slider label="Focus Y" value={s.objY} min={0} max={100} step={5} unit="%" onChange={(v) => set({ objY: v })} />

              {/* Mask Start */}
              <Slider label="Fade Start" value={s.maskStart} min={0} max={50} step={1} unit="%" onChange={(v) => set({ maskStart: v })} />

              {/* Mask End */}
              <Slider label="Fade End" value={s.maskEnd} min={1} max={50} step={1} unit="%" onChange={(v) => set({ maskEnd: v })} />

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={reset} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-semibold text-neutral-400 hover:text-white transition-colors">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
                <button type="button" onClick={exportSettings} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-[10px] font-bold text-black hover:bg-amber-400 transition-colors">
                  <Download className="w-3 h-3" /> Copy JSON
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="shrink-0 border-t border-white/10 px-4 py-4 flex justify-center bg-black/40">
              <div className="border border-amber-500/30 rounded-xl overflow-hidden" style={{ width: device.width * previewScale, height: device.height * previewScale }}>
                <div className="w-full h-full overflow-hidden" style={{ transform: `scale(${s.zoom / 100}) translate(${s.posX}px, ${s.posY}px)`, transformOrigin: "center center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/section.png" alt="Preview" className="w-full h-full object-cover" style={{ objectPosition: `${s.objX}% ${s.objY}%`, maskImage: `linear-gradient(to top, transparent ${s.maskStart}%, black ${s.maskEnd}%, black 100%)`, WebkitMaskImage: `linear-gradient(to top, transparent ${s.maskStart}%, black ${s.maskEnd}%, black 100%)` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{children}</span>;
}

function Slider({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <Label>{label}</Label>
        <span className="text-[11px] font-mono text-white tabular-nums">{value}{unit}</span>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - step))} className="grid h-6 w-6 place-items-center rounded border border-white/10 bg-white/5 text-neutral-400 hover:text-white transition-colors shrink-0">
          <ChevronLeft className="w-3 h-3" />
        </button>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500" />
        <button type="button" onClick={() => onChange(Math.min(max, value + step))} className="grid h-6 w-6 place-items-center rounded border border-white/10 bg-white/5 text-neutral-400 hover:text-white transition-colors shrink-0">
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
