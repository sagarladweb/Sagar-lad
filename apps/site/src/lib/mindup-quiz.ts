/**
 * MindUp Score — quiz questions, scoring, and result types.
 *
 * 6 questions (one per pillar), each on a 1–5 Likert scale.
 * Score per pillar = (answer - 1) × 25  →  0–100 range.
 * Total MindUp Score = average of all pillar scores.
 */

import { MINDUP_PILLARS, type MindUpPillar } from "./mindup";

export type QuizAnswer = {
  pillarId: string;
  value: number; // 1–5
};

export type PillarResult = {
  pillar: MindUpPillar;
  score: number; // 0–100
  label: "Weak" | "Developing" | "Strong" | "Excellent";
};

export type QuizResult = {
  totalScore: number; // 0–100
  pillars: PillarResult[];
  strongest: PillarResult;
  weakest: PillarResult;
};

export type QuizQuestion = {
  pillarId: string;
  question: string;
  options: { value: number; label: string }[];
};

const LABELS: [number, string][] = [
  [80, "Excellent"],
  [60, "Strong"],
  [40, "Developing"],
  [0, "Weak"],
];

function scoreLabel(score: number): "Weak" | "Developing" | "Strong" | "Excellent" {
  for (const [threshold, label] of LABELS) {
    if (score >= threshold) return label as "Weak" | "Developing" | "Strong" | "Excellent";
  }
  return "Weak";
}

/** Convert a 1–5 answer to a 0–100 score. */
export function answerToScore(value: number): number {
  return Math.round(((Math.max(1, Math.min(5, value)) - 1) / 4) * 100);
}

/** Calculate full quiz result from 6 answers. */
export function calculateResult(answers: QuizAnswer[]): QuizResult {
  const pillars = MINDUP_PILLARS.map((pillar) => {
    const answer = answers.find((a) => a.pillarId === pillar.id);
    const score = answerToScore(answer?.value ?? 3);
    return { pillar, score, label: scoreLabel(score) };
  });

  const totalScore = Math.round(pillars.reduce((sum, p) => sum + p.score, 0) / pillars.length);
  const strongest = pillars.reduce((a, b) => (a.score >= b.score ? a : b));
  const weakest = pillars.reduce((a, b) => (a.score <= b.score ? a : b));

  return { totalScore, pillars, strongest, weakest };
}

const QUESTIONS_MAP: Record<string, string> = {
  M: "I stay calm under pressure and respond thoughtfully instead of reacting emotionally.",
  I: "I consistently prioritize my physical health through exercise, nutrition, and sleep.",
  N: "I invest time in building and maintaining meaningful relationships.",
  D: "I am actively developing new skills and growing in my career.",
  P: "I make small improvements every day and bounce back quickly from setbacks.",
  U: "I have a clear sense of purpose and believe in my ability to achieve my goals.",
};

/** The 6 quiz questions — one per MIND UP pillar. */
export const QUIZ_QUESTIONS: QuizQuestion[] = MINDUP_PILLARS.map((pillar) => ({
  pillarId: pillar.id,
  question: QUESTIONS_MAP[pillar.id],
  options: [
    { value: 1, label: "Strongly Disagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Neutral" },
    { value: 4, label: "Agree" },
    { value: 5, label: "Strongly Agree" },
  ],
}));
