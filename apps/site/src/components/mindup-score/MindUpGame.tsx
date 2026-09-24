import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { playTick, playWin, playSiren } from "./sounds";
import { CardStack } from "./CardStack";

import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  HeartPulse,
  KeyRound,
  Loader2,
  RefreshCw,
  Rocket,
  Target,
  Timer,
  Trophy,
  TrendingUp,
  UsersRound,
  X,
  Zap,
} from "lucide-react";

type PillarId = "M" | "I" | "N" | "D" | "U" | "P";
type Screen = "welcome" | "question" | "results";

type Pillar = {
  id: PillarId;
  title: string;
  shortTitle: string;
  badge: string;
  icon: typeof Brain;
  image: string;
  questions: string[];
  moveTitle: string;
  actions: string[];
  focus: string;
  reflection: string;
};

const QUESTION_SECONDS = 12;

/* XP Scoring:
   - <= 5s: 0 XP (penalizes rushed/random clicking)
   - 5s - 7s: 15 XP (fast, thoughtful)
   - 7s - 9s: 12 XP
   - 9s - 11s: 9 XP
   - 11s - 12s: 6 XP
   - >12s or timed out: 0 XP */
export function calcSingleQuestionXp(
  time: number | undefined,
  isManual: boolean,
  isTimedOut: boolean
): number {
  if (isTimedOut || !isManual || time === undefined) return 0;
  if (time <= 5) return 0;
  if (time <= 7) return 15;
  if (time <= 9) return 12;
  if (time <= 11) return 9;
  if (time <= 12) return 6;
  return 0;
}

const PUBLIC_BASE = "/images/mindup/";

type StoredResult = {
  overall: number;
  scores: Record<PillarId, number>;
  date: string;
  name?: string;
};

const QR_URL = "https://sagarlad.com/mindup-score";
const QR_SITE = "sagarlad.com";

const pillars: Pillar[] = [
  {
    id: "M",
    title: "Master Your Mindset",
    shortTitle: "Mindset",
    badge: "Mindset Explorer",
    icon: Brain,
    image: `${PUBLIC_BASE}master-your-mind.png`,
    questions: [
      "I can manage my thoughts and emotions when I face challenges.",
      "I learn from setbacks instead of allowing them to stop me.",
    ],
    moveTitle: "Your 7-Day Mindset Move",
    actions: [
      "Notice one negative thought each day.",
      "Ask: “Is this fact or assumption?”",
      "Reframe it into a more useful thought.",
      "Write down one lesson from a challenge.",
    ],
    focus: "Think better. Respond better.",
    reflection: "What thought pattern would help me respond more intentionally?",
  },
  {
    id: "I",
    title: "Invest in Your Health",
    shortTitle: "Health",
    badge: "Health Investor",
    icon: HeartPulse,
    image: `${PUBLIC_BASE}invest-in-your-health.png`,
    questions: [
      "I take care of my body through healthy habits such as sleep, movement and nutrition.",
      "I make time to manage stress, recharge and protect my energy.",
    ],
    moveTitle: "Your 7-Day Health Move",
    actions: [
      "Improve your sleep routine.",
      "Move your body for 20 minutes each day.",
      "Drink more water.",
      "Take one intentional recovery break.",
    ],
    focus: "Protect your energy.",
    reflection: "What one health habit would give me more energy this week?",
  },
  {
    id: "N",
    title: "Nurture Relationships",
    shortTitle: "Relationships",
    badge: "Relationship Builder",
    icon: UsersRound,
    image: `${PUBLIC_BASE}relationship.png`,
    questions: [
      "I make meaningful time for the people who matter to me.",
      "I communicate openly, listen well and maintain healthy relationships.",
    ],
    moveTitle: "Your 7-Day Relationship Move",
    actions: [
      "Contact someone important to you.",
      "Have one distraction-free conversation.",
      "Listen more intentionally.",
      "Express appreciation to someone.",
    ],
    focus: "Create meaningful connection.",
    reflection: "Which relationship deserves more of my full attention?",
  },
  {
    id: "D",
    title: "Develop Skills & Work",
    shortTitle: "Skills & Work",
    badge: "Skill Builder",
    icon: Rocket,
    image: `${PUBLIC_BASE}develop-skills.png`,
    questions: [
      "I regularly learn and develop skills that help me grow personally or professionally.",
      "I use my time and energy effectively on work that matters to me.",
    ],
    moveTitle: "Your 7-Day Development Move",
    actions: [
      "Choose one skill to improve.",
      "Spend 20 minutes learning each day.",
      "Remove one major distraction.",
      "Complete one important task before low-value tasks.",
    ],
    focus: "Learn. Apply. Grow.",
    reflection: "What skill would create the most meaningful momentum for me?",
  },
  {
    id: "U",
    title: "Unlock Yourself",
    shortTitle: "Unlock Yourself",
    badge: "Potential Unlocker",
    icon: KeyRound,
    image: `${PUBLIC_BASE}unlock-potential.png`,
    questions: [
      "I have the confidence and courage to step outside my comfort zone.",
      "I make time to discover my strengths, interests, purpose and potential.",
    ],
    moveTitle: "Your 7-Day Unlock Move",
    actions: [
      "Identify one limiting belief.",
      "Write down five strengths.",
      "Do one thing outside your comfort zone.",
      "Take one small action toward something meaningful.",
    ],
    focus: "Discover your potential.",
    reflection: "What could become possible if I trusted myself a little more?",
  },
  {
    id: "P",
    title: "Progress & Monitor",
    shortTitle: "Progress",
    badge: "Progress Tracker",
    icon: TrendingUp,
    image: `${PUBLIC_BASE}progress.png`,
    questions: [
      "I set goals and take consistent action toward them.",
      "I regularly review my progress and adjust what I’m doing when necessary.",
    ],
    moveTitle: "Your 7-Day Progress Move",
    actions: [
      "Choose one goal.",
      "Define one measurable action.",
      "Track it for seven days.",
      "Review your progress at the end of the week.",
    ],
    focus: "Measure. Learn. Improve.",
    reflection: "What simple measure would make my progress visible?",
  },
];

const scale = [
  { value: 5, label: "Almost Always" },
  { value: 4, label: "Often" },
  { value: 3, label: "Sometimes" },
  { value: 2, label: "Rarely" },
  { value: 1, label: "Never" },
];

const statusBands = [
  {
    min: 90,
    label: "Mind Up Master",
    lead: "You’re highly intentional about your growth.",
    description:
      "You demonstrate strong foundations across the six MIND UP dimensions. Your next opportunity is to sustain your progress and help others grow.",
    resetKicker: "Sustain & Inspire",
    resetTitle: "Your 7-Day Mastery Reset",
    resetMessage:
      "Exceptional intentionality. This week is about sustaining excellence, protecting what works, and lifting others as you grow.",
    resetTip: "Systemize one strength. Mentor one person this week.",
  },
  {
    min: 75,
    label: "Thriving",
    lead: "You’re moving with intention.",
    description:
      "You have strong foundations across your life. Keep building while paying attention to your growth zone.",
    resetKicker: "Sustain & Sharpen",
    resetTitle: "Your 7-Day Thrive Reset",
    resetMessage:
      "Strong foundations. This week sustains what works while sharpening your growth zone with focused, calm action.",
    resetTip: "Keep your best habit. Refine one edge each day.",
  },
  {
    min: 60,
    label: "Building",
    lead: "You’re building momentum.",
    description:
      "You’re doing many things right. Your next opportunity is to strengthen the areas that are holding you back.",
    resetKicker: "Build Momentum",
    resetTitle: "Your 7-Day Momentum Reset",
    resetMessage:
      "You’re doing many things right. This week turns good days into a reliable rhythm, starting with your growth zone.",
    resetTip: "Protect one focused block daily. Track every win.",
  },
  {
    min: 40,
    label: "Rising",
    lead: "You’re on your way up.",
    description:
      "You have some positive foundations, but greater consistency could make a meaningful difference.",
    resetKicker: "Build Consistency",
    resetTitle: "Your 7-Day Consistency Reset",
    resetMessage:
      "You have sparks of progress. This week is about showing up daily in your growth zone — small, repeatable wins.",
    resetTip: "Same time every day. Never miss twice.",
  },
  {
    min: 0,
    label: "Reset",
    lead: "It’s time to reset.",
    description:
      "Some important areas may need more attention. Don’t try to change everything at once. Start with your lowest-scoring area.",
    resetKicker: "Gentle Start",
    resetTitle: "Your 7-Day Gentle Reset",
    resetMessage:
      "You don’t need to fix everything. This week, one tiny win each day in your growth zone will gently rebuild momentum.",
    resetTip: "Start tiny. Ten minutes counts. Be kind to yourself.",
  },
];

const questionList = pillars.flatMap((pillar) =>
  pillar.questions.map((question) => ({ pillar, question }))
);

const frameworkTitles: Record<PillarId, string> = {
  M: "Master Your Mindset",
  I: "Invest in Your Health",
  N: "Nurture Your Relationships",
  D: "Develop Skills & Work",
  U: "Unlock Yourself",
  P: "Progress Daily & Reset Often",
};

/* Big orbit = MIND from 9 o'clock to 3 o'clock across the top.
   Small orbit = U at 7 o'clock, P at 5 o'clock.
   Angle map: 0°=3h, 30°=4h, 60°=5h, 90°=6h, 120°=7h, 150°=8h, 180°=9h, 240°=11h, 270°=12h, 300°=1h */
const orbitConfig: Record<PillarId, { angle: number; radius: number; ring: "outer" | "inner" }> = {
  M: { angle: 180, radius: 42, ring: "outer" },
  I: { angle: 240, radius: 42, ring: "outer" },
  N: { angle: 300, radius: 42, ring: "outer" },
  D: { angle: 0, radius: 42, ring: "outer" },
  U: { angle: 120, radius: 26.5, ring: "inner" },
  P: { angle: 60, radius: 26.5, ring: "inner" },
};


/* ===== MIND UP SCORING — EXACT SPEC =====
   - Each question 1..5. Each pillar = 2 questions, raw sum 2..10.
   - Pillar % = ((rawSum - 2) / 8) * 100  → 0,12.5,25,37.5,50,62.5,75,87.5,100
   - Overall = average of 6 pillar % (using exact values), rounded to nearest int for display/bands.
   - Bands: 0-39 RESET, 40-59 RISING, 60-74 BUILDING, 75-89 THRIVING, 90-100 MASTER */
