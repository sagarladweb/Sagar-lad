"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Smartphone,
  Tablet,
  Monitor,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Download,
  X,
} from "lucide-react";

const STORAGE_KEY = "contact-hero-sandbox-v2";

const DEVICES = [
  { key: "mobile" as const, name: "Mobile", icon: Smartphone, width: 375, height: 667, maxWidth: 639 },
  { key: "tablet" as const, name: "Tablet", icon: Tablet, width: 768, height: 1024, maxWidth: 1023 },
  { key: "desktop" as const, name: "Desktop", icon: Monitor, width: 1280, height: 720, maxWidth: 1439 },
  { key: "wide" as const, name: "Wide", icon: Monitor, width: 1440, height: 900, maxWidth: 9999 },
] as const;

type DeviceKey = typeof DEVICES[number]["key"];

type DeviceSettings = {
  zoom: number;
  posX: number;
  posY: number;
  objX: number;
  objY: number;
  maskStart: number;
  maskEnd: number;
};

type AllSettings = Record<DeviceKey, DeviceSettings>;

const DEVICE_DEFAULTS: DeviceSettings = { zoom: 100, posX: 0, posY: 0, objX: 50, objY: 50, maskStart: 0, maskEnd: 12 };

const ALL_DEFAULTS: AllSettings = {
  mobile: { ...DEVICE_DEFAULTS },
  tablet: { ...DEVICE_DEFAULTS },
  desktop: { ...DEVICE_DEFAULTS },
  wide: { ...DEVICE_DEFAULTS },
};

function load(): AllSettings {
  if (typeof window === "undefined") return ALL_DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return ALL_DEFAULTS;
    const parsed = JSON.parse(raw);
    // Merge with defaults so new keys always exist
    return {
      mobile: { ...DEVICE_DEFAULTS, ...parsed.mobile },
      tablet: { ...DEVICE_DEFAULTS, ...parsed.tablet },
      desktop: { ...DEVICE_DEFAULTS, ...parsed.desktop },
      wide: { ...DEVICE_DEFAULTS, ...parsed.wide },
    };
  } catch { return ALL_DEFAULTS; }
}

function save(s: AllSettings) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

