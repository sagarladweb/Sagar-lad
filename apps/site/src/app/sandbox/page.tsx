"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Smartphone,
  Monitor,
  Tablet,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Crosshair,
  Layers,
  Sparkles,
  ChevronRight,
  Info,
  ArrowLeft,
  Eye,
} from "lucide-react";

type ImagePreset = {
  id: string;
  name: string;
  section: string;
  category: "hero" | "card" | "portrait";
  src: string;
  mobileDefault: { x: number; y: number; scale: number };
  tabletDefault: { x: number; y: number; scale: number };
  desktopDefault: { x: number; y: number; scale: number };
  mobileContainer: string; // e.g. "h-[540px] w-full"
  desktopContainer: string; // e.g. "aspect-[16/9] w-full"
  hasTextOverlay?: boolean;
  overlayTitle?: string;
  overlaySubtitle?: string;
};

const PRESETS: ImagePreset[] = [
  {
    id: "about-hero",
    name: "About Me Hero",
    section: "About Page",
    category: "hero",
    src: "/images/heroes/sagar-lad-author-keynote-speaker-about-hero.webp",
    mobileDefault: { x: 77, y: 50, scale: 100 },
    tabletDefault: { x: 80, y: 50, scale: 100 },
    desktopDefault: { x: 50, y: 50, scale: 100 },
    mobileContainer: "h-[560px] w-full",
    desktopContainer: "aspect-[16/9] w-full",
    hasTextOverlay: true,
    overlayTitle: "MIND UP",
    overlaySubtitle: "Change your MIND, Change your life",
  },
  {
    id: "speaking-hero",
    name: "Public Speaking Hero",
    section: "Speaking Page",
    category: "hero",
    src: "/images/heroes/Speaking_hero.webp",
    mobileDefault: { x: 65, y: 50, scale: 100 },
    tabletDefault: { x: 77, y: 50, scale: 100 },
    desktopDefault: { x: 50, y: 50, scale: 100 },
    mobileContainer: "h-[560px] w-full",
    desktopContainer: "aspect-[16/9] w-full",
    hasTextOverlay: true,
    overlayTitle: "Ideas that ignite rooms",
    overlaySubtitle: "Keynotes on AI, Leadership & Growth",
  },
  {
    id: "home-hero",
    name: "Home Page Hero",
    section: "Homepage",
    category: "hero",
    src: "/images/heroes/sagar-lad-author-mentor-guide-home-hero.webp",
    mobileDefault: { x: 76, y: 24, scale: 100 },
    tabletDefault: { x: 88, y: 22, scale: 100 },
    desktopDefault: { x: 0, y: 30, scale: 100 },
    mobileContainer: "h-[580px] w-full",
    desktopContainer: "aspect-[21/9] w-full",
    hasTextOverlay: true,
    overlayTitle: "Sagar Lad",
    overlaySubtitle: "Your friend, mentor and Guide",
  },
  {
    id: "about-quote",
    name: "Mindset Quote Card",
    section: "About Page",
    category: "card",
    src: "/images/about/sagar-lad-mindup-quote-inspiration.webp",
    mobileDefault: { x: 70, y: 25, scale: 100 },
    tabletDefault: { x: 68, y: 25, scale: 100 },
    desktopDefault: { x: 68, y: 25, scale: 100 },
    mobileContainer: "aspect-[4/3] w-full",
    desktopContainer: "aspect-[4/3] w-full",
    hasTextOverlay: false,
  },
  {
    id: "about-sagar",
    name: "About Sagar Section",
    section: "Homepage",
    category: "card",
    src: "/images/about/sagar-lad-author-speaker-human-potential-about.webp",
    mobileDefault: { x: 50, y: 50, scale: 100 },
    tabletDefault: { x: 50, y: 50, scale: 100 },
    desktopDefault: { x: 50, y: 50, scale: 100 },
    mobileContainer: "aspect-[4/5] w-full",
    desktopContainer: "aspect-[4/5] w-full",
    hasTextOverlay: false,
  },
  {
    id: "newsletter",
    name: "Newsletter Section",
    section: "Homepage",
    category: "card",
    src: "/images/newsletter/sagar-lad-newsletter-mindset-coffee.webp",
    mobileDefault: { x: 50, y: 50, scale: 100 },
    tabletDefault: { x: 50, y: 50, scale: 100 },
    desktopDefault: { x: 50, y: 50, scale: 100 },
    mobileContainer: "aspect-[4/3] w-full",
    desktopContainer: "aspect-[16/9] w-full",
    hasTextOverlay: false,
  },
  {
    id: "casual-1",
    name: "Friend Sagar 1 (Casual)",
    section: "Homepage Gallery",
    category: "portrait",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-1.webp",
    mobileDefault: { x: 50, y: 45, scale: 100 },
    tabletDefault: { x: 50, y: 45, scale: 100 },
    desktopDefault: { x: 50, y: 45, scale: 100 },
    mobileContainer: "aspect-[4/5] w-full",
    desktopContainer: "aspect-[4/5] w-full",
    hasTextOverlay: false,
  },
  {
    id: "casual-2",
    name: "Friend Sagar 2 (Casual)",
    section: "Homepage Gallery",
    category: "portrait",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-2.webp",
    mobileDefault: { x: 50, y: 45, scale: 100 },
    tabletDefault: { x: 50, y: 45, scale: 100 },
    desktopDefault: { x: 50, y: 45, scale: 100 },
    mobileContainer: "aspect-[4/5] w-full",
    desktopContainer: "aspect-[4/5] w-full",
    hasTextOverlay: false,
  },
  {
    id: "casual-3",
    name: "Friend Sagar 3 (Casual)",
    section: "Homepage Gallery",
    category: "portrait",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-3.webp",
    mobileDefault: { x: 50, y: 45, scale: 100 },
    tabletDefault: { x: 50, y: 45, scale: 100 },
    desktopDefault: { x: 50, y: 45, scale: 100 },
    mobileContainer: "aspect-[4/5] w-full",
    desktopContainer: "aspect-[4/5] w-full",
    hasTextOverlay: false,
  },
  {
    id: "casual-4",
    name: "Friend Sagar 4 (Casual)",
    section: "Homepage Gallery",
    category: "portrait",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-4.webp",
    mobileDefault: { x: 50, y: 45, scale: 100 },
    tabletDefault: { x: 50, y: 45, scale: 100 },
    desktopDefault: { x: 50, y: 45, scale: 100 },
    mobileContainer: "aspect-[4/5] w-full",
    desktopContainer: "aspect-[4/5] w-full",
    hasTextOverlay: false,
  },
  {
    id: "casual-5",
    name: "Friend Sagar 5 (Casual)",
    section: "Homepage Gallery",
    category: "portrait",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-5.webp",
    mobileDefault: { x: 50, y: 45, scale: 100 },
    tabletDefault: { x: 50, y: 45, scale: 100 },
    desktopDefault: { x: 50, y: 45, scale: 100 },
    mobileContainer: "aspect-[4/5] w-full",
    desktopContainer: "aspect-[4/5] w-full",
    hasTextOverlay: false,
  },
  {
    id: "contact-hero",
    name: "Contact Hero Portrait",
    section: "Contact Page",
    category: "portrait",
    src: "/images/contact/sagar-lad-keynote-speaker-contact-portrait.png",
    mobileDefault: { x: 50, y: 50, scale: 100 },
    tabletDefault: { x: 50, y: 50, scale: 100 },
    desktopDefault: { x: 50, y: 50, scale: 100 },
    mobileContainer: "aspect-[3/4] w-full",
    desktopContainer: "aspect-[3/4] w-full",
    hasTextOverlay: false,
  },
];

