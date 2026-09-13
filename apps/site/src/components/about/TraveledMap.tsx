"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  WORLD_MAP_VIEWBOX,
  WORLD_COUNTRIES,
  VISITED_COUNTRIES_ORDER,
  type CountryData,
} from "./world-map-paths";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// 17 countries that get yellow fill + dot marker
const YELLOW_COUNTRIES = new Set([
  "IN", "BE", "LU", "IT", "HU", "AT", "CH", "ES", "FR",
  "PT", "DE", "GB", "CA", "AE", "NL", "HR", "IS",
]);

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

  // Dot centers computed from SVG paths
  const [dotCenters, setDotCenters] = useState<{ code: string; x: number; y: number }[]>([]);

  const visitedCountries = useMemo(
    () => VISITED_COUNTRIES_ORDER.map((code) => WORLD_COUNTRIES[code]).filter(Boolean) as CountryData[],
    []
  );

  const activeCountry = hoveredCode ? WORLD_COUNTRIES[hoveredCode] : null;

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  // Compute dot centers from SVG paths for the 17 yellow countries
  useEffect(() => {
    if (!hasEnteredViewport) return;
    const svg = svgRef.current;
    if (!svg) return;

    const centers = Array.from(YELLOW_COUNTRIES)
      .map((code) => {
        const el = svg.querySelector(`#map-country-${code}`) as SVGGeometryElement | null;
        if (!el) return null;
        const bbox = el.getBBox();
        return { code, x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 };
      })
      .filter(Boolean) as { code: string; x: number; y: number }[];

    setDotCenters(centers);
  }, [hasEnteredViewport]);

  // GSAP country count animation
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

  // Click to zoom / click again to zoom out
  const handleCountryClick = useCallback(
    (c: CountryData, e: React.MouseEvent<SVGPathElement>) => {
      if (!c.visited) return;

      if (selectedCode === c.code) {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setSelectedCode(null);
        return;
      }

      const viewport = containerRef.current?.querySelector("[data-map-vp]") as HTMLElement;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      const clickX = e.clientX - rect.left - rect.width / 2;
      const clickY = e.clientY - rect.top - rect.height / 2;

      const targetZoom = 2;
      const maxBound = rect.width * (targetZoom - 1) * 0.4;
      setZoom(targetZoom);
      setPan({
        x: Math.max(-maxBound, Math.min(maxBound, -clickX * (targetZoom - 1))),
        y: Math.max(-maxBound, Math.min(maxBound, -clickY * (targetZoom - 1))),
      });
      setSelectedCode(c.code);
    },
    [selectedCode]
  );

  return (
    <div ref={containerRef} className="w-full space-y-4">
      <div className="relative w-full overflow-hidden">
        <div
          data-map-vp
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
          onMouseLeave={() => setHoveredCode(null)}
          className="relative w-full aspect-[16/9.5] sm:aspect-[16/9] min-h-[340px] sm:min-h-[460px] md:min-h-[520px] flex items-center justify-center"
        >
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
                    onClick={(e) => handleCountryClick(c, e)}
                    onMouseEnter={() => {
                      if (!isTouchDevice && isVisited) setHoveredCode(c.code);
                    }}
                    onMouseLeave={() => {
                      if (!isTouchDevice) setHoveredCode(null);
                    }}
                    style={{
                      transition: "fill 0.2s ease, stroke 0.2s ease",
                      transitionDelay: hasEnteredViewport && isYellow ? `${orderIndex * 35}ms` : "0ms",
                      cursor: isVisited ? "pointer" : "default",
                    }}
                    fill={
                      isYellow
                        ? hasEnteredViewport
                          ? "#ffd51d"
                          : "#fef08a"
                        : isVisited
                        ? "#e2e8f0"
                        : "#f1f5f9"
                    }
                    stroke={
                      isHighlighted
                        ? "#000000"
                        : isYellow
                        ? "#ca8a04"
                        : isVisited
                        ? "#94a3b8"
                        : "#cbd5e1"
                    }
                    strokeWidth={
                      isHighlighted ? 1.8 : isYellow ? 0.9 : 0.45
                    }
                    strokeLinejoin="round"
                    className="focus:outline-none"
                    tabIndex={isVisited ? 0 : -1}
                    aria-label={isVisited ? `${c.name} (Visited)` : c.name}
                  />
                );
              })}

              {/* Dot markers — scaled inversely with zoom so they stay consistent on screen */}
              {dotCenters.map((d) => {
                const isActive = hoveredCode === d.code || selectedCode === d.code;
                const dotR = (isActive ? 3.5 : 2.5) / zoom;
                const strokeW = 1.2 / zoom;
                const pulseR1 = 5 / zoom;
                const pulseR2 = 9 / zoom;
                const hitR = 8 / zoom; // larger invisible hit area for small countries
                return (
                  <g key={`dot-${d.code}`}>
                    {/* Invisible hit area — easier to hover small countries */}
                    <circle
                      cx={d.x}
                      cy={d.y}
                      r={hitR}
                      fill="transparent"
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => { if (!isTouchDevice) setHoveredCode(d.code); }}
                      onMouseLeave={() => { if (!isTouchDevice) setHoveredCode(null); }}
                    />
                    {isActive && (
                      <circle cx={d.x} cy={d.y} r={pulseR1} fill="#ef4444" opacity={0.2}>
                        <animate attributeName="r" values={`${pulseR1};${pulseR2};${pulseR1}`} dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.25;0.08;0.25" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle
                      cx={d.x}
                      cy={d.y}
                      r={dotR}
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth={strokeW}
                      className="pointer-events-none"
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

          {/* Hover pill — flag + country name only, offset further when zoomed */}
          {activeCountry && (
            <div
              className="absolute z-50 pointer-events-none"
              style={{
                left: `${mousePos.x + 16 * zoom}px`,
                top: `${mousePos.y - 20 * zoom}px`,
              }}
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
