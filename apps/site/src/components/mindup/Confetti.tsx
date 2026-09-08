"use client";

import { useEffect, useState } from "react";

const BRAND = "#6674B8";
const RANDOM_COLORS = ["#ffd51d", "#69A98D", "#D76E67", "#C9A35D", "#57A8A8", "#9A82C0"];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

type Piece = {
  id: number;
  x: number;
  color: string;
  w: number;
  h: number;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
  shape: "rect" | "circle";
};

function generatePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => {
    const isBrand = Math.random() < 0.3;
    const shape = Math.random() > 0.4 ? "rect" : "circle";
    const size = rand(6, 10);
    return {
      id: i,
      x: rand(2, 98),
      color: isBrand ? BRAND : RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)],
      w: shape === "rect" ? size : size * 0.6,
      h: shape === "rect" ? size * 1.5 : size * 0.6,
      delay: rand(0, 1.5),
      duration: rand(2, 3.5),
      drift: rand(-50, 50),
      rotate: rand(360, 1080),
      shape,
    };
  });
}

export function Confetti() {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    setPieces(generatePieces(60));
  }, []);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute confetti-piece"
          style={{
            left: `${p.x}%`,
            top: "-12px",
            width: p.w,
            height: p.h,
            borderRadius: p.shape === "circle" ? "50%" : "1.5px",
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--drift" as string]: `${p.drift}px`,
            ["--rotate" as string]: `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
}