type DeviceMode = "mobile" | "tablet" | "desktop";

export default function PerfectCalibrationSandbox() {
  const [selectedPreset, setSelectedPreset] = useState<ImagePreset>(PRESETS[0]);
  const [activeControlTab, setActiveControlTab] = useState<DeviceMode>("mobile");
  const [showGuides, setShowGuides] = useState(true);
  const [showOverlays, setShowOverlays] = useState(true);
  const [copied, setCopied] = useState(false);

  // Calibration state per preset
  const [calibrations, setCalibrations] = useState<
    Record<string, Record<DeviceMode, { x: number; y: number; scale: number }>>
  >(() => {
    const init: Record<string, Record<DeviceMode, { x: number; y: number; scale: number }>> = {};
    for (const p of PRESETS) {
      init[p.id] = {
        mobile: { ...p.mobileDefault },
        tablet: { ...p.tabletDefault },
        desktop: { ...p.desktopDefault },
      };
    }
    return init;
  });

  const currentSettings = calibrations[selectedPreset.id]?.[activeControlTab] ?? {
    x: 50,
    y: 50,
    scale: 100,
  };

  const updateSetting = (patch: Partial<{ x: number; y: number; scale: number }>) => {
    setCalibrations((prev) => ({
      ...prev,
      [selectedPreset.id]: {
        ...(prev[selectedPreset.id] || {
          mobile: { ...selectedPreset.mobileDefault },
          tablet: { ...selectedPreset.tabletDefault },
          desktop: { ...selectedPreset.desktopDefault },
        }),
        [activeControlTab]: {
          ...currentSettings,
          ...patch,
        },
      },
    }));
  };

  const resetActiveDevice = () => {
    const def =
      activeControlTab === "mobile"
        ? selectedPreset.mobileDefault
        : activeControlTab === "tablet"
        ? selectedPreset.tabletDefault
        : selectedPreset.desktopDefault;
    updateSetting(def);
  };

  // Generate responsive Tailwind class string
  const mob = calibrations[selectedPreset.id]?.mobile ?? selectedPreset.mobileDefault;
  const tab = calibrations[selectedPreset.id]?.tablet ?? selectedPreset.tabletDefault;
  const desk = calibrations[selectedPreset.id]?.desktop ?? selectedPreset.desktopDefault;

  const tailwindClasses = `object-cover object-[${mob.x}%_${mob.y}%] sm:object-[${tab.x}%_${tab.y}%] lg:object-[${desk.x}%_${desk.y}%]`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tailwindClasses);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Click on image container to reposition focal point
  const handleContainerClick = (
    e: React.MouseEvent<HTMLDivElement>,
    targetDevice: DeviceMode
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const clickY = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    setActiveControlTab(targetDevice);
    setCalibrations((prev) => ({
      ...prev,
      [selectedPreset.id]: {
        ...(prev[selectedPreset.id] || {
          mobile: { ...selectedPreset.mobileDefault },
          tablet: { ...selectedPreset.tabletDefault },
          desktop: { ...selectedPreset.desktopDefault },
        }),
        [targetDevice]: {
          ...(prev[selectedPreset.id]?.[targetDevice] ?? { scale: 100 }),
          x: clickX,
          y: clickY,
        },
      },
    }));
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30">
      {/* Top Header */}
      <header className="border-b border-neutral-800 bg-[#12151a]/95 backdrop-blur px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg shadow-inner">
            🎯
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Sagar Lad Responsive Image Sandbox
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full font-semibold border border-amber-500/30">
                PRO CALIBRATOR
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Live side-by-side vertical (mobile) &amp; horizontal (desktop) focal alignment
            </p>
          </div>
        </div>

        {/* Global toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuides(!showGuides)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
              showGuides
                ? "bg-neutral-800 border-amber-500/40 text-amber-300"
                : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white"
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{showGuides ? "Guides ON" : "Guides OFF"}</span>
          </button>

          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
              showOverlays
                ? "bg-neutral-800 border-amber-500/40 text-amber-300"
                : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showOverlays ? "Text Overlay ON" : "Text Overlay OFF"}</span>
          </button>

          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit</span>
          </Link>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        {/* Control Sidebar */}
        <aside className="w-full xl:w-96 border-b xl:border-b-0 xl:border-r border-neutral-800 bg-[#12151a] p-5 flex flex-col gap-5 shrink-0 overflow-y-auto max-h-none xl:max-h-[calc(100vh-61px)]">
          {/* Preset Selector */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Select Image Asset
            </label>
            <select
              value={selectedPreset.id}
              onChange={(e) => {
                const p = PRESETS.find((item) => item.id === e.target.value);
                if (p) setSelectedPreset(p);
              }}
              className="w-full bg-[#181c22] border border-neutral-700 hover:border-neutral-600 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 font-medium focus:outline-none focus:border-amber-500 transition shadow-sm"
            >
              <optgroup label="Hero Sections (Fullscreen / Large)">
                {PRESETS.filter((p) => p.category === "hero").map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.section})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Content & Section Cards">
                {PRESETS.filter((p) => p.category === "card").map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.section})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Portraits & Friends Gallery">
                {PRESETS.filter((p) => p.category === "portrait").map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.section})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Breakpoint Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Editing Breakpoint
              </label>
              <span className="text-[11px] text-amber-400 font-mono font-semibold">
                active: {activeControlTab}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#181c22] rounded-xl border border-neutral-700/70">
              <button
                onClick={() => setActiveControlTab("mobile")}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  activeControlTab === "mobile"
                    ? "bg-amber-600 text-white shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>

              <button
                onClick={() => setActiveControlTab("tablet")}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  activeControlTab === "tablet"
                    ? "bg-amber-600 text-white shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Tablet</span>
              </button>

              <button
                onClick={() => setActiveControlTab("desktop")}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  activeControlTab === "desktop"
                    ? "bg-amber-600 text-white shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
            </div>
          </div>

          {/* Alignment Sliders */}
          <div className="space-y-4 p-4 rounded-2xl bg-[#181c22]/80 border border-neutral-800">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white capitalize">
                  {activeControlTab} Focal Point
                </span>
              </div>
              <button
                onClick={resetActiveDevice}
                title="Reset this breakpoint"
                className="text-neutral-400 hover:text-white transition p-1 hover:bg-neutral-800 rounded"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Horizontal X Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-neutral-300 font-medium">Horizontal (X%):</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateSetting({ x: Math.max(0, currentSettings.x - 1) })}
                    className="w-5 h-5 rounded bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center text-xs"
                  >
                    -
                  </button>
                  <span className="font-mono text-amber-400 font-bold w-12 text-center">
                    {currentSettings.x}%
                  </span>
                  <button
                    onClick={() => updateSetting({ x: Math.min(100, currentSettings.x + 1) })}
                    className="w-5 h-5 rounded bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentSettings.x}
                onChange={(e) => updateSetting({ x: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                <span>0% (Left)</span>
                <span>50% (Center)</span>
                <span>100% (Right)</span>
              </div>
            </div>

            {/* Vertical Y Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-neutral-300 font-medium">Vertical (Y%):</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateSetting({ y: Math.max(0, currentSettings.y - 1) })}
                    className="w-5 h-5 rounded bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center text-xs"
                  >
                    -
                  </button>
                  <span className="font-mono text-amber-400 font-bold w-12 text-center">
                    {currentSettings.y}%
                  </span>
                  <button
                    onClick={() => updateSetting({ y: Math.min(100, currentSettings.y + 1) })}
                    className="w-5 h-5 rounded bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentSettings.y}
                onChange={(e) => updateSetting({ y: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                <span>0% (Top)</span>
                <span>50% (Center)</span>
                <span>100% (Bottom)</span>
              </div>
            </div>

            {/* Zoom / Scale */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-neutral-300 font-medium">Zoom / Scale:</span>
                <span className="font-mono text-amber-400 font-bold">{currentSettings.scale}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="150"
                value={currentSettings.scale}
                onChange={(e) => updateSetting({ scale: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                <span>70% (Zoom Out)</span>
                <span>100% (Standard)</span>
                <span>150% (Zoom In)</span>
              </div>
            </div>
          </div>

          {/* Quick Positioning Helpers */}
          <div>
            <span className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Common Presets ({activeControlTab})
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => updateSetting({ x: 50, y: 50, scale: 100 })}
                className="p-2 bg-[#181c22] hover:bg-neutral-800 border border-neutral-700/60 rounded-lg text-neutral-300 hover:text-white text-left text-[11px] font-mono"
              >
                Center (50% 50%)
              </button>
              <button
                onClick={() => updateSetting({ x: 77, y: 50, scale: 100 })}
                className="p-2 bg-[#181c22] hover:bg-neutral-800 border border-neutral-700/60 rounded-lg text-neutral-300 hover:text-white text-left text-[11px] font-mono"
              >
                Right Focus (77% 50%)
              </button>
              <button
                onClick={() => updateSetting({ x: 65, y: 50, scale: 100 })}
                className="p-2 bg-[#181c22] hover:bg-neutral-800 border border-neutral-700/60 rounded-lg text-neutral-300 hover:text-white text-left text-[11px] font-mono"
              >
                Medium Right (65% 50%)
              </button>
              <button
                onClick={() => updateSetting({ x: 70, y: 25, scale: 100 })}
                className="p-2 bg-[#181c22] hover:bg-neutral-800 border border-neutral-700/60 rounded-lg text-neutral-300 hover:text-white text-left text-[11px] font-mono"
              >
                Face High (70% 25%)
              </button>
            </div>
          </div>

          {/* Instructions note */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200/90 flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Interactive Drag &amp; Click:</strong> You can directly click anywhere on the Mobile or Desktop image previews to immediately reposition the focal point!
            </p>
          </div>

          {/* Export Code Box */}
          <div className="mt-auto pt-4 border-t border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Export Tailwind Code
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">mobile &rarr; sm &rarr; lg</span>
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-neutral-800 font-mono text-[11px] text-amber-300 break-all leading-relaxed select-all">
              {tailwindClasses}
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Tailwind Classes"}</span>
            </button>
          </div>
        </aside>

        {/* Live Canvas Viewports (Side-by-Side Dual Real World) */}
        <main className="flex-1 bg-[#090b0e] p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto">
          {/* Info bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#12151a] p-3.5 rounded-2xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Current Asset:
              </span>
              <span className="text-xs bg-neutral-800 text-neutral-200 px-2.5 py-1 rounded-md font-mono">
                {selectedPreset.src}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
              <span>📱 Mob: [{mob.x}% {mob.y}%]</span>
              <span>📟 Tab: [{tab.x}% {tab.y}%]</span>
              <span>🖥️ Desk: [{desk.x}% {desk.y}%]</span>
            </div>
          </div>

          {/* Dual Screen Preview: Mobile (Vertical) & Desktop (Horizontal) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT: Mobile Vertical Screen (375px Real Dimensions) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2.5 px-1">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Mobile Viewport (Vertical Screen)</span>
                </div>
                <span className="text-[11px] font-mono text-neutral-500">375px × 640px</span>
              </div>

              {/* Mobile Phone Mockup Frame */}
              <div
                className="w-[340px] sm:w-[375px] max-w-full rounded-[40px] p-3 bg-neutral-900 border-4 border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative group cursor-crosshair select-none"
                onClick={(e) => handleContainerClick(e, "mobile")}
              >
                {/* iPhone Dynamic Island */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 pointer-events-none flex items-center justify-end px-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800" />
                </div>

                {/* Inner Screen Canvas */}
                <div className="w-full rounded-[30px] overflow-hidden bg-black relative">
                  <div className={`relative ${selectedPreset.mobileContainer} overflow-hidden`}>
                    <Image
                      src={selectedPreset.src}
                      alt={selectedPreset.name}
                      fill
                      priority
                      style={{
                        objectFit: "cover",
                        objectPosition: `${mob.x}% ${mob.y}%`,
                        transform: `scale(${mob.scale / 100})`,
                      }}
                      className="transition-transform duration-75 pointer-events-none"
                    />

                    {/* Gradient Overlay as used on real site */}
                    {selectedPreset.hasTextOverlay && showOverlays && (
                      <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                    )}

                    {/* Simulated Text Overlay */}
                    {selectedPreset.hasTextOverlay && showOverlays && (
                      <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 text-white pointer-events-none">
                        <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase border border-white/20 rounded-full px-3 py-1 w-max mb-2">
                          {selectedPreset.section}
                        </span>
                        <h2 className="font-bold text-2xl drop-shadow-md leading-tight">
                          {selectedPreset.overlayTitle}
                        </h2>
                        <p className="text-xs text-white/80 mt-1 drop-shadow leading-relaxed">
                          {selectedPreset.overlaySubtitle}
                        </p>
                      </div>
                    )}

                    {/* Alignment Guides */}
                    {showGuides && (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Center Crosshair */}
                        <div className="w-full h-[1px] bg-red-500/40 absolute top-1/2 left-0" />
                        <div className="h-full w-[1px] bg-red-500/40 absolute left-1/2 top-0" />

                        {/* Rule of thirds */}
                        <div className="w-full h-[1px] border-b border-dashed border-white/25 absolute top-1/3 left-0" />
                        <div className="w-full h-[1px] border-b border-dashed border-white/25 absolute top-2/3 left-0" />
                        <div className="h-full w-[1px] border-r border-dashed border-white/25 absolute left-1/3 top-0" />
                        <div className="h-full w-[1px] border-r border-dashed border-white/25 absolute left-2/3 top-0" />

                        {/* Active Target Cursor */}
                        <div
                          style={{ left: `${mob.x}%`, top: `${mob.y}%` }}
                          className="absolute w-6 h-6 -ml-3 -mt-3 border-2 border-amber-400 rounded-full shadow-lg bg-amber-400/25 flex items-center justify-center transition-all duration-75"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Home Indicator Bar */}
                <div className="w-28 h-1 bg-neutral-600 rounded-full mx-auto mt-2 pointer-events-none" />
              </div>

              <span className="text-[11px] text-neutral-500 mt-2 text-center">
                Click anywhere inside to reposition Mobile focal point ({mob.x}% {mob.y}%)
              </span>
            </div>

            {/* RIGHT: Desktop Horizontal Screen (Widescreen Dimensions) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2.5 px-1">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                  <Monitor className="w-4 h-4 text-amber-400" />
                  <span>Desktop Viewport (Horizontal Widescreen)</span>
                </div>
                <span className="text-[11px] font-mono text-neutral-500">1440px / 16:9</span>
              </div>

              {/* Desktop Monitor Mockup Frame */}
              <div
                className="w-full rounded-2xl p-3 bg-neutral-900 border-4 border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative group cursor-crosshair select-none"
                onClick={(e) => handleContainerClick(e, "desktop")}
              >
                {/* Browser Tab Bar */}
                <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-neutral-800/80">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    sagarlad.com/{selectedPreset.section.toLowerCase()}
                  </span>
                  <div className="w-8" />
                </div>

                {/* Inner Screen Canvas */}
                <div className="w-full rounded-xl overflow-hidden bg-black relative">
                  <div className={`relative ${selectedPreset.desktopContainer} overflow-hidden`}>
                    <Image
                      src={selectedPreset.src}
                      alt={selectedPreset.name}
                      fill
                      priority
                      style={{
                        objectFit: "cover",
                        objectPosition: `${desk.x}% ${desk.y}%`,
                        transform: `scale(${desk.scale / 100})`,
                      }}
                      className="transition-transform duration-75 pointer-events-none"
                    />

                    {/* Gradient Overlay as used on real site */}
                    {selectedPreset.hasTextOverlay && showOverlays && (
                      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                    )}

                    {/* Simulated Text Overlay */}
                    {selectedPreset.hasTextOverlay && showOverlays && (
                      <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 text-white pointer-events-none max-w-xl">
                        <span className="text-[11px] font-bold tracking-widest text-white/70 uppercase border border-white/20 rounded-full px-4 py-1 w-max mb-3">
                          {selectedPreset.section}
                        </span>
                        <h2 className="font-bold text-3xl lg:text-4xl drop-shadow-md leading-tight">
                          {selectedPreset.overlayTitle}
                        </h2>
                        <p className="text-sm text-white/85 mt-2 drop-shadow leading-relaxed">
                          {selectedPreset.overlaySubtitle}
                        </p>
                      </div>
                    )}

                    {/* Alignment Guides */}
                    {showGuides && (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Center Crosshair */}
                        <div className="w-full h-[1px] bg-red-500/40 absolute top-1/2 left-0" />
                        <div className="h-full w-[1px] bg-red-500/40 absolute left-1/2 top-0" />

                        {/* Rule of thirds */}
                        <div className="w-full h-[1px] border-b border-dashed border-white/25 absolute top-1/3 left-0" />
                        <div className="w-full h-[1px] border-b border-dashed border-white/25 absolute top-2/3 left-0" />
                        <div className="h-full w-[1px] border-r border-dashed border-white/25 absolute left-1/3 top-0" />
                        <div className="h-full w-[1px] border-r border-dashed border-white/25 absolute left-2/3 top-0" />

                        {/* Active Target Cursor */}
                        <div
                          style={{ left: `${desk.x}%`, top: `${desk.y}%` }}
                          className="absolute w-6 h-6 -ml-3 -mt-3 border-2 border-amber-400 rounded-full shadow-lg bg-amber-400/25 flex items-center justify-center transition-all duration-75"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <span className="text-[11px] text-neutral-500 mt-2 text-center">
                Click anywhere inside to reposition Desktop focal point ({desk.x}% {desk.y}%)
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
