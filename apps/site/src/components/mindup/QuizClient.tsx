"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { QUIZ_QUESTIONS, calculateResult, type QuizAnswer, type QuizResult } from "@/lib/mindup-quiz";
import { ResultsView } from "./ResultsView";
import { ArrowLeft, Check, Brain } from "lucide-react";
import { MINDUP_PILLARS } from "@/lib/mindup";

function getPillarColor(pillarId: string): string {
  return MINDUP_PILLARS.find((p) => p.id === pillarId)?.color ?? "var(--brand)";
}

function AnalyzingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // animated ellipsis
  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 300);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1500;
    let raf: number;
    let done = false;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased * 100);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!done) {
        done = true;
        setTimeout(() => onDoneRef.current(), 300);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); done = true; };
  }, []);

  const circumference = 2 * Math.PI * 34;
  const offset = circumference * (1 - progress / 100);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="mx-auto max-w-sm w-full text-center">
        <div className="relative mx-auto mb-8 w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="5" />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="var(--brand)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-7 h-7 text-brand animate-pulse" />
          </div>
        </div>

        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-3">
          Analyzing your answers{dots}
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Finding your strongest and weakest pillars
        </p>

        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-xs font-semibold text-muted-foreground tabular-nums">
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}

const STORAGE_KEY = "mindup-quiz-result";

export function QuizClient() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [analyzing, setAnalyzing] = useState<QuizResult | null>(null);

  const question = QUIZ_QUESTIONS[current];
  const progress = ((current + 1) / QUIZ_QUESTIONS.length) * 100;
  const isLast = current === QUIZ_QUESTIONS.length - 1;
  const selectedValue = answers.find((a) => a.pillarId === question?.pillarId)?.value;

  const selectAnswer = useCallback(
    (value: number) => {
      const updated = answers.filter((a) => a.pillarId !== question.pillarId);
      updated.push({ pillarId: question.pillarId, value });
      setAnswers(updated);

      setTimeout(() => {
        if (isLast) {
          // compute result now, show analyzing animation, then reveal
          const computed = calculateResult(updated);
          setAnalyzing(computed);
        } else {
          setCurrent((c) => c + 1);
        }
      }, 280);
    },
    [answers, question, isLast],
  );

  if (result) {
    return (
      <ResultsView
        result={result}
        onRestart={() => {
          localStorage.removeItem(STORAGE_KEY);
          setCurrent(0);
          setAnswers([]);
          setResult(null);
          setAnalyzing(null);
        }}
      />
    );
  }

  if (analyzing) {
    return (
      <AnalyzingScreen
        onDone={() => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(analyzing));
          setResult(analyzing);
          setAnalyzing(null);
        }}
      />
    );
  }

  const dotColor = getPillarColor(question.pillarId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="mx-auto max-w-lg px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1">
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-400 ease-out"
                style={{ width: `${progress}%`, backgroundColor: dotColor }}
              />
            </div>
          </div>
          <span className="text-xs font-semibold text-muted-foreground tabular-nums">
            {current + 1}/{QUIZ_QUESTIONS.length}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="mx-auto max-w-lg w-full">
          {/* Pillar label */}
          <div className="flex items-center gap-2 mb-8">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: dotColor }}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {MINDUP_PILLARS.find((p) => p.id === question.pillarId)?.short}
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-snug mb-8">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-2.5">
            {question.options.map((opt) => {
              const active = selectedValue === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => selectAnswer(opt.value)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-200 ${
                    active
                      ? "border-foreground bg-muted shadow-sm"
                      : "border-border bg-card hover:border-foreground/30 hover:bg-muted/50"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-all ${
                      active
                        ? "bg-foreground text-background"
                        : "bg-border text-muted-foreground"
                    }`}
                  >
                    {opt.value}
                  </span>
                  <span className={`text-sm font-medium flex-1 text-left ${active ? "text-foreground" : "text-muted-foreground"}`}>
                    {opt.label}
                  </span>
                  {active && <Check className="w-4 h-4 text-foreground shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
