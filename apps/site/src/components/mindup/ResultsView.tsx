"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { QuizResult } from "@/lib/mindup-quiz";
import { RewardBooks } from "./RewardBooks";
import { Confetti } from "./Confetti";
import { ArrowLeft, User } from "lucide-react";
import { MINDUP_PILLARS } from "@/lib/mindup";
import dynamic from "next/dynamic";

const MindUpShareButtons = dynamic(() =>
  import("./MindUpShareButtons").then((m) => m.MindUpShareButtons)
);

function ScoreRing({ score }: { score: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const r = 64;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const offset = mounted ? circ - (pct / 100) * circ : circ;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-36 h-36 sm:w-40 sm:h-40" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 80 80)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl sm:text-5xl font-bold text-foreground">{score}</span>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

function PillarRow({
  pillarId,
  label,
  score,
  scoreLabel,
  index,
}: {
  pillarId: string;
  label: string;
  score: number;
  scoreLabel: string;
  index: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 900 + index * 120);
    return () => clearTimeout(id);
  }, [index]);

  const p = MINDUP_PILLARS.find((x) => x.id === pillarId);
  const color = p?.color ?? "#6674B8";

  return (
    <div
      className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-xl hover:bg-muted/50 transition-colors"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
      }}
    >
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-foreground truncate">{label}</span>
          <span className="text-xs font-bold tabular-nums ml-2 shrink-0" style={{ color }}>
            {score}%
          </span>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: mounted ? `${score}%` : "0%",
              backgroundColor: color,
              transition: "width 0.7s cubic-bezier(0.33, 1, 0.68, 1)",
            }}
          />
        </div>
        <span className="text-[11px] text-muted-foreground mt-1 block">{scoreLabel}</span>
      </div>
    </div>
  );
}

export function ResultsView({
  result,
  onRestart,
}: {
  result: QuizResult;
  onRestart: () => void;
}) {
  const [userName, setUserName] = useState("");
  const [pillarsData, setPillarsData] = useState<{ id: string; score: number }[]>([]);

  useEffect(() => {
    setPillarsData(
      result.pillars.map((p) => ({ id: p.pillar.id, score: p.score }))
    );
  }, [result]);
  return (
    <div className="min-h-screen bg-background">
      <Confetti />

      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-16">
        <Link
          href="/"
          className="result-animate inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 sm:mb-12"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to home
        </Link>

        {/* Desktop: two columns. Mobile: stacked. */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-12 items-start">
          {/* Left — score + insight + actions */}
          <div className="w-full lg:col-span-5">
            <div className="result-animate result-delay-1">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand mb-3">Results</p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-8 sm:mb-10">
                Your Score
              </h1>
            </div>

            <div className="result-animate result-delay-2 flex justify-center lg:justify-start mb-8 sm:mb-10">
              <ScoreRing score={result.totalScore} />
            </div>

            <div className="result-animate result-delay-3 rounded-2xl border border-border bg-card p-5 sm:p-6 mb-6 sm:mb-8">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your strongest pillar is{" "}
                <span className="font-semibold text-foreground">{result.strongest.pillar.title}</span>{" "}
                at <span className="font-semibold" style={{ color: result.strongest.pillar.color }}>
                  {result.strongest.score}%
                </span>. Your biggest growth opportunity is{" "}
                <span className="font-semibold text-foreground">{result.weakest.pillar.title}</span>{" "}
                at <span className="font-semibold" style={{ color: result.weakest.pillar.color }}>
                  {result.weakest.score}%
                </span>.
              </p>
            </div>

            <div className="result-animate result-delay-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              {/* Name input for share certificate */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name (for certificate)"
                  className="w-full rounded-full border border-border bg-card/80 pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                  maxLength={28}
                />
              </div>

              {/* Share buttons */}
              {pillarsData.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Share your score
                  </span>
                  <MindUpShareButtons
                    score={result.totalScore}
                    userName={userName || "Explorer"}
                    pillars={pillarsData}
                    status={result.strongest.label}
                  />
                </div>
              )}

              <button
                onClick={onRestart}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-8 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
              >
                Retake Quiz
              </button>
            </div>
          </div>

          {/* Right — pillar breakdown */}
          <div className="w-full lg:col-span-7 mt-8 lg:mt-0">
            <div className="result-animate result-delay-5 rounded-2xl border border-border bg-card p-5 sm:p-8">
              <h3 className="text-sm font-semibold text-foreground mb-4 sm:mb-6">Pillar Breakdown</h3>
              <div className="space-y-0.5 sm:space-y-1">
                {result.pillars.map((p, i) => (
                  <PillarRow
                    key={p.pillar.id}
                    pillarId={p.pillar.id}
                    label={p.pillar.title}
                    score={p.score}
                    scoreLabel={p.label}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reward Books Grid */}
        <RewardBooks />
      </div>
    </div>
  );
}
