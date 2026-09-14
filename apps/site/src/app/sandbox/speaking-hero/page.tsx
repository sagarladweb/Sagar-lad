"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Monitor,
  Laptop,
  Tablet,
  Smartphone,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";

type DeviceMode = "desktop" | "laptop" | "tablet" | "mobile";

export default function SpeakingHeroSandbox() {
  const [device, setDevice] = useState<DeviceMode>("mobile");
  const [copied, setCopied] = useState(false);

  // Position sliders per device (starting with current defaults)
  const [mobileX, setMobileX] = useState(77);
  const [mobileY, setMobileY] = useState(50);

  const [tabletX, setTabletX] = useState(80);
  const [tabletY, setTabletY] = useState(50);

  const [laptopX, setLaptopX] = useState(50);
  const [laptopY, setLaptopY] = useState(50);

  const [desktopX, setDesktopX] = useState(50);
  const [desktopY, setDesktopY] = useState(50);

  const imageSrc = "/images/heroes/Speaking_hero.webp";

  // Active current position for live style
  const currentPos =
    device === "desktop"
      ? { x: desktopX, y: desktopY, label: "Desktop (lg)" }
      : device === "laptop"
      ? { x: laptopX, y: laptopY, label: "Laptop (md)" }
      : device === "tablet"
      ? { x: tabletX, y: tabletY, label: "Tablet (sm)" }
      : { x: mobileX, y: mobileY, label: "Mobile" };

  const mobileClass = `object-[${mobileX}%_${mobileY}%]`;
  const tabletClass = `sm:object-[${tabletX}%_${tabletY}%]`;
  const desktopClass = `lg:object-[${desktopX}%_${desktopY}%]`;

  const fullTailwindClass = `object-cover ${mobileClass} ${tabletClass} ${desktopClass} hero-drift`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullTailwindClass);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setMobileX(77);
    setMobileY(50);
    setTabletX(80);
    setTabletY(50);
    setLaptopX(50);
    setLaptopY(50);
    setDesktopX(50);
    setDesktopY(50);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur sticky top-0 z-50 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-accent/20 text-accent border border-accent/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-base sm:text-lg font-bold">
                  Public Speaking Hero Calibration Sandbox
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Engine
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Adjust sliders to visually align Sagar in the frame across Mobile, Tablet, Laptop, and Desktop.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl border border-neutral-800 text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-1.5 rounded-xl bg-accent text-accent-foreground text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-950 stroke-[3]" />
                  Copied Class!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Tailwind Class
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Controls & Viewport Selectors */}
        <div className="lg:col-span-5 space-y-5">
          {/* Viewport Selectors */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">
              1. Select Device Viewport
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setDevice("mobile")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  device === "mobile"
                    ? "border-accent bg-accent/20 text-white shadow-md ring-1 ring-accent"
                    : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white hover:border-neutral-700"
                }`}
              >
                <Smartphone className="w-5 h-5 text-accent" />
                Mobile
              </button>
              <button
                type="button"
                onClick={() => setDevice("tablet")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  device === "tablet"
                    ? "border-accent bg-accent/20 text-white shadow-md ring-1 ring-accent"
                    : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white hover:border-neutral-700"
                }`}
              >
                <Tablet className="w-5 h-5 text-accent" />
                Tablet
              </button>
              <button
                type="button"
                onClick={() => setDevice("laptop")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  device === "laptop"
                    ? "border-accent bg-accent/20 text-white shadow-md ring-1 ring-accent"
                    : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white hover:border-neutral-700"
                }`}
              >
                <Laptop className="w-5 h-5 text-accent" />
                Laptop
              </button>
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  device === "desktop"
                    ? "border-accent bg-accent/20 text-white shadow-md ring-1 ring-accent"
                    : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white hover:border-neutral-700"
                }`}
              >
                <Monitor className="w-5 h-5 text-accent" />
                Desktop
              </button>
            </div>
          </div>

          {/* Calibrate Position Sliders for Active Device */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 block">
                  2. Calibrate Position:{" "}
                  <span className="text-accent font-bold">{currentPos.label}</span>
                </label>
                <p className="text-[11px] text-neutral-500">
                  Live dragging instantly moves the image preview
                </p>
              </div>
            </div>

            {/* Mobile Sliders */}
            {device === "mobile" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-neutral-300">
                      Mobile Horizontal (X)
                    </span>
                    <span className="font-mono text-accent font-bold text-sm">
                      {mobileX}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={mobileX}
                    onChange={(e) => setMobileX(Number(e.target.value))}
                    className="w-full accent-[#5b7bfb] cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>0% (Left)</span>
                    <span>50% (Center)</span>
                    <span>100% (Right)</span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    {[-5, -1, 1, 5].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() =>
                          setMobileX((v) => Math.min(100, Math.max(0, v + delta)))
                        }
                        className="flex-1 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-neutral-300"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-neutral-300">
                      Mobile Vertical (Y)
                    </span>
                    <span className="font-mono text-accent font-bold text-sm">
                      {mobileY}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={mobileY}
                    onChange={(e) => setMobileY(Number(e.target.value))}
                    className="w-full accent-[#5b7bfb] cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>0% (Top)</span>
                    <span>50% (Center)</span>
                    <span>100% (Bottom)</span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    {[-5, -1, 1, 5].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() =>
                          setMobileY((v) => Math.min(100, Math.max(0, v + delta)))
                        }
                        className="flex-1 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-neutral-300"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tablet Sliders */}
            {device === "tablet" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-neutral-300">
                      Tablet Horizontal (X)
                    </span>
                    <span className="font-mono text-accent font-bold text-sm">
                      {tabletX}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={tabletX}
                    onChange={(e) => setTabletX(Number(e.target.value))}
                    className="w-full accent-[#5b7bfb] cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>0% (Left)</span>
                    <span>50% (Center)</span>
                    <span>100% (Right)</span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    {[-5, -1, 1, 5].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() =>
                          setTabletX((v) => Math.min(100, Math.max(0, v + delta)))
                        }
                        className="flex-1 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-neutral-300"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-neutral-300">
                      Tablet Vertical (Y)
                    </span>
                    <span className="font-mono text-accent font-bold text-sm">
                      {tabletY}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={tabletY}
                    onChange={(e) => setTabletY(Number(e.target.value))}
                    className="w-full accent-[#5b7bfb] cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>0% (Top)</span>
                    <span>50% (Center)</span>
                    <span>100% (Bottom)</span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    {[-5, -1, 1, 5].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() =>
                          setTabletY((v) => Math.min(100, Math.max(0, v + delta)))
                        }
                        className="flex-1 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-neutral-300"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Laptop Sliders */}
            {device === "laptop" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-neutral-300">
                      Laptop Horizontal (X)
                    </span>
                    <span className="font-mono text-accent font-bold text-sm">
                      {laptopX}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={laptopX}
                    onChange={(e) => setLaptopX(Number(e.target.value))}
                    className="w-full accent-[#5b7bfb] cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>0% (Left)</span>
                    <span>50% (Center)</span>
                    <span>100% (Right)</span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    {[-5, -1, 1, 5].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() =>
                          setLaptopX((v) => Math.min(100, Math.max(0, v + delta)))
                        }
                        className="flex-1 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-neutral-300"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-neutral-300">
                      Laptop Vertical (Y)
                    </span>
                    <span className="font-mono text-accent font-bold text-sm">
                      {laptopY}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={laptopY}
                    onChange={(e) => setLaptopY(Number(e.target.value))}
                    className="w-full accent-[#5b7bfb] cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>0% (Top)</span>
                    <span>50% (Center)</span>
                    <span>100% (Bottom)</span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    {[-5, -1, 1, 5].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() =>
                          setLaptopY((v) => Math.min(100, Math.max(0, v + delta)))
                        }
                        className="flex-1 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-neutral-300"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Sliders */}
            {device === "desktop" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-neutral-300">
                      Desktop Horizontal (X)
                    </span>
                    <span className="font-mono text-accent font-bold text-sm">
                      {desktopX}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={desktopX}
                    onChange={(e) => setDesktopX(Number(e.target.value))}
                    className="w-full accent-[#5b7bfb] cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>0% (Left)</span>
                    <span>50% (Center)</span>
                    <span>100% (Right)</span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    {[-5, -1, 1, 5].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() =>
                          setDesktopX((v) => Math.min(100, Math.max(0, v + delta)))
                        }
                        className="flex-1 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-neutral-300"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-neutral-300">
                      Desktop Vertical (Y)
                    </span>
                    <span className="font-mono text-accent font-bold text-sm">
                      {desktopY}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={desktopY}
                    onChange={(e) => setDesktopY(Number(e.target.value))}
                    className="w-full accent-[#5b7bfb] cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>0% (Top)</span>
                    <span>50% (Center)</span>
                    <span>100% (Bottom)</span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    {[-5, -1, 1, 5].map((delta) => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() =>
                          setDesktopY((v) => Math.min(100, Math.max(0, v + delta)))
                        }
                        className="flex-1 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] font-mono text-neutral-300"
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generated Code Display */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Generated Tailwind Class
              </label>
              <span className="text-[11px] text-accent font-mono">Ready to paste</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-emerald-400 break-all select-all">
              {fullTailwindClass}
            </div>
          </div>
        </div>

        {/* Right Column: Live Viewport Frame */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 px-1 text-xs text-neutral-400">
            <span>
              Live Preview:{" "}
              <strong className="text-white capitalize">{device} Frame</strong>
            </span>
            <span className="font-mono text-accent">
              Position: {currentPos.x}% X, {currentPos.y}% Y
            </span>
          </div>

          {/* Device Container Frame */}
          <div
            className={`w-full transition-all duration-300 mx-auto rounded-3xl overflow-hidden border-2 border-neutral-700 shadow-2xl bg-neutral-900 relative ${
              device === "mobile"
                ? "max-w-[340px] aspect-[9/16]"
                : device === "tablet"
                ? "max-w-[480px] aspect-[4/5]"
                : device === "laptop"
                ? "max-w-[700px] aspect-[16/10]"
                : "max-w-full aspect-[16/9]"
            }`}
          >
            {/* Live Hero Simulation */}
            <div className="relative w-full h-full overflow-hidden flex flex-col justify-end">
              {/* Background Image with Live Position Binding */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={imageSrc}
                  alt="Speaking Hero Live Preview"
                  fill
                  priority
                  className="object-cover transition-none"
                  style={{
                    objectPosition: `${currentPos.x}% ${currentPos.y}%`,
                  }}
                  sizes="100vw"
                />
                {/* Real Site Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
              </div>

              {/* Real Site Content Mockup */}
              <div className="relative z-10 p-5 sm:p-8 flex flex-col justify-end max-w-xl text-left">
                <div className="mb-3">
                  <span className="btn-premium inline-flex items-center rounded-full bg-accent px-3 py-1 text-[11px] font-semibold tracking-wide text-accent-foreground shadow-md">
                    Speaking
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight drop-shadow-md">
                  Keynotes that move people to action.
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-neutral-200 line-clamp-3 leading-relaxed drop-shadow">
                  High-impact keynotes and interactive workshops on AI leadership, clarity of thinking, and high-performance execution.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-accent text-black font-semibold text-xs shadow-md">
                    Book for a talk
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
