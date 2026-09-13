"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Download, Settings2 } from "lucide-react";

const STORAGE_KEY = "contact-hero-sandbox-v3";

type S = { z: number; tx: number; ty: number; ox: number; oy: number; ms: number; me: number };
type All = Record<string, S>;

const DEF: S = { z: 100, tx: 0, ty: 0, ox: 50, oy: 50, ms: 0, me: 12 };

function deviceKey(w: number) {
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  if (w < 1440) return "desktop";
  return "wide";
}

function loadAll(): All {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

function saveAll(a: All) { localStorage.setItem(STORAGE_KEY, JSON.stringify(a)); }

export function ContactHeroSandbox() {
  const [all, setAll] = useState<All>({});
  const [dk, setDk] = useState("mobile");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const apply = () => setDk(deviceKey(window.innerWidth));
    setAll(loadAll());
    apply();
    setMounted(true);
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  const cur = mounted ? { ...DEF, ...all[dk] } : DEF;

  const set = useCallback((patch: Partial<S>) => {
    setAll((prev) => {
      const next = { ...prev, [dk]: { ...DEF, ...prev[dk], ...patch } };
      saveAll(next);
      return next;
    });
  }, [dk]);

  const reset = () => {
    setAll((prev) => { const next = { ...prev }; delete next[dk]; saveAll(next); return next; });
  };

  const exportAll = () => {
    const out: Record<string, string> = {};
    for (const k of ["mobile", "tablet", "desktop", "wide"]) {
      const s = { ...DEF, ...all[k] };
      out[k] = `scale(${s.z / 100}) translate(${s.tx}px, ${s.ty}px) | object-position: ${s.ox}% ${s.oy}% | mask: ${s.ms}%, ${s.me}%`;
    }
    navigator.clipboard.writeText(JSON.stringify(out, null, 2));
    alert("Copied!");
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <style>{`
        .contact-hero-img {
          transform: scale(${cur.z / 100}) translate(${cur.tx}px, ${cur.ty}px) !important;
          object-position: ${cur.ox}% ${cur.oy}% !important;
          mask-image: linear-gradient(to top, transparent ${cur.ms}%, black ${cur.me}%, black 100%) !important;
          -webkit-mask-image: linear-gradient(to top, transparent ${cur.ms}%, black ${cur.me}%, black 100%) !important;
        }
      `}</style>

      <button type="button" onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 rounded-full bg-amber-500 text-black px-4 py-2 text-[11px] font-bold uppercase tracking-wider shadow-xl hover:bg-amber-400 transition-colors">
        <Settings2 className="w-3.5 h-3.5" />
        {open ? "Close" : "Adjust Image"}
      </button>

      {open && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] bg-[#111] border border-amber-500/30 rounded-2xl p-4 shadow-2xl w-[320px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{dk}</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={reset} className="text-[9px] text-neutral-500 hover:text-white transition-colors">Reset</button>
              <span className="text-neutral-700">|</span>
              <button type="button" onClick={exportAll} className="text-[9px] text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1"><Download className="w-2.5 h-2.5" />Copy All</button>
            </div>
          </div>

          <div className="space-y-3">
            <Slider label="Zoom" value={cur.z} min={50} max={200} step={1} unit="%" onChange={(v) => set({ z: v })} />
            <Slider label="Move X" value={cur.tx} min={-200} max={200} step={1} unit="px" onChange={(v) => set({ tx: v })} />
            <Slider label="Move Y" value={cur.ty} min={-200} max={200} step={1} unit="px" onChange={(v) => set({ ty: v })} />
            <Slider label="Focus X" value={cur.ox} min={0} max={100} step={1} unit="%" onChange={(v) => set({ ox: v })} />
            <Slider label="Focus Y" value={cur.oy} min={0} max={100} step={1} unit="%" onChange={(v) => set({ oy: v })} />
            <Slider label="Fade Start" value={cur.ms} min={0} max={50} step={1} unit="%" onChange={(v) => set({ ms: v })} />
            <Slider label="Fade End" value={cur.me} min={1} max={50} step={1} unit="%" onChange={(v) => set({ me: v })} />
          </div>
        </div>
      )}
    </>,
    document.body
  );
}

function Slider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{label}</span>
        <span className="text-[11px] font-mono text-white tabular-nums">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500" />
    </div>
  );
}
