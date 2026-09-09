"use client";

import { useEffect, useRef, useState } from "react";

interface AuthOverlayProps {
  type: "success" | "error";
  message?: string;
  onComplete?: () => void;
}

export function AuthOverlay({ type, message, onComplete }: AuthOverlayProps) {
  const [phase, setPhase] = useState<"enter" | "draw" | "done">("enter");
  const isSuccess = type === "success";
  const cbRef = useRef(onComplete);
  cbRef.current = onComplete;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("draw"), 100);
    const t2 = setTimeout(() => setPhase("done"), 1200);
    const t3 = setTimeout(() => cbRef.current?.(), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: isSuccess
          ? "linear-gradient(135deg, #059669 0%, #10b981 40%, #34d399 100%)"
          : "linear-gradient(135deg, #dc2626 0%, #ef4444 40%, #f87171 100%)",
        animation: "authFadeIn 0.3s ease-out",
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)" }}
      />

      <div className="relative z-10" style={{ width: 180, height: 180 }}>
        <svg viewBox="0 0 180 180" className="w-full h-full">
          <circle
            cx="90" cy="90" r="85"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            className={phase !== "enter" ? "ring-pulse" : ""}
          />
          <circle
            cx="90" cy="90" r="72"
            fill="white"
            className={phase !== "enter" ? "circle-scale" : ""}
            style={{ transformOrigin: "90px 90px" }}
          />
          {isSuccess ? (
            <polyline
              points="52,92 78,118 128,68"
              fill="none"
              stroke="#10b981"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={phase === "draw" || phase === "done" ? "check-draw" : ""}
              style={{ strokeDasharray: 120, strokeDashoffset: 120 }}
            />
          ) : (
            <g className={phase === "draw" || phase === "done" ? "cross-draw" : ""}>
              <line
                x1="60" y1="60" x2="120" y2="120"
                stroke="#ef4444"
                strokeWidth="8"
                strokeLinecap="round"
                style={{ strokeDasharray: 90, strokeDashoffset: 90 }}
              />
              <line
                x1="120" y1="60" x2="60" y2="120"
                stroke="#ef4444"
                strokeWidth="8"
                strokeLinecap="round"
                style={{ strokeDasharray: 90, strokeDashoffset: 90 }}
              />
            </g>
          )}
        </svg>
      </div>

      <div className="relative z-10 mt-6 text-center">
        <p className="text-3xl font-bold text-white tracking-tight">
          {isSuccess ? "Welcome Back" : "Access Denied"}
        </p>
        {message && (
          <p className="mt-3 text-sm text-white/80 max-w-xs">{message}</p>
        )}
        {isSuccess && (
          <p className="mt-4 text-xs text-white/60 uppercase tracking-widest">
            Redirecting to dashboard...
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes authFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ringPulse {
          0% { r: 72; opacity: 0; }
          50% { r: 85; opacity: 0.5; }
          100% { r: 85; opacity: 0; }
        }
        @keyframes circleScale {
          0% { transform: scale(0); }
          60% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
        @keyframes drawCross {
          to { stroke-dashoffset: 0; }
        }
        .ring-pulse {
          animation: ringPulse 1s ease-out forwards;
        }
        .circle-scale {
          animation: circleScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .check-draw {
          animation: drawCheck 0.6s ease-out 0.3s forwards;
        }
        .cross-draw line:first-child {
          animation: drawCross 0.4s ease-out 0.3s forwards;
        }
        .cross-draw line:last-child {
          animation: drawCross 0.4s ease-out 0.45s forwards;
        }
      `}</style>
    </div>
  );
}
