"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  WORLD_MAP_VIEWBOX,
  WORLD_COUNTRIES,
  VISITED_COUNTRIES_ORDER,
  type CountryData,
} from "./world-map-paths";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function TraveledMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [countryCount, setCountryCount] = useState(0);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);

  const visitedCountries = useMemo(
    () => VISITED_COUNTRIES_ORDER.map((code) => WORLD_COUNTRIES[code]).filter(Boolean) as CountryData[],
    []
  );

  const activeCountry = hoveredCode ? WORLD_COUNTRIES[hoveredCode] : null;

  // Dot centers for visited countries
  const [dotCenters, setDotCenters] = useState<{ code: string; x: number; y: number }[]>([]);

  useEffect(() => {
    if (!hasEnteredViewport) return;
    const svg = svgRef.current;
    if (!svg) return;
    const centers = visitedCountries
      .map((c) => {
        const el = svg.querySelector(`#map-country-${c.code}`) as SVGGeometryElement | null;
        if (!el) return null;
        const bbox = el.getBBox();
        let x = bbox.x + bbox.width / 2;
        let y = bbox.y + bbox.height / 2;
        if (c.code === "IN") { x = 588; y = 498; }
        return { code: c.code, x, y };
      })
      .filter(Boolean) as { code: string; x: number; y: number }[];
    setDotCenters(centers);
  }, [hasEnteredViewport, visitedCountries]);

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

  return (
    <div ref={containerRef} className="w-full space-y-4">
      {/* ── Map Canvas ── */}
      <div className="relative w-full overflow-hidden">
        <div
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
          className="relative w-full aspect-[16/9.5] sm:aspect-[16/9] min-h-[340px] sm:min-h-[460px] md:min-h-[520px] flex items-center justify-center"
        >
          <svg
            ref={svgRef}
            viewBox={WORLD_MAP_VIEWBOX}
            className="w-full h-full max-h-full object-contain"
            style={{ overflow: "visible" }}
          >
            {Object.values(WORLD_COUNTRIES).map((c) => {
              const isVisited = c.visited;
              const isHovered = hoveredCode === c.code;
              const orderIndex = c.order ?? 99;

              return (
                <path
                  key={c.code}
                  id={`map-country-${c.code}`}
                  d={c.d}
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
                    isHovered
                      ? "#000000"
                      : isVisited
                      ? "#ca8a04"
                      : "#cbd5e1"
                  }
                  strokeWidth={isHovered ? 1.8 : isVisited ? 0.9 : 0.45}
                  strokeLinejoin="round"
                  className="focus:outline-none"
                  tabIndex={isVisited ? 0 : -1}
                  aria-label={isVisited ? `${c.name} (Visited)` : c.name}
                />
              );
            })}

            {/* Red dots on visited countries */}
            {dotCenters.map((d) => {
              const isActive = hoveredCode === d.code;
              return (
                <g key={`dot-${d.code}`}>
                  {isActive && (
                    <circle cx={d.x} cy={d.y} r={5} fill="#ef4444" opacity={0.25}>
                      <animate attributeName="r" values="3;7;3" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={d.x}
                    cy={d.y}
                    r={isActive ? 3.5 : 2.5}
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth={1.2}
                    className="pointer-events-none"
                  />
                </g>
              );
            })}
          </svg>

          {/* Country count overlay */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 pointer-events-none select-none">
            <span className="font-display text-4xl sm:text-5xl font-black text-foreground/90 tabular-nums">
              {countryCount}
            </span>
            <span className="block text-xs sm:text-sm font-medium text-muted-foreground -mt-1">
              Countries
            </span>
          </div>

          {/* Hover tooltip pill */}
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
                    ? "Gujarat, India"
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
