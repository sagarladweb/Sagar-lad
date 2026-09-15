"use client";

import { useState, useCallback, useEffect } from "react";

type Breakpoint = "mobile" | "tablet" | "desktop" | "wide";

type Settings = {
  scale: number;
  translateX: number;
  translateY: number;
  objectPosX: number;
  objectPosY: number;
  featherHeight: number;
  featherOpacity: number;
};

const DEFAULTS: Settings = {
  scale: 1,
  translateX: 0,
  translateY: 0,
  objectPosX: 50,
  objectPosY: 50,
  featherHeight: 33,
  featherOpacity: 80,
};

const BP_RANGES: Record<Breakpoint, { min: number; max: number; label: string }> = {
  mobile: { min: 0, max: 639, label: "Mobile (<640px)" },
  tablet: { min: 640, max: 1023, label: "Tablet (640–1023px)" },
  desktop: { min: 1024, max: 1439, label: "Desktop (1024–1439px)" },
  wide: { min: 1440, max: 9999, label: "Wide (≥1440px)" },
};

const INITIAL: Record<Breakpoint, Settings> = {
  mobile: { ...DEFAULTS, scale: 2, translateX: 10, translateY: 8, objectPosX: 55, objectPosY: 65 },
  tablet: { ...DEFAULTS, scale: 2, translateX: 11, translateY: 4, objectPosX: 50, objectPosY: 50 },
  desktop: { ...DEFAULTS, scale: 1, translateX: 0, translateY: 0, objectPosX: 50, objectPosY: 50 },
  wide: { ...DEFAULTS, scale: 1.9, translateX: 7, translateY: -11, objectPosX: 27, objectPosY: 53 },
};

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-center justify-between text-[11px] font-medium text-neutral-400">
        {label}
        <span className="tabular-nums text-white/80 font-mono">
          {value}{unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full bg-neutral-700 accent-[#FACC15] cursor-pointer"
      />
    </label>
  );
}

