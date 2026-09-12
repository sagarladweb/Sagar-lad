"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  WORLD_MAP_VIEWBOX,
  WORLD_COUNTRIES,
  VISITED_COUNTRIES_ORDER,
  type CountryData,
} from "./world-map-paths";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function TraveledMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapViewportRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [hasMovedDuringClick, setHasMovedDuringClick] = useState(false);

  // Hovered / Selected country
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, flipY: false });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Stats count animation
  const [countryCount, setCountryCount] = useState(0);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);

  // Visited countries list
  const visitedCountries = VISITED_COUNTRIES_ORDER.map(
    (code) => WORLD_COUNTRIES[code]
  ).filter(Boolean) as CountryData[];

  const activeCountry =
    (hoveredCode ? WORLD_COUNTRIES[hoveredCode] : null) ||
    (selectedCode ? WORLD_COUNTRIES[selectedCode] : null);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice(
      "ontouchstart" in window || navigator.maxTouchPoints > 0
    );
  }, []);

  // GSAP ScrollTrigger Entrance Animation for Counter
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
            onUpdate: () => {
              setCountryCount(Math.round(counterObj.val));
            },
          });
        },
      });
    }, el);

    return () => ctx.revert();
  }, [visitedCountries.length]);

  // Target zoom levels tailored for each visited country's geography
  const getCountryZoom = (code: string, bboxDim: number) => {
    const customZoom: Record<string, number> = {
      CA: 2.2,
      IN: 2.7,
      GB: 3.4,
      FR: 3.4,
      ES: 3.4,
      DE: 3.6,
      IT: 3.6,
      IS: 3.5,
      PT: 3.8,
      AT: 4.2,
      HU: 4.2,
      HR: 4.2,
      CH: 4.5,
      NL: 4.5,
      BE: 4.5,
      LU: 5.0,
      AE: 4.2,
    };
    if (customZoom[code]) return customZoom[code];
    if (bboxDim < 25) return 4.5;
    if (bboxDim < 60) return 3.5;
    return 2.5;
  };

  // Reset zoom & pan to 1x
  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedCode(null);
  }, []);

  // Zoom into a specific point on the map
  const zoomToPoint = useCallback((clientX: number, clientY: number, targetScale = 2.8) => {
    const viewport = mapViewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();

    // Position relative to viewport center
    const relX = clientX - rect.left - rect.width / 2;
    const relY = clientY - rect.top - rect.height / 2;

    const unzoomedX = (relX - pan.x) / zoom;
    const unzoomedY = (relY - pan.y) / zoom;

    const newZoom = targetScale;
    const newPanX = -unzoomedX * newZoom;
    const newPanY = -unzoomedY * newZoom;

    const maxBound = 520 * (newZoom - 1);
    setZoom(newZoom);
    setPan({
      x: Math.max(-maxBound, Math.min(maxBound, newPanX)),
      y: Math.max(-maxBound, Math.min(maxBound, newPanY)),
    });
  }, [pan.x, pan.y, zoom]);

  // Double-click / double-tap zoom toggle
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (zoom > 1.1) {
      handleResetZoom();
    } else {
      zoomToPoint(e.clientX, e.clientY, 2.8);
    }
  };

  // Drag-to-pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setHasMovedDuringClick(false);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const viewport = mapViewportRef.current;
    if (viewport) {
      const rect = viewport.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;

      // Smart clamping: tooltip is ~220px wide
      const tooltipW = 220;
      const margin = 16;
      const clampedX = Math.max(
        margin + tooltipW / 2,
        Math.min(rect.width - margin - tooltipW / 2, rawX)
      );
      const flipY = rawY < 95;

      setTooltipPos({ x: clampedX, y: rawY, flipY });
    }

    if (!isPanning || zoom <= 1.05) return;
    setHasMovedDuringClick(true);
    const maxBound = 520 * (zoom - 1);
    const nextX = Math.max(-maxBound, Math.min(maxBound, e.clientX - startPan.x));
    const nextY = Math.max(-maxBound, Math.min(maxBound, e.clientY - startPan.y));
    setPan({ x: nextX, y: nextY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Wheel zoom: Only with Ctrl/Cmd key pressed so regular scroll is never hijacked
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.003;
      const newZoom = Math.min(5, Math.max(1, zoom + delta));
      setZoom(newZoom);
      if (newZoom === 1) setPan({ x: 0, y: 0 });
    }
  };

  // Mobile touch gestures (pinch & tap)
  const touchStartDist = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchStartDist.current;
      setZoom((prev) => Math.min(5, Math.max(1, prev * ratio)));
      touchStartDist.current = dist;
    }
  };

  const handleTouchEnd = () => {
    touchStartDist.current = null;
  };

  // When clicking a country on the map: zoom smoothly to where cursor is placed
  const handleCountryClick = (c: CountryData, e: React.MouseEvent<SVGPathElement>) => {
    if (hasMovedDuringClick) return;
    if (!c.visited) return;

    // Toggle if clicking the same already zoomed-in country
    if (selectedCode === c.code && zoom > 1.15) {
      handleResetZoom();
      return;
    }

    setSelectedCode(c.code);
    setHoveredCode(c.code);

    const viewportEl = mapViewportRef.current;
    if (!viewportEl) return;
    const vpRect = viewportEl.getBoundingClientRect();

    // Center coordinates of the viewport
    const vpCenterX = vpRect.left + vpRect.width / 2;
    const vpCenterY = vpRect.top + vpRect.height / 2;

    // Offset of the cursor click relative to current viewport center
    const clickOffsetX = e.clientX - vpCenterX;
    const clickOffsetY = e.clientY - vpCenterY;

    // Point in invariant unzoomed/unpanned coordinate space
    const unzoomedX = (clickOffsetX - pan.x) / zoom;
    const unzoomedY = (clickOffsetY - pan.y) / zoom;

    // Appropriate zoom factor so user sees the country and surrounding context clearly
    const targetZoom = 2.4;

    const targetPanX = -unzoomedX * targetZoom;
    const targetPanY = -unzoomedY * targetZoom;

    const maxBoundX = vpRect.width * (targetZoom - 1);
    const maxBoundY = vpRect.height * (targetZoom - 1);

    const clampedX = Math.max(-maxBoundX, Math.min(maxBoundX, targetPanX));
    const clampedY = Math.max(-maxBoundY, Math.min(maxBoundY, targetPanY));

    setZoom(targetZoom);
    setPan({ x: clampedX, y: clampedY });

    // Position tooltip nicely at the center above the country
    setTooltipPos({
      x: vpRect.width / 2,
      y: Math.max(50, vpRect.height / 2 - 30),
      flipY: false,
    });
  };

  return (
    <div ref={containerRef} className="w-full space-y-6">
      {/* ── Top Bar: Countries count + zoom controls ── */}
      <div className="flex items-center justify-between gap-4">
        {/* Countries Card */}
        <div className="flex items-center justify-start gap-2 px-4 py-2.5 rounded-xl bg-card border border-border/80 shadow-xs h-11">
          <span className="font-display font-bold text-base sm:text-lg text-foreground tabular-nums">
            {countryCount}
          </span>
          <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
            Countries
          </span>
        </div>

        {/* Desktop-only Simple Pills (Without Icon) */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted/60 text-muted-foreground border border-border/60">
            Click to zoom
          </span>

          {zoom > 1.05 && (
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-black text-white dark:bg-white dark:text-black shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
            >
              Reset view
            </button>
          )}
        </div>
      </div>

      {/* ── Clean Map Canvas (No Outer Card Frame / No Layout Borders) ── */}
      <div className="relative w-full overflow-hidden select-none">
        <div
          ref={mapViewportRef}
          onDoubleClick={handleDoubleClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative w-full aspect-[16/9.5] sm:aspect-[16/9] min-h-[340px] sm:min-h-[460px] md:min-h-[520px] flex items-center justify-center cursor-${
            zoom > 1.05 ? (isPanning ? "grabbing" : "grab") : "default"
          }`}
        >
          {/* Animated Transform Layer */}
          <div
            className="w-full h-full flex items-center justify-center origin-center transition-transform"
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`,
              transition: isPanning
                ? "none"
                : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <svg
              ref={svgRef}
              viewBox={WORLD_MAP_VIEWBOX}
              className="w-full h-full max-h-full object-contain"
              style={{ overflow: "visible" }}
            >
              {/* All World Countries */}
              {Object.values(WORLD_COUNTRIES).map((c) => {
                const isVisited = c.visited;
                const isHovered = hoveredCode === c.code;
                const isSelected = selectedCode === c.code;
                const isHighlighted = isHovered || isSelected;

                const orderIndex = c.order ?? 99;

                return (
                  <path
                    key={c.code}
                    id={`map-country-${c.code}`}
                    d={c.d}
                    onClick={(e) => handleCountryClick(c, e)}
                    onMouseEnter={() => {
                      if (!isTouchDevice && isVisited) setHoveredCode(c.code);
                    }}
                    onMouseLeave={() => {
                      if (!isTouchDevice) setHoveredCode(null);
                    }}
                    style={{
                      transition:
                        "fill 0.2s ease, stroke 0.2s ease, opacity 0.3s ease",
                      transitionDelay:
                        hasEnteredViewport && isVisited
                          ? `${orderIndex * 35}ms`
                          : "0ms",
                      cursor: isVisited ? "pointer" : "default",
                    }}
                    // 1. Visited countries filled with yellow (#ffd51d)
                    fill={
                      isVisited
                        ? hasEnteredViewport
                          ? "#ffd51d"
                          : "#fef08a"
                        : "#f1f5f9"
                    }
                    // 2. Hover to black border on the map of that country rather than yellow
                    stroke={
                      isHighlighted
                        ? "#000000" // Black border on hover as requested
                        : isVisited
                        ? "#ca8a04" // Subtle golden amber border when not hovered
                        : "#cbd5e1" // Subtle light slate for unvisited
                    }
                    strokeWidth={
                      isHighlighted
                        ? 1.8 / zoom
                        : isVisited
                        ? 0.9 / zoom
                        : 0.45 / zoom
                    }
                    strokeLinejoin="round"
                    className="focus:outline-none"
                    tabIndex={isVisited ? 0 : -1}
                    aria-label={isVisited ? `${c.name} (Visited)` : c.name}
                  />
                );
              })}
            </svg>
          </div>

          {/* ── Red Dot Hover Indicator ── */}
          {activeCountry && (
            <div
              className="absolute z-40 pointer-events-none transition-all duration-150 ease-out"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Pulsing red dot */}
              <div className="relative flex items-center justify-center">
                <span className="absolute w-4 h-4 rounded-full bg-red-500/30 animate-ping" />
                <span className="relative w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white shadow-md" />
              </div>
              {/* Minimal label below dot */}
              <div
                className="absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/95 dark:bg-zinc-900/95 border border-border/60 shadow-sm"
              >
                <span className="text-sm shrink-0" role="img" aria-label={activeCountry.name}>
                  {activeCountry.flag || "📍"}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {activeCountry.code === "HU"
                    ? "Hungary"
                    : activeCountry.code === "AE"
                    ? "UAE"
                    : activeCountry.name}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile-Only Bottom Center Aligned Chip (Click to Zoom & Reset) ── */}
      <div className="flex sm:hidden items-center justify-center gap-2 pt-1">
        <span className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-muted/70 text-muted-foreground border border-border/60 shadow-xs">
          Click to zoom
        </span>

        {zoom > 1.05 && (
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-black text-white dark:bg-white dark:text-black shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Reset view
          </button>
        )}
      </div>
    </div>
  );
}
