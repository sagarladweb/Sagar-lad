"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";
import {
  WORLD_MAP_VIEWBOX,
  WORLD_COUNTRIES,
  VISITED_COUNTRIES_ORDER,
  type CountryData,
} from "./world-map-paths";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// The 17 countries that receive yellow fill and precision dots
const YELLOW_COUNTRIES = new Set([
  "IN", "BE", "LU", "IT", "HU", "AT", "CH", "ES", "FR",
  "PT", "DE", "GB", "CA", "AE", "NL", "HR", "IS",
]);

// Accurate country display labels and flags
const COUNTRY_DISPLAY: Record<string, { name: string; flag: string }> = {
  IN: { name: "India", flag: "🇮🇳" },
  BE: { name: "Belgium", flag: "🇧🇪" },
  LU: { name: "Luxembourg", flag: "🇱🇺" },
  IT: { name: "Italy", flag: "🇮🇹" },
  HU: { name: "Budapest, Hungary", flag: "🇭🇺" },
  AT: { name: "Austria", flag: "🇦🇹" },
  CH: { name: "Switzerland", flag: "🇨🇭" },
  ES: { name: "Spain", flag: "🇪🇸" },
  FR: { name: "France", flag: "🇫🇷" },
  PT: { name: "Portugal", flag: "🇵🇹" },
  DE: { name: "Germany", flag: "🇩🇪" },
  GB: { name: "United Kingdom", flag: "🇬🇧" },
  CA: { name: "Canada", flag: "🇨🇦" },
  AE: { name: "Dubai, UAE", flag: "🇦🇪" },
  NL: { name: "Netherlands", flag: "🇳🇱" },
  HR: { name: "Croatia", flag: "🇭🇷" },
  IS: { name: "Iceland", flag: "🇮🇸" },
};

// Exact, calibrated geographic dot coordinates for the 17 yellow countries in SVG viewBox
const YELLOW_COUNTRY_DOTS: { code: string; x: number; y: number }[] = [
  { code: "IN", x: 602, y: 473 }, // India
  { code: "BE", x: 417, y: 394 }, // Belgium
  { code: "LU", x: 421, y: 397 }, // Luxembourg
  { code: "IT", x: 435, y: 421 }, // Italy
  { code: "HU", x: 450, y: 404 }, // Budapest, Hungary
  { code: "AT", x: 437, y: 403 }, // Austria
  { code: "CH", x: 425, y: 406 }, // Switzerland
  { code: "ES", x: 395, y: 425 }, // Spain (Mainland)
  { code: "FR", x: 413, y: 405 }, // France (Mainland)
  { code: "PT", x: 387, y: 425 }, // Portugal (Mainland)
  { code: "DE", x: 430, y: 393 }, // Germany
  { code: "GB", x: 401, y: 382 }, // United Kingdom
  { code: "CA", x: 220, y: 340 }, // Canada
  { code: "AE", x: 534, y: 467 }, // Dubai, UAE
  { code: "NL", x: 418, y: 389 }, // Netherlands
  { code: "HR", x: 443, y: 413 }, // Croatia
  { code: "IS", x: 370, y: 346 }, // Iceland
];