export function ContactImageSandbox() {
  const [open, setOpen] = useState(false);
  const [bp, setBp] = useState<Breakpoint>("desktop");
  const [settings, setSettings] = useState<Record<Breakpoint, Settings>>(INITIAL);
  const [copied, setCopied] = useState(false);

  const s = settings[bp];

  const update = useCallback(
    (partial: Partial<Settings>) => {
      setSettings((prev) => ({ ...prev, [bp]: { ...prev[bp], ...partial } }));
    },
    [bp]
  );

  // Detect current breakpoint
  useEffect(() => {
    function detect() {
      const w = window.innerWidth;
      if (w < 640) setBp("mobile");
      else if (w < 1024) setBp("tablet");
      else if (w < 1440) setBp("desktop");
      else setBp("wide");
    }
    detect();
    window.addEventListener("resize", detect);
    return () => window.removeEventListener("resize", detect);
  }, []);

  // Apply live styles to .contact-hero-img
  useEffect(() => {
    const style = document.getElementById("sandbox-style");
    if (style) {
      style.textContent = `
        .contact-hero-img {
          object-position: ${s.objectPosX}% ${s.objectPosY}% !important;
          transform: scale(${s.scale}) translate(${s.translateX}px, ${s.translateY}px) !important;
        }
        .contact-feather {
          height: ${s.featherHeight}% !important;
          opacity: ${s.featherOpacity / 100} !important;
        }
      `;
    }
  }, [s]);

  function generateCSS() {
    let css = `.contact-hero-img {\n`;
    css += `  object-position: 50% 50%;\n`;
    css += `}\n\n`;

    for (const key of ["mobile", "tablet", "desktop", "wide"] as Breakpoint[]) {
      const st = settings[key];
      const bpRange = BP_RANGES[key];
      if (key === "mobile") {
        css += `@media (max-width: ${bpRange.max}px) {\n`;
      } else if (key === "wide") {
        css += `@media (min-width: ${bpRange.min}px) {\n`;
      } else {
        css += `@media (min-width: ${bpRange.min}px) and (max-width: ${bpRange.max}px) {\n`;
      }
      css += `  .contact-hero-img {\n`;
      css += `    transform: scale(${st.scale}) translate(${st.translateX}px, ${st.translateY}px);\n`;
      css += `    object-position: ${st.objectPosX}% ${st.objectPosY}%;\n`;
      css += `  }\n`;
      css += `}\n\n`;
    }

    css += `/* Feather gradient */\n`;
    css += `.contact-feather {\n`;
    css += `  height: ${settings.mobile.featherHeight}%;\n`;
    css += `  opacity: ${settings.mobile.featherOpacity / 100};\n`;
    css += `}\n`;

    return css;
  }

  function copySettings() {
    const css = generateCSS();
    navigator.clipboard.writeText(css).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[200] bg-[#FACC15] text-black px-3 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-[#ffe043] active:scale-95 transition-all"
      >
        🎛️ Image Sandbox
      </button>
    );
  }

  return (
    <>
      <style id="sandbox-style">{`.contact-hero-img{}`}</style>
      <div className="fixed bottom-4 right-4 z-[200] w-80 max-h-[85vh] overflow-y-auto rounded-xl bg-neutral-900/95 border border-white/15 backdrop-blur-xl shadow-2xl text-white p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">🎛️ Image Sandbox</h3>
            <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-white text-lg leading-none">&times;</button>
          </div>

          {/* Breakpoint tabs */}
          <div className="flex gap-1 bg-neutral-800 rounded-lg p-1">
            {(["mobile", "tablet", "desktop", "wide"] as Breakpoint[]).map((b) => (
              <button
                key={b}
                onClick={() => setBp(b)}
                className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-colors ${
                  bp === b ? "bg-[#FACC15] text-black" : "text-neutral-400 hover:text-white"
                }`}
              >
                {b === "mobile" ? "📱" : b === "tablet" ? "📱" : b === "desktop" ? "🖥️" : "🖥️"}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-neutral-500 -mt-2">{BP_RANGES[bp].label}</p>

          {/* Image controls */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Image</p>
            <Slider label="Zoom" value={s.scale} onChange={(v) => update({ scale: v })} min={0.5} max={3} step={0.1} unit="x" />
            <Slider label="Position X" value={s.translateX} onChange={(v) => update({ translateX: v })} min={-50} max={50} unit="px" />
            <Slider label="Position Y" value={s.translateY} onChange={(v) => update({ translateY: v })} min={-50} max={50} unit="px" />
            <Slider label="Object X" value={s.objectPosX} onChange={(v) => update({ objectPosX: v })} min={0} max={100} unit="%" />
            <Slider label="Object Y" value={s.objectPosY} onChange={(v) => update({ objectPosY: v })} min={0} max={100} unit="%" />
          </div>

          <div className="h-px bg-white/10" />

          {/* Feather controls */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Feather</p>
            <Slider label="Height" value={s.featherHeight} onChange={(v) => update({ featherHeight: v })} min={5} max={80} unit="%" />
            <Slider label="Intensity" value={s.featherOpacity} onChange={(v) => update({ featherOpacity: v })} min={0} max={100} unit="%" />
          </div>

          <div className="h-px bg-white/10" />

          {/* Preview all breakpoints */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">All Settings</p>
            {(["mobile", "tablet", "desktop", "wide"] as Breakpoint[]).map((b) => (
              <div key={b} className={`text-[10px] font-mono p-2 rounded-md ${bp === b ? "bg-white/10 text-white" : "text-neutral-500"}`}>
                <span className="font-bold">{b}:</span> scale={settings[b].scale} tx={settings[b].translateX} ty={settings[b].translateY} objX={settings[b].objectPosX} objY={settings[b].objectPosY}
              </div>
            ))}
          </div>

          <div className="h-px bg-white/10" />

          {/* Copy button */}
          <button
            onClick={copySettings}
            className="w-full py-2.5 rounded-lg bg-[#FACC15] text-black text-xs font-bold hover:bg-[#ffe043] active:scale-[0.98] transition-all"
          >
            {copied ? "✓ Copied!" : "📋 Copy CSS Settings"}
          </button>
        </div>
      </>
  );
}
