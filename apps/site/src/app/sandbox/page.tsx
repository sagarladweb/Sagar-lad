"use client";

import { useState } from "react";
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
  autoPreset: {
    mobile: ImageAlignmentSetting;
    tablet: ImageAlignmentSetting;
    desktop: ImageAlignmentSetting;
  };
};

const PRESET_METADATA: PresetItem[] = [
  {
    id: "about-hero",
    name: "About Hero",
    section: "About Page",
    category: "hero",
    src: "/images/heroes/sagar-lad-author-keynote-speaker-about-hero.webp",
    mobileAspect: "h-[540px] w-full",
    tabletAspect: "aspect-[16/10] w-full",
    desktopAspect: "aspect-[16/9] w-full",
    hasTextOverlay: true,
    overlayTitle: "MIND UP",
    overlaySubtitle: "Change your MIND, Change your life",
    autoPreset: {
      mobile: { x: 77, y: 38, scale: 100 },
      tablet: { x: 80, y: 40, scale: 100 },
      desktop: { x: 50, y: 45, scale: 100 },
    },
  },
  {
    id: "speaking-hero",
    name: "Speaking Hero",
    section: "Speaking Page",
    category: "hero",
    src: "/images/heroes/Speaking_hero.webp",
    mobileAspect: "h-[540px] w-full",
    tabletAspect: "aspect-[16/10] w-full",
    desktopAspect: "aspect-[16/9] w-full",
    hasTextOverlay: true,
    overlayTitle: "Ideas that ignite rooms",
    overlaySubtitle: "Story-driven keynotes worldwide",
    autoPreset: {
      mobile: { x: 65, y: 42, scale: 100 },
      tablet: { x: 77, y: 45, scale: 100 },
      desktop: { x: 50, y: 50, scale: 100 },
    },
  },
  {
    id: "home-hero",
    name: "Home Hero",
    section: "Homepage",
    category: "hero",
    src: "/images/heroes/sagar-lad-author-mentor-guide-home-hero.webp",
    mobileAspect: "h-[540px] w-full",
    tabletAspect: "aspect-[16/10] w-full",
    desktopAspect: "aspect-[21/9] w-full",
    hasTextOverlay: true,
    overlayTitle: "Sagar Lad",
    overlaySubtitle: "Your friend, mentor and Guide",
    autoPreset: {
      mobile: { x: 76, y: 24, scale: 100 },
      tablet: { x: 88, y: 22, scale: 100 },
      desktop: { x: 0, y: 30, scale: 100 },
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
    autoPreset: {
      mobile: { x: 70, y: 25, scale: 100 },
      tablet: { x: 68, y: 25, scale: 100 },
      desktop: { x: 68, y: 25, scale: 100 },
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
    autoPreset: {
      mobile: { x: 50, y: 25, scale: 100 },
      tablet: { x: 50, y: 25, scale: 100 },
      desktop: { x: 50, y: 25, scale: 100 },
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
    autoPreset: {
      mobile: { x: 50, y: 20, scale: 100 },
      tablet: { x: 50, y: 20, scale: 100 },
      desktop: { x: 50, y: 18, scale: 100 },
    },
  },
  {
    id: "casual-1",
    name: "Casual 1",
    section: "Friend Gallery",
    category: "portrait",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-1.webp",
    mobileAspect: "aspect-[4/3] w-full",
    tabletAspect: "aspect-[4/3] w-full",
    desktopAspect: "aspect-[4/3] w-full",
    hasTextOverlay: false,
    autoPreset: {
      mobile: { x: 50, y: 30, scale: 100 },
      tablet: { x: 50, y: 30, scale: 100 },
      desktop: { x: 50, y: 30, scale: 100 },
    },
  },
  {
    id: "casual-2",
    name: "Casual 2",
    section: "Friend Gallery",
    category: "portrait",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-2.webp",
    mobileAspect: "aspect-[4/3] w-full",
    tabletAspect: "aspect-[4/3] w-full",
    desktopAspect: "aspect-[4/3] w-full",
    hasTextOverlay: false,
    autoPreset: {
      mobile: { x: 50, y: 25, scale: 100 },
      tablet: { x: 50, y: 25, scale: 100 },
      desktop: { x: 50, y: 25, scale: 100 },
    },
  },
  {
    id: "casual-3",
    name: "Casual 3",
    section: "Friend Gallery",
    category: "portrait",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-3.webp",
    mobileAspect: "aspect-[4/3] w-full",
    tabletAspect: "aspect-[4/3] w-full",
    desktopAspect: "aspect-[4/3] w-full",
    hasTextOverlay: false,
    autoPreset: {
      mobile: { x: 50, y: 30, scale: 100 },
      tablet: { x: 50, y: 30, scale: 100 },
      desktop: { x: 50, y: 30, scale: 100 },
    },
  },
  {
    id: "casual-4",
    name: "Casual 4",
    section: "Friend Gallery",
    category: "portrait",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-4.webp",
    mobileAspect: "aspect-[4/3] w-full",
    tabletAspect: "aspect-[4/3] w-full",
    desktopAspect: "aspect-[4/3] w-full",
    hasTextOverlay: false,
    autoPreset: {
      mobile: { x: 50, y: 35, scale: 100 },
      tablet: { x: 50, y: 35, scale: 100 },
      desktop: { x: 50, y: 35, scale: 100 },
    },
  },
  {
    id: "casual-5",
    name: "Casual 5",
    section: "Friend Gallery",
    category: "portrait",
    src: "/images/profile/sagar-lad-friend-mentor-casual-outdoor-5.webp",
    mobileAspect: "aspect-[4/3] w-full",
    tabletAspect: "aspect-[4/3] w-full",
    desktopAspect: "aspect-[4/3] w-full",
    hasTextOverlay: false,
    autoPreset: {
      mobile: { x: 50, y: 25, scale: 100 },
      tablet: { x: 50, y: 25, scale: 100 },
      desktop: { x: 50, y: 25, scale: 100 },
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
    autoPreset: {
      mobile: { x: 50, y: 50, scale: 100 },
      tablet: { x: 50, y: 50, scale: 100 },
      desktop: { x: 50, y: 50, scale: 100 },
    },
  },
];

type DeviceType = "mobile" | "tablet" | "desktop";

export default function MasterResponsiveSandbox() {
  const [allConfigs, setAllConfigs] = useState<Record<string, ImageBreakpointConfig>>(
    DEFAULT_IMAGE_CONFIGS
  );
  const [activeImageId, setActiveImageId] = useState<string>("about-hero");
  const [activeDeviceTab, setActiveDeviceTab] = useState<DeviceType>("mobile");
  const [showGuides, setShowGuides] = useState(true);
  const [showOverlays, setShowOverlays] = useState(true);
  const [copyAllCopied, setCopyAllCopied] = useState(false);
  const [singleCopied, setSingleCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const activeMeta = PRESET_METADATA.find((p) => p.id === activeImageId) || PRESET_METADATA[0];
  const activeConfig = allConfigs[activeImageId] || DEFAULT_IMAGE_CONFIGS[activeImageId];

  // Update setting for active image on specific device
  const updateActiveSetting = (
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

  // Magic 1-Click Auto-Tune for current image
  const autoTuneCurrentImage = () => {
    const preset = activeMeta.autoPreset;
    setAllConfigs((prev) => {
      const current = prev[activeImageId];
      const tailwind = `object-cover object-[${preset.mobile.x}%_${preset.mobile.y}%] sm:object-[${preset.tablet.x}%_${preset.tablet.y}%] lg:object-[${preset.desktop.x}%_${preset.desktop.y}%]`;
      return {
        ...prev,
        [activeImageId]: {
          ...current,
          mobile: { ...preset.mobile },
          tablet: { ...preset.tablet },
          desktop: { ...preset.desktop },
          tailwind,
        },
      };
    });
  };

  // Magic 1-Click Auto-Tune for ALL 11 images
  const autoTuneAllImages = () => {
    setAllConfigs((prev) => {
      const next = { ...prev };
      for (const meta of PRESET_METADATA) {
        const preset = meta.autoPreset;
        const tailwind = `object-cover object-[${preset.mobile.x}%_${preset.mobile.y}%] sm:object-[${preset.tablet.x}%_${preset.tablet.y}%] lg:object-[${preset.desktop.x}%_${preset.desktop.y}%]`;
        next[meta.id] = {
          ...next[meta.id],
          mobile: { ...preset.mobile },
          tablet: { ...preset.tablet },
          desktop: { ...preset.desktop },
          tailwind,
        };
      }
      return next;
    });
    setSaveMessage("✨ All 11 images auto-optimized for Mobile, Tablet & Desktop!");
    setTimeout(() => setSaveMessage(null), 3000);
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

  // Click on any device viewport to immediately center focal point
  const handleDeviceClick = (
    e: React.MouseEvent<HTMLDivElement>,
    device: DeviceType
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const clickY = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    setActiveDeviceTab(device);
    updateActiveSetting(device, { x: clickX, y: clickY });
  };

  const currentSliderValues = activeConfig[activeDeviceTab] || { x: 50, y: 50, scale: 100 };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-neutral-100 flex flex-col font-sans select-none">
      {/* ── Top Header Bar ───────────────────────────────────────── */}
      <header className="border-b border-neutral-800 bg-[#101318]/95 backdrop-blur px-4 sm:px-6 py-3 sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg shadow">
            🎯
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Sagar Lad Multi-Device Image Studio
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full font-semibold border border-amber-500/30">
                TRIPLE-VIEW LIVE
              </span>
            </h1>
            <p className="text-xs text-neutral-400">
              Mobile (Vertical) + Tablet (iPad) + Desktop (Horizontal Widescreen) live side-by-side
            </p>
          </div>
        </div>

        {/* Master Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={autoTuneAllImages}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>✨ Auto-Tune All 11 Images</span>
          </button>

          {/* ONE MASTER BUTTON: Copy All Images Settings */}
          <button
            onClick={copyAllSettings}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg transition flex items-center gap-2"
          >
            {copyAllCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copyAllCopied ? "✓ All Settings Copied!" : "📋 Copy All Images Settings"}</span>
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
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white transition flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit</span>
          </Link>
        </div>
      </header>

      {/* Save / Status Toast Notification */}
      {saveMessage && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-2 text-xs text-amber-200 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">{saveMessage}</span>
          </div>
          <button onClick={() => setSaveMessage(null)} className="text-amber-400 font-mono text-xs">✕</button>
        </div>
      )}

      {/* ── Visual Thumbnail Selector Strip (All 11 Images) ──────── */}
      <div className="border-b border-neutral-800 bg-[#0e1116] px-4 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2">
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          Images:
        </span>
        {PRESET_METADATA.map((p, idx) => {
          const isSelected = p.id === activeImageId;
          return (
            <button
              key={p.id}
              onClick={() => setActiveImageId(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition flex items-center gap-2 border ${
                isSelected
                  ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                  : "bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400/80" />
              <span>{idx + 1}. {p.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main Layout: Sidebar Controls + Triple Live Canvas ────── */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        {/* Left Control Panel */}
        <aside className="w-full xl:w-96 border-b xl:border-b-0 xl:border-r border-neutral-800 bg-[#101318] p-5 flex flex-col gap-5 shrink-0 overflow-y-auto max-h-none xl:max-h-[calc(100vh-112px)]">
          {/* Active Asset Details & 1-Click Magic Auto-Tune */}
          <div className="p-4 rounded-2xl bg-[#171b22] border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Active Selection
              </span>
              <span className="text-[10px] bg-neutral-800 text-amber-300 font-mono px-2 py-0.5 rounded">
                {activeMeta.section}
              </span>
            </div>
            <h2 className="text-base font-bold text-white">{activeMeta.name}</h2>
            <div className="text-[11px] text-neutral-400 font-mono break-all">{activeMeta.src}</div>

            {/* 1-Click Auto-Tune for this single image */}
            <button
              onClick={autoTuneCurrentImage}
              className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>✨ 1-Click Auto-Align (All 3 Screens)</span>
            </button>
          </div>

          {/* Breakpoint Switcher for Sliders */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Focal Slider Focus
              </label>
              <span className="text-[11px] text-amber-400 font-mono font-bold">
                {activeDeviceTab.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#171b22] rounded-xl border border-neutral-800">
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

          {/* Sliders for the active breakpoint */}
          <div className="p-4 rounded-2xl bg-[#171b22] border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold text-white capitalize flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeDeviceTab} Coordinates</span>
              </span>
              <span className="text-[11px] font-mono text-amber-400">
                X: {currentSliderValues.x}% &middot; Y: {currentSliderValues.y}%
              </span>
            </div>

            {/* Horizontal (X%) Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-neutral-300 font-medium">Horizontal (Left &harr; Right):</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      updateActiveSetting(activeDeviceTab, {
                        x: Math.max(0, currentSliderValues.x - 1),
                      })
                    }
                    className="w-5 h-5 rounded bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center text-xs"
                  >
                    -
                  </button>
                  <span className="font-mono text-amber-400 font-bold w-10 text-center">
                    {currentSliderValues.x}%
                  </span>
                  <button
                    onClick={() =>
                      updateActiveSetting(activeDeviceTab, {
                        x: Math.min(100, currentSliderValues.x + 1),
                      })
                    }
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
                value={currentSliderValues.x}
                onChange={(e) =>
                  updateActiveSetting(activeDeviceTab, { x: Number(e.target.value) })
                }
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                <span>0% (Left)</span>
                <span>50% (Center)</span>
                <span>100% (Right)</span>
              </div>
            </div>

            {/* Vertical (Y%) Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-neutral-300 font-medium">Vertical (Top &harr; Bottom):</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      updateActiveSetting(activeDeviceTab, {
                        y: Math.max(0, currentSliderValues.y - 1),
                      })
                    }
                    className="w-5 h-5 rounded bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center text-xs"
                  >
                    -
                  </button>
                  <span className="font-mono text-amber-400 font-bold w-10 text-center">
                    {currentSliderValues.y}%
                  </span>
                  <button
                    onClick={() =>
                      updateActiveSetting(activeDeviceTab, {
                        y: Math.min(100, currentSliderValues.y + 1),
                      })
                    }
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
                value={currentSliderValues.y}
                onChange={(e) =>
                  updateActiveSetting(activeDeviceTab, { y: Number(e.target.value) })
                }
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                <span>0% (Head/Top)</span>
                <span>50% (Center)</span>
                <span>100% (Bottom)</span>
              </div>
            </div>

            {/* Zoom / Scale */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-neutral-300 font-medium">Zoom / Scale:</span>
                <span className="font-mono text-amber-400 font-bold">{currentSliderValues.scale}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="150"
                value={currentSliderValues.scale}
                onChange={(e) =>
                  updateActiveSetting(activeDeviceTab, { scale: Number(e.target.value) })
                }
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
            </div>
          </div>

          {/* Quick 1-Click Positioning Presets */}
          <div>
            <span className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Instant Position Presets ({activeDeviceTab})
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => updateActiveSetting(activeDeviceTab, { x: 50, y: 50, scale: 100 })}
                className="p-2 bg-[#171b22] hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-300 text-left font-mono text-[11px]"
              >
                ⚖️ Center (50% 50%)
              </button>
              <button
                onClick={() => updateActiveSetting(activeDeviceTab, { x: 77, y: 40, scale: 100 })}
                className="p-2 bg-[#171b22] hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-300 text-left font-mono text-[11px]"
              >
                👤 Face Right (77% 40%)
              </button>
              <button
                onClick={() => updateActiveSetting(activeDeviceTab, { x: 65, y: 42, scale: 100 })}
                className="p-2 bg-[#171b22] hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-300 text-left font-mono text-[11px]"
              >
                🎤 Stage Center (65% 42%)
              </button>
              <button
                onClick={() => updateActiveSetting(activeDeviceTab, { x: 50, y: 25, scale: 100 })}
                className="p-2 bg-[#171b22] hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-300 text-left font-mono text-[11px]"
              >
                ⬆️ Upper Head (50% 25%)
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl text-xs text-neutral-400 flex gap-2 items-start">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Tip:</strong> Click anywhere directly on the Mobile, Tablet, or Desktop screens to instantly snap Sagar&apos;s face to that exact position!
            </p>
          </div>

          {/* Current Single Tailwind Classes Output */}
          <div className="mt-auto pt-3 border-t border-neutral-800 space-y-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              Current Image Tailwind
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
              <span>{singleCopied ? "Copied!" : "Copy This Image Only"}</span>
            </button>
          </div>
        </aside>

        {/* ── Right Canvas: Triple Viewports Live Side-by-Side ────── */}
        <main className="flex-1 bg-[#07090c] p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto">
          {/* Canvas Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#101318] p-3 rounded-2xl border border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Viewing:
              </span>
              <span className="text-xs bg-amber-500/15 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-lg font-semibold">
                {activeMeta.name} ({activeMeta.section})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGuides(!showGuides)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
                  showGuides
                    ? "bg-neutral-800 border-amber-500/40 text-amber-300"
                    : "bg-neutral-900 border-neutral-700 text-neutral-400"
                }`}
              >
                <Crosshair className="w-3 h-3" />
                <span>{showGuides ? "Crosshairs ON" : "Crosshairs OFF"}</span>
              </button>

              <button
                onClick={() => setShowOverlays(!showOverlays)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
                  showOverlays
                    ? "bg-neutral-800 border-amber-500/40 text-amber-300"
                    : "bg-neutral-900 border-neutral-700 text-neutral-400"
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>{showOverlays ? "Overlays ON" : "Overlays OFF"}</span>
              </button>
            </div>
          </div>

          {/* TRIPLE VIEWPORT GRID: Mobile + Tablet + Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 1. MOBILE VIEWPORT (Vertical Screen 360px) */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. Mobile (Vertical)</span>
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-neutral-800 px-2 py-0.5 rounded">
                  [{activeConfig.mobile.x}% {activeConfig.mobile.y}%]
                </span>
              </div>

              {/* Phone Mockup Frame */}
              <div
                className={`w-full max-w-[340px] rounded-[36px] p-2.5 bg-neutral-900 border-4 shadow-2xl relative cursor-crosshair transition ${
                  activeDeviceTab === "mobile" ? "border-amber-500/70" : "border-neutral-800"
                }`}
                onClick={(e) => handleDeviceClick(e, "mobile")}
              >
                {/* Dynamic Island */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20 pointer-events-none" />

                <div className="w-full rounded-[28px] overflow-hidden bg-black relative">
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

                    {/* Gradient Overlay */}
                    {activeMeta.hasTextOverlay && showOverlays && (
                      <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                    )}

                    {/* Text Overlay */}
                    {activeMeta.hasTextOverlay && showOverlays && (
                      <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 text-white pointer-events-none">
                        <span className="text-[9px] font-bold tracking-widest text-white/70 uppercase border border-white/20 rounded-full px-2.5 py-0.5 w-max mb-1.5">
                          {activeMeta.section}
                        </span>
                        <h3 className="font-bold text-xl drop-shadow leading-tight">
                          {activeMeta.overlayTitle}
                        </h3>
                        <p className="text-[11px] text-white/80 mt-0.5 drop-shadow leading-relaxed">
                          {activeMeta.overlaySubtitle}
                        </p>
                      </div>
                    )}

                    {/* Crosshair Guide */}
                    {showGuides && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="w-full h-[1px] bg-red-500/40 absolute top-1/2 left-0" />
                        <div className="h-full w-[1px] bg-red-500/40 absolute left-1/2 top-0" />
                        <div
                          style={{ left: `${activeConfig.mobile.x}%`, top: `${activeConfig.mobile.y}%` }}
                          className="absolute w-6 h-6 -ml-3 -mt-3 border-2 border-amber-400 rounded-full shadow-lg bg-amber-400/20 flex items-center justify-center"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-24 h-1 bg-neutral-700 rounded-full mx-auto mt-2 pointer-events-none" />
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 text-center">Click inside to move mobile focal point</span>
            </div>

            {/* 2. TABLET VIEWPORT (Medium iPad 768px) */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Tablet className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. Tablet (iPad Screen)</span>
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-neutral-800 px-2 py-0.5 rounded">
                  [{activeConfig.tablet.x}% {activeConfig.tablet.y}%]
                </span>
              </div>

              {/* Tablet Mockup Frame */}
              <div
                className={`w-full max-w-[420px] rounded-[28px] p-3 bg-neutral-900 border-4 shadow-2xl relative cursor-crosshair transition ${
                  activeDeviceTab === "tablet" ? "border-amber-500/70" : "border-neutral-800"
                }`}
                onClick={(e) => handleDeviceClick(e, "tablet")}
              >
                {/* Camera dot */}
                <div className="w-2 h-2 rounded-full bg-neutral-800 mx-auto mb-2 pointer-events-none" />

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

                    {/* Gradient Overlay */}
                    {activeMeta.hasTextOverlay && showOverlays && (
                      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />
                    )}

                    {/* Text Overlay */}
                    {activeMeta.hasTextOverlay && showOverlays && (
                      <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 text-white pointer-events-none">
                        <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase border border-white/20 rounded-full px-2.5 py-0.5 w-max mb-1.5">
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

                    {/* Crosshair Guide */}
                    {showGuides && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="w-full h-[1px] bg-red-500/40 absolute top-1/2 left-0" />
                        <div className="h-full w-[1px] bg-red-500/40 absolute left-1/2 top-0" />
                        <div
                          style={{ left: `${activeConfig.tablet.x}%`, top: `${activeConfig.tablet.y}%` }}
                          className="absolute w-6 h-6 -ml-3 -mt-3 border-2 border-amber-400 rounded-full shadow-lg bg-amber-400/20 flex items-center justify-center"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 text-center">Click inside to move tablet focal point</span>
            </div>

            {/* 3. DESKTOP VIEWPORT (Widescreen 16:9) */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-amber-400" />
                  <span>3. Desktop (Widescreen)</span>
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-neutral-800 px-2 py-0.5 rounded">
                  [{activeConfig.desktop.x}% {activeConfig.desktop.y}%]
                </span>
              </div>

              {/* Desktop Monitor Mockup Frame */}
              <div
                className={`w-full max-w-[480px] rounded-2xl p-2.5 bg-neutral-900 border-4 shadow-2xl relative cursor-crosshair transition ${
                  activeDeviceTab === "desktop" ? "border-amber-500/70" : "border-neutral-800"
                }`}
                onClick={(e) => handleDeviceClick(e, "desktop")}
              >
                {/* Browser bar */}
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-neutral-800 px-1">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/80" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                    <div className="w-2 h-2 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[9px] text-neutral-500 font-mono">sagarlad.com</span>
                  <div className="w-4" />
                </div>

                <div className="w-full rounded-xl overflow-hidden bg-black relative">
                  <div className={`relative ${activeMeta.desktopAspect} overflow-hidden`}>
                    <Image
                      src={activeMeta.src}
                      alt={activeMeta.name}
                      fill
                      priority
                      style={{
                        objectFit: "cover",
                        objectPosition: `${activeConfig.desktop.x}% ${activeConfig.desktop.y}%`,
                        transform: `scale(${activeConfig.desktop.scale / 100})`,
                      }}
                      className="transition-transform duration-75 pointer-events-none"
                    />

                    {/* Gradient Overlay */}
                    {activeMeta.hasTextOverlay && showOverlays && (
                      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                    )}

                    {/* Text Overlay */}
                    {activeMeta.hasTextOverlay && showOverlays && (
                      <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 text-white pointer-events-none">
                        <span className="text-[9px] font-bold tracking-widest text-white/70 uppercase border border-white/20 rounded-full px-2.5 py-0.5 w-max mb-1.5">
                          {activeMeta.section}
                        </span>
                        <h3 className="font-bold text-2xl drop-shadow leading-tight">
                          {activeMeta.overlayTitle}
                        </h3>
                        <p className="text-xs text-white/80 mt-0.5 drop-shadow leading-relaxed">
                          {activeMeta.overlaySubtitle}
                        </p>
                      </div>
                    )}

                    {/* Crosshair Guide */}
                    {showGuides && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="w-full h-[1px] bg-red-500/40 absolute top-1/2 left-0" />
                        <div className="h-full w-[1px] bg-red-500/40 absolute left-1/2 top-0" />
                        <div
                          style={{ left: `${activeConfig.desktop.x}%`, top: `${activeConfig.desktop.y}%` }}
                          className="absolute w-6 h-6 -ml-3 -mt-3 border-2 border-amber-400 rounded-full shadow-lg bg-amber-400/20 flex items-center justify-center"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 text-center">Click inside to move desktop focal point</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
