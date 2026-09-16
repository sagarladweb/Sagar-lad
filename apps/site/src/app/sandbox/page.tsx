"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Smartphone,
  Tablet,
  Monitor,
  Copy,
  Check,
  Save,
  Wand2,
  Crosshair,
  Layers,
  ArrowLeft,
  Sliders,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Info,
  ArrowUp,
  ArrowDown,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Focus,
  Target,
  Maximize2,
} from "lucide-react";
import {
  DEFAULT_IMAGE_CONFIGS,
  type ImageBreakpointConfig,
  type ImageAlignmentSetting,
} from "@/lib/image-responsive-config";

type PresetItem = {
  id: string;
  name: string;
  section: string;
  category: "hero" | "card" | "portrait";
  src: string;
  mobileAspect: string;
  tabletAspect: string;
  desktopAspect: string;
  hasTextOverlay?: boolean;
  overlayTitle?: string;
  overlaySubtitle?: string;
  centerGuide: {
    mobileFace: ImageAlignmentSetting;
    tabletFace: ImageAlignmentSetting;
    desktopFull: ImageAlignmentSetting;
  };
};

const PRESET_METADATA: PresetItem[] = [
  {
    id: "about-hero",
    name: "About Hero",
    section: "About Page",
    category: "hero",
    src: "/images/heroes/sagar-lad-author-keynote-speaker-about-hero.webp",
    mobileAspect: "h-[560px] w-full",
    tabletAspect: "aspect-[16/10] w-full",
    desktopAspect: "aspect-[16/9] w-full",
    hasTextOverlay: true,
    overlayTitle: "MIND UP",
    overlaySubtitle: "Change your MIND, Change your life",
    centerGuide: {
      mobileFace: { x: 79, y: 38, scale: 100 },
      tabletFace: { x: 71, y: 27, scale: 103 },
      desktopFull: { x: 70, y: 35, scale: 103 },
    },
  },
  {
    id: "speaking-hero",
    name: "Speaking Hero",
    section: "Speaking Page",
    category: "hero",
    src: "/images/heroes/Speaking_hero.webp",
    mobileAspect: "h-[560px] w-full",
    tabletAspect: "aspect-[16/10] w-full",
    desktopAspect: "aspect-[16/9] w-full",
    hasTextOverlay: true,
    overlayTitle: "Ideas that ignite rooms",
    overlaySubtitle: "Story-driven keynotes worldwide",
    centerGuide: {
      mobileFace: { x: 65, y: 48, scale: 100 },
      tabletFace: { x: 64, y: 50, scale: 101 },
      desktopFull: { x: 65, y: 52, scale: 101 },
    },
  },
  {
    id: "home-hero",
    name: "Home Hero",
    section: "Homepage",
    category: "hero",
    src: "/images/heroes/sagar-lad-author-mentor-guide-home-hero.webp",
    mobileAspect: "h-[560px] w-full",
    tabletAspect: "aspect-[16/10] w-full",
    desktopAspect: "aspect-[21/9] w-full",
    hasTextOverlay: true,
    overlayTitle: "Sagar Lad",
    overlaySubtitle: "Your friend, mentor and Guide",
    centerGuide: {
      mobileFace: { x: 76, y: 100, scale: 100 },
      tabletFace: { x: 66, y: 81, scale: 100 },
      desktopFull: { x: 66, y: 48, scale: 101 },
    },
  },
  {
    id: "about-quote",
    name: "Quote Card",
    section: "About Page",
    category: "card",
    src: "/images/about/sagar-lad-mindup-quote-inspiration.webp",
    mobileAspect: "aspect-[4/3] w-full",
    tabletAspect: "aspect-[4/3] w-full",
    desktopAspect: "aspect-[4/3] w-full",
    hasTextOverlay: false,
    centerGuide: {
      mobileFace: { x: 88, y: 60, scale: 115 },
      tabletFace: { x: 76, y: 55, scale: 104 },
      desktopFull: { x: 83, y: 65, scale: 117 },
    },
  },
  {
    id: "about-sagar",
    name: "About Sagar",
    section: "Homepage",
    category: "card",
    src: "/images/about/sagar-lad-author-speaker-human-potential-about.webp",
    mobileAspect: "aspect-[4/5] w-full",
    tabletAspect: "aspect-[4/5] w-full",
    desktopAspect: "aspect-[4/5] w-full",
    hasTextOverlay: false,
    centerGuide: {
      mobileFace: { x: 45, y: 53, scale: 103 },
      tabletFace: { x: 45, y: 38, scale: 101 },
      desktopFull: { x: 45, y: 50, scale: 100 },
    },
  },
  {
    id: "newsletter",
    name: "Newsletter CTA",
    section: "Homepage",
    category: "card",
    src: "/images/newsletter/sagar-lad-newsletter-mindset-coffee.webp",
    mobileAspect: "aspect-[4/3] w-full",
    tabletAspect: "aspect-[16/10] w-full",
    desktopAspect: "aspect-[16/9] w-full",
    hasTextOverlay: false,
    centerGuide: {
      mobileFace: { x: 43, y: 20, scale: 98 },
      tabletFace: { x: 47, y: 24, scale: 100 },
      desktopFull: { x: 46, y: 23, scale: 100 },
    },
  },
  {
    id: "casual-1",
    name: "Friend Casual 1",
    section: "Friend Gallery",
    category: "portrait",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-1.webp",
    mobileAspect: "aspect-[4/3] w-full",
    tabletAspect: "aspect-[4/3] w-full",
    desktopAspect: "aspect-[4/3] w-full",
    hasTextOverlay: false,
    centerGuide: {
      mobileFace: { x: 52, y: 42, scale: 100 },
      tabletFace: { x: 50, y: 44, scale: 100 },
      desktopFull: { x: 50, y: 46, scale: 104 },
    },
  },
  {
    id: "casual-2",
    name: "Friend Casual 2",
    section: "Friend Gallery",
    category: "portrait",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-2.webp",
    mobileAspect: "aspect-[4/3] w-full",
    tabletAspect: "aspect-[4/3] w-full",
    desktopAspect: "aspect-[4/3] w-full",
    hasTextOverlay: false,
    centerGuide: {
      mobileFace: { x: 50, y: 59, scale: 100 },
      tabletFace: { x: 50, y: 60, scale: 100 },
      desktopFull: { x: 50, y: 62, scale: 100 },
    },
  },
  {
    id: "casual-3",
    name: "Friend Casual 3",
    section: "Friend Gallery",
    category: "portrait",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-3.webp",
    mobileAspect: "aspect-[4/3] w-full",
    tabletAspect: "aspect-[4/3] w-full",
    desktopAspect: "aspect-[4/3] w-full",
    hasTextOverlay: false,
    centerGuide: {
      mobileFace: { x: 18, y: 53, scale: 103 },
      tabletFace: { x: 28, y: 59, scale: 100 },
      desktopFull: { x: 50, y: 58, scale: 100 },
    },
  },
  {
    id: "casual-4",
    name: "Friend Casual 4",
    section: "Friend Gallery",
    category: "portrait",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-4.webp",
    mobileAspect: "aspect-[4/3] w-full",
    tabletAspect: "aspect-[4/3] w-full",
    desktopAspect: "aspect-[4/3] w-full",
    hasTextOverlay: false,
    centerGuide: {
      mobileFace: { x: 44, y: 54, scale: 98 },
      tabletFace: { x: 46, y: 52, scale: 103 },
      desktopFull: { x: 44, y: 50, scale: 105 },
    },
  },
  {
    id: "casual-5",
    name: "Friend Casual 5",
    section: "Friend Gallery",
    category: "portrait",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-5.webp",
    mobileAspect: "aspect-[4/3] w-full",
    tabletAspect: "aspect-[4/3] w-full",
    desktopAspect: "aspect-[4/3] w-full",
    hasTextOverlay: false,
    centerGuide: {
      mobileFace: { x: 26, y: 62, scale: 102 },
      tabletFace: { x: 29, y: 71, scale: 100 },
      desktopFull: { x: 50, y: 70, scale: 100 },
    },
  },
  {
    id: "contact-hero",
    name: "Contact Portrait",
    section: "Contact Page",
    category: "portrait",
    src: "/images/contact/sagar-lad-keynote-speaker-contact-portrait.png",
    mobileAspect: "aspect-[3/4] w-full",
    tabletAspect: "aspect-[3/4] w-full",
    desktopAspect: "aspect-[3/4] w-full",
    hasTextOverlay: false,
    centerGuide: {
      mobileFace: { x: 51, y: 61, scale: 100 },
      tabletFace: { x: 51, y: 58, scale: 100 },
      desktopFull: { x: 52, y: 34, scale: 100 },
    },
  },
];