function pillarPercentFromRaw(rawSum: number): number {
  const clamped = Math.min(10, Math.max(2, rawSum));
  return ((clamped - 2) / 8) * 100;
}
function calculatePillarScores(answersMap: Record<number, number>): Record<PillarId, number> {
  const next: Record<PillarId, number> = { M: 0, I: 0, N: 0, D: 0, U: 0, P: 0 };
  // Exact mapping: Q1-2→M, Q3-4→I, Q5-6→N, Q7-8→D, Q9-10→U, Q11-12→P
  pillars.forEach((pillar, pillarIndex) => {
    const a = answersMap[pillarIndex * 2];
    const b = answersMap[pillarIndex * 2 + 1];
    const first = a >= 1 && a <= 5 ? a : 1;
    const second = b >= 1 && b <= 5 ? b : 1;
    next[pillar.id] = pillarPercentFromRaw(first + second);
  });
  return next;
}
function calculateOverall(pillarScores: Record<PillarId, number>): number {
  const vals = (Object.keys(pillarScores) as PillarId[]).map((k) => pillarScores[k]);
  const avg = vals.reduce((s, v) => s + v, 0) / 6;
  return Math.round(avg);
}
function roundedPillar(score: number): number {
  return Math.round(score);
}

const motivation: { title: string; sub: string }[] = [
  { title: "Mindset locked in!", sub: "Strong start. Keep that energy going." },
  { title: "Energy invested!", sub: "2 down. You’re building momentum." },
  { title: "Halfway there!", sub: "You’re unstoppable. Push on." },
  { title: "4 of 6 complete!", sub: "Your future self is watching. Keep going." },
  { title: "Almost there!", sub: "One final push. Finish strong." },
  { title: "Journey complete!", sub: "You did it. Your score is ready." },
];

/* ---------- helpers ---------- */

function useCountUp(target: number, duration = 1400, delay = 200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const elapsed = Math.min(Math.max(now - start, 0), duration);
      const progress = 1 - Math.pow(1 - elapsed / duration, 3);
      setValue(Math.round(target * progress));
      if (elapsed < duration) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return value;
}

function polarToPercent(angleDeg: number, radiusPct: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    left: `${50 + Math.cos(rad) * radiusPct}%`,
    top: `${50 + Math.sin(rad) * radiusPct}%`,
  };
}

function getShareText(
  overall: number,
  status: string,
  scores: Record<PillarId, number>,
  growth: Pillar,
  name?: string
) {
  const who = name ? `${name} scored` : "I scored";
  return [
    `I took the MIND UP Assessment — ${who} ${overall}/100 (${status})`,
    "",
    ...pillars.map((p) => `${p.shortTitle}: ${roundedPillar(scores[p.id])}`),
    "",
    `My growth zone: ${growth.title}`,
    "What's your MIND UP score? Take the 2-minute assessment:",
    QR_URL,
  ].join("\n");
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {}
    ta.remove();
  }
}

const QR_STATIC = "/images/mindup/qr-mindup.png";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* ---------- brand icons ---------- */
function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45z" />
    </svg>
  );
}
function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07z" />
    </svg>
  );
}

