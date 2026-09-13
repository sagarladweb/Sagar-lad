"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Settings2,
} from "lucide-react";

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
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] bg-[#111] border border-amber-500/30 rounded-2xl p-4 shadow-2xl w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{dk}</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={reset} className="text-[9px] text-neutral-500 hover:text-white transition-colors">Reset</button>
              <span className="text-neutral-700">|</span>
              <button type="button" onClick={exportAll} className="text-[9px] text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1"><Download className="w-2.5 h-2.5" />Copy All</button>
            </div>
          </div>

          <div className="space-y-2.5">
            <Row label="Zoom" value={`${cur.z}%`}>
              <Btn onClick={() => set({ z: Math.max(50, cur.z - 5) })}><ChevronLeft className="w-3 h-3" /></Btn>
              <Btn onClick={() => set({ z: Math.min(200, cur.z + 5) })}><ChevronRight className="w-3 h-3" /></Btn>
            </Row>
            <Row label="Move X" value={`${cur.tx}px`}>
              <Btn onClick={() => set({ tx: cur.tx - 5 })}><ChevronLeft className="w-3 h-3" /></Btn>
              <Btn onClick={() => set({ tx: cur.tx + 5 })}><ChevronRight className="w-3 h-3" /></Btn>
            </Row>
            <Row label="Move Y" value={`${cur.ty}px`}>
              <Btn onClick={() => set({ ty: cur.ty - 5 })}><ChevronLeft className="w-3 h-3" /></Btn>
              <Btn onClick={() => set({ ty: cur.ty + 5 })}><ChevronRight className="w-3 h-3" /></Btn>
            </Row>
            <Row label="Focus X" value={`${cur.ox}%`}>
              <Btn onClick={() => set({ ox: Math.max(0, cur.ox - 5) })}><ChevronLeft className="w-3 h-3" /></Btn>
              <Btn onClick={() => set({ ox: Math.min(100, cur.ox + 5) })}><ChevronRight className="w-3 h-3" /></Btn>
            </Row>
            <Row label="Focus Y" value={`${cur.oy}%`}>
              <Btn onClick={() => set({ oy: Math.max(0, cur.oy - 5) })}><ChevronLeft className="w-3 h-3" /></Btn>
              <Btn onClick={() => set({ oy: Math.min(100, cur.oy + 5) })}><ChevronRight className="w-3 h-3" /></Btn>
            </Row>
            <Row label="Fade Start" value={`${cur.ms}%`}>
              <Btn onClick={() => set({ ms: Math.max(0, cur.ms - 1) })}><ChevronLeft className="w-3 h-3" /></Btn>
              <Btn onClick={() => set({ ms: Math.min(50, cur.ms + 1) })}><ChevronRight className="w-3 h-3" /></Btn>
            </Row>
            <Row label="Fade End" value={`${cur.me}%`}>
              <Btn onClick={() => set({ me: Math.max(1, cur.me - 1) })}><ChevronLeft className="w-3 h-3" /></Btn>
              <Btn onClick={() => set({ me: Math.min(50, cur.me + 1) })}><ChevronRight className="w-3 h-3" /></Btn>
            </Row>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}

function Row({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 w-16 shrink-0">{label}</span>
      <span className="text-[11px] font-mono text-white tabular-nums w-14 text-center">{value}</span>
      <div className="flex gap-1.5">{children}</div>
    </div>
  );
}

function Btn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="grid h-6 w-6 place-items-center rounded-lg border border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors">
      {children}
    </button>
  );
}
