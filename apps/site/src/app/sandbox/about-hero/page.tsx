"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Monitor,
  Tablet,
  Smartphone,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";

type DeviceMode = "desktop" | "tablet" | "mobile";

export default function AboutHeroSandbox() {
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [copied, setCopied] = useState(false);

  // Position sliders per device
  const [mobileX, setMobileX] = useState(63);
  const [mobileY, setMobileY] = useState(50);

  const [tabletX, setTabletX] = useState(50);
  const [tabletY, setTabletY] = useState(50);

  const [desktopX, setDesktopX] = useState(50);
  const [desktopY, setDesktopY] = useState(50);

  // Active target image
  const [selectedHero, setSelectedHero] = useState<"about" | "speaking">("about");

  const imageSrc =
    selectedHero === "about"
      ? "/images/heroes/sagar-lad-about-me-hero.webp"
      : "/images/heroes/Speaking_hero.webp";

  const mobileClass = `object-[${mobileX}%_${mobileY}%]`;
  const tabletClass = `sm:object-[${tabletX}%_${tabletY}%]`;
  const desktopClass = `lg:object-[${desktopX}%_${desktopY}%]`;

  const fullTailwindClass = `object-cover ${mobileClass} ${tabletClass} ${desktopClass}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullTailwindClass);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (selectedHero === "about") {
      setMobileX(63);
      setMobileY(50);
      setTabletX(50);
      setTabletY(50);
      setDesktopX(50);
      setDesktopY(50);
    } else {
      setMobileX(50);
      setMobileY(50);
      setTabletX(50);
      setTabletY(50);
      setDesktopX(50);
      setDesktopY(50);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur sticky top-0 z-50 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-accent/20 text-accent border border-accent/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-base sm:text-lg font-bold">
                  Hero Responsive Calibration Sandbox
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Interactive
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Calibrate responsive coordinates across Mobile, Tablet, and Desktop for the About Me &amp; Speaking heroes.
              </p>
            </div>
          </div>

          {/* Hero Switcher */}
          <div className="flex items-center gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setSelectedHero("about")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedHero === "about"
                  ? "bg-accent text-accent-foreground font-bold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              About Me Hero
            </button>
            <button
              type="button"
              onClick={() => setSelectedHero("speaking")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedHero === "speaking"
                  ? "bg-accent text-accent-foreground font-bold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Speaking Hero
            </button>
          </div>
        </div>
      </header>

      {/* Main Sandbox Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Device Selector */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">
              1. Select Device Viewport to Test
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  device === "desktop"
                    ? "border-accent bg-accent/15 text-accent shadow-md"
                    : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white hover:border-neutral-700"
                }`}
              >
                <Monitor className="w-5 h-5" />
                Desktop (lg)
              </button>
              <button
                type="button"
                onClick={() => setDevice("tablet")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  device === "tablet"
                    ? "border-accent bg-accent/15 text-accent shadow-md"
                    : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white hover:border-neutral-700"
                }`}
              >
                <Tablet className="w-5 h-5" />
                Tablet (sm)
              </button>
              <button
                type="button"
                onClick={() => setDevice("mobile")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  device === "mobile"
                    ? "border-accent bg-accent/15 text-accent shadow-md"
                    : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white hover:border-neutral-700"
                }`}
              >
                <Smartphone className="w-5 h-5" />
                Mobile
              </button>
            </div>
          </div>

          {/* Coordinate Sliders */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                2. Calibrate Position ({device.toUpperCase()})
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-neutral-400 hover:text-accent flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Mobile Sliders */}
            {device === "mobile" && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-neutral-300">Mobile Horizontal (X)</span>
                    <span className="font-mono text-accent font-bold">{mobileX}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={mobileX}
                    onChange={(e) => setMobileX(Number(e.target.value))}
                    className="w-full accent-[#5b7bfb] cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-neutral-300">Mobile Vertical (Y)</span>
                    <span className="font-mono text-accent font-bold">{mobileY}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={mobileY}
                    onChange={(e) => setMobileY(Number(e.target.value))}
                    className="w-full accent-[#5b7bfb] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Tablet Sliders */}
            {device === "tablet" && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-neutral-300">Tablet Horizontal (X)</span>
                    <span className="font-mono text-accent font-bold">{tabletX}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={tabletX}
                    onChange={(e) => setTabletX(Number(e.target.value))}
                    className="w-full accent-[#5b7bfb] cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-neutral-300">Tablet Vertical (Y)</span>
                    <span className="font-mono text-accent font-bold">{tabletY}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={tabletY}
                    onChange={(e) => setTabletY(Number(e.target.value))}
                    className="w-full accent-[#5b7bfb] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Desktop Sliders */}
            {device === "desktop" && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-neutral-300">Desktop Horizontal (X)</span>
                    <span className="font-mono text-accent font-bold">{desktopX}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={desktopX}
                    onChange={(e) => setDesktopX(Number(e.target.value))}
                    className="w-full accent-[#5b7bfb] cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-neutral-300">Desktop Vertical (Y)</span>
                    <span className="font-mono text-accent font-bold">{desktopY}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={desktopY}
                    onChange={(e) => setDesktopY(Number(e.target.value))}
                    className="w-full accent-[#5b7bfb] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Coordinate Summary Matrix */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800/80 text-center text-xs">
              <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Mobile</span>
                <code className="text-[11px] font-mono font-bold text-accent">{mobileClass}</code>
              </div>
              <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Tablet</span>
                <code className="text-[11px] font-mono font-bold text-accent">{tabletClass}</code>
              </div>
              <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 block">Desktop</span>
                <code className="text-[11px] font-mono font-bold text-accent">{desktopClass}</code>
              </div>
            </div>
          </div>

          {/* Export / Copy Box */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">
              3. Generated Tailwind Classes
            </label>
            <div className="p-3 rounded-xl bg-black font-mono text-xs text-amber-300 break-all border border-neutral-800">
              {fullTailwindClass}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent text-accent-foreground px-4 py-3 text-sm font-semibold hover:opacity-90 transition-all shadow-md active:scale-[0.99]"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied to Clipboard!" : "Copy Tailwind Classes"}
            </button>
          </div>

          {/* Guidance note */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
            <p>
              Once you are happy with the visual framing on all devices, copy the Tailwind string and send it here. We will hardcode it into the page component!
            </p>
          </div>
        </div>

        {/* Live Preview Column (7 cols) */}
        <div className="lg:col-span-7 sticky top-20 space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
            <span className="font-semibold text-neutral-300">
              Live Preview: {selectedHero === "about" ? "About Me Hero" : "Speaking Hero"}
            </span>
            <span className="font-mono text-[11px]">
              Frame: {device === "desktop" ? "100% Widescreen" : device === "tablet" ? "768px (iPad)" : "390px (iPhone)"}
            </span>
          </div>

          {/* Viewport Frame Container */}
          <div className="flex justify-center bg-neutral-950 p-4 rounded-2xl border border-neutral-800 overflow-hidden items-center min-h-[580px]">
            <div
              className={`relative transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-neutral-900 text-white flex flex-col ${
                device === "desktop"
                  ? "w-full aspect-[16/10]"
                  : device === "tablet"
                  ? "w-[85%] aspect-[4/5]"
                  : "w-[340px] aspect-[9/16]"
              }`}
            >
              {/* Window Header */}
              <div className="h-7 bg-neutral-900/95 border-b border-neutral-800 px-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {device === "desktop"
                    ? `${desktopClass.replace("lg:", "")}`
                    : device === "tablet"
                    ? `${tabletClass.replace("sm:", "")}`
                    : `${mobileClass}`}
                </span>
              </div>

              {/* Main Visual Hero Mockup */}
              <div className="relative flex-1 w-full overflow-hidden flex flex-col justify-end">
                {/* Hero Image */}
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                  <Image
                    src={imageSrc}
                    alt="Preview"
                    fill
                    priority
                    className={`object-cover ${
                      device === "desktop"
                        ? desktopClass.replace("lg:", "")
                        : device === "tablet"
                        ? tabletClass.replace("sm:", "")
                        : mobileClass
                    }`}
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
                </div>

                {/* Overlaid Copy matching the real page */}
                <div className="relative z-10 p-5 sm:p-8 space-y-3 max-w-xl">
                  {selectedHero === "about" ? (
                    <>
                      <div>
                        <span className="inline-block text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70 border border-white/20 rounded-full px-3 py-1">
                          The full story
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed line-clamp-3">
                        Data &amp; AI Architect by profession, TEDx Speaker, and published author of 6+ books. Founder of the MIND UP Framework.
                      </p>
                      <div className="border-l-2 border-accent pl-3 text-xs sm:text-sm font-semibold text-white/90">
                        People don&apos;t make poor choices — they make the best choices they can with the information they have.
                      </div>
                      <div className="pt-1 text-sm sm:text-lg font-display font-bold leading-snug">
                        <p>MIND UP.</p>
                        <p>Change your <span className="text-[#ffd51d]">MIND</span>.</p>
                        <p>Change your <span className="text-[#ffd51d]">life</span>.</p>
                      </div>
                      <div className="pt-1">
                        <SiteLogo light className="h-7 w-auto" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="inline-block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/20 border border-accent/30 rounded-full px-3 py-1">
                          Speaking
                        </span>
                      </div>
                      <h2 className="font-display text-lg sm:text-2xl font-bold leading-tight text-white">
                        Ideas that ignite rooms and transform mindsets.
                      </h2>
                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed line-clamp-2">
                        Delivering story-driven, actionable keynotes on AI leadership, financial freedom, and career momentum.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