export function TraveledMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [countryCount, setCountryCount] = useState(0);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);

  // Dragging state for manual panning when zoomed
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // 25 visited countries preserved from existing data
  const visitedCountries = useMemo(
    () => VISITED_COUNTRIES_ORDER.map((code) => WORLD_COUNTRIES[code]).filter(Boolean) as CountryData[],
    []
  );

  const activeCountry = hoveredCode && YELLOW_COUNTRIES.has(hoveredCode)
    ? COUNTRY_DISPLAY[hoveredCode]
    : null;

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // GSAP country count animation (up to 25 countries)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const totalVisited = visitedCountries.length;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCountryCount(totalVisited);
      setHasEnteredViewport(true);
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        once: true,
        onEnter: () => {
          setHasEnteredViewport(true);
          const counterObj = { val: 0 };
          gsap.to(counterObj, {
            val: totalVisited,
            duration: 1.4,
            ease: "power2.out",
            onUpdate: () => setCountryCount(Math.round(counterObj.val)),
          });
        },
      });
    }, el);

    return () => ctx.revert();
  }, [visitedCountries.length]);

  // Handle click on country or background
  const handleMapClick = useCallback(
    (e: React.MouseEvent, country?: CountryData) => {
      const isYellow = country && YELLOW_COUNTRIES.has(country.code);

      // Rule: clicking country not filled with color or background -> zoom out
      if (!isYellow || !country) {
        if (selectedCode !== null || zoom !== 1) {
          setZoom(1);
          setPan({ x: 0, y: 0 });
          setSelectedCode(null);
        }
        return;
      }

      // Rule: clicking again on that same yellow country -> zoom out
      if (selectedCode === country.code) {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setSelectedCode(null);
        return;
      }

      // Rule: clicking yellow country (or another yellow country) -> zoom to cursor position
      // Exactly ONE zoom scale applied by clicking: 2.2x
      const viewport = containerRef.current?.querySelector("[data-map-vp]") as HTMLElement;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();

      const clickX = e.clientX - rect.left - rect.width / 2;
      const clickY = e.clientY - rect.top - rect.height / 2;

      const targetZoom = 2.2;
      const targetPanX = -clickX * (targetZoom - 1);
      const targetPanY = -clickY * (targetZoom - 1);

      const maxBoundX = rect.width * (targetZoom - 1) * 0.48;
      const maxBoundY = rect.height * (targetZoom - 1) * 0.48;

      setZoom(targetZoom);
      setPan({
        x: Math.max(-maxBoundX, Math.min(maxBoundX, targetPanX)),
        y: Math.max(-maxBoundY, Math.min(maxBoundY, targetPanY)),
      });
      setSelectedCode(country.code);
    },
    [selectedCode, zoom]
  );

  // Manual zoom helpers
  const handleManualZoomIn = () => {
    setZoom((prev) => Math.min(4, Math.round((prev + 0.5) * 10) / 10));
  };

  const handleManualZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(1, Math.round((prev - 0.5) * 10) / 10);
      if (next === 1) {
        setPan({ x: 0, y: 0 });
        setSelectedCode(null);
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedCode(null);
  };

  // Drag to pan when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    if (!isDragging || zoom <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const maxBoundX = rect.width * (zoom - 1) * 0.5;
    const maxBoundY = rect.height * (zoom - 1) * 0.5;

    setPan({
      x: Math.max(-maxBoundX, Math.min(maxBoundX, dragStartRef.current.panX + dx)),
      y: Math.max(-maxBoundY, Math.min(maxBoundY, dragStartRef.current.panY + dy)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div ref={containerRef} className="w-full space-y-4">
      <div className="relative w-full overflow-hidden">
        <div
          data-map-vp
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setHoveredCode(null);
            setIsDragging(false);
          }}
          onClick={(e) => {
            // If background clicked directly
            if ((e.target as HTMLElement).tagName === "svg" || (e.target as HTMLElement).getAttribute("data-map-vp")) {
              handleMapClick(e);
            }
          }}
          className={`relative w-full aspect-[16/9.5] sm:aspect-[16/9] min-h-[340px] sm:min-h-[460px] md:min-h-[520px] flex items-center justify-center overflow-hidden select-none ${
            zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
          }`}
        >
          {/* Zoomable & Pannable Map Layer */}
          <div
            className="w-full h-full flex items-center justify-center origin-center"
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`,
              transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <svg
              ref={svgRef}
              viewBox={WORLD_MAP_VIEWBOX}
              className="w-full h-full max-h-full object-contain"
              style={{ overflow: "visible" }}
            >
              {/* Country paths */}
              {Object.values(WORLD_COUNTRIES).map((c) => {
                const isVisited = c.visited;
                const isYellow = YELLOW_COUNTRIES.has(c.code);
                const isHovered = hoveredCode === c.code;
                const isSelected = selectedCode === c.code;
                const isHighlighted = isHovered || isSelected;
                const orderIndex = c.order ?? 99;

                return (
                  <path
                    key={c.code}
                    id={`map-country-${c.code}`}
                    d={c.d}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMapClick(e, c);
                    }}
                    onMouseEnter={() => {
                      // Rule: show hover pill ONLY for yellow-filled countries
                      if (!isTouchDevice && isYellow) {
                        setHoveredCode(c.code);
                      }
                    }}
                    onMouseLeave={() => {
                      if (!isTouchDevice) {
                        setHoveredCode(null);
                      }
                    }}
                    style={{
                      transition: "fill 0.25s ease, stroke 0.25s ease",
                      transitionDelay: hasEnteredViewport && isYellow ? `${orderIndex * 25}ms` : "0ms",
                      cursor: isYellow ? "pointer" : isVisited ? "default" : "default",
                    }}
                    fill={
                      isYellow
                        ? hasEnteredViewport
                          ? "#FACC15"
                          : "#fef08a"
                        : isVisited
                        ? "#e2e8f0"
                        : "#f1f5f9"
                    }
                    stroke={
                      isHighlighted
                        ? "#ca8a04"
                        : isYellow
                        ? "#ca8a04"
                        : isVisited
                        ? "#94a3b8"
                        : "#cbd5e1"
                    }
                    strokeWidth={
                      isHighlighted ? 1.2 : isYellow ? 0.85 : 0.45
                    }
                    strokeLinejoin="round"
                    className="focus:outline-none"
                    tabIndex={isYellow ? 0 : -1}
                    aria-label={isYellow ? `${COUNTRY_DISPLAY[c.code]?.name || c.name} (Visited)` : c.name}
                  />
                );
              })}

              {/* Exact 17 Geographic Dots (Scales inversely with zoom) */}
              {YELLOW_COUNTRY_DOTS.map((d) => {
                const isActive = hoveredCode === d.code || selectedCode === d.code;
                const dotR = (isActive ? 3.8 : 2.6) / zoom;
                const strokeW = 1.2 / zoom;
                const pulseR1 = 5.5 / zoom;
                const pulseR2 = 9.5 / zoom;

                return (
                  <g key={`dot-${d.code}`} style={{ pointerEvents: "none" }}>
                    {isActive && (
                      <circle cx={d.x} cy={d.y} r={pulseR1} fill="#ef4444" opacity={0.25}>
                        <animate attributeName="r" values={`${pulseR1};${pulseR2};${pulseR1}`} dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0.05;0.3" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle
                      cx={d.x}
                      cy={d.y}
                      r={dotR}
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth={strokeW}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Country count */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 pointer-events-none select-none">
            <span className="font-display text-4xl sm:text-5xl font-black text-foreground/90 tabular-nums">
              {countryCount}
            </span>
            <span className="block text-xs sm:text-sm font-medium text-muted-foreground -mt-1">
              Countries
            </span>
          </div>

          {/* Manual Zoom Controls: In, Out, Reset */}
          <div className="absolute bottom-4 right-4 z-40 flex items-center gap-1.5 bg-background/85 backdrop-blur-md p-1.5 rounded-full border border-border/70 shadow-md">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleManualZoomIn();
              }}
              disabled={zoom >= 4}
              aria-label="Zoom in"
              title="Zoom In"
              className="grid h-8 w-8 place-items-center rounded-full text-foreground hover:bg-muted active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleManualZoomOut();
              }}
              disabled={zoom <= 1}
              aria-label="Zoom out"
              title="Zoom Out"
              className="grid h-8 w-8 place-items-center rounded-full text-foreground hover:bg-muted active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <Minus className="h-4 w-4" />
            </button>
            {zoom > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetZoom();
                }}
                aria-label="Reset zoom"
                title="Reset Zoom"
                className="grid h-8 w-8 place-items-center rounded-full text-foreground hover:bg-muted active:scale-95 transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* White Solid Hover Pill: ONLY shows when hovering on yellow-filled countries */}
          {activeCountry && (
            <div
              className="absolute z-50 pointer-events-none transition-transform duration-75"
              style={{
                left: `${mousePos.x}px`,
                top: `${mousePos.y - 18}px`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-xl border border-black/10 whitespace-nowrap">
                <span className="text-base shrink-0 leading-none" role="img" aria-label={activeCountry.name}>
                  {activeCountry.flag}
                </span>
                <span className="text-xs font-bold text-neutral-900 tracking-tight">
                  {activeCountry.name}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