export function ContactHeroSandbox() {
  const [all, setAll] = useState<AllSettings>(ALL_DEFAULTS);
  const [activeDevice, setActiveDevice] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setAll(load()); setMounted(true); }, []);

  const current = all[DEVICES[activeDevice].key];

  const updateCurrent = useCallback((patch: Partial<DeviceSettings>) => {
    setAll((prev) => {
      const key = DEVICES[activeDevice].key;
      const next = { ...prev, [key]: { ...prev[key], ...patch } };
      save(next);
      return next;
    });
  }, [activeDevice]);

  const resetCurrent = () => {
    setAll((prev) => {
      const key = DEVICES[activeDevice].key;
      const next = { ...prev, [key]: { ...DEVICE_DEFAULTS } };
      save(next);
      return next;
    });
  };

  const resetAll = () => { setAll(ALL_DEFAULTS); save(ALL_DEFAULTS); };

  const exportAll = () => {
    const out: Record<string, Record<string, string>> = {};
    for (const d of DEVICES) {
      const s = all[d.key];
      out[d.key] = { zoom: `${s.zoom}%`, translateX: `${s.posX}px`, translateY: `${s.posY}px`, objectPosition: `${s.objX}% ${s.objY}%`, maskStops: `${s.maskStart}%, ${s.maskEnd}%` };
    }
    navigator.clipboard.writeText(JSON.stringify(out, null, 2));
    alert("All device settings copied!");
  };

  const exportCurrent = () => {
    const s = current;
    const d = DEVICES[activeDevice];
    const out = { device: d.name, zoom: `${s.zoom}%`, translateX: `${s.posX}px`, translateY: `${s.posY}px`, objectPosition: `${s.objX}% ${s.objY}%`, maskStops: `${s.maskStart}%, ${s.maskEnd}%` };
    navigator.clipboard.writeText(JSON.stringify(out, null, 2));
    alert(`${d.name} settings copied!`);
  };

  if (!mounted) return null;

  const device = DEVICES[activeDevice];
  const previewScale = Math.min(1, 360 / device.width);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="fixed top-4 right-4 z-[100] rounded-full bg-amber-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-lg hover:bg-amber-400 transition-colors">
        Open Sandbox
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative ml-auto w-full max-w-sm bg-[#111] border-l border-amber-500/30 shadow-2xl flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Hero Image Sandbox</span>
              <button type="button" onClick={() => setOpen(false)} className="text-neutral-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            {/* Scrollable controls */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {/* Device tabs */}
              <div>
                <Label>Device (per-device settings)</Label>
                <div className="grid grid-cols-4 gap-1 mt-1.5">
                  {DEVICES.map((d, i) => {
                    const Icon = d.icon;
                    const hasChanges = JSON.stringify(all[d.key]) !== JSON.stringify(DEVICE_DEFAULTS);
                    return (
                      <button key={d.name} type="button" onClick={() => setActiveDevice(i)}
                        className={`relative flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-[10px] font-semibold transition-colors ${activeDevice === i ? "bg-amber-500 text-black" : "bg-white/5 text-neutral-400 hover:text-white"}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {d.name}
                        {hasChanges && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1 text-[9px] text-neutral-600 font-mono">{device.width}×{device.height}px — {device.name}</p>
              </div>

              {/* Sliders for current device */}
              <Slider label="Zoom" value={current.zoom} min={50} max={200} step={5} unit="%" onChange={(v) => updateCurrent({ zoom: v })} />
              <Slider label="Move X" value={current.posX} min={-200} max={200} step={5} unit="px" onChange={(v) => updateCurrent({ posX: v })} />
              <Slider label="Move Y" value={current.posY} min={-200} max={200} step={5} unit="px" onChange={(v) => updateCurrent({ posY: v })} />
              <Slider label="Focus X" value={current.objX} min={0} max={100} step={5} unit="%" onChange={(v) => updateCurrent({ objX: v })} />
              <Slider label="Focus Y" value={current.objY} min={0} max={100} step={5} unit="%" onChange={(v) => updateCurrent({ objY: v })} />
              <Slider label="Fade Start" value={current.maskStart} min={0} max={50} step={1} unit="%" onChange={(v) => updateCurrent({ maskStart: v })} />
              <Slider label="Fade End" value={current.maskEnd} min={1} max={50} step={1} unit="%" onChange={(v) => updateCurrent({ maskEnd: v })} />

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={resetCurrent} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-semibold text-neutral-400 hover:text-white transition-colors">
                  <RotateCcw className="w-3 h-3" /> Reset {device.name}
                </button>
                <button type="button" onClick={resetAll} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-semibold text-neutral-400 hover:text-white transition-colors">
                  <RotateCcw className="w-3 h-3" /> Reset All
                </button>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={exportCurrent} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-[10px] font-bold text-black hover:bg-amber-400 transition-colors">
                  <Download className="w-3 h-3" /> Copy {device.name}
                </button>
                <button type="button" onClick={exportAll} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-[10px] font-bold text-black hover:bg-amber-400 transition-colors">
                  <Download className="w-3 h-3" /> Copy All Devices
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="shrink-0 border-t border-white/10 px-4 py-4 flex justify-center bg-black/40">
              <div className="border border-amber-500/30 rounded-xl overflow-hidden" style={{ width: device.width * previewScale, height: device.height * previewScale }}>
                <div className="w-full h-full overflow-hidden" style={{ transform: `scale(${current.zoom / 100}) translate(${current.posX}px, ${current.posY}px)`, transformOrigin: "center center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/section.png" alt="Preview" className="w-full h-full object-cover" style={{ objectPosition: `${current.objX}% ${current.objY}%`, maskImage: `linear-gradient(to top, transparent ${current.maskStart}%, black ${current.maskEnd}%, black 100%)`, WebkitMaskImage: `linear-gradient(to top, transparent ${current.maskStart}%, black ${current.maskEnd}%, black 100%)` }} />
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