type DeviceType = "mobile" | "tablet" | "desktop";
type ViewMode = "mobile-tablet" | "triple-view";

export default function SuperSimpleSandbox() {
  const [allConfigs, setAllConfigs] = useState<Record<string, ImageBreakpointConfig>>(
    DEFAULT_IMAGE_CONFIGS
  );
  const [activeImageId, setActiveImageId] = useState<string>("about-hero");
  const [activeDeviceTab, setActiveDeviceTab] = useState<DeviceType>("mobile");
  const [viewMode, setViewMode] = useState<ViewMode>("mobile-tablet");
  const [showGuides, setShowGuides] = useState(true);
  const [showOverlays, setShowOverlays] = useState(true);
  const [copyAllCopied, setCopyAllCopied] = useState(false);
  const [singleCopied, setSingleCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const activeMeta = PRESET_METADATA.find((p) => p.id === activeImageId) || PRESET_METADATA[0];
  const activeConfig = allConfigs[activeImageId] || DEFAULT_IMAGE_CONFIGS[activeImageId];

  // Update setting for active image on specific device
  const updateSetting = (
    device: DeviceType,
    patch: Partial<ImageAlignmentSetting>
  ) => {
    setAllConfigs((prev) => {
      const current = prev[activeImageId] || DEFAULT_IMAGE_CONFIGS[activeImageId];
      const updatedDevice = { ...current[device], ...patch };
      const mob = device === "mobile" ? updatedDevice : current.mobile;
      const tab = device === "tablet" ? updatedDevice : current.tablet;
      const desk = device === "desktop" ? updatedDevice : current.desktop;

      const tailwind = `object-cover object-[${mob.x}%_${mob.y}%] sm:object-[${tab.x}%_${tab.y}%] lg:object-[${desk.x}%_${desk.y}%]`;

      return {
        ...prev,
        [activeImageId]: {
          ...current,
          [device]: updatedDevice,
          tailwind,
        },
      };
    });
  };

  // Nudge function: shift person by dx/dy (e.g. -2% or +2%)
  const nudge = (device: DeviceType, dx: number, dy: number) => {
    const cur = activeConfig[device];
    updateSetting(device, {
      x: Math.max(0, Math.min(100, cur.x + dx)),
      y: Math.max(0, Math.min(100, cur.y + dy)),
    });
  };

  // ONE-CLICK: Center person on BOTH mobile & tablet
  const centerPersonBoth = () => {
    const guide = activeMeta.centerGuide;
    setAllConfigs((prev) => {
      const current = prev[activeImageId];
      const tailwind = `object-cover object-[${guide.mobileFace.x}%_${guide.mobileFace.y}%] sm:object-[${guide.tabletFace.x}%_${guide.tabletFace.y}%] lg:object-[${current.desktop.x}%_${current.desktop.y}%]`;
      return {
        ...prev,
        [activeImageId]: {
          ...current,
          mobile: { ...guide.mobileFace },
          tablet: { ...guide.tabletFace },
          tailwind,
        },
      };
    });
    setSaveMessage("🎯 Sagar centered on both Mobile and Tablet!");
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Click on the Full Original Image to aim focal center
  const handleFullImageAim = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const clickY = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    // Immediately apply to the active device, or if in mobile-tablet mode, apply to both
    if (activeDeviceTab === "desktop") {
      updateSetting("desktop", { x: clickX, y: clickY });
    } else {
      updateSetting("mobile", { x: clickX, y: clickY });
      updateSetting("tablet", { x: clickX, y: clickY });
    }
    setSaveMessage(`🎯 Aimed focal center to (${clickX}%, ${clickY}%)`);
    setTimeout(() => setSaveMessage(null), 2500);
  };

  // Click on any device viewport directly
  const handleDeviceClick = (e: React.MouseEvent<HTMLDivElement>, device: DeviceType) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const clickY = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    setActiveDeviceTab(device);
    updateSetting(device, { x: clickX, y: clickY });
  };

  // Master Copy: copies ALL 11 images settings in one click
  const copyAllSettings = () => {
    const output = {
      summary: "Sagar Lad Website - Complete 11-Image Responsive Alignment Settings",
      generatedAt: new Date().toISOString(),
      images: allConfigs,
    };
    navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    setCopyAllCopied(true);
    setTimeout(() => setCopyAllCopied(false), 2500);
  };

  // Save directly to code via API
  const saveAllToCode = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/sandbox/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allConfigs),
      });
      if (res.ok) {
        setSaveMessage("✓ Saved & applied directly to website code!");
      } else {
        setSaveMessage("❌ Error saving settings. Please try Copy All instead.");
      }
    } catch {
      setSaveMessage("❌ Network error saving configuration.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  const currentActiveVal = activeConfig[activeDeviceTab];

  return (
    <div className="min-h-screen bg-[#090b0e] text-neutral-100 flex flex-col font-sans select-none">
      {/* ── Top Header ───────────────────────────────────────────── */}
      <header className="border-b border-neutral-800 bg-[#0f1217]/95 backdrop-blur px-4 sm:px-6 py-3 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg shadow">
            🎯
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Sagar Lad Center-Person Calibrator
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                EASY ALIGN MODE
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Center the person in Mobile &amp; Tablet views with 1 click &mdash; Desktop shows full image
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View mode toggle */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("mobile-tablet")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === "mobile-tablet"
                  ? "bg-amber-600 text-white shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile &amp; Tablet Focus</span>
            </button>
            <button
              onClick={() => setViewMode("triple-view")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === "triple-view"
                  ? "bg-amber-600 text-white shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>All 3 Screens</span>
            </button>
          </div>

          {/* Master Copy All Settings Button */}
          <button
            onClick={copyAllSettings}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg transition flex items-center gap-1.5"
          >
            {copyAllCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copyAllCopied ? "✓ All Copied!" : "📋 Copy All Settings"}</span>
          </button>

          {/* Save Directly to Code */}
          <button
            onClick={saveAllToCode}
            disabled={isSaving}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white shadow transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "💾 Save to Code"}</span>
          </button>

          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>
        </div>
      </header>

      {/* Toast message */}
      {saveMessage && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-2 text-xs text-amber-200 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">{saveMessage}</span>
          </div>
          <button onClick={() => setSaveMessage(null)} className="text-amber-400 font-mono text-xs">✕</button>
        </div>
      )}

      {/* ── Visual Thumbnail Selector Ribbon ─────────────────────── */}
      <div className="border-b border-neutral-800 bg-[#0c0e12] px-4 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2">
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
          Select Image:
        </span>
        {PRESET_METADATA.map((p, idx) => {
          const isSelected = p.id === activeImageId;
          return (
            <button
              key={p.id}
              onClick={() => setActiveImageId(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition flex items-center gap-2 border ${
                isSelected
                  ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm font-bold"
                  : "bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400/80" />
              <span>{idx + 1}. {p.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main Workspace ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        {/* Left Controls: Simple Alignment Helpers */}
        <aside className="w-full xl:w-96 border-b xl:border-b-0 xl:border-r border-neutral-800 bg-[#0f1217] p-5 flex flex-col gap-5 shrink-0 overflow-y-auto max-h-none xl:max-h-[calc(100vh-112px)]">
          {/* Active selection info */}
          <div className="p-4 rounded-2xl bg-[#151920] border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Current Image
              </span>
              <span className="text-[10px] bg-neutral-800 text-amber-300 font-mono px-2 py-0.5 rounded">
                {activeMeta.section}
              </span>
            </div>
            <h2 className="text-base font-bold text-white">{activeMeta.name}</h2>

            {/* BIG 1-CLICK BUTTON: Center Person on Mobile & Tablet */}
            <button
              onClick={centerPersonBoth}
              className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4 text-white animate-pulse" />
              <span>🎯 Auto-Center Person on Mobile &amp; Tablet</span>
            </button>
          </div>

          {/* Device Tab Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Active Steerer
              </label>
              <span className="text-[11px] text-amber-400 font-mono font-bold">
                {activeDeviceTab.toUpperCase()} ({currentActiveVal.x}% {currentActiveVal.y}%)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#151920] rounded-xl border border-neutral-800">
              <button
                onClick={() => setActiveDeviceTab("mobile")}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  activeDeviceTab === "mobile"
                    ? "bg-amber-600 text-white shadow"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>

              <button
                onClick={() => setActiveDeviceTab("tablet")}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  activeDeviceTab === "tablet"
                    ? "bg-amber-600 text-white shadow"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Tablet</span>
              </button>

              <button
                onClick={() => setActiveDeviceTab("desktop")}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  activeDeviceTab === "desktop"
                    ? "bg-amber-600 text-white shadow"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
            </div>
          </div>

          {/* Super Easy Directional Steerer Pads (No Math, Just Arrows!) */}
          <div className="p-4 rounded-2xl bg-[#151920] border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span className="capitalize">{activeDeviceTab} Directional Steerer</span>
              </span>
              <span className="text-[11px] text-neutral-400">Tap arrows to center</span>
            </div>

            {/* Steerer keypad */}
            <div className="flex flex-col items-center gap-2 pt-1">
              <button
                onClick={() => nudge(activeDeviceTab, 0, -3)}
                className="w-24 py-2 bg-neutral-800 hover:bg-neutral-700 active:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-neutral-700 shadow-sm transition"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Up</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => nudge(activeDeviceTab, -3, 0)}
                  className="w-24 py-2 bg-neutral-800 hover:bg-neutral-700 active:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-neutral-700 shadow-sm transition"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5" />
                  <span>Left</span>
                </button>

                <button
                  onClick={() =>
                    updateSetting(activeDeviceTab, {
                      x: activeMeta.centerGuide[activeDeviceTab === "mobile" ? "mobileFace" : activeDeviceTab === "tablet" ? "tabletFace" : "desktopFull"].x,
                      y: activeMeta.centerGuide[activeDeviceTab === "mobile" ? "mobileFace" : activeDeviceTab === "tablet" ? "tabletFace" : "desktopFull"].y,
                    })
                  }
                  className="px-3 py-2 bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white rounded-xl text-xs font-bold border border-amber-500/40 shadow-sm transition"
                  title="Reset to recommended center"
                >
                  Reset
                </button>

                <button
                  onClick={() => nudge(activeDeviceTab, 3, 0)}
                  className="w-24 py-2 bg-neutral-800 hover:bg-neutral-700 active:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-neutral-700 shadow-sm transition"
                >
                  <span>Right</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => nudge(activeDeviceTab, 0, 3)}
                className="w-24 py-2 bg-neutral-800 hover:bg-neutral-700 active:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-neutral-700 shadow-sm transition"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Down</span>
              </button>
            </div>

            {/* Sliders for precise adjustment */}
            <div className="pt-2 space-y-2 border-t border-neutral-800/80">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-400">Horizontal:</span>
                <span className="font-mono text-amber-400 font-bold">{currentActiveVal.x}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentActiveVal.x}
                onChange={(e) => updateSetting(activeDeviceTab, { x: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />

              <div className="flex justify-between text-[11px] pt-1">
                <span className="text-neutral-400">Vertical:</span>
                <span className="font-mono text-amber-400 font-bold">{currentActiveVal.y}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentActiveVal.y}
                onChange={(e) => updateSetting(activeDeviceTab, { y: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
            </div>
          </div>

          {/* Instructions note */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-200/90 flex gap-2 items-start">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>How to use:</strong> Look at the <strong>Mobile Screen</strong> and <strong>Tablet Screen</strong> on the right. If Sagar is too far left, click <strong>Right</strong>. If he is too far right, click <strong>Left</strong>. It&apos;s that easy!
            </p>
          </div>

          {/* Current Image Tailwind Output */}
          <div className="mt-auto pt-3 border-t border-neutral-800 space-y-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              Active Tailwind Output
            </span>
            <div className="p-2.5 bg-black/60 rounded-xl border border-neutral-800 font-mono text-[11px] text-amber-300 break-all leading-relaxed select-all">
              {activeConfig.tailwind}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(activeConfig.tailwind);
                setSingleCopied(true);
                setTimeout(() => setSingleCopied(false), 2000);
              }}
              className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 transition flex items-center justify-center gap-1.5"
            >
              {singleCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{singleCopied ? "Copied!" : "Copy Active Image Tailwind"}</span>
            </button>
          </div>
        </aside>

        {/* ── Right Canvas: Visual Aiming & Live Viewports ─────────── */}
        <main className="flex-1 bg-[#07090c] p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto">
          {/* Top Interactive Banner: Click directly on Sagar */}
          <div className="bg-[#101318] p-4 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Full Original Image (Click anywhere on Sagar&apos;s face to auto-center):
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono">
                Clicking here centers Sagar across Mobile &amp; Tablet
              </span>
            </div>

            {/* Clickable Full Image with Interactive Crosshair */}
            <div
              className="relative w-full aspect-[21/9] max-h-[220px] rounded-xl overflow-hidden border border-neutral-700 cursor-crosshair group bg-black shadow-inner"
              onClick={handleFullImageAim}
            >
              <Image
                src={activeMeta.src}
                alt={activeMeta.name}
                fill
                priority
                className="object-contain pointer-events-none"
              />

              {/* Aiming marker */}
              <div
                style={{
                  left: `${activeConfig.mobile.x}%`,
                  top: `${activeConfig.mobile.y}%`,
                }}
                className="absolute w-7 h-7 -ml-3.5 -mt-3.5 border-2 border-amber-400 rounded-full bg-amber-400/30 flex items-center justify-center pointer-events-none shadow-lg animate-pulse"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow" />
              </div>

              <div className="absolute bottom-2 right-2 bg-black/80 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-800 pointer-events-none">
                Aim: {activeConfig.mobile.x}% {activeConfig.mobile.y}%
              </div>
            </div>
          </div>

          {/* View Mode 1: Mobile & Tablet Focus (Main Priority) */}
          {viewMode === "mobile-tablet" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* 1. MOBILE LIVE SCREEN */}
              <div className="flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2.5 px-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-white">1. Mobile Phone (Vertical Screen)</span>
                  </div>
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-mono font-bold">
                    [{activeConfig.mobile.x}% {activeConfig.mobile.y}%]
                  </span>
                </div>

                {/* iPhone frame */}
                <div
                  className={`w-full max-w-[360px] rounded-[40px] p-3 bg-neutral-900 border-4 shadow-2xl relative cursor-crosshair transition ${
                    activeDeviceTab === "mobile" ? "border-amber-500" : "border-neutral-800"
                  }`}
                  onClick={(e) => handleDeviceClick(e, "mobile")}
                >
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20 pointer-events-none" />

                  <div className="w-full rounded-[30px] overflow-hidden bg-black relative">
                    <div className={`relative ${activeMeta.mobileAspect} overflow-hidden`}>
                      <Image
                        src={activeMeta.src}
                        alt={activeMeta.name}
                        fill
                        priority
                        style={{
                          objectFit: "cover",
                          objectPosition: `${activeConfig.mobile.x}% ${activeConfig.mobile.y}%`,
                          transform: `scale(${activeConfig.mobile.scale / 100})`,
                        }}
                        className="transition-transform duration-75 pointer-events-none"
                      />

                      {/* Text Overlay */}
                      {activeMeta.hasTextOverlay && showOverlays && (
                        <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                      )}
                      {activeMeta.hasTextOverlay && showOverlays && (
                        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 text-white pointer-events-none">
                          <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase border border-white/20 rounded-full px-3 py-0.5 w-max mb-2">
                            {activeMeta.section}
                          </span>
                          <h3 className="font-bold text-2xl drop-shadow leading-tight">
                            {activeMeta.overlayTitle}
                          </h3>
                          <p className="text-xs text-white/80 mt-1 drop-shadow leading-relaxed">
                            {activeMeta.overlaySubtitle}
                          </p>
                        </div>
                      )}

                      {/* Center Crosshairs */}
                      {showGuides && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="w-full h-[1px] bg-red-500/40 absolute top-1/2 left-0" />
                          <div className="h-full w-[1px] bg-red-500/40 absolute left-1/2 top-0" />
                          <div
                            style={{
                              left: `${activeConfig.mobile.x}%`,
                              top: `${activeConfig.mobile.y}%`,
                            }}
                            className="absolute w-6 h-6 -ml-3 -mt-3 border-2 border-amber-400 rounded-full shadow-lg bg-amber-400/25 flex items-center justify-center"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-28 h-1 bg-neutral-700 rounded-full mx-auto mt-2.5 pointer-events-none" />
                </div>
                <span className="text-xs text-neutral-400 mt-2 text-center font-medium">
                  Click inside to center Sagar on Mobile
                </span>
              </div>

              {/* 2. TABLET LIVE SCREEN */}
              <div className="flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2.5 px-2">
                  <div className="flex items-center gap-2">
                    <Tablet className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-white">2. Tablet (iPad Screen)</span>
                  </div>
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-mono font-bold">
                    [{activeConfig.tablet.x}% {activeConfig.tablet.y}%]
                  </span>
                </div>

                {/* iPad frame */}
                <div
                  className={`w-full max-w-[480px] rounded-[32px] p-3.5 bg-neutral-900 border-4 shadow-2xl relative cursor-crosshair transition ${
                    activeDeviceTab === "tablet" ? "border-amber-500" : "border-neutral-800"
                  }`}
                  onClick={(e) => handleDeviceClick(e, "tablet")}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-800 mx-auto mb-2 pointer-events-none" />

                  <div className="w-full rounded-2xl overflow-hidden bg-black relative">
                    <div className={`relative ${activeMeta.tabletAspect} overflow-hidden`}>
                      <Image
                        src={activeMeta.src}
                        alt={activeMeta.name}
                        fill
                        priority
                        style={{
                          objectFit: "cover",
                          objectPosition: `${activeConfig.tablet.x}% ${activeConfig.tablet.y}%`,
                          transform: `scale(${activeConfig.tablet.scale / 100})`,
                        }}
                        className="transition-transform duration-75 pointer-events-none"
                      />

                      {/* Text Overlay */}
                      {activeMeta.hasTextOverlay && showOverlays && (
                        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />
                      )}
                      {activeMeta.hasTextOverlay && showOverlays && (
                        <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 text-white pointer-events-none">
                          <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase border border-white/20 rounded-full px-3 py-0.5 w-max mb-2">
                            {activeMeta.section}
                          </span>
                          <h3 className="font-bold text-3xl drop-shadow leading-tight">
                            {activeMeta.overlayTitle}
                          </h3>
                          <p className="text-sm text-white/80 mt-1 drop-shadow leading-relaxed">
                            {activeMeta.overlaySubtitle}
                          </p>
                        </div>
                      )}

                      {/* Crosshairs */}
                      {showGuides && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="w-full h-[1px] bg-red-500/40 absolute top-1/2 left-0" />
                          <div className="h-full w-[1px] bg-red-500/40 absolute left-1/2 top-0" />
                          <div
                            style={{
                              left: `${activeConfig.tablet.x}%`,
                              top: `${activeConfig.tablet.y}%`,
                            }}
                            className="absolute w-6 h-6 -ml-3 -mt-3 border-2 border-amber-400 rounded-full shadow-lg bg-amber-400/25 flex items-center justify-center"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-neutral-400 mt-2 text-center font-medium">
                  Click inside to center Sagar on Tablet
                </span>
              </div>
            </div>
          ) : (
            /* View Mode 2: Triple View (Mobile + Tablet + Desktop) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Mobile */}
              <div className="lg:col-span-4 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2 px-1 text-xs font-bold text-neutral-300">
                  <span>1. Mobile</span>
                  <span className="font-mono text-amber-400">[{activeConfig.mobile.x}% {activeConfig.mobile.y}%]</span>
                </div>
                <div
                  className="w-full max-w-[320px] rounded-[32px] p-2 bg-neutral-900 border-4 border-neutral-800 relative cursor-crosshair"
                  onClick={(e) => handleDeviceClick(e, "mobile")}
                >
                  <div className={`relative ${activeMeta.mobileAspect} overflow-hidden rounded-[24px]`}>
                    <Image
                      src={activeMeta.src}
                      alt={activeMeta.name}
                      fill
                      priority
                      style={{
                        objectFit: "cover",
                        objectPosition: `${activeConfig.mobile.x}% ${activeConfig.mobile.y}%`,
                      }}
                      className="pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Tablet */}
              <div className="lg:col-span-4 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2 px-1 text-xs font-bold text-neutral-300">
                  <span>2. Tablet</span>
                  <span className="font-mono text-amber-400">[{activeConfig.tablet.x}% {activeConfig.tablet.y}%]</span>
                </div>
                <div
                  className="w-full max-w-[380px] rounded-[24px] p-2 bg-neutral-900 border-4 border-neutral-800 relative cursor-crosshair"
                  onClick={(e) => handleDeviceClick(e, "tablet")}
                >
                  <div className={`relative ${activeMeta.tabletAspect} overflow-hidden rounded-[18px]`}>
                    <Image
                      src={activeMeta.src}
                      alt={activeMeta.name}
                      fill
                      priority
                      style={{
                        objectFit: "cover",
                        objectPosition: `${activeConfig.tablet.x}% ${activeConfig.tablet.y}%`,
                      }}
                      className="pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Desktop */}
              <div className="lg:col-span-4 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2 px-1 text-xs font-bold text-neutral-300">
                  <span>3. Desktop</span>
                  <span className="font-mono text-amber-400">[{activeConfig.desktop.x}% {activeConfig.desktop.y}%]</span>
                </div>
                <div
                  className="w-full max-w-[420px] rounded-2xl p-2 bg-neutral-900 border-4 border-neutral-800 relative cursor-crosshair"
                  onClick={(e) => handleDeviceClick(e, "desktop")}
                >
                  <div className={`relative ${activeMeta.desktopAspect} overflow-hidden rounded-xl`}>
                    <Image
                      src={activeMeta.src}
                      alt={activeMeta.name}
                      fill
                      priority
                      style={{
                        objectFit: "cover",
                        objectPosition: `${activeConfig.desktop.x}% ${activeConfig.desktop.y}%`,
                      }}
                      className="pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
