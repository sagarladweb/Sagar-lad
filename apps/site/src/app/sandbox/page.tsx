"use client";

import { useState } from "react";
import Image from "next/image";

type ImagePreset = {
  id: string;
  name: string;
  section: string;
  src: string;
  defaultAspect: string;
  initialX: number;
  initialY: number;
  initialScale: number;
};

const PRESETS: ImagePreset[] = [
  {
    id: "home-hero",
    name: "Home Page Hero",
    section: "Homepage",
    src: "/images/heroes/sagar-lad-author-mentor-guide-home-hero.webp",
    defaultAspect: "aspect-[16/9] lg:aspect-[21/9]",
    initialX: 50,
    initialY: 45,
    initialScale: 100,
  },
  {
    id: "about-hero",
    name: "About Me Hero",
    section: "About Page",
    src: "/images/heroes/sagar-lad-author-keynote-speaker-about-hero.webp",
    defaultAspect: "aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/9]",
    initialX: 77,
    initialY: 50,
    initialScale: 100,
  },
  {
    id: "speaking-hero",
    name: "Public Speaking Hero",
    section: "Speaking Page",
    src: "/images/heroes/Speaking_hero.webp",
    defaultAspect: "aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/9]",
    initialX: 65,
    initialY: 50,
    initialScale: 100,
  },
  {
    id: "about-quote",
    name: "About Mindset Quote Card",
    section: "About Page (Quote)",
    src: "/images/about/sagar-lad-mindup-quote-inspiration.webp",
    defaultAspect: "aspect-[4/5] sm:aspect-[3/2] lg:aspect-[16/9]",
    initialX: 50,
    initialY: 50,
    initialScale: 100,
  },
  {
    id: "about-sagar",
    name: "About Sagar Section",
    section: "Homepage",
    src: "/images/about/sagar-lad-author-speaker-human-potential-about.webp",
    defaultAspect: "aspect-[4/5]",
    initialX: 50,
    initialY: 50,
    initialScale: 100,
  },
  {
    id: "newsletter",
    name: "Newsletter CTA Section",
    section: "Homepage",
    src: "/images/newsletter/sagar-lad-newsletter-mindset-coffee.webp",
    defaultAspect: "aspect-[4/3] sm:aspect-[16/9]",
    initialX: 50,
    initialY: 50,
    initialScale: 100,
  },
  {
    id: "casual-1",
    name: "Friend Sagar - Casual 1",
    section: "Homepage (Friend Sagar)",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-1.webp",
    defaultAspect: "aspect-[4/5]",
    initialX: 50,
    initialY: 45,
    initialScale: 100,
  },
  {
    id: "casual-2",
    name: "Friend Sagar - Casual 2",
    section: "Homepage (Friend Sagar)",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-2.webp",
    defaultAspect: "aspect-[4/5]",
    initialX: 50,
    initialY: 45,
    initialScale: 100,
  },
  {
    id: "casual-3",
    name: "Friend Sagar - Casual 3",
    section: "Homepage (Friend Sagar)",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-3.webp",
    defaultAspect: "aspect-[4/5]",
    initialX: 50,
    initialY: 45,
    initialScale: 100,
  },
  {
    id: "casual-4",
    name: "Friend Sagar - Casual 4",
    section: "Homepage (Friend Sagar)",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-4.webp",
    defaultAspect: "aspect-[4/5]",
    initialX: 50,
    initialY: 45,
    initialScale: 100,
  },
  {
    id: "casual-5",
    name: "Friend Sagar - Casual 5",
    section: "Homepage (Friend Sagar)",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-5.webp",
    defaultAspect: "aspect-[4/5]",
    initialX: 50,
    initialY: 45,
    initialScale: 100,
  },
  {
    id: "contact-hero",
    name: "Contact Hero Portrait",
    section: "Contact Page",
    src: "/images/contact/sagar-lad-keynote-speaker-contact-portrait.png",
    defaultAspect: "aspect-[3/4]",
    initialX: 50,
    initialY: 50,
    initialScale: 100,
  },
];

type DeviceView = {
  id: string;
  name: string;
  width: string;
  icon: string;
};

