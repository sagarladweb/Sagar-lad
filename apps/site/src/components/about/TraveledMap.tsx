"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  WORLD_MAP_VIEWBOX,
  WORLD_COUNTRIES,
  VISITED_COUNTRIES_ORDER,
  type CountryData,
} from "./world-map-paths";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// 17 countries that get a dot marker on the map
const DOT_COUNTRIES = new Set([
  "IN", "BE", "LU", "IT", "HU", "AT", "CH", "ES", "FR",
  "PT", "DE", "GB", "CA", "AE", "NL", "HR", "IS",
]);

// Fixed dot positions (SVG coordinates) for the 17 countries
const DOT_POSITIONS: Record<string, { x: number; y: number }> = {
  IN: { x: 588, y: 498 },
  BE: { x: 432, y: 361 },
  LU: { x: 438, y: 364 },
  IT: { x: 458, y: 390 },
  HU: { x: 468, y: 372 },
  AT: { x: 454, y: 368 },
  CH: { x: 438, y: 372 },
  ES: { x: 418, y: 402 },
  FR: { x: 428, y: 378 },
  PT: { x: 410, y: 398 },
  DE: { x: 448, y: 358 },
  GB: { x: 426, y: 346 },
  CA: { x: 185, y: 305 },
  AE: { x: 530, y: 445 },
  NL: { x: 436, y: 354 },
  HR: { x: 462, y: 380 },
  IS: { x: 390, y: 290 },
};

export function TraveledMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  // Hover state
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Country count animation
  const [countryCount, setCountryCount] = useState(0);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);

  const visitedCountries = useMemo(
    () => VISITED_COUNTRIES_ORDER.map((code) => WORLD_COUNTRIES[code]).filter(Boolean) as CountryData[],
    []
  );

  const activeCountry = hoveredCode ? WORLD_COUNTRIES[hoveredCode] : null;

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // GSAP ScrollTrigger — country count animation
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

  // Click to zoom on cursor / click again to zoom out
  const handleCountryClick = useCallback(
    (c: CountryData, e: React.MouseEvent<SVGPathElement>) => {
      if (!c.visited) return;

      // If clicking the same country, zoom out
      if (selectedCode === c.code) {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setSelectedCode(null);
        return;
      }

      // Zoom in centered on click position
      const viewport = containerRef.current?.querySelector("[data-map-viewport]") as HTMLElement;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      const clickX = e.clientX - rect.left - rect.width / 2;
      const clickY = e.clientY - rect.top - rect.height / 2;

      const targetZoom = 2;
      const targetPanX = -clickX * (targetZoom - 1);
      const targetPanY = -clickY * (targetZoom - 1);

      const maxBound = rect.width * (targetZoom - 1) * 0.4;
      setZoom(targetZoom);
      setPan({
        x: Math.max(-maxBound, Math.min(maxBound, targetPanX)),
        y: Math.max(-maxBound, Math.min(maxBound, targetPanY)),
      });
      setSelectedCode(c.code);
    },
    [selectedCode]
  );

  return (
    <div ref={containerRef} className="w-full space-y-4">
      <div className="relative w-full overflow-hidden">
        <div
          data-map-viewport
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
          onMouseLeave={() => setHoveredCode(null)}
          className="relative w-full aspect-[16/9.5] sm:aspect-[16/9] min-h-[340px] sm:min-h-[460px] md:min-h-[520px] flex items-center justify-center"
        >
          {/* Transform layer with zoom/pan */}
          <div
            className="w-full h-full flex items-center justify-center origin-center transition-transform"
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`,
              transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
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
                      transition: "fill 0.2s ease, stroke 0.2s ease, opacity 0.3s ease",
                      transitionDelay: hasEnteredViewport && isVisited ? `${orderIndex * 35}ms` : "0ms",
                      cursor: isVisited ? "pointer" : "default",
                    }}
                    fill={
                      isVisited
                        ? hasEnteredViewport
                          ? "#ffd51d"
                          : "#fef08a"
                        : "#f1f5f9"
                    }
                    stroke={
                      isHighlighted
                        ? "#000000"
                        : isVisited
                        ? "#ca8a04"
                        : "#cbd5e1"
                    }
                    strokeWidth={
                      isHighlighted ? 1.8 : isVisited ? 0.9 : 0.45
                    }
                    strokeLinejoin="round"
                    className="focus:outline-none"
                    tabIndex={isVisited ? 0 : -1}
                    aria-label={isVisited ? `${c.name} (Visited)` : c.name}
                  />
                );
              })}

              {/* Dots only for the 17 specific countries */}
              {Object.entries(DOT_POSITIONS).map(([code, pos]) => {
                const isActive = hoveredCode === code || selectedCode === code;
                return (
                  <g key={`dot-${code}`}>
                    {isActive && (
                      <circle cx={pos.x} cy={pos.y} r={7} fill="#ef4444" opacity={0.2}>
                        <animate attributeName="r" values="5;9;5" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.25;0.08;0.25" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isActive ? 4 : 3}
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      className="pointer-events-none"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Country count overlay */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 pointer-events-none select-none">
            <span className="font-display text-4xl sm:text-5xl font-black text-foreground/90 tabular-nums">
              {countryCount}
            </span>
            <span className="block text-xs sm:text-sm font-medium text-muted-foreground -mt-1">
              Countries
            </span>
          </div>

          {/* Hover tooltip — flag + country name only */}
          {activeCountry && (
            <div
              className="absolute z-50 pointer-events-none"
              style={{ left: `${mousePos.x + 16}px`, top: `${mousePos.y - 16}px` }}
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-lg border border-black/10 whitespace-nowrap">
                <span className="text-sm shrink-0" role="img" aria-label={activeCountry.name}>
                  {activeCountry.flag || "📍"}
                </span>
                <span className="text-xs font-bold text-black">
                  {activeCountry.code === "IN"
                    ? "India"
                    : activeCountry.code === "HU"
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
    </div>
  );
}
