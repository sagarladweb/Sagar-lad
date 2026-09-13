"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";

type Device = "mobile" | "tablet" | "desktop";

const DEVICE_WIDTHS: Record<Device, number> = {
  mobile: 375,
  tablet: 768,
  desktop: 1280,
};

const DEVICE_LABELS: Record<Device, string> = {
  mobile: "Mobile (375px)",
  tablet: "Tablet (768px)",
  desktop: "Desktop (1280px)",
};

type Transform = {
  x: number;
  y: number;
  scale: number;
};

type MaskConfig = {
  enabled: boolean;
  fadeStart: number;   // % where fade starts
  fadeEnd: number;     // % where fade ends (0 = bottom, 100 = top)
  direction: "to top" | "to bottom" | "to left" | "to right";
};

type ContainerConfig = {
  maxWidth: number;    // px
  rounded: boolean;
  objectFit: "cover" | "contain" | "fill";
};

const DEFAULT_TRANSFORM: Transform = { x: 0, y: 0, scale: 1 };
const DEFAULT_MASK: MaskConfig = { enabled: true, fadeStart: 0, fadeEnd: 12, direction: "to top" };
const DEFAULT_CONTAINER: ContainerConfig = { maxWidth: 420, rounded: true, objectFit: "contain" };

const STORAGE_KEY = "contact-hero-sandbox";

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export default function ContactHeroSandbox() {
  const saved = useRef(loadSaved());

  const [device, setDevice] = useState<Device>("desktop");
  const [transform, setTransform] = useState<Transform>(saved.current?.transform ?? DEFAULT_TRANSFORM);
  const [mask, setMask] = useState<MaskConfig>(saved.current?.mask ?? DEFAULT_MASK);
  const [container, setContainer] = useState<ContainerConfig>(saved.current?.container ?? DEFAULT_CONTAINER);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });

  // Auto-save
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ transform, mask, container }));
  }, [transform, mask, container]);

  const reset = useCallback(() => {
    setTransform(DEFAULT_TRANSFORM);
    setMask(DEFAULT_MASK);
    setContainer(DEFAULT_CONTAINER);
  }, []);

  // Drag handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOrigin({ x: transform.x, y: transform.y });
  }, [transform]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setTransform((t) => ({ ...t, x: dragOrigin.x + dx, y: dragOrigin.y + dy }));
  }, [dragging, dragStart, dragOrigin]);

  const onMouseUp = useCallback(() => setDragging(false), []);

  // Touch handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setDragOrigin({ x: transform.x, y: transform.y });
  }, [transform]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.x;
    const dy = touch.clientY - dragStart.y;
    setTransform((t) => ({ ...t, x: dragOrigin.x + dx, y: dragOrigin.y + dy }));
  }, [dragging, dragStart, dragOrigin]);

  // Keyboard arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 10 : 2;
      if (e.key === "ArrowUp") { e.preventDefault(); setTransform((t) => ({ ...t, y: t.y - step })); }
      if (e.key === "ArrowDown") { e.preventDefault(); setTransform((t) => ({ ...t, y: t.y + step })); }
      if (e.key === "ArrowLeft") { e.preventDefault(); setTransform((t) => ({ ...t, x: t.x - step })); }
      if (e.key === "ArrowRight") { e.preventDefault(); setTransform((t) => ({ ...t, x: t.x + step })); }
      if (e.key === "+" || e.key === "=") { e.preventDefault(); setTransform((t) => ({ ...t, scale: Math.min(t.scale + 0.1, 5) })); }
      if (e.key === "-") { e.preventDefault(); setTransform((t) => ({ ...t, scale: Math.max(t.scale - 0.1, 0.1) })); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const vw = DEVICE_WIDTHS[device];

  const maskCSS = mask.enabled
    ? `linear-gradient(${mask.direction}, transparent ${mask.fadeStart}%, black ${mask.fadeEnd}%, black 100%)`
    : "none";

  const imgStyle: React.CSSProperties = {
    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
    objectFit: container.objectFit,
    maskImage: maskCSS,
    WebkitMaskImage: maskCSS,
    transition: dragging ? "none" : "transform 0.1s ease-out",
    cursor: dragging ? "grabbing" : "grab",
  };

  // Position step buttons
  const step = 5;
  const moveBtn = (dx: number, dy: number) => () =>
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));

  return (
    <div className="min-h-screen bg-[#090909] text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Contact Hero Image Sandbox</h1>
            <p className="text-xs text-neutral-500 mt-1">Drag image or use controls. Shift+Arrow = 10px. Output updates live.</p>
          </div>
          <button
            onClick={reset}
            className="px-4 py-2 text-xs font-semibold rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
          >
            Reset All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Preview */}
          <div className="flex flex-col items-center">
            {/* Device tabs */}
            <div className="flex gap-1 mb-4 bg-white/5 rounded-full p-1">
              {(Object.keys(DEVICE_WIDTHS) as Device[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                    device === d ? "bg-[#FACC15] text-black" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {DEVICE_LABELS[d]}
                </button>
              ))}
            </div>

            {/* Device frame */}
            <div
              className="relative bg-white/5 border border-white/10 overflow-hidden"
              style={{
                width: Math.min(vw, 800),
                height: 600,
                borderRadius: 12,
              }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onMouseUp}
            >
              {/* Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <div className="w-px h-full bg-white/5" />
                <div className="absolute w-full h-px bg-white/5" />
              </div>

              {/* Image container */}
              <div
                className="relative mx-auto h-full"
                style={{
                  maxWidth: container.maxWidth,
                  borderRadius: container.rounded ? 16 : 0,
                  overflow: "hidden",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/section.png"
                  alt="Sagar Lad"
                  className="w-full h-full"
                  style={imgStyle}
                  draggable={false}
                />
              </div>

              {/* Position indicator */}
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-[10px] font-mono text-neutral-400">
                x:{transform.x} y:{transform.y} scale:{transform.scale.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Controls panel */}
          <div className="space-y-4">
            {/* Move buttons (D-pad) */}
            <Section title="Move">
              <div className="grid grid-cols-3 gap-1 w-fit mx-auto">
                <div />
                <DPadBtn onClick={moveBtn(0, -step)} label="↑" />
                <div />
                <DPadBtn onClick={moveBtn(-step, 0)} label="←" />
                <div className="w-8 h-8 rounded bg-white/5" />
                <DPadBtn onClick={moveBtn(step, 0)} label="→" />
                <div />
                <DPadBtn onClick={moveBtn(0, step)} label="↓" />
                <div />
              </div>
              <p className="text-[10px] text-neutral-500 text-center mt-2">Or drag the image. Shift+Arrow = 10px.</p>
            </Section>

            {/* Zoom */}
            <Section title="Zoom">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTransform((t) => ({ ...t, scale: Math.max(t.scale - 0.1, 0.1) }))}
                  className="w-8 h-8 rounded bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10"
                >
                  −
                </button>
                <input
                  type="range"
                  min={0.1}
                  max={5}
                  step={0.05}
                  value={transform.scale}
                  onChange={(e) => setTransform((t) => ({ ...t, scale: parseFloat(e.target.value) }))}
                  className="flex-1 accent-[#FACC15]"
                />
                <button
                  onClick={() => setTransform((t) => ({ ...t, scale: Math.min(t.scale + 0.1, 5) }))}
                  className="w-8 h-8 rounded bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10"
                >
                  +
                </button>
                <span className="text-xs font-mono text-neutral-400 w-10 text-right">{transform.scale.toFixed(1)}×</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">Or use +/- keys.</p>
            </Section>

            {/* Container */}
            <Section title="Container">
              <label className="block">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Max Width (px)</span>
                <input
                  type="number"
                  value={container.maxWidth}
                  onChange={(e) => setContainer((c) => ({ ...c, maxWidth: parseInt(e.target.value) || 420 }))}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white"
                />
              </label>
              <label className="block mt-2">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Object Fit</span>
                <select
                  value={container.objectFit}
                  onChange={(e) => setContainer((c) => ({ ...c, objectFit: e.target.value as ContainerConfig["objectFit"] }))}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white"
                >
                  <option value="contain">contain</option>
                  <option value="cover">cover</option>
                  <option value="fill">fill</option>
                </select>
              </label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={container.rounded}
                  onChange={(e) => setContainer((c) => ({ ...c, rounded: e.target.checked }))}
                  className="accent-[#FACC15]"
                />
                <span className="text-xs text-neutral-300">Rounded corners</span>
              </label>
            </Section>

            {/* Mask */}
            <Section title="Mask / Fade">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mask.enabled}
                  onChange={(e) => setMask((m) => ({ ...m, enabled: e.target.checked }))}
                  className="accent-[#FACC15]"
                />
                <span className="text-xs text-neutral-300">Enable gradient mask</span>
              </label>
              {mask.enabled && (
                <>
                  <label className="block mt-2">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Direction</span>
                    <select
                      value={mask.direction}
                      onChange={(e) => setMask((m) => ({ ...m, direction: e.target.value as MaskConfig["direction"] }))}
                      className="mt-1 w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white"
                    >
                      <option value="to top">to top (fade bottom)</option>
                      <option value="to bottom">to bottom (fade top)</option>
                      <option value="to left">to left (fade right)</option>
                      <option value="to right">to right (fade left)</option>
                    </select>
                  </label>
                  <label className="block mt-2">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Fade Start ({mask.fadeStart}%)</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={mask.fadeStart}
                      onChange={(e) => setMask((m) => ({ ...m, fadeStart: parseInt(e.target.value) }))}
                      className="mt-1 w-full accent-[#FACC15]"
                    />
                  </label>
                  <label className="block mt-2">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Fade End ({mask.fadeEnd}%)</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={mask.fadeEnd}
                      onChange={(e) => setMask((m) => ({ ...m, fadeEnd: parseInt(e.target.value) }))}
                      className="mt-1 w-full accent-[#FACC15]"
                    />
                  </label>
                </>
              )}
            </Section>

            {/* Output */}
            <Section title="Output">
              <pre className="text-[10px] text-[#FACC15] bg-black/40 rounded p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`style={{
  transform: "translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})",
  objectFit: "${container.objectFit}",
  maskImage: "${maskCSS}",
  WebkitMaskImage: "${maskCSS}",
}}`}
              </pre>
              <button
                onClick={() => {
                  const css = `style={{
  transform: "translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})",
  objectFit: "${container.objectFit}",
  maskImage: "${maskCSS}",
  WebkitMaskImage: "${maskCSS}",
}}`;
                  navigator.clipboard.writeText(css);
                }}
                className="mt-2 w-full px-3 py-1.5 text-xs font-semibold rounded bg-[#FACC15] text-black hover:opacity-90"
              >
                Copy CSS
              </button>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <h3 className="text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-500 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function DPadBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 active:bg-white/20 transition-colors"
    >
      {label}
    </button>
  );
}