const DEVICES: DeviceView[] = [
  { id: "mobile", name: "Mobile (375px)", width: "375px", icon: "📱" },
  { id: "tablet", name: "Tablet (768px)", width: "768px", icon: "📟" },
  { id: "laptop", name: "Laptop (1024px)", width: "1024px", icon: "💻" },
  { id: "desktop", name: "Desktop (1440px)", width: "1440px", icon: "🖥️" },
  { id: "full", name: "Full Screen", width: "100%", icon: "🔲" },
];

export default function ImageCalibrationSandbox() {
  const [selectedPreset, setSelectedPreset] = useState<ImagePreset>(PRESETS[0]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceView>(DEVICES[0]);
  
  // Per-breakpoint adjustments stored in memory for easy multi-device tuning
  const [deviceSettings, setDeviceSettings] = useState<
    Record<string, Record<string, { x: number; y: number; scale: number }>>
  >({});

  const currentSettings =
    deviceSettings[selectedPreset.id]?.[selectedDevice.id] ?? {
      x: selectedPreset.initialX,
      y: selectedPreset.initialY,
      scale: selectedPreset.initialScale,
    };

  const updateCurrent = (patch: Partial<{ x: number; y: number; scale: number }>) => {
    setDeviceSettings((prev) => ({
      ...prev,
      [selectedPreset.id]: {
        ...(prev[selectedPreset.id] || {}),
        [selectedDevice.id]: {
          ...currentSettings,
          ...patch,
        },
      },
    }));
  };

  const [copied, setCopied] = useState(false);

  // Generate copyable Tailwind string combining current breakpoint or all tuned breakpoints
  const mobileSet = deviceSettings[selectedPreset.id]?.mobile ?? { x: selectedPreset.initialX, y: selectedPreset.initialY };
  const tabletSet = deviceSettings[selectedPreset.id]?.tablet ?? mobileSet;
  const laptopSet = deviceSettings[selectedPreset.id]?.laptop ?? tabletSet;
  const desktopSet = deviceSettings[selectedPreset.id]?.desktop ?? laptopSet;

  const tailwindSnippet = `object-cover object-[${mobileSet.x}%_${mobileSet.y}%] sm:object-[${tabletSet.x}%_${tabletSet.y}%] md:object-[${laptopSet.x}%_${laptopSet.y}%] lg:object-[${desktopSet.x}%_${desktopSet.y}%]`;

  const copySnippet = () => {
    navigator.clipboard.writeText(tailwindSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎯</span>
          <div>
            <h1 className="text-base font-bold tracking-wide text-white">Sagar Lad Image Calibration Sandbox</h1>
            <p className="text-xs text-neutral-400">Multi-Device Viewport Calibration & Tailwind Generator</p>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center bg-neutral-800/80 p-1 rounded-xl border border-neutral-700/60">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDevice(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedDevice.id === d.id
                  ? "bg-amber-600 text-white shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>{d.icon}</span>
              <span className="hidden sm:inline">{d.name}</span>
            </button>
          ))}
        </div>

        {/* Quick link back */}
        <a
          href="/"
          className="text-xs text-neutral-400 hover:text-neutral-200 underline underline-offset-4"
        >
          &larr; Back to Website
        </a>
      </header>

      {/* Main Sandbox Grid */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Sidebar: Asset Selector & Controls */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-neutral-800 bg-neutral-900/50 p-6 flex flex-col gap-6 shrink-0 overflow-y-auto">
          {/* Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Select Image Asset
            </label>
            <select
              value={selectedPreset.id}
              onChange={(e) => {
                const found = PRESETS.find((p) => p.id === e.target.value);
                if (found) setSelectedPreset(found);
              }}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.section} &mdash; {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Active Preset Metadata */}
          <div className="p-3 bg-neutral-800/40 rounded-lg border border-neutral-800 text-xs flex flex-col gap-1 text-neutral-400">
            <div><span className="text-neutral-200 font-medium">Path:</span> <code className="text-[11px] text-amber-400 break-all">{selectedPreset.src}</code></div>
            <div><span className="text-neutral-200 font-medium">Device:</span> <span className="text-amber-300">{selectedDevice.name}</span></div>
          </div>

          {/* Calibration Sliders */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              {selectedDevice.name} Alignment
            </h3>

            {/* Object Position X Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Horizontal (X%):</span>
                <span className="font-mono text-amber-400 font-bold">{currentSettings.x}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentSettings.x}
                onChange={(e) => updateCurrent({ x: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5">
                <span>Left (0%)</span>
                <span>Center (50%)</span>
                <span>Right (100%)</span>
              </div>
            </div>

            {/* Object Position Y Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Vertical (Y%):</span>
                <span className="font-mono text-amber-400 font-bold">{currentSettings.y}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentSettings.y}
                onChange={(e) => updateCurrent({ y: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5">
                <span>Top (0%)</span>
                <span>Center (50%)</span>
                <span>Bottom (100%)</span>
              </div>
            </div>

            {/* Zoom / Scale Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400">Scale / Zoom (%):</span>
                <span className="font-mono text-amber-400 font-bold">{currentSettings.scale}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={currentSettings.scale}
                onChange={(e) => updateCurrent({ scale: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-0.5">
                <span>50%</span>
                <span>100%</span>
                <span>150%</span>
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider block">
              Quick Center Resets
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                onClick={() => updateCurrent({ x: 50, y: 50, scale: 100 })}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 font-mono text-[11px]"
              >
                Center
              </button>
              <button
                onClick={() => updateCurrent({ x: 77, y: 50, scale: 100 })}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 font-mono text-[11px]"
              >
                77% / 50%
              </button>
              <button
                onClick={() => updateCurrent({ x: 65, y: 50, scale: 100 })}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 font-mono text-[11px]"
              >
                65% / 50%
              </button>
            </div>
          </div>

          {/* Export Output */}
          <div className="mt-auto pt-4 border-t border-neutral-800 space-y-2">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
              Generated Tailwind Classes
            </span>
            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 font-mono text-[11px] text-amber-300 break-all leading-relaxed">
              {tailwindSnippet}
            </div>
            <button
              onClick={copySnippet}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow transition flex items-center justify-center gap-2"
            >
              {copied ? "✓ Copied to Clipboard!" : "📋 Copy Tailwind Code"}
            </button>
          </div>
        </aside>

        {/* Right Viewport Canvas */}
        <main className="flex-1 bg-neutral-900/30 p-6 flex flex-col items-center justify-center overflow-auto">
          <div className="mb-3 text-xs text-neutral-400 flex items-center gap-2">
            <span>Viewport Simulation:</span>
            <span className="font-semibold text-neutral-200">{selectedDevice.name}</span>
            <span>&bull;</span>
            <span className="text-amber-400 font-mono">
              object-[{currentSettings.x}%_{currentSettings.y}%] scale-{currentSettings.scale}
            </span>
          </div>

          {/* Simulated Viewport Frame */}
          <div
            style={{ width: selectedDevice.width, maxWidth: "100%" }}
            className="transition-all duration-300 shadow-2xl rounded-2xl border border-neutral-700 bg-black overflow-hidden flex flex-col"
          >
            {/* Mock browser header */}
            <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-2 flex items-center justify-between text-xs text-neutral-500 select-none">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[11px] text-neutral-400 truncate max-w-[200px]">
                sagarlad.com/{selectedPreset.section.toLowerCase()}
              </span>
              <div className="text-[10px] text-neutral-500 font-mono">{selectedDevice.width}</div>
            </div>

            {/* Visual Canvas Rendering */}
            <div className="relative w-full bg-neutral-950 p-4 sm:p-8 flex items-center justify-center">
              <div className="relative w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 flex items-center justify-center">
                <div
                  className={`relative w-full ${selectedPreset.defaultAspect} overflow-hidden`}
                >
                  <Image
                    src={selectedPreset.src}
                    alt={selectedPreset.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 1200px"
                    priority
                    style={{
                      objectFit: "cover",
                      objectPosition: `${currentSettings.x}% ${currentSettings.y}%`,
                      transform: `scale(${currentSettings.scale / 100})`,
                    }}
                    className="transition-transform duration-75 select-none"
                  />

                  {/* Alignment Crosshair Overlay for Precision Checking */}
                  <div className="absolute inset-0 pointer-events-none opacity-25">
                    <div className="w-full h-[1px] bg-red-500 absolute top-1/2 left-0" />
                    <div className="h-full w-[1px] bg-red-500 absolute left-1/2 top-0" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom info banner */}
            <div className="bg-neutral-900/90 border-t border-neutral-800 px-4 py-3 flex items-center justify-between text-xs text-neutral-400">
              <span>Aspect Ratio: <strong className="text-neutral-200">{selectedPreset.defaultAspect}</strong></span>
              <span className="text-[11px] text-neutral-500">Crosshair indicates 50%/50% center axis</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
