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
  Eye,
  EyeOff,
} from "lucide-react";

const STORAGE_KEY = "contact-hero-sandbox";

type DevicePreset = {
  name: string;
  icon: React.ReactNode;
  width: number;
  height: number;
};

const DEVICES: DevicePreset[] = [
  { name: "Mobile", icon: <Smartphone className="w-3.5 h-3.5" />, width: 375, height: 667 },
  { name: "Tablet", icon: <Tablet className="w-3.5 h-3.5" />, width: 768, height: 1024 },
  { name: "Desktop", icon: <Monitor className="w-3.5 h-3.5" />, width: 1280, height: 720 },
  { name: "Wide", icon: <Monitor className="w-3.5 h-3.5" />, width: 1440, height: 900 },
];

type Settings = {
  device: number;
  zoom: number;
  posX: number;
  posY: number;
  objectPositionX: number;
  objectPositionY: number;
  maskStop1: number;
  maskStop2: number;
};

const DEFAULTS: Settings = {
  device: 0,
  zoom: 100,
  posX: 0,
  posY: 0,
  objectPositionX: 50,
  objectPositionY: 50,
  maskStop1: 0,
  maskStop2: 12,
};

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function saveSettings(s: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function ContactHeroSandbox() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [visible, setVisible] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setMounted(true);
  }, []);

  const update = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
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

  const exportJson = () => {
    const json = JSON.stringify(
      {
        zoom: `${settings.zoom}%`,
        translateX: `${settings.posX}px`,
        translateY: `${settings.posY}px`,
        objectPosition: `${settings.objectPositionX}% ${settings.objectPositionY}%`,
        maskStops: `${settings.maskStop1}%, ${settings.maskStop2}%`,
      },
      null,
      2
    );
    navigator.clipboard.writeText(json);
    alert("Copied to clipboard!");
  };

  if (!mounted) return null;

  const device = DEVICES[settings.device];
  const scale = Math.min(1, (360 / device.width) * 1);

  return (
    <>
      {/* Toggle button — fixed top-right */}
      <button
        type="button"
        onClick={() => setShowControls((v) => !v)}
        className="fixed top-4 right-4 z-[100] rounded-full border border-amber-500/40 bg-amber-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-lg hover:bg-amber-400 transition-colors flex items-center gap-1.5"
      >
        {showControls ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        {showControls ? "Hide" : "Sandbox"}
      </button>

      {showControls && (
        <div className="fixed inset-x-0 top-0 z-[90] bg-[#111] border-b border-amber-500/30 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 py-3">
            {/* Top row: device tabs + actions */}
            <div className="flex items-center justify-between gap-4 mb-3">
              {/* Device tabs */}
              <div className="flex gap-1 bg-black/40 rounded-lg p-1">
                {DEVICES.map((d, i) => (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => update({ device: i })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                      settings.device === i
                        ? "bg-amber-500 text-black"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {d.icon}
                    {d.name}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                  className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] font-semibold text-neutral-400 hover:text-white transition-colors"
                >
                  {visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {visible ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10px] font-semibold text-neutral-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={exportJson}
                  className="flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1.5 text-[10px] font-bold text-black hover:bg-amber-400 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Copy JSON
                </button>
              </div>
            </div>

            {/* Controls row */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-300">
              {/* Zoom */}
              <ControlGroup label="Zoom">
                <AdjButton onClick={() => update({ zoom: Math.max(50, settings.zoom - 5) })} icon={<ZoomOut className="w-3 h-3" />} />
                <span className="w-12 text-center font-mono text-white tabular-nums">{settings.zoom}%</span>
                <AdjButton onClick={() => update({ zoom: Math.min(200, settings.zoom + 5) })} icon={<ZoomIn className="w-3 h-3" />} />
              </ControlGroup>

              {/* Translate X */}
              <ControlGroup label="Move X">
                <AdjButton onClick={() => update({ posX: settings.posX - 10 })} icon={<ChevronLeft className="w-3 h-3" />} />
                <span className="w-12 text-center font-mono text-white tabular-nums">{settings.posX}px</span>
                <AdjButton onClick={() => update({ posX: settings.posX + 10 })} icon={<ChevronRight className="w-3 h-3" />} />
              </ControlGroup>

              {/* Translate Y */}
              <ControlGroup label="Move Y">
                <AdjButton onClick={() => update({ posY: settings.posY - 10 })} icon={<ChevronUp className="w-3 h-3" />} />
                <span className="w-12 text-center font-mono text-white tabular-nums">{settings.posY}px</span>
                <AdjButton onClick={() => update({ posY: settings.posY + 10 })} icon={<ChevronDown className="w-3 h-3" />} />
              </ControlGroup>

              {/* Object Position X */}
              <ControlGroup label="Focus X">
                <AdjButton onClick={() => update({ objectPositionX: Math.max(0, settings.objectPositionX - 5) })} icon={<ChevronLeft className="w-3 h-3" />} />
                <span className="w-12 text-center font-mono text-white tabular-nums">{settings.objectPositionX}%</span>
                <AdjButton onClick={() => update({ objectPositionX: Math.min(100, settings.objectPositionX + 5) })} icon={<ChevronRight className="w-3 h-3" />} />
              </ControlGroup>

              {/* Object Position Y */}
              <ControlGroup label="Focus Y">
                <AdjButton onClick={() => update({ objectPositionY: Math.max(0, settings.objectPositionY - 5) })} icon={<ChevronUp className="w-3 h-3" />} />
                <span className="w-12 text-center font-mono text-white tabular-nums">{settings.objectPositionY}%</span>
                <AdjButton onClick={() => update({ objectPositionY: Math.min(100, settings.objectPositionY + 5) })} icon={<ChevronDown className="w-3 h-3" />} />
              </ControlGroup>

              {/* Mask stops */}
              <ControlGroup label="Fade Start">
                <AdjButton onClick={() => update({ maskStop1: Math.max(0, settings.maskStop1 - 1) })} icon={<ChevronLeft className="w-3 h-3" />} />
                <span className="w-12 text-center font-mono text-white tabular-nums">{settings.maskStop1}%</span>
                <AdjButton onClick={() => update({ maskStop1: Math.min(50, settings.maskStop1 + 1) })} icon={<ChevronRight className="w-3 h-3" />} />
              </ControlGroup>

              <ControlGroup label="Fade End">
                <AdjButton onClick={() => update({ maskStop2: Math.max(1, settings.maskStop2 - 1) })} icon={<ChevronLeft className="w-3 h-3" />} />
                <span className="w-12 text-center font-mono text-white tabular-nums">{settings.maskStop2}%</span>
                <AdjButton onClick={() => update({ maskStop2: Math.min(50, settings.maskStop2 + 1) })} icon={<ChevronRight className="w-3 h-3" />} />
              </ControlGroup>
            </div>

            {/* Preview */}
            {visible && (
              <div className="mt-3 flex justify-center">
                <div
                  className="border border-amber-500/30 rounded-xl overflow-hidden bg-white"
                  style={{
                    width: device.width * scale,
                    height: device.height * scale,
                  }}
                >
                  <div
                    className="w-full h-full overflow-hidden"
                    style={{
                      transform: `scale(${settings.zoom / 100}) translate(${settings.posX}px, ${settings.posY}px)`,
                      transformOrigin: "center center",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/section.png"
                      alt="Preview"
                      className="w-full h-full"
                      style={{
                        objectPosition: `${settings.objectPositionX}% ${settings.objectPositionY}%`,
                        objectFit: "cover",
                        maskImage: `linear-gradient(to top, transparent ${settings.maskStop1}%, black ${settings.maskStop2}%, black 100%)`,
                        WebkitMaskImage: `linear-gradient(to top, transparent ${settings.maskStop1}%, black ${settings.maskStop2}%, black 100%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Device info */}
            <div className="mt-2 text-center text-[10px] text-neutral-500 font-mono">
              {device.name} — {device.width}×{device.height}px — scale {Math.round(scale * 100)}%
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ControlGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500 w-14 shrink-0">
        {label}
      </span>
      {children}
    </div>
  );
}

function AdjButton({
  onClick,
  icon,
}: {
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid h-6 w-6 place-items-center rounded border border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
    >
      {icon}
    </button>
  );
}