/* ---------- chrome ---------- */
function Logo() {
  return (
    <div className="flex items-center" aria-label="MIND UP">
      <img src="/images/mindup/favicon-48x48.png" alt="MIND UP logo" className="h-8 w-8 rounded-md object-contain sm:h-9 sm:w-9" />
    </div>
  );
}

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-[#fffdf2]">
      <main>
        <section className="relative isolate overflow-hidden border-b border-[#f0e8bd]">
          <div className="absolute inset-0 bg-[linear-gradient(112deg,#fffdf2_0%,#fffdf2_52%,#fffbe6_52%,#fffbe6_100%)]" />
          <div className="absolute right-[-12rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full border-[90px] border-[#dce8fb]/70" aria-hidden="true" />
          <div className="absolute left-[-10rem] bottom-[-14rem] h-[26rem] w-[26rem] rounded-full border-[70px] border-[#ffd51d]/25" aria-hidden="true" />
          <div className="relative mx-auto grid min-h-[calc(100vh-180px)] max-w-[1440px] grid-cols-1 items-end gap-8 px-5 pb-24 pt-12 sm:min-h-[calc(100vh-180px)] sm:px-8 sm:pb-24 sm:items-end lg:grid-cols-[1.02fr_0.98fr] lg:gap-6 lg:px-12 lg:py-8 lg:items-center xl:px-20 lg:pb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto flex w-full max-w-[600px] items-center justify-center order-1 pb-8 sm:pb-12 lg:pb-0 lg:order-2"
            >
              <CardStack />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 max-w-[640px] order-2 lg:order-1"
            >
              <p className="mb-4 text-[11px] font-black uppercase tracking-[0.22em] text-[#b89300] sm:mb-5 sm:text-xs">
                6 dimensions · 12 questions · 12s per question
              </p>
              <h1 className="text-balance text-[clamp(3.2rem,10vw,7.5rem)] font-extrabold leading-[0.84] tracking-[0.06em] text-[#0d21a1]">
                MIND <span className="text-[#d9ae00]">UP</span>
              </h1>
              <h2 className="mt-5 text-balance text-[clamp(1.55rem,4.5vw,2.9rem)] font-bold leading-[1.06] tracking-[-0.045em] text-[#15213b] sm:mt-7">
                How MIND UP are you?
              </h2>
              <p className="mt-4 max-w-[540px] text-pretty text-[15px] leading-7 text-[#53617b] sm:mt-5 sm:text-lg">
                Discover where you stand, find your growth zone, and leave with one clear next move.
              </p>
              <div className="hidden lg:block mt-7">
                <button onClick={onStart} className="btn-premium primary-button group inline-flex items-center gap-2.5">
                  Start My MIND UP Journey
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
            <div>
              <p className="eyebrow">The framework</p>
              <h2 className="section-title mt-4">Six dimensions. One clearer picture.</h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#60708b] sm:text-base">
                MIND UP is a simple personal-growth framework. Your assessment gives you a snapshot of where you are today, not a permanent label.
              </p>
            </div>
            <div className="divide-y divide-[#f0e8bd] border-y border-[#f0e8bd]">
              {pillars.map((pillar, index) => {
                return (
                  <motion.div
                    key={pillar.id}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-[44px_1fr_auto] items-center gap-3 py-3.5 sm:grid-cols-[48px_1fr_auto] sm:py-4"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0d21a1] text-base font-black text-white sm:h-9 sm:w-9 sm:text-lg">{pillar.id}</span>
                    <span className="text-[15px] font-bold text-[#17243f] sm:text-base">{frameworkTitles[pillar.id]}</span>
                    <img src={pillar.image} alt="" loading="lazy" className="h-12 w-12 rounded-lg object-contain sm:h-14 sm:w-14" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#ffd51d] px-5 py-16 pb-24 text-[#0d21a1] sm:px-8 sm:py-20 sm:pb-24 lg:px-12 lg:pb-12">
          <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-[840px]">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0d21a1]/70 sm:text-xs">
                BEFORE YOU START
              </p>
              <h2 className="mt-4 text-[clamp(1.35rem,3.6vw,2.35rem)] font-bold leading-[1.3] tracking-[-0.03em]">
                Answer honestly based on how you have actually been living recently, not how you wish you were living — there are no wrong answers, only your starting point.
              </h2>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky CTA bar for mobile and tablet */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#f0e8bd] bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <button onClick={onStart} className="btn-premium primary-button group w-full flex items-center justify-center gap-2.5">
          Start My MIND UP Journey
          <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

/* ---------- QUESTIONS ---------- */
function JourneyProgress({ questionIndex, secondsLeft, answers, timedOut }: { questionIndex: number; secondsLeft: number; answers: Record<number, number>; timedOut: Record<number, boolean> }) {
  const currentPillarIndex = Math.floor(questionIndex / 2);
  const overallPct = ((questionIndex + 1) / 12) * 100;
  const timerDanger = secondsLeft <= 3;

  /* Per-pillar status */
  const pillarStatus = pillars.map((_, i) => {
    if (i < currentPillarIndex) {
      const a = answers[i * 2];
      const b = answers[i * 2 + 1];
      if (a !== undefined && b !== undefined) {
        if (timedOut[i * 2] && timedOut[i * 2 + 1]) return "missed";
        if (timedOut[i * 2] || timedOut[i * 2 + 1]) return "partial";
        return "done";
      }
      return "missed";
    }
    if (i === currentPillarIndex) return "current";
    return "upcoming";
  });

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#b89300] sm:text-xs sm:tracking-[0.2em]">MIND UP Journey</p>
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black tabular-nums sm:text-xs ${
              timerDanger ? "animate-pulse border-[#0d21a1] bg-[#0d21a1] text-[#ffd51d]" : "border-[#f0e8bd] bg-[#fffbe6] text-[#0d21a1]"
            }`}
            role="timer"
            aria-live="off"
          >
            <Timer size={13} strokeWidth={2.6} /> {secondsLeft}s
          </span>
          <p className="text-[13px] font-bold text-[#63708c] sm:text-sm">Question {questionIndex + 1} of 12</p>
        </div>
      </div>
      <div className="mb-2 h-[5px] overflow-hidden rounded-full bg-[#f0e8bd]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#ffd51d] to-[#ffe45c]"
          initial={false}
          animate={{ width: `${overallPct}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {pillars.map((pillar, index) => (
          <div key={pillar.id} className="flex flex-1 items-center gap-1.5 sm:gap-2.5">
            <div
              className={`progress-circle ${index < currentPillarIndex ? "is-complete" : ""} ${index === currentPillarIndex ? "is-current" : ""}`}
              aria-label={`${pillar.title}${index < currentPillarIndex ? ", completed" : ""}`}
            >
              {index === currentPillarIndex && <span className="progress-ring" aria-hidden="true" />}
              {pillarStatus[index] === "missed" ? (
                <div className="relative h-[74%] w-[74%]">
                  <img src={pillar.image} alt="" draggable={false} className="h-full w-full object-contain opacity-40 grayscale" />
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                </div>
              ) : index < currentPillarIndex ? (
                <img src={pillar.image} alt="" draggable={false} className="h-[74%] w-[74%] object-contain" />
              ) : (
                <span className="text-[11px] font-black text-[#0d21a1] sm:text-xs">{pillar.id}</span>
              )}
            </div>
            {index < pillars.length - 1 && (
              <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[#f0e8bd]">
                <motion.div
                  className={`h-full ${index < currentPillarIndex && (pillarStatus[index] === "missed" || pillarStatus[index] === "partial") ? "bg-[#dc2626]" : "bg-[#ffd51d]"}`}
                  initial={false}
                  animate={{ width: index < currentPillarIndex ? "100%" : "0%" }}
                  transition={{ duration: 0.45 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* One pillar PNG flies from the question card into its progress circle */
function FlyInAnimation({
  pillarIndex,
  isMissed,
  earnedXp,
  totalXp,
}: {
  pillarIndex: number;
  isMissed: boolean;
  earnedXp: number;
  totalXp: number;
}) {
  const pillar = pillars[pillarIndex];
  const msg = motivation[pillarIndex];
  const isLast = pillarIndex === 5;

  // Full-screen celebration for the last pillar (P)
  if (isLast) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d21a1]"
        style={{ perspective: "800px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* 3D converging lines — two layers for depth */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * 360;
          const isOuter = i % 2 === 0;
          return (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 h-[1.5px] origin-left"
              style={{
                width: isOuter ? "55vmax" : "40vmax",
                background: isOuter
                  ? "linear-gradient(90deg, rgba(255,213,29,0.8), rgba(255,213,29,0.1) 60%, transparent)"
                  : "linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.05) 50%, transparent)",
                transform: `rotate(${angle}deg) translateZ(${isOuter ? 0 : 20}px)`,
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: [0, isOuter ? 0.9 : 0.5, 0] }}
              transition={{
                duration: isOuter ? 1.4 : 1.1,
                delay: 0.1 + i * 0.03,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          );
        })}
        {/* 3D spinning ring planes */}
        {[0, 1, 2].map((ring) => (
          <motion.div
            key={ring}
            className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#ffd51d]"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateX(${60 + ring * 30}deg) rotateY(${ring * 45}deg)`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 2.5 + ring * 0.5, 3.5 + ring * 0.5],
              opacity: [0, 0.5 - ring * 0.1, 0],
              rotateX: [60 + ring * 30, 60 + ring * 30 + 90],
              rotateY: [ring * 45, ring * 45 + 120],
            }}
            transition={{
              duration: 1.8 + ring * 0.3,
              delay: 0.2 + ring * 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
        {/* 3D floating particles */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 120 + (i % 3) * 40;
          return (
            <motion.span
              key={`p${i}`}
              className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-[#ffd51d]"
              style={{ transformStyle: "preserve-3d" }}
              initial={{ x: 0, y: 0, z: 0, opacity: 0, scale: 0 }}
              animate={{
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                z: [0, 60, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{ duration: 1.6, delay: 0.4 + i * 0.08, ease: "easeOut" }}
            />
          );
        })}
        {/* Expanding ring */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#ffd51d]"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 3, 4], opacity: [0, 0.6, 0] }}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 2.5, 3.5], opacity: [0, 0.4, 0] }}
          transition={{ duration: 1.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Trophy */}
        <motion.div
          className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-[#ffd51d] shadow-[0_0_80px_rgba(255,213,29,0.5)] sm:h-36 sm:w-36"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 12 }}
        >
          <Trophy size={48} strokeWidth={2} className="text-[#0d21a1] sm:hidden" />
          <Trophy size={60} strokeWidth={2} className="text-[#0d21a1] hidden sm:block" />
        </motion.div>
        {/* XP badge */}
        <motion.div
          className="relative z-10 mt-6 flex flex-col items-center gap-2"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <span className="flex items-center gap-2 rounded-full bg-[#ffd51d] px-5 py-2 text-sm font-black text-[#0d21a1] sm:text-base">
            <Zap size={16} strokeWidth={3} /> +{totalXp} XP
          </span>
          <span className="text-2xl font-black text-white sm:text-3xl">Journey complete!</span>
          <span className="text-sm text-white/60">All 6 dimensions scored</span>
        </motion.div>
        {/* Pillar letters */}
        <motion.div
          className="relative z-10 mt-6 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          {pillars.map((p, i) => (
            <motion.span
              key={p.id}
              initial={{ y: 16, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 + i * 0.08, type: "spring", stiffness: 300, damping: 14 }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-black text-[#ffd51d] sm:h-10 sm:w-10 sm:text-sm"
            >
              {p.id}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  // Regular fly-in for pillars 1-5
  return (
    <motion.div
      className="flyin-layer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.18 } }}
      aria-hidden="true"
    >
      {isMissed ? (
        <>
          <motion.img
            src={pillar.image}
            alt=""
            draggable={false}
            className="flyin-img opacity-40 grayscale"
            initial={{ scale: 0.5, opacity: 0, y: "40vh", x: "-50%" }}
            animate={{ scale: [0.5, 0.9, 0.85, 0.3], opacity: [0, 0.6, 0.6, 0], y: ["40vh", "15vh", "10vh", "-20vh"], rotate: [0, -8, 8, -4] }}
            transition={{ duration: 1.0, times: [0, 0.3, 0.6, 1], ease: "easeOut" }}
          />
          <motion.div
            className="flyin-caption"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: [0, 1, 1, 0], y: [14, 0, 0, -8] }}
            transition={{ duration: 0.9, times: [0, 0.25, 0.7, 1] }}
          >
            <span className="flyin-xp text-[#dc2626]">
              <svg className="inline-block -mt-0.5 mr-1" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg> Skipped (+0 XP)
            </span>
            <strong>{msg.title}</strong>
            <em className="text-[#dc2626]">Time ran out</em>
          </motion.div>
        </>
      ) : (
        <>
          <motion.img
            src={pillar.image}
            alt=""
            draggable={false}
            className="flyin-img"
            initial={{ scale: 0.4, opacity: 0, rotate: -14, y: "52vh" }}
            animate={{ scale: [0.4, 1.12, 0.92, 0.2], opacity: [0, 1, 1, 0.9], rotate: [-14, 6, -3, 0], y: ["52vh", "12vh", "4vh", "-38vh"] }}
            transition={{ duration: 1.15, times: [0, 0.32, 0.55, 1], ease: [0.3, 0.9, 0.3, 1] }}
          />
          <motion.div
            className="flyin-caption"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: [0, 1, 1, 0], y: [14, 0, 0, -8] }}
            transition={{ duration: 1.0, times: [0, 0.3, 0.75, 1] }}
          >
            <span className={`flyin-xp ${earnedXp === 0 ? "text-[#b45309]" : ""}`}>
              <Zap size={12} strokeWidth={3} /> {earnedXp > 0 ? `+${earnedXp} XP` : `+0 XP`}
            </span>
            <strong>{msg.title}</strong>
            <em>{earnedXp === 0 ? "Take 5s+ to reflect" : pillar.badge}</em>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

function QuestionScreen({
  questionIndex,
  answers,
  answerTimes,
  xp,
  secondsLeft,
  flyIn,
  timedOut,
  onAnswer,
  onBack,
  onHome,
}: {
  questionIndex: number;
  answers: Record<number, number>;
  answerTimes: Record<number, number>;
  xp: number;
  secondsLeft: number;
  flyIn: number | null;
  timedOut: Record<number, boolean>;
  onAnswer: (value: number) => void;
  onBack: () => void;
  onHome: () => void;
}) {
  const current = questionList[questionIndex];
  const selected = answers[questionIndex];
  const isLocked = flyIn !== null;

  const showBigTimer = secondsLeft <= 3 && flyIn === null;

  // Tick sound for last 3 seconds
  useEffect(() => {
    if (showBigTimer && secondsLeft > 0) playTick();
  }, [secondsLeft, showBigTimer]);

  const flyInPillarXp = useMemo(() => {
    if (flyIn === null) return 0;
    const q1 = flyIn * 2;
    const q2 = flyIn * 2 + 1;
    return (
      calcSingleQuestionXp(
        answerTimes[q1],
        answers[q1] !== undefined && !timedOut[q1],
        !!timedOut[q1]
      ) +
      calcSingleQuestionXp(
        answerTimes[q2],
        answers[q2] !== undefined && !timedOut[q2],
        !!timedOut[q2]
      )
    );
  }, [flyIn, answerTimes, answers, timedOut]);

  return (
    <div className="min-h-screen bg-[#fffdf2]">
      
      <main className="relative mx-auto flex min-h-[calc(100vh-84px)] max-w-[1120px] flex-col px-4 py-5 sm:px-8 sm:py-7 lg:px-12">
        <JourneyProgress questionIndex={questionIndex} secondsLeft={secondsLeft} answers={answers} timedOut={timedOut} />

        <AnimatePresence mode="wait">
          <motion.div
            key={questionIndex}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col justify-center py-8 sm:py-12"
          >
            <div className="mb-5 flex flex-wrap items-center gap-3 sm:mb-7">
              <motion.span
                className="question-image-chip"
                initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 240, damping: 16 }}
              >
                <img src={current.pillar.image} alt="" draggable={false} />
              </motion.span>
              <span className="text-[12px] font-black uppercase tracking-[0.14em] text-[#b89300] sm:text-sm sm:tracking-[0.16em]">
                {current.pillar.id} · {current.pillar.title}
              </span>
            </div>
            <h1 className="max-w-[920px] text-balance text-[clamp(1.65rem,6vw,3.9rem)] font-bold leading-[1.12] tracking-[-0.045em] text-[#0d21a1]">
              <span className="mr-2 text-[#c2b280] sm:mr-3">{questionIndex + 1}.</span>
              {current.question}
            </h1>

            <div className="mt-8 grid gap-2.5 sm:grid-cols-5 sm:gap-2 lg:mt-10 lg:gap-3" role="radiogroup" aria-label="Choose your answer">
              {scale.map((option) => (
                <button
                  key={option.value}
                  role="radio"
                  aria-checked={selected === option.value}
                  disabled={isLocked}
                  onClick={() => onAnswer(option.value)}
                  className={`answer-option ${selected === option.value ? "is-selected" : ""} ${isLocked ? "is-locked" : ""}`}
                >
                  <span className="option-number">{option.value}</span>
                  <span className="text-[13px] font-bold sm:text-xs lg:text-sm">{option.label}</span>
                  {selected === option.value && <Check size={17} className="option-check" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between border-t border-[#f0e8bd] py-4 sm:py-5">
          <button onClick={onBack} className="text-button" disabled={isLocked}>
            <ArrowLeft size={17} /> Back
          </button>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#b89300] sm:text-xs">
            {Math.floor(questionIndex / 2) + 1} / 6 dimensions
          </p>
        </div>

        {/* Big timer overlay — last 3 seconds */}
        <AnimatePresence>
          {showBigTimer && (
            <motion.div
              key="big-timer"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-[#0d21a1]/90 text-white shadow-[0_0_60px_rgba(13,33,161,0.5)] backdrop-blur-sm sm:h-40 sm:w-40">
                <span className="text-5xl font-black tabular-nums sm:text-6xl">{secondsLeft}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ffd51d] sm:text-xs">seconds</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* XP pill — bottom center with animation */}
        <div className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2">
          <motion.div
            key={xp}
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="xp-pill"
            aria-live="polite"
          >
            <Zap size={14} strokeWidth={2.6} />
            <span>{xp} XP</span>
          </motion.div>
        </div>

        <AnimatePresence>
          {flyIn !== null && (
            <FlyInAnimation
              pillarIndex={flyIn}
              isMissed={timedOut[flyIn * 2] && timedOut[flyIn * 2 + 1]}
              earnedXp={flyInPillarXp}
              totalXp={xp}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ---------- RESULTS ---------- */
function PremiumConfetti({ count = 96 }: { count?: number }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setVisible(false), 5000);
    return () => window.clearTimeout(t);
  }, []);

  const { pieces, sparkles } = useMemo(() => {
    const palette = ["#0d21a1", "#ffd51d", "#0d21a1", "#d9ae00", "#ffe88a", "#ffffff", "#d9ae00", "#f2e396"];
    const list = Array.from({ length: count }, (_, i) => {
      const r1 = (i * 137 + 41) % 100;
      const r2 = (i * 89 + 17) % 100;
      const r3 = (i * 53 + 71) % 100;
      const r4 = (i * 29 + 13) % 100;
      const slot = i % 8;
      const emitter = slot <= 4 ? "top" : slot === 5 ? "left" : slot === 6 ? "right" : "center";
      const shapeIdx = i % 6;
      const shape = shapeIdx === 0 ? "rect" : shapeIdx === 1 ? "circle" : shapeIdx === 2 ? "ribbon" : shapeIdx === 3 ? "diamond" : shapeIdx === 4 ? "pill" : "star";
      const color = palette[(i * 3 + Math.floor(i / 6)) % palette.length];
      const isGold = color === "#ffd51d" || color === "#ffe88a" || color === "#d9ae00";
      return {
        emitter,
        shape,
        color,
        isGold,
        left: r1,
        topJitter: 68 + (r4 % 22),
        centerAngle: (r1 / 100) * Math.PI * 2,
        centerDist: 120 + (r3 % 160),
        delay: emitter === "top" ? (r2 / 100) * 1.0 : emitter === "center" ? 0.25 + (r2 / 100) * 0.5 : 0.15 + (r2 / 100) * 0.6,
        duration: emitter === "top" ? 3.0 + (r3 / 100) * 1.3 : 2.6 + (r3 / 100) * 1.2,
        w: 5 + ((i * 7) % 4) * 2.6,
        h: 8 + ((i * 11) % 5) * 2.6,
        drift: -80 + ((i * 37) % 160),
        sway: 20 + ((i * 23) % 34),
        spin: 300 + ((i * 61) % 540),
        flip: 360 + ((i * 47) % 720),
      };
    });
    const sparks = Array.from({ length: 16 }, (_, i) => ({
      left: (i * 61 + 11) % 100,
      top: 18 + ((i * 43 + 7) % 55),
      size: 4 + ((i * 13) % 3) * 2,
      delay: 0.4 + ((i * 31) % 100) / 100 * 1.4,
      dur: 1.6 + ((i * 17) % 100) / 100 * 1.2,
      gold: i % 3 !== 1,
    }));
    return { pieces: list, sparkles: sparks };
  }, [count]);

  if (!visible) return null;

  const shapeStyle = (p: (typeof pieces)[number]) => {
    const base: React.CSSProperties = {};
    if (p.shape === "circle") {
      base.width = p.w + 2.5;
      base.height = p.w + 2.5;
      base.borderRadius = "50%";
    } else if (p.shape === "ribbon") {
      base.width = 4.5;
      base.height = p.h + 12;
      base.borderRadius = 3;
    } else if (p.shape === "diamond") {
      base.width = p.w + 3;
      base.height = p.w + 3;
      base.borderRadius = 2;
    } else if (p.shape === "pill") {
      base.width = p.w + 8;
      base.height = p.w * 0.62;
      base.borderRadius = 999;
    } else if (p.shape === "star") {
      base.width = p.w + 5;
      base.height = p.w + 5;
      base.borderRadius = 2;
    } else {
      base.width = p.w;
      base.height = p.h;
      base.borderRadius = 1.5;
    }
    base.background = p.isGold
      ? `linear-gradient(135deg, #fff6c8 0%, ${p.color} 45%, #b89300 100%)`
      : p.color === "#ffffff"
        ? "#ffffff"
        : `linear-gradient(135deg, ${p.color} 0%, ${p.color} 60%, rgba(13,33,161,0.35) 130%)`;
    base.boxShadow = p.color === "#ffffff"
      ? "0 0 0 1px rgba(13,33,161,0.20), 0 2px 10px rgba(13,33,161,0.12)"
      : p.isGold
        ? "0 2px 10px rgba(217,174,0,0.45)"
        : "0 2px 10px rgba(13,33,161,0.22)";
    return base;
  };

  return (
    <div className="confetti-premium" aria-hidden="true">
      {/* ambient light beams */}
      <motion.span
        className="confetti-beam left"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 3.2, ease: "easeOut" }}
      />
      <motion.span
        className="confetti-beam right"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 3.2, delay: 0.15, ease: "easeOut" }}
      />
      {/* expanding celebration rings */}
      <motion.span
        className="confetti-ring r1"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 0.6, 0], scale: [0.4, 1.1, 1.45] }}
        transition={{ duration: 2.4, ease: "easeOut" }}
      />
      <motion.span
        className="confetti-ring r2"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 0.45, 0], scale: [0.4, 1.25, 1.7] }}
        transition={{ duration: 2.8, delay: 0.25, ease: "easeOut" }}
      />

      {pieces.map((p, i) => {
        const style: React.CSSProperties = { ...shapeStyle(p) };
        if (p.emitter === "top") {
          style.left = `${p.left}%`;
          style.top = -26;
        } else if (p.emitter === "left") {
          style.left = -12;
          style.top = `${p.topJitter}%`;
        } else if (p.emitter === "right") {
          style.left = "calc(100% + 2px)";
          style.top = `${p.topJitter}%`;
        } else {
          style.left = "50%";
          style.top = "36%";
        }
        const burstX = Math.cos(p.centerAngle) * p.centerDist;
        const isLeft = p.emitter === "left";
        const isRight = p.emitter === "right";

        const animate: any =
          p.emitter === "top"
            ? {
                y: [0, 220, 480, 760],
                x: [0, p.sway, -p.sway * 0.7, p.drift],
                opacity: [0, 1, 1, 0],
                rotate: [0, p.spin * 0.4, p.spin * 0.75, p.spin],
                scale: [0.5, 1, 1, 0.85],
              }
            : p.emitter === "center"
              ? {
                  y: [0, burstX * 0.12 - 130, 180, 560],
                  x: [0, burstX * 0.55, burstX * 0.8, burstX * 0.9 + p.drift * 0.3],
                  opacity: [0, 1, 1, 0],
                  rotate: [0, p.spin * 0.5, p.spin, p.spin * 1.3],
                  scale: [0.4, 1.1, 1, 0.85],
                }
              : {
                  y: [0, -170 - (i % 5) * 22, 120, 620],
                  x: [0, (isLeft ? 1 : -1) * (130 + (i % 6) * 22), (isLeft ? 1 : -1) * (190 + (i % 4) * 30), (isLeft ? 1 : -1) * 150 + p.drift * 0.4],
                  opacity: [0, 1, 1, 0],
                  rotate: [0, (isLeft ? 1 : -1) * p.spin * 0.6, (isLeft ? 1 : -1) * p.spin, (isLeft ? 1 : -1) * p.spin * 1.25],
                  scale: [0.5, 1.05, 1, 0.85],
                };

        return (
          <motion.span
            key={i}
            className={`confetti-piece shape-${p.shape}${isLeft || isRight ? " is-cannon" : ""}`}
            style={style}
            initial={{ y: 0, x: 0, opacity: 0, rotate: 0, scale: 0.5 }}
            animate={animate}
            transition={{ duration: p.duration, delay: p.delay, ease: [0.22, 0.7, 0.35, 1], times: [0, 0.35, 0.7, 1] }}
          />
        );
      })}

      {/* floating premium sparkles */}
      {sparkles.map((s, i) => (
        <motion.span
          key={`spark-${i}`}
          className={`confetti-sparkle${s.gold ? " is-gold" : ""}`}
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0.4, 1, 0], scale: [0, 1.2, 0.85, 1.1, 0.2], y: [0, -14, -26, -38] }}
          transition={{ duration: s.dur, delay: s.delay, ease: "easeInOut" }}
        />
      ))}

      <motion.span
        className="confetti-glow"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 0.75, 0], scale: [0.8, 1.18, 1.35] }}
        transition={{ duration: 2.4, ease: "easeOut" }}
      />
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 86;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const display = useCountUp(score, 1500, 500);
  return (
    <div className="relative h-[200px] w-[200px] shrink-0 sm:h-[228px] sm:w-[228px]">
      <div className="absolute inset-[-14px] rounded-full bg-[radial-gradient(circle,rgba(13,33,161,0.12),transparent_65%)]" aria-hidden="true" />
      <svg className="relative h-full w-full -rotate-90" viewBox="0 0 214 214" aria-hidden="true">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d21a1" />
            <stop offset="100%" stopColor="#d9ae00" />
          </linearGradient>
        </defs>
        <circle cx="107" cy="107" r={radius} fill="none" stroke="#f0e8bd" strokeWidth="14" />
        <motion.circle
          cx="107"
          cy="107"
          r={radius}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - dash }}
          transition={{ duration: 1.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-[56px] font-black leading-none tracking-normal text-[#0d21a1] sm:text-[68px]"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          {display}
        </motion.span>
        <span className="mt-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#71809b] sm:text-xs">out of 100</span>
      </div>
    </div>
  );
}

function CertificatePreview({
  name,
  overall,
  status,
  scores,
}: {
  name: string;
  overall: number;
  status: string;
  scores: Record<PillarId, number>;
  onNameChange?: (n: string) => void;
  nameLocked?: boolean;
}) {
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const nameLen = (name || "").length;
  const nameFontSize =
    nameLen > 28
      ? "clamp(18px, 2.8vw, 24px)"
      : nameLen > 18
      ? "clamp(22px, 3.6vw, 30px)"
      : "clamp(26px, 4.8vw, 42px)";

  return (
    <div className="certificate-premium" aria-label="MIND UP certificate preview">
      <div className="cert-frame-inner">
        <div className="cert-watermark" aria-hidden="true">MIND UP</div>

        {/* Top Header */}
        <div className="cert-head">
          <div className="cert-brand-block" title="Sagar Lad">
            <img src="/logos/site-logo.png" alt="Sagar Lad" className="cert-brand-logo" />
          </div>
          <div className="cert-main-brand">
            <h3 className="cert-brand-title">MIND UP™</h3>
            <p className="cert-brand-subtitle">PERSONAL GROWTH ASSESSMENT</p>
          </div>
          <div className="cert-seal-badge" aria-label="MIND UP Explorer Seal">
            <div className="seal-inner-ring">
              <span className="seal-text">EXPLORER</span>
              <span className="seal-star">★</span>
            </div>
          </div>
        </div>

        {/* Title block */}
        <div className="cert-title-block">
          <span className="cert-rule" aria-hidden="true" />
          <p className="cert-title">Certificate of Completion</p>
          <span className="cert-rule" aria-hidden="true" />
        </div>
        <div className="cert-diamond-marker" aria-hidden="true">
          <span className="cert-diamond" />
        </div>

        <p className="cert-presented">Proudly presented to</p>

        {/* Dynamic Big Name */}
        <div className="cert-name-wrap-premium">
          <div className="cert-name-display-premium">
            <span
              className={`cert-name-text ${name ? "" : "is-placeholder"}`}
              style={{ fontSize: nameFontSize }}
            >
              {name || "Your Name"}
            </span>
          </div>
          <div className="cert-name-flourish" aria-hidden="true" />
        </div>

        <p className="cert-subtitle">has successfully completed the MIND UP Assessment</p>

        {/* Score Widgets */}
        <div className="cert-score-row-premium">
          <div className="cert-overall-premium">
            <span className="cert-caption-light">OVERALL MIND UP SCORE</span>
            <div className="cert-overall-number-row">
              <span className="cert-overall-num">{overall}</span>
              <span className="cert-overall-denom">/100</span>
            </div>
            <span className="cert-status-gold">{status}</span>
          </div>
          <div className="cert-pillars-premium">
            {pillars.map((p) => (
              <div key={p.id} className="cert-pillar-premium">
                <div className="cert-pillar-top-row">
                  <span className="pillar-letter">{p.id}</span>
                  <strong className="pillar-score">{roundedPillar(scores[p.id])}</strong>
                </div>
                <em className="pillar-title">{p.shortTitle}</em>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="cert-footer-premium">
          <div className="cert-footer-left">
            <span className="cert-date">{today}</span>
            <span className="cert-verified">
              <BadgeCheck size={14} /> Verified · MIND UP™
            </span>
            <span className="cert-tagline">Your starting point, not your destination.</span>
            <span className="cert-official-label">Official Growth Certificate · sagarlad.com</span>
          </div>
          <div className="cert-qr-premium">
            <div className="qr-box-premium">
              <img src={QR_STATIC} alt={`QR code linking to ${QR_URL}`} width={78} height={78} />
            </div>
            <span className="cert-site-premium">website: {QR_SITE}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

async function renderCertificateCanvas(
  name: string,
  overall: number,
  status: string,
  scores: Record<PillarId, number>
): Promise<HTMLCanvasElement> {
  const W = 2400;
  const H = 1480;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Font definitions: strictly 2 fonts
  const FONT_SERIF = "Georgia, 'Times New Roman', serif";
  const FONT_SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  // White base paper
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // 1. Outer Border: Yellow ONLY
  ctx.strokeStyle = "#ffd51d";
  ctx.lineWidth = 18;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // 2. Inner Border: Blue ONLY
  ctx.strokeStyle = "#0d21a1";
  ctx.lineWidth = 7;
  ctx.strokeRect(52, 52, W - 104, H - 104);

  // Paper subtle micro-dots texture
  ctx.fillStyle = "rgba(13, 33, 161, 0.03)";
  for (let y = 96; y < H - 96; y += 44) {
    for (let x = 96; x < W - 96; x += 44) {
      ctx.beginPath();
      ctx.arc(x, y, 2.0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Watermark (strictly Font Sans, faint)
  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.fillStyle = "#0d21a1";
  ctx.font = `900 240px ${FONT_SANS}`;
  ctx.textAlign = "center";
  ctx.letterSpacing = "0px";
  ctx.fillText("MIND UP", W / 2, H / 2 + 60);
  ctx.restore();

  // Top-Left: Sagar Lad Brand Logo
  try {
    const brandLogo = await loadImage("/logos/site-logo.png");
    const blH = 62;
    const blW = (brandLogo.width / brandLogo.height) * blH;
    ctx.drawImage(brandLogo, 140, 120, blW, blH);
  } catch {}

  // Center Header: MIND UP™
  ctx.textAlign = "center";
  ctx.fillStyle = "#0d21a1";
  ctx.letterSpacing = "0px";
  ctx.font = `900 74px ${FONT_SANS}`;
  ctx.fillText("MIND UP™", W / 2, 172);

  ctx.letterSpacing = "0.22em";
  ctx.font = `800 22px ${FONT_SANS}`;
  ctx.fillText("PERSONAL GROWTH ASSESSMENT", W / 2, 215);
  ctx.letterSpacing = "0px"; // RESET IMMEDIATELY

  // Top-Right: Explorer Seal Badge (Clean, elegant, double concentric ring, no cutting lines)
  const sealX = W - 200;
  const sealY = 175;
  const sealR = 72;

  // Solid gold outer disc
  ctx.fillStyle = "#ffd51d";
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2);
  ctx.fill();

  // Crisp navy outer ring
  ctx.strokeStyle = "#0d21a1";
  ctx.lineWidth = 4.5;
  ctx.stroke();

  // Fine concentric inner accent ring
  ctx.strokeStyle = "rgba(13, 33, 161, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealR - 8, 0, Math.PI * 2);
  ctx.stroke();

  // EXPLORER text (strictly FONT_SANS)
  ctx.fillStyle = "#0d21a1";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "0.12em";
  ctx.font = `900 19px ${FONT_SANS}`;
  ctx.fillText("EXPLORER", sealX, sealY - 12);
  ctx.letterSpacing = "0px";

  // Navy Star ★
  ctx.font = `900 32px ${FONT_SANS}`;
  ctx.fillText("★", sealX, sealY + 20);
  ctx.textBaseline = "alphabetic"; // restore baseline

  // Title: Certificate of Completion flanked by gold rules (strictly Font Serif)
  const titleY = 296;
  ctx.fillStyle = "#0d21a1";
  ctx.letterSpacing = "0.22em";
  ctx.font = `900 28px ${FONT_SERIF}`;
  ctx.textAlign = "center";
  const titleText = "CERTIFICATE OF COMPLETION";
  const titleW = ctx.measureText(titleText).width;
  ctx.fillText(titleText, W / 2, titleY);
  ctx.letterSpacing = "0px"; // RESET IMMEDIATELY

  // Flanking horizontal rules
  const ruleGap = 32;
  const ruleY = titleY - 9;
  ctx.strokeStyle = "#ffd51d";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(140, ruleY);
  ctx.lineTo(W / 2 - titleW / 2 - ruleGap, ruleY);
  ctx.moveTo(W / 2 + titleW / 2 + ruleGap, ruleY);
  ctx.lineTo(W - 140, ruleY);
  ctx.stroke();

  // Diamond accent below title with ample breathing space (ZERO collision)
  const diamondY = titleY + 30;
  ctx.fillStyle = "#d9ae00";
  ctx.save();
  ctx.translate(W / 2, diamondY);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-7.5, -7.5, 15, 15);
  ctx.restore();

  // Recipient block (Font Serif)
  ctx.fillStyle = "#60708b";
  ctx.font = `italic 400 26px ${FONT_SERIF}`;
  ctx.fillText("Proudly presented to", W / 2, 386);

  // Big name handling with dynamic font sizing (Font Serif)
  ctx.fillStyle = "#0d21a1";
  ctx.letterSpacing = "0px";
  const displayName = (name || "Your Name").trim().slice(0, 48);
  let nameFont = 94;
  ctx.font = `900 ${nameFont}px ${FONT_SERIF}`;
  const maxNameW = W - 360;
  while (nameFont > 32 && ctx.measureText(displayName).width > maxNameW) {
    nameFont -= 2;
    ctx.font = `900 ${nameFont}px ${FONT_SERIF}`;
  }
  ctx.fillText(displayName, W / 2, 486);

  // Gold flourish underline matching name width
  const measuredW = ctx.measureText(displayName).width;
  const nameW = Math.min(1100, Math.max(300, measuredW + 80));
  const nameGrad = ctx.createLinearGradient(W / 2 - nameW / 2, 0, W / 2 + nameW / 2, 0);
  nameGrad.addColorStop(0, "rgba(255,213,29,0)");
  nameGrad.addColorStop(0.2, "#ffd51d");
  nameGrad.addColorStop(0.8, "#ffd51d");
  nameGrad.addColorStop(1, "rgba(255,213,29,0)");
  ctx.fillStyle = nameGrad;
  ctx.fillRect(W / 2 - nameW / 2, 508, nameW, 6);

  // Subtitle (Font Sans)
  ctx.fillStyle = "#4f5e79";
  ctx.font = `500 24px ${FONT_SANS}`;
  ctx.fillText("has successfully completed the MIND UP Assessment", W / 2, 558);

  // Overall Score Card (Left)
  const ox = 140;
  const oy = 635;
  const ow = 480;
  const oh = 445;
  const cardGrad = ctx.createLinearGradient(ox, oy, ox + ow, oy + oh);
  cardGrad.addColorStop(0, "#071440");
  cardGrad.addColorStop(1, "#0d21a1");
  ctx.fillStyle = cardGrad;
  ctx.fillRect(ox, oy, ow, oh);
  ctx.strokeStyle = "#ffd51d";
  ctx.lineWidth = 4.5;
  ctx.strokeRect(ox, oy, ow, oh);

  // Label: OVERALL MIND UP SCORE
  ctx.letterSpacing = "0.14em";
  ctx.fillStyle = "#ffd51d";
  ctx.font = `900 22px ${FONT_SANS}`;
  ctx.textAlign = "center";
  ctx.fillText("OVERALL MIND UP SCORE", ox + ow / 2, oy + 62);
  ctx.letterSpacing = "0px"; // MUST RESET

  // Overall Score number: strictly 0px letter spacing (natural, tight spacing)
  const overallStr = String(overall);
  ctx.letterSpacing = "0px";
  ctx.font = `900 156px ${FONT_SANS}`;
  ctx.letterSpacing = "0px";
  const overallW = ctx.measureText(overallStr).width;
  ctx.font = `800 44px ${FONT_SANS}`;
  ctx.letterSpacing = "0px";
  const suffixW = ctx.measureText("/100").width;
  const scoreGap = 14;
  const totalScoreW = overallW + scoreGap + suffixW;
  const scoreStartX = ox + (ow - totalScoreW) / 2;
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 156px ${FONT_SANS}`;
  ctx.letterSpacing = "0px";
  ctx.fillText(overallStr, scoreStartX, oy + 242);
  ctx.fillStyle = "rgba(255,255,255,0.76)";
  ctx.font = `800 44px ${FONT_SANS}`;
  ctx.letterSpacing = "0px";
  ctx.fillText("/100", scoreStartX + overallW + scoreGap, oy + 238);

  // Status pill
  ctx.fillStyle = "#ffd51d";
  const pillW = 380;
  const pillH = 68;
  const pillX = ox + (ow - pillW) / 2;
  const pillY = oy + 316;
  ctx.beginPath();
  (ctx as any).roundRect?.(pillX, pillY, pillW, pillH, 34);
  ctx.fill();
  if (!(ctx as any).roundRect) ctx.fillRect(pillX, pillY, pillW, pillH);
  ctx.letterSpacing = "0.12em";
  ctx.fillStyle = "#0d21a1";
  ctx.font = `900 26px ${FONT_SANS}`;
  ctx.textAlign = "center";
  ctx.fillText(status.toUpperCase().slice(0, 20), pillX + pillW / 2, pillY + 44);
  ctx.letterSpacing = "0px"; // RESET

  // 6 Pillar Cards (Right - 3 cols x 2 rows)
  const gx = 660;
  const gy = 635;
  const cw = 500;
  const ch = 208;
  const gapX = 30;
  const gapY = 29;
  pillars.forEach((p, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const px = gx + col * (cw + gapX);
    const py = gy + row * (ch + gapY);

    ctx.fillStyle = "#fffdf5";
    ctx.fillRect(px, py, cw, ch);
    ctx.strokeStyle = "#f0e8bd";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(px, py, cw, ch);

    ctx.fillStyle = "#ffd51d";
    ctx.fillRect(px, py, cw, 9);

    // Letter badge
    ctx.fillStyle = "#0d21a1";
    ctx.beginPath();
    ctx.arc(px + 62, py + 86, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = `900 32px ${FONT_SANS}`;
    ctx.textAlign = "center";
    ctx.letterSpacing = "0px";
    ctx.fillText(p.id, px + 62, py + 98);

    // Score number: strictly 0px letter spacing
    ctx.textAlign = "left";
    ctx.fillStyle = "#0d21a1";
    ctx.font = `900 76px ${FONT_SANS}`;
    ctx.letterSpacing = "0px";
    ctx.fillText(String(roundedPillar(scores[p.id])), px + 116, py + 112);

    // Title
    ctx.fillStyle = "#4f5e79";
    ctx.font = `700 24px ${FONT_SANS}`;
    ctx.fillText(p.shortTitle.slice(0, 24), px + 30, py + 170);
  });

  // Footer divider line
  const divY = 1105;
  ctx.strokeStyle = "#e8d27a";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(140, divY);
  ctx.lineTo(W - 140, divY);
  ctx.stroke();

  // Footer Left - Balanced vertically
  ctx.textAlign = "left";
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  ctx.fillStyle = "#0d21a1";
  ctx.letterSpacing = "0px";
  ctx.font = `800 28px ${FONT_SANS}`;
  ctx.fillText(today, 140, divY + 70);

  ctx.font = `800 26px ${FONT_SANS}`;
  ctx.fillText("Verified · MIND UP™", 140, divY + 120);

  ctx.fillStyle = "#5b6a88";
  ctx.font = `500 22px ${FONT_SANS}`;
  ctx.fillText("Your starting point, not your destination.", 140, divY + 168);

  ctx.fillStyle = "#8d9bb0";
  ctx.font = `600 20px ${FONT_SANS}`;
  ctx.fillText("Official Growth Certificate · sagarlad.com", 140, divY + 212);

  // Footer Right: Scannable QR Code + Website Name
  try {
    const img = await loadImage(QR_STATIC);
    const qSize = 175;
    const boxPad = 10;
    const qx = W - 140 - qSize - boxPad;
    const qy = divY + 25;
    const boxX = qx - boxPad;
    const boxY = qy - boxPad;
    const boxW = qSize + boxPad * 2;
    const boxH = qSize + boxPad * 2;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = "#d9ae00";
    ctx.lineWidth = 3.5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.drawImage(img, qx, qy, qSize, qSize);

    // website: sagarlad.com - ample margin from bottom border (well inside)
    ctx.fillStyle = "#0d21a1";
    ctx.font = `800 24px ${FONT_SANS}`;
    ctx.textAlign = "center";
    ctx.letterSpacing = "0.04em";
    ctx.fillText(`website: ${QR_SITE}`, boxX + boxW / 2, boxY + boxH + 34);
    ctx.letterSpacing = "0px";
  } catch {}

  return canvas;
}

if (typeof window !== "undefined") {
  (window as any).__renderCertificateCanvas = renderCertificateCanvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

function NameModal({
  open,
  initialName,
  actionLabel,
  onClose,
  onConfirm,
}: {
  open: boolean;
  initialName: string;
  actionLabel: string;
  onClose: () => void;
  onConfirm: (name: string) => void;
}) {
  const [name, setName] = useState(initialName);
  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  const valid = name.trim().length >= 2;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-card"
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Enter your name for the certificate"
          >
            <button className="modal-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ffd51d] text-[#0d21a1]">
              <Award size={26} />
            </div>
            <h3 className="mt-4 text-center text-2xl font-black tracking-[-0.04em] text-[#0d21a1]">
              Personalize your certificate
            </h3>
            <p className="mt-2 text-center text-sm leading-6 text-[#60708b]">
              Enter your name exactly as you want it to appear on your MIND UP certificate.
            </p>
            <label className="mt-5 block text-left text-xs font-black uppercase tracking-[0.16em] text-[#52617d]">
              Full name
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && valid) onConfirm(name.trim());
                }}
                placeholder="Your Name"
                maxLength={32}
                className="modal-input"
              />
            </label>
            <button
              disabled={!valid}
              onClick={() => onConfirm(name.trim())}
              className="primary-button mt-5 w-full"
            >
              <Download size={18} /> {actionLabel}
            </button>
            <p className="mt-3 text-center text-xs font-semibold text-[#8b99b5]">
              Includes your name, overall score, all 6 pillars, Explorer badge & QR.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ResultsScreen({
  scores,
  overall,
  previous,
  explorerName,
  setExplorerName,
  nameLocked,
  onRetake,
  onHome,
}: {
  scores: Record<PillarId, number>;
  overall: number;
  previous: StoredResult | null;
  explorerName: string;
  setExplorerName: (n: string) => void;
  nameLocked: boolean;
  onRetake: () => void;
  onHome: () => void;
}) {
  const status = statusBands.find((band) => overall >= band.min)!;
  const growth = pillars.reduce((lowest, item) => (scores[item.id] < scores[lowest.id] ? item : lowest));
  const GrowthIcon = growth.icon;
  const [notice, setNotice] = useState("");
  const [nameOpen, setNameOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"download" | "instagram">("download");
  const [sharing, setSharing] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [hintPlayed, setHintPlayed] = useState(false);
  const [certScale, setCertScale] = useState(1);
  const carouselRef = useRef<HTMLDivElement>(null);
  const certOuterRef = useRef<HTMLDivElement>(null);
  const certInnerRef = useRef<HTMLDivElement>(null);
  const CERT_DESIGN_W = 760;

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(""), 3600);
    return () => window.clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mobile download banner after 5s, auto-hide after 10s total
  useEffect(() => {
    if (bannerDismissed) return;
    const t1 = window.setTimeout(() => setShowBanner(true), 5000);
    const t2 = window.setTimeout(() => { setShowBanner(false); setBannerDismissed(true); }, 10000);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [bannerDismissed]);

  // Certificate full-show scaling on mobile (no responsive stacking, scale whole cert)
  useEffect(() => {
    const update = () => {
      const outer = certOuterRef.current;
      const inner = certInnerRef.current;
      if (!outer) return;
      const avail = outer.clientWidth || outer.parentElement?.clientWidth || window.innerWidth;
      if (avail >= CERT_DESIGN_W) {
        setCertScale(1);
        outer.style.height = "";
        return;
      }
      const s = Math.max(0.3, avail / CERT_DESIGN_W);
      setCertScale(s);
      requestAnimationFrame(() => {
        if (inner && outer) {
          const h = inner.offsetHeight;
          if (h) outer.style.height = `${Math.ceil(h * s)}px`;
        }
      });
    };
    update();
    window.addEventListener("resize", update);
    const t1 = window.setTimeout(update, 250);
    const t2 = window.setTimeout(update, 900);
    return () => {
      window.removeEventListener("resize", update);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [explorerName, overall, CERT_DESIGN_W]);

  // Scroll-hint: animate carousel right->left once when it enters view
  const playScrollHint = () => {
    if (hintPlayed) return;
    const el = carouselRef.current;
    if (!el) return;
    setHintPlayed(true);
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 12) return;
    window.setTimeout(() => {
      try {
        el.scrollTo({ left: Math.min(max, 300), behavior: "smooth" });
      } catch {}
    }, 350);
    window.setTimeout(() => {
      try {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } catch {}
    }, 1250);
  };

  const shareText = getShareText(overall, status.label, scores, growth, explorerName || undefined);
  const pageUrl = QR_URL;

  const doDownload = async (name: string) => {
    setSharing(true);
    try {
      const canvas = await renderCertificateCanvas(name, overall, status.label, scores);
      const link = document.createElement("a");
      const safe = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "mind-up";
      link.download = `mind-up-certificate-${safe}-${overall}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setNotice("Certificate downloaded with your name.");
    } catch {
      setNotice("Download failed. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  const doInstagramShare = async (name: string) => {
    setSharing(true);
    try {
      const canvas = await renderCertificateCanvas(name || "Mind Up Explorer", overall, status.label, scores);
      const blob = await canvasToBlob(canvas);
      const file = blob
        ? new File([blob], `mind-up-${overall}.png`, { type: "image/png" })
        : null;
      const caption = getShareText(overall, status.label, scores, growth, name || undefined);

      // Automated path: native share with the certificate image attached (no manual download)
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "My MIND UP result", text: caption });
          setNotice("Shared — pick Instagram to post your certificate instantly.");
          return;
        } catch (err) {
          if ((err as Error)?.name === "AbortError") return;
        }
      }
      // Fallback automation: copy caption + auto-download image together
      await copyText(caption);
      const link = document.createElement("a");
      link.download = `mind-up-instagram-${overall}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setNotice("Caption copied & image downloaded — Instagram will use both.");
      window.open("https://www.instagram.com/", "_blank", "noopener");
    } catch {
      setNotice("Instagram share failed. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  const handleDownloadClick = () => {
    if (nameLocked || explorerName.trim().length >= 2) {
      void doDownload(explorerName.trim());
    } else {
      setPendingAction("download");
      setNameOpen(true);
    }
  };

  const handleInstagram = () => {
    if (nameLocked || explorerName.trim().length >= 2) {
      void doInstagramShare(explorerName.trim());
    } else {
      setPendingAction("instagram");
      setNameOpen(true);
    }
  };

  const handleNameConfirm = (name: string) => {
    setExplorerName(name);
    setNameOpen(false);
    if (pendingAction === "instagram") void doInstagramShare(name);
    else void doDownload(name);
  };

  const handleLinkedIn = async () => {
    await copyText(shareText);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`, "_blank", "noopener");
    setNotice("Caption copied — paste it with your LinkedIn post.");
  };
  const handleFacebook = async () => {
    await copyText(shareText);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, "_blank", "noopener");
    setNotice("Caption copied — paste it with your Facebook post.");
  };

  const scrollCarousel = (dir: 1 | -1) => {
    const el = carouselRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const w = card ? card.offsetWidth + 12 : 240;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };
  const onCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 8) {
      setCarouselIndex(0);
      return;
    }
    // Progress-based pagination (0..3) so dots work on mobile + desktop
    const p = Math.min(1, Math.max(0, el.scrollLeft / max));
    setCarouselIndex(Math.round(p * 3));
  };

  const delta = previous ? overall - previous.overall : null;

  return (
    <div className="min-h-screen bg-white">
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-[#ffd51d] via-[#ffe45c] to-[#ffd51d] px-4 pb-14 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-12 lg:pb-20 lg:pt-20">
          <div className="absolute right-[-14rem] top-[-14rem] h-[36rem] w-[36rem] rounded-full border-[80px] border-[#0d21a1]/10" aria-hidden="true" />
          <div className="absolute left-[-12rem] bottom-[-16rem] h-[30rem] w-[30rem] rounded-full border-[64px] border-white/40" aria-hidden="true" />
          <div className="absolute left-[20%] top-[10%] h-[18rem] w-[18rem] rounded-full bg-[#0d21a1]/5 blur-3xl" aria-hidden="true" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto grid max-w-[1160px] items-center gap-10 lg:grid-cols-[auto_1fr] lg:gap-14"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto rounded-[2.2rem] bg-white/80 p-4 shadow-[0_24px_70px_rgba(13,33,161,0.18)] backdrop-blur-md lg:mx-0"
            >
              <ScoreRing score={overall} />
            </motion.div>
            <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
              {delta !== null && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25, type: "spring", stiffness: 260, damping: 14 }}
                  className={`delta-chip ${delta >= 0 ? "is-up" : "is-down"}`}
                >
                  {delta >= 0 ? "+" : ""}{delta} vs last time
                </motion.span>
              )}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="max-w-[760px] text-balance text-[clamp(2rem,6vw,4.4rem)] font-black leading-[1.0] tracking-[-0.03em] text-[#1a35c4]"
              >
                {status.lead}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="max-w-[600px] text-[15px] font-medium leading-7 text-[#0d21a1]/70 sm:text-lg sm:leading-8"
              >
                {status.description}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.45 }}
                className="mt-2"
              >
                <button onClick={handleDownloadClick} disabled={sharing} className="hero-download-btn">
                  {sharing ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  Download my score
                </button>
              </motion.div>
            </div>
          </motion.div>
        </section>
        <div className="mx-auto max-w-[1160px] px-4 sm:px-8 lg:px-12">
          <section className="result-section">
            <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}>
              <p className="eyebrow">01 · Your six pillars</p>
              <h2 className="section-title section-title-spaced mt-3">Every dimension, clearly scored.</h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#60708b] sm:text-base">
                Each pillar is scored 0–100 from your two answers. Your overall score is the average of all six.
              </p>
            </motion.div>
            <div className="mt-8 divide-y divide-[#f0e8bd] border-y border-[#f0e8bd] sm:mt-10">
              {pillars.map((pillar, index) => {
                const Icon = pillar.icon;
                const val = roundedPillar(scores[pillar.id]);
                const isGrowth = pillar.id === growth.id;
                return (
                  <motion.div
                    key={pillar.id}
                    initial={{ opacity: 0, x: 22 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: index * 0.06, duration: 0.5 }}
                    className="grid items-center gap-3 py-4 sm:grid-cols-[240px_1fr_72px] sm:gap-4 sm:py-5"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10 ${isGrowth ? "bg-[#1a35c4] text-[#ffd51d]" : "bg-[#fffbe6] text-[#1a35c4]"}`}>
                        <Icon size={19} />
                      </span>
                      <div className="min-w-0">
                        <div>
                          <span className="mr-1.5 font-black text-[#0d21a1]">{pillar.id}</span>
                          <span className="text-[14px] font-bold text-[#17243f] sm:text-[15px]">{pillar.shortTitle}</span>
                        </div>
                        {isGrowth && <span className="growth-tag mt-1 inline-block">Growth zone</span>}
                      </div>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[#f0e8bd] sm:h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${scores[pillar.id]}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.15 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className={`h-full rounded-full ${isGrowth ? "bg-gradient-to-r from-[#1a35c4] to-[#2a45d4]" : "bg-[#3b5bcc]"}`}
                      />
                    </div>
                    <PillarNumber value={val} />
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section className="result-section">
            <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} className="sm:text-left text-center">
              <p className="eyebrow">02 · Your next move</p>
              <h2 className="section-title section-title-spaced mt-3 sm:mx-0 mx-auto">3 moves for your growth zone.</h2>
              <div className="mt-6 flex max-w-md items-center gap-3 bg-[#fffbe6] p-4 sm:mx-0 mx-auto">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ffd51d] text-[#1a35c4]">
                  <GrowthIcon size={21} />
                </span>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#b89300]">Growth zone · {roundedPillar(scores[growth.id])}/100</p>
                  <p className="text-[15px] font-black text-[#1a35c4]">{growth.title}</p>
                </div>
              </div>
              <p className="mt-4 max-w-lg text-[15px] leading-7 text-[#60708b] sm:mx-0 mx-auto">
                Based on your lowest score. Do these three — nothing else — for the next 7 days.
              </p>
            </motion.div>
            <div className="mt-8 max-w-2xl">
              <ol className="divide-y divide-[#f0e8bd] border-y border-[#f0e8bd]">
                {growth.actions.slice(0, 3).map((action, index) => (
                  <motion.li
                    key={action}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: index * 0.1 }}
                    className="grid grid-cols-[46px_1fr] items-center gap-3 py-5 sm:grid-cols-[52px_1fr] sm:gap-4 sm:py-6"
                  >
                    <span className="rec-number">{index + 1}</span>
                    <span className="text-[16px] font-bold leading-6 text-[#17243f] sm:text-lg sm:leading-7">{action}</span>
                  </motion.li>
                ))}
              </ol>
              <p className="mt-4 bg-[#ffd51d]/40 px-4 py-3 text-[13px] font-black uppercase tracking-[0.12em] text-[#1a35c4] sm:text-sm">
                Focus: {growth.focus}
              </p>
              <p className="mt-4 border-l-4 border-[#ffd51d] pl-4 text-[15px] font-bold italic leading-7 text-[#334155]">
                "{growth.reflection}"
              </p>
            </div>
          </section>

          <section className="result-section">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="sm:text-left text-center"
            >
              <p className="eyebrow">03 · MIND UP Explorer</p>
              <h2 className="section-title section-title-spaced mt-3 sm:mx-0 mx-auto">Congratulations, Explorer.</h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#60708b] sm:text-base sm:mx-0 mx-auto">
                You completed all 6 dimensions and earned <strong className="text-[#0d21a1]">+60 XP</strong>.
                {nameLocked ? " Your name is saved and locked." : " Add your name to the certificate, then download or share."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 26, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="mx-auto mt-8 max-w-[860px]"
            >
              <div ref={certOuterRef} className="cert-scale-outer">
                <div
                  ref={certInnerRef}
                  className={`cert-scale-inner ${certScale < 1 ? "is-scaled force-desktop-cert" : ""}`}
                  style={certScale < 1 ? { width: CERT_DESIGN_W, transform: `scale(${certScale})` } : undefined}
                >
                  <CertificatePreview name={explorerName} overall={overall} status={status.label} scores={scores} onNameChange={setExplorerName} nameLocked={nameLocked} />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="mx-auto mt-7 max-w-[860px]"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              onViewportEnter={playScrollHint}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#52617d]">
                  share
                </p>
                <div className="flex gap-2">
                </div>
              </div>
              <div className="share-carousel-wrap">
                <div ref={carouselRef} onScroll={onCarouselScroll} className="share-carousel unified">
                  <motion.button
                    data-card
                    onClick={handleDownloadClick}
                    disabled={sharing}
                    className="share-card is-primary"
                    variants={{ hidden: { x: 90, opacity: 0 }, show: { x: 0, opacity: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
                  >
                    <span className="share-card-icon">{sharing ? <Loader2 size={22} className="animate-spin" /> : <Download size={22} />}</span>
                    <strong>Download</strong>
                    <span>Certificate PNG with your name</span>
                  </motion.button>
                  <motion.button
                    data-card
                    onClick={handleInstagram}
                    disabled={sharing}
                    className="share-card"
                    variants={{ hidden: { x: 90, opacity: 0 }, show: { x: 0, opacity: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
                  >
                    <span className="share-card-icon">{sharing ? <Loader2 size={22} className="animate-spin" /> : <InstagramIcon size={22} />}</span>
                    <strong>Instagram</strong>
                    <span>Auto share with image</span>
                  </motion.button>
                  <motion.button
                    data-card
                    onClick={handleLinkedIn}
                    className="share-card"
                    variants={{ hidden: { x: 90, opacity: 0 }, show: { x: 0, opacity: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
                  >
                    <span className="share-card-icon"><LinkedInIcon size={22} /></span>
                    <strong>LinkedIn</strong>
                    <span>Share your result</span>
                  </motion.button>
                  <motion.button
                    data-card
                    onClick={handleFacebook}
                    className="share-card"
                    variants={{ hidden: { x: 90, opacity: 0 }, show: { x: 0, opacity: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
                  >
                    <span className="share-card-icon"><FacebookIcon size={22} /></span>
                    <strong>Facebook</strong>
                    <span>Share your result</span>
                  </motion.button>
                </div>
                <span className="carousel-fade-edge" aria-hidden="true" />
              </div>
              <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`carousel-dot ${carouselIndex === i ? "is-active" : ""}`} />
                ))}
              </div>

            </motion.div>

          </section>


        </div>
      </main>



      {!nameLocked && (
        <NameModal
          open={nameOpen}
          initialName={explorerName}
          actionLabel={pendingAction === "instagram" ? "Continue to Instagram" : "Download certificate"}
          onClose={() => setNameOpen(false)}
          onConfirm={handleNameConfirm}
        />
      )}

      <AnimatePresence>
        {showBanner && !bannerDismissed && (
          <motion.div
            initial={{ y: 110, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 110, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="mobile-download-banner"
            role="complementary"
            aria-label="Download your certificate"
          >
            <span className="banner-icon">
              <Trophy size={18} />
            </span>
            <span className="banner-text">
              <strong>Your certificate is ready</strong>
              <em>{overall}/100 · {status.label}</em>
            </span>
            <button
              onClick={() => {
                setBannerDismissed(true);
                setShowBanner(false);
                handleDownloadClick();
              }}
              disabled={sharing}
              className="banner-cta"
            >
              {sharing ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              Download
            </button>
            <button
              onClick={() => {
                setBannerDismissed(true);
                setShowBanner(false);
              }}
              className="banner-close"
              aria-label="Dismiss download banner"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 16, x: "-50%" }}
            className={`toast ${showBanner && !bannerDismissed ? "has-banner" : ""}`}
            role="status"
          >
            <Check size={17} className="shrink-0 text-[#ffd51d]" /> {notice}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PillarNumber({ value }: { value: number }) {
  const display = useCountUp(value, 900, 100);
  return (
    <strong className="text-left text-[22px] tracking-[-0.04em] text-[#0d21a1] sm:text-right sm:text-2xl">
      {display}
    </strong>
  );
}

/* ---------- APP ---------- */
const GAME_KEY = "mind-up-game-state";
type GameState = { screen: Screen; questionIndex: number; answers: Record<number, number>; answerTimes: Record<number, number>; secondsLeft: number; explorerName: string; timedOut: Record<number, boolean> };

function loadGameState(): GameState | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(GAME_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch { return null; }
}

function saveGameState(state: GameState) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(GAME_KEY, JSON.stringify(state));
  } catch {}
}

function clearGameState() {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(GAME_KEY);
  } catch {}
}

export default function MindUpGame() {
  const [saved, setSaved] = useState<ReturnType<typeof loadGameState> | null>(null);
  const [previous, setPrevious] = useState<StoredResult | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSaved(loadGameState());
    try {
      const stored = window.localStorage.getItem("mind-up-previous-result");
      setPrevious(stored ? (JSON.parse(stored) as StoredResult) : null);
    } catch {}
    setHydrated(true);
  }, []);

  const [screen, setScreen] = useState<Screen>(saved?.screen ?? "welcome");
  const [questionIndex, setQuestionIndex] = useState(saved?.questionIndex ?? 0);
  const [answers, setAnswers] = useState<Record<number, number>>(saved?.answers ?? {});
  const [answerTimes, setAnswerTimes] = useState<Record<number, number>>(saved?.answerTimes ?? {});
  const [secondsLeft, setSecondsLeft] = useState(saved?.secondsLeft ?? QUESTION_SECONDS);
  const [flyIn, setFlyIn] = useState<number | null>(null);
  const [explorerName, setExplorerName] = useState(() => {
    if (saved?.explorerName) return saved.explorerName;
    try {
      if (typeof window === "undefined") return "";
      return (
        localStorage.getItem("mindup_explorer_name") ||
        localStorage.getItem("mind-up-locked-name") ||
        ""
      );
    } catch {
      return "";
    }
  });
  const [timedOut, setTimedOut] = useState<Record<number, boolean>>(saved?.timedOut ?? {});
  const advanceTimer = useRef<number | null>(null);
  const flyInTimer = useRef<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [screen]);

  const scores = useMemo(() => calculatePillarScores(answers), [answers]);
  const overall = useMemo(() => calculateOverall(scores), [scores]);

  /* XP: Based on answer speed after 5 seconds to prevent random answers.
     - 0 XP if answered in <= 5 seconds (too fast = likely random)
     - 15 XP if answered in 5-7 seconds
     - 12 XP if answered in 7-9 seconds
     - 9 XP if answered in 9-11 seconds
     - 6 XP if answered in 11-12 seconds
     - 0 XP if answered in > 12 seconds or timed out */
  const xp = useMemo(() => {
    let pts = 0;
    for (let i = 0; i < 6; i++) {
      const q1 = i * 2;
      const q2 = i * 2 + 1;
      pts += calcSingleQuestionXp(
        answerTimes[q1],
        answers[q1] !== undefined && !timedOut[q1],
        !!timedOut[q1]
      );
      pts += calcSingleQuestionXp(
        answerTimes[q2],
        answers[q2] !== undefined && !timedOut[q2],
        !!timedOut[q2]
      );
    }
    return pts;
  }, [answers, timedOut, answerTimes]);

  // Persist game state so refresh doesn't restart
  useEffect(() => {
    if (screen === "welcome") {
      clearGameState();
    } else if (screen === "question") {
      saveGameState({ screen, questionIndex, answers, answerTimes, secondsLeft, explorerName, timedOut });
    }
  }, [screen, questionIndex, answers, answerTimes, secondsLeft, explorerName, timedOut]);

  const [nameLocked, setNameLocked] = useState(() => {
    try { return localStorage.getItem("mind-up-name-locked") === "1"; } catch { return false; }
  });

  // Simple hash for tamper detection
  const hashName = (n: string) => {
    let h = 0;
    for (let i = 0; i < n.length; i++) h = ((h << 5) - h + n.charCodeAt(i)) | 0;
    return h.toString(36);
  };

  useEffect(() => {
    const stored = window.localStorage.getItem("mind-up-latest-result");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredResult;
        setPrevious(parsed);
        if (parsed.name) setExplorerName(parsed.name);
      } catch {
        window.localStorage.removeItem("mind-up-latest-result");
      }
    }
    // Verify name lock integrity & persistent name
    const storedExplorer = localStorage.getItem("mindup_explorer_name");
    const lockedName = localStorage.getItem("mind-up-locked-name");
    const lockedHash = localStorage.getItem("mind-up-name-hash");
    if (storedExplorer) {
      setExplorerName(storedExplorer);
    } else if (lockedName && lockedHash && hashName(lockedName) === lockedHash) {
      setExplorerName(lockedName);
      setNameLocked(true);
    }
  }, []);

  const lockName = (name: string) => {
    const clean = name.trim().slice(0, 48);
    setExplorerName(clean);
    setNameLocked(true);
    try {
      localStorage.setItem("mindup_explorer_name", clean);
      localStorage.setItem("mind-up-locked-name", clean);
      localStorage.setItem("mind-up-name-hash", hashName(clean));
      localStorage.setItem("mind-up-name-locked", "1");
    } catch {}
  };

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
      if (flyInTimer.current) window.clearTimeout(flyInTimer.current);
    };
  }, []);

  const clearTimers = () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    if (flyInTimer.current) window.clearTimeout(flyInTimer.current);
    advanceTimer.current = null;
    flyInTimer.current = null;
  };

  const start = () => {
    clearTimers();
    setFlyIn(null);
    setSecondsLeft(QUESTION_SECONDS);
    setTimedOut({});
    setAnswerTimes({});
    const stored = window.localStorage.getItem("mind-up-latest-result");
    if (stored) {
      try {
        setPrevious(JSON.parse(stored) as StoredResult);
      } catch {
        window.localStorage.removeItem("mind-up-latest-result");
        setPrevious(null);
      }
    }
    setScreen("question");
    setQuestionIndex(0);
    setAnswers({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const home = () => {
    clearTimers();
    setFlyIn(null);
    setScreen("welcome");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const finishAssessment = (finalAnswers: Record<number, number>) => {
    const finalScores = calculatePillarScores(finalAnswers);
    const finalOverall = calculateOverall(finalScores);
    const result: StoredResult = {
      overall: finalOverall,
      scores: finalScores,
      date: new Date().toISOString(),
      name: explorerName || undefined,
    };
    // Move current result to previous before overwriting
    try {
      const current = window.localStorage.getItem("mind-up-latest-result");
      if (current) {
        window.localStorage.setItem("mind-up-previous-result", current);
        setPrevious(JSON.parse(current) as StoredResult);
      } else {
        setPrevious(null);
      }
    } catch {
      setPrevious(null);
    }
    window.localStorage.setItem("mind-up-latest-result", JSON.stringify(result));
    clearGameState();
    setScreen("results");
    window.scrollTo(0, 0);
  };

  const goToQuestion = (nextIndex: number) => {
    setQuestionIndex(nextIndex);
    setSecondsLeft(QUESTION_SECONDS);
    if (nextIndex % 2 === 0) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitAnswer = (value: number) => {
    if (flyIn !== null) return;
    if (value < 1 || value > 5) return;
    if (answers[questionIndex] !== undefined) return;

    // Calculate time taken: QUESTION_SECONDS - secondsLeft + 1 (since we count down from 12 to 0)
    const timeTaken = QUESTION_SECONDS - secondsLeft + 1;
    const nextAnswers = { ...answers, [questionIndex]: value };
    const nextAnswerTimes = { ...answerTimes, [questionIndex]: timeTaken };
    setAnswers(nextAnswers);
    setAnswerTimes(nextAnswerTimes);
    setSecondsLeft(QUESTION_SECONDS);
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);

    if (questionIndex % 2 === 1) {
      const pillarIdx = Math.floor(questionIndex / 2);
      const isLastPillar = questionIndex === 11;
      setFlyIn(pillarIdx);
      if (isLastPillar) playWin();
      flyInTimer.current = window.setTimeout(() => {
        setFlyIn(null);
        if (isLastPillar) {
          finishAssessment(nextAnswers);
        } else {
          goToQuestion(questionIndex + 1);
        }
      }, isLastPillar ? 2500 : 1500);
    } else {
      advanceTimer.current = window.setTimeout(() => {
        goToQuestion(questionIndex + 1);
      }, 420);
    }
  };

  const handleAnswer = (value: number) => submitAnswer(value);

  const handleBack = () => {
    if (flyIn !== null) return;
    clearTimers();
    home();
  };

  /* 12-second countdown per question — ticks while the question screen is open */
  useEffect(() => {
    if (screen !== "question" || flyIn !== null) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [screen, flyIn, questionIndex, answers]);

  /* auto-submit on timeout (records 1 = Never as the default answer) */
  useEffect(() => {
    if (screen !== "question" || flyIn !== null || secondsLeft > 0) return;
    if (answers[questionIndex] !== undefined) return;
    playSiren();
    setTimedOut((prev) => ({ ...prev, [questionIndex]: true }));
    submitAnswer(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, flyIn, secondsLeft, questionIndex, answers]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#fffdf2] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0d21a1] border-t-transparent" />
      </div>
    );
  }

  if (screen === "welcome") return <Welcome onStart={start} />;
  if (screen === "question") {
    return (
      <QuestionScreen
        questionIndex={questionIndex}
        answers={answers}
        answerTimes={answerTimes}
        xp={xp}
        secondsLeft={secondsLeft}
        flyIn={flyIn}
        timedOut={timedOut}
        onAnswer={handleAnswer}
        onBack={handleBack}
        onHome={home}
      />
    );
  }
  return (
    <ResultsScreen
      scores={scores}
      overall={overall}
      previous={previous}
      explorerName={explorerName}
      setExplorerName={lockName}
      nameLocked={nameLocked}
      onRetake={start}
      onHome={home}
    />
  );
}
