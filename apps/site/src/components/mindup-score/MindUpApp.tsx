"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Brain,
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Heart,
  Loader2,
  Pencil,
  Printer,
  RefreshCw,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { SITE } from "@/lib/site";

type PillarId = "M" | "I" | "N" | "D" | "U" | "P";
type Screen = "welcome" | "question" | "results" | "reset";

type Pillar = {
  id: PillarId;
  title: string;
  shortTitle: string;
  badge: string;
  icon: typeof Brain;
  questions: string[];
  moveTitle: string;
  actions: string[];
  focus: string;
  reflection: string;
};

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
    title: "Master Your Mind",
    shortTitle: "Mind",
    badge: "Mindset Explorer",
    icon: Brain,
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
    title: "Invest in Health",
    shortTitle: "Health",
    badge: "Health Investor",
    icon: Heart,
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
    icon: Users,
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
    icon: Briefcase,
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
    shortTitle: "Yourself",
    badge: "Potential Unlocker",
    icon: Star,
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
    title: "Progress Daily & Reset Often",
    shortTitle: "Progress Daily",
    badge: "Progress Tracker",
    icon: TrendingUp,
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
  { value: 1, label: "Never" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
  { value: 5, label: "Almost Always" },
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
  M: "Master Your Mind",
  I: "Invest in Health",
  N: "Nurture Relationships",
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

/* XP fullscreen shows ONLY ONCE when ends (after 6th pillar P / Q12) to avoid disrupting assessment flow.
   Progress line continuously updates total XP. */
const FULLSCREEN_XP_PILLARS = [5];

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
  const displayName = name?.trim() ? name.trim() : "Mind Up Explorer";
  return [
    `🎯 My MIND UP Score: ${overall}/100 · ${status}`,
    `Explorer: ${displayName}`,
    "",
    "Here is my 6-dimension personal growth breakdown:",
    `🧠 Mind: ${roundedPillar(scores.M)}/100`,
    `❤️ Health: ${roundedPillar(scores.I)}/100`,
    `👥 Relationships: ${roundedPillar(scores.N)}/100`,
    `💼 Skills & Work: ${roundedPillar(scores.D)}/100`,
    `⭐ Yourself: ${roundedPillar(scores.U)}/100`,
    `📈 Progress Daily: ${roundedPillar(scores.P)}/100`,
    "",
    `🌱 Growth zone focus: ${growth.title}`,
    `“${growth.reflection}”`,
    "",
    "Take the assessment & discover where you stand:",
    QR_URL,
    "",
    "#MINDUP #SagarLad #PersonalGrowth #SelfImprovement #LifeScore #Leadership",
  ].join("\n");
}

function getWhatsAppText(
  overall: number,
  status: string,
  scores: Record<PillarId, number>,
  growth: Pillar,
  name?: string
) {
  const displayName = name?.trim() ? name.trim() : "Mind Up Explorer";
  return [
    `*🎯 My MIND UP Score: ${overall}/100 (${status})*`,
    `*Explorer:* ${displayName}`,
    "",
    "*6-Dimension Personal Growth Breakdown:*",
    `🧠 Mind: ${roundedPillar(scores.M)}/100`,
    `❤️ Health: ${roundedPillar(scores.I)}/100`,
    `👥 Relationships: ${roundedPillar(scores.N)}/100`,
    `💼 Skills & Work: ${roundedPillar(scores.D)}/100`,
    `⭐ Yourself: ${roundedPillar(scores.U)}/100`,
    `📈 Progress Daily: ${roundedPillar(scores.P)}/100`,
    "",
    `🌱 *Growth Focus:* ${growth.title}`,
    `“${growth.reflection}”`,
    "",
    `Take your assessment: ${QR_URL}`,
    "#MINDUP #SagarLad #PersonalGrowth",
  ].join("\n");
}

function getTweetText(
  overall: number,
  status: string,
  scores: Record<PillarId, number>,
  growth: Pillar,
  name?: string
) {
  const prefix = name?.trim() ? `${name.trim()}: ` : "";
  return `🎯 ${prefix}My MIND UP Score is ${overall}/100 (${status})!\n\nVerified 6-dimension personal growth score by @sagarlad. Take your assessment & see where you stand:`;
}

async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard && navigator.clipboard.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      return true;
    }
  } catch (err) {
    console.warn("Clipboard image write not supported or permission denied", err);
  }
  return false;
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
    document.body.removeChild(ta);
  }
}

async function getQrDataUrl(): Promise<string> {
  return "/logos/mindup-qr.svg";
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* ---------- brand icons ---------- */
function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
function TwitterXIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
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
function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2" aria-label="Sagar Lad">
      <img
        src={light ? "/logos/site-logo-white.png" : "/logos/site-logo.png"}
        alt="Sagar Lad"
        className="h-8 w-auto object-contain"
      />
    </div>
  );
}

function TopBar({ onHome, xp }: { onHome?: () => void; xp?: number }) {
  return (
    <header className="relative z-30 flex h-[68px] items-center justify-between border-b border-[#d9e4f7] bg-white/92 px-4 backdrop-blur-md sm:h-[76px] sm:px-8 lg:px-12">
      <button
        onClick={onHome}
        className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2454d9]"
        aria-label="Go home"
      >
        <Logo />
      </button>
      <div className="flex items-center gap-2 sm:gap-3">
        {typeof xp === "number" && (
          <div className="xp-pill" aria-live="polite">
            <Zap size={14} strokeWidth={2.6} />
            <span>{xp} XP</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#63708c] sm:text-xs sm:tracking-[0.16em]">
          <Clock3 size={15} className="text-[#2454d9]" />
          <span className="sm:hidden">3 min</span>
          <span className="hidden sm:inline">3 minute assessment</span>
        </div>
      </div>
    </header>
  );
}

/* ---------- HERO SOLAR SYSTEM : letters only ---------- */
function SolarSystem() {
  return (
    <div className="solar-wrap" role="img" aria-label="MIND UP solar system: big orbit holds MIND from 9 o'clock to 3 o'clock, small orbit holds U at 7 o'clock and P at 5 o'clock">
      <div className="solar-stage">
        <div className="solar-ring outer" aria-hidden="true" />
        <div className="solar-ring inner" aria-hidden="true" />
        <motion.div
          className="solar-dash outer-dash"
          aria-hidden="true"
          animate={{ rotate: 360 }}
          transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="solar-dash inner-dash"
          aria-hidden="true"
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <div className="solar-glow glow-blue" aria-hidden="true" />
        <div className="solar-glow glow-yellow" aria-hidden="true" />

        <svg className="solar-spokes" viewBox="0 0 100 100" aria-hidden="true">
          {pillars.map((p) => {
            const cfg = orbitConfig[p.id];
            const rad = (cfg.angle * Math.PI) / 180;
            const x2 = 50 + Math.cos(rad) * cfg.radius;
            const y2 = 50 + Math.sin(rad) * cfg.radius;
            return <line key={p.id} x1="50" y1="50" x2={x2} y2={y2} />;
          })}
        </svg>

        <motion.div
          className="solar-core"
          initial={{ scale: 0.7, opacity: 0, x: "-50%", y: "-50%" }}
          animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="core-kicker">Your journey</span>
          <strong>6</strong>
          <span className="core-sub">dimensions
of growth</span>
          <span className="core-pulse" aria-hidden="true" />
        </motion.div>

        {pillars.map((pillar, i) => {
          const cfg = orbitConfig[pillar.id];
          const pos = polarToPercent(cfg.angle, cfg.radius);
          const isInner = cfg.ring === "inner";
          return (
            <motion.div
              key={pillar.id}
              className="solar-planet-wrap"
              style={{ left: pos.left, top: pos.top, x: "-50%", y: "-50%" }}
              initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
              animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
              transition={{ delay: 0.25 + i * 0.12, type: "spring", stiffness: 200, damping: 14 }}
            >
              <div className={`solar-planet letter-only ${isInner ? "is-inner" : "is-outer"} float-${i % 3}`} style={{ animationDelay: `${i * 0.35}s` }}>
                {pillar.id}
              </div>
            </motion.div>
          );
        })}

        <motion.div
          className="solar-spark-track"
          aria-hidden="true"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          <span className="solar-spark s1" />
          <span className="solar-spark s2" />
        </motion.div>
      </div>
    </div>
  );
}

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-[#f8fbff]">
      <main>
        <section className="relative isolate overflow-hidden border-b border-[#d9e4f7]">
          <div className="absolute inset-0 bg-[linear-gradient(112deg,#f8fbff_0%,#f8fbff_52%,#edf4ff_52%,#edf4ff_100%)]" />
          <div className="absolute right-[-12rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full border-[90px] border-[#dce8fb]/70" aria-hidden="true" />
          <div className="absolute left-[-10rem] bottom-[-14rem] h-[26rem] w-[26rem] rounded-full border-[70px] border-[#ffd51d]/25" aria-hidden="true" />
          {/* Mobile / Tablet Hero Layout: 1) Eyebrow -> 2) Circle UI -> 3) MIND UP + Text + CTA Button */}
          <div className="flex flex-col items-center text-center px-4 py-8 sm:px-8 sm:py-12 lg:hidden">
            <p className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#2454d9] sm:text-xs">
              6 dimensions · 12 questions · 3 minutes
            </p>
            <div className="my-3 w-full flex justify-center">
              <SolarSystem />
            </div>
            <div className="mt-5 flex flex-col items-center">
              <h1 className="text-balance text-[clamp(2.8rem,9vw,4.5rem)] font-black leading-[0.88] tracking-[-0.04em] text-[#0b2860]">
                MIND <span className="text-[#2454d9]">UP</span>
              </h1>
              <h2 className="mt-3 text-balance text-[clamp(1.4rem,4.5vw,2.2rem)] font-bold leading-[1.12] tracking-[-0.02em] text-[#15213b]">
                How MIND UP are you?
              </h2>
              <p className="mt-3 max-w-[480px] text-pretty text-[15px] leading-6 text-[#53617b]">
                Discover where you stand, find your growth zone, and leave with one clear next move.
              </p>
              <button onClick={onStart} className="primary-button mt-6 w-full sm:w-auto">
                Start my MIND UP journey
                <ArrowRight size={19} />
              </button>
            </div>
          </div>

          {/* Desktop Hero Layout */}
          <div className="relative mx-auto hidden min-h-[calc(100vh-68px)] max-w-[1440px] items-center gap-8 px-5 py-12 sm:min-h-[calc(100vh-76px)] sm:px-8 lg:grid lg:grid-cols-[1.02fr_0.98fr] lg:gap-6 lg:px-12 lg:py-8 xl:px-20">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 max-w-[640px]"
            >
              <p className="mb-4 text-[11px] font-black uppercase tracking-[0.22em] text-[#2454d9] sm:mb-5 sm:text-xs">
                6 dimensions · 12 questions · 3 minutes
              </p>
              <h1 className="text-balance text-[clamp(3.2rem,10vw,7.5rem)] font-black leading-[0.84] tracking-[-0.05em] text-[#0b2860]">
                MIND <span className="text-[#2454d9]">UP</span>
              </h1>
              <h2 className="mt-5 text-balance text-[clamp(1.55rem,4.5vw,2.9rem)] font-bold leading-[1.06] tracking-[-0.02em] text-[#15213b] sm:mt-7">
                How MIND UP are you?
              </h2>
              <p className="mt-4 max-w-[540px] text-pretty text-[15px] leading-7 text-[#53617b] sm:mt-5 sm:text-lg">
                Discover where you stand, find your growth zone, and leave with one clear next move.
              </p>
              <button onClick={onStart} className="primary-button mt-7 sm:mt-9">
                Start my MIND UP journey
                <ArrowRight size={19} />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto flex w-full max-w-[600px] items-center justify-center"
            >
              <SolarSystem />
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
            <div className="divide-y divide-[#d9e4f7] border-y border-[#d9e4f7]">
              {pillars.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <motion.div
                    key={pillar.id}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-[44px_1fr_auto] items-center gap-3 py-4 sm:grid-cols-[48px_1fr_auto] sm:py-5"
                  >
                    <span className="text-xl font-black text-[#2454d9] sm:text-2xl">{pillar.id}</span>
                    <span className="text-[15px] font-bold text-[#17243f] sm:text-base">{frameworkTitles[pillar.id]}</span>
                    <Icon size={20} className="text-[#7890b9]" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-[#d9e4f7] bg-[#f8faff] px-5 py-16 text-[#0b2860] sm:px-8 sm:py-20 lg:px-12">
          <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-[720px]">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-[#ffd51d] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#0b2860] sm:text-xs">
                Before you start
              </p>
              <h2 className="mt-4 text-[26px] font-bold leading-tight tracking-[-0.02em] text-[#0b2860] sm:text-5xl">
                Honest answers create useful results.
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#52617d] sm:mt-5 sm:text-base">
                There are no right or wrong answers. Answer based on how you have actually been living recently, not how you wish you were living. Your score is not a judgment. It’s a starting point.
              </p>
            </div>
            <button onClick={onStart} className="primary-button shrink-0">
              I’m ready
              <ArrowRight size={19} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---------- QUESTIONS ---------- */
function JourneyProgress({ questionIndex, xp }: { questionIndex: number; xp: number }) {
  const currentPillarIndex = Math.floor(questionIndex / 2);
  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#2454d9] sm:text-xs sm:tracking-[0.2em]">MIND UP Journey</p>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 bg-[#ffd51d] px-2.5 py-1 text-[11px] font-black text-[#0b2860] sm:flex">
            <Zap size={12} strokeWidth={3} /> {xp} XP
          </span>
          <p className="text-[13px] font-bold text-[#63708c] sm:text-sm">Question {questionIndex + 1} of 12</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {pillars.map((pillar, index) => (
          <div key={pillar.id} className="flex flex-1 items-center gap-1.5 sm:gap-2.5">
            <div
              className={`progress-letter ${index < currentPillarIndex ? "is-complete" : ""} ${index === currentPillarIndex ? "is-current" : ""}`}
              aria-label={`${pillar.title}${index < currentPillarIndex ? ", completed" : ""}`}
            >
              {index < currentPillarIndex ? <Check size={14} strokeWidth={3.2} /> : pillar.id}
            </div>
            {index < pillars.length - 1 && (
              <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[#dbe5f5]">
                <motion.div
                  className="h-full bg-[#2454d9]"
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

/* Full-screen XP celebration — shows ONLY ONCE when ends (after 6th pillar P / question 12), auto closes in 2.2s */
function CelebrationOverlay({ pillarIndex }: { pillarIndex: number }) {
  const pillar = pillars[pillarIndex] || pillars[5];
  const Icon = Trophy;
  const msg = motivation[5];
  const xpEarned = 60;
  const milestone = "Full journey complete · +60 XP";
  return (
    <motion.div
      className="xp-fullscreen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div className="xp-rays" aria-hidden="true" />
      <motion.div
        className="xp-inner"
        initial={{ scale: 0.9, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
      >
        <motion.div
          className="xp-badge"
          initial={{ scale: 0, rotate: -18 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 220, damping: 11 }}
        >
          <Icon size={52} strokeWidth={2.1} />
        </motion.div>
        <motion.p
          className="xp-plus"
          initial={{ scale: 0.5, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 13 }}
        >
          +10 XP
        </motion.p>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.24em] text-[#ffd51d] sm:text-xs">
          {milestone}
        </p>
        <h3 className="mx-auto mt-3 max-w-xl text-balance text-[34px] font-black leading-[1.02] tracking-[-0.03em] text-white sm:text-[52px]">
          {msg.title}
        </h3>
        <p className="mt-3 text-[16px] font-semibold text-[#c9d6ef] sm:text-lg">{msg.sub}</p>
        <div className="mt-7 flex items-center justify-center gap-2" aria-label="All 6 dimensions complete">
          {pillars.map((p) => (
            <motion.span
              key={p.id}
              className="xp-dot is-done"
              initial={false}
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 0.45 }}
            >
              <Check size={13} strokeWidth={4} />
            </motion.span>
          ))}
        </div>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-[#8fa3c7]">
          6 of 6 · {xpEarned} XP total
        </p>
      </motion.div>
    </motion.div>
  );
}

/* =====================================================================
   GINNIE — FLOATING DRAGGABLE GENIE AVATAR
   Interactive, lightweight, floating genie companion.
   Can be dragged anywhere, provides idle motivation, hovering reactions,
   and real-time validation on choice.
   ===================================================================== */
const GINNIE_IDLE_WORDS = [
  "Action!",
  "Focus!",
  "Trust!",
  "Decide!",
  "Momentum!",
  "Go!",
  "Clarity!",
  "Courage!",
  "Move!",
  "Choose!",
];

function GinnieAvatar({
  questionIndex,
  currentPillar,
  selectedScore,
  celebration = null,
}: {
  questionIndex: number;
  currentPillar: Pillar;
  selectedScore?: number;
  celebration?: number | null;
}) {
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [speechText, setSpeechText] = useState("Hello!");
  const [faceExpression, setFaceExpression] = useState("( • ‿ • )");
  const [isWiggling, setIsWiggling] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Eye blink cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setFaceExpression((prev) => (prev === "( • ‿ • )" ? "( - ‿ - )" : prev));
      setTimeout(() => {
        setFaceExpression((prev) => (prev === "( - ‿ - )" ? "( • ‿ • )" : prev));
      }, 200);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Initial greeting: "Hello!" when visible
  useEffect(() => {
    setSpeechText("Hello!");
    setFaceExpression("( ^ ‿ ^ )");
    setBubbleOpen(true);
    const t = setTimeout(() => {
      setBubbleOpen(false);
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  // Success screen celebration: "Bye!"
  useEffect(() => {
    if (celebration !== null) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setSpeechText("Bye!");
      setFaceExpression("( ★ ‿ ★ )");
      setBubbleOpen(true);
      const t = setTimeout(() => {
        setBubbleOpen(false);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [celebration]);

  // Idle timer: when user is idle for 5.5s on a question, throw a ONE-WORD motivation!
  useEffect(() => {
    if (typeof selectedScore === "number") return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    idleTimerRef.current = setTimeout(() => {
      const word = GINNIE_IDLE_WORDS[questionIndex % GINNIE_IDLE_WORDS.length];
      setSpeechText(word);
      setFaceExpression("( ⚡ ‿ ⚡ )");
      setBubbleOpen(true);

      // Auto-hide after 2.4s so it never stays or distracts
      hideTimerRef.current = setTimeout(() => {
        setBubbleOpen(false);
      }, 2400);
    }, 5500);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [questionIndex, selectedScore]);

  // When question changes, reset bubble and face
  useEffect(() => {
    setBubbleOpen(false);
    setFaceExpression("( • ‿ • )");
  }, [questionIndex]);

  // Answer validation reaction (short, non-distracting 1-word)
  useEffect(() => {
    if (typeof selectedScore === "number") {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      const feedback = selectedScore >= 4 ? "Great!" : selectedScore === 3 ? "Solid!" : "Noted!";
      setSpeechText(feedback);
      setFaceExpression(selectedScore >= 4 ? "( ★ ‿ ★ )" : "( ˘ ◡ ˘ )");
      setBubbleOpen(true);

      const hideTimer = setTimeout(() => {
        setBubbleOpen(false);
      }, 1600);
      return () => clearTimeout(hideTimer);
    }
  }, [selectedScore]);

  // Hover handlers: show on hover, immediately hide when mouse leaves
  const handleMouseEnter = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setSpeechText("Focus!");
    setFaceExpression("( ^ ‿ ^ )");
    setBubbleOpen(true);
  };

  const handleMouseLeave = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setBubbleOpen(false);
  };

  // Tap interaction (for mobile / click)
  const handleTap = () => {
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 450);
    const word = GINNIE_IDLE_WORDS[(questionIndex + 1) % GINNIE_IDLE_WORDS.length];
    setSpeechText(word);
    setFaceExpression("( ⚡ ‿ ⚡ )");
    setBubbleOpen(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setBubbleOpen(false);
    }, 2200);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.12}
      whileDrag={{ scale: 1.12, cursor: "grabbing" }}
      className="ginnie-floating-wrap"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Floating Pill Bubble (Compact, one-word, non-cropping) */}
      <AnimatePresence>
        {bubbleOpen && (
          <motion.div
            key={speechText}
            initial={{ opacity: 0, scale: 0.85, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="ginnie-pill-bubble"
          >
            <p className="ginnie-pill-text">{speechText}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Draggable Blue Avatar Character */}
      <motion.div
        onClick={handleTap}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          y: isWiggling ? [-4, 4, -4, 0] : [0, -8, 0],
          rotate: isWiggling ? [-10, 10, -6, 0] : [-1.5, 1.5, -1.5],
        }}
        transition={{
          y: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.94 }}
        className="ginnie-avatar-stage"
        role="button"
        tabIndex={0}
        aria-label="Ginnie co-pilot avatar. Hover or tap for focus boost."
        title="Ginnie · Drag me anywhere!"
      >
        <div className="ginnie-avatar-glow" />
        <div className="ginnie-avatar-shadow" />

        {/* Blue Genie SVG Character */}
        <div className="ginnie-avatar-body">
          <svg width="64" height="74" viewBox="0 0 64 74" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Genie Smoke / Mystical Swirl Base */}
            <path
              d="M32 50 C24 55, 17 60, 22 66 C26 71, 38 68, 33 73 C31 75, 27 74, 25 74"
              stroke="url(#ginnieTailGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />

            {/* Genie Head Orb (Blue Gradient + Cyan Stroke) */}
            <circle cx="32" cy="34" r="22" fill="url(#ginnieBodyGrad)" stroke="#38bdf8" strokeWidth="1.8" />

            {/* Blue Turban / Magic Crown */}
            <path
              d="M14 26 C14 13, 22 9, 32 9 C42 9, 50 13, 50 26 C45 22, 38 20, 32 20 C26 20, 19 22, 14 26 Z"
              fill="#2563eb"
            />
            <path
              d="M20 17 C26 12, 38 12, 44 17"
              stroke="#93c5fd"
              strokeWidth="1.3"
              strokeLinecap="round"
            />

            {/* Forehead Magic Blue Jewel */}
            <circle cx="32" cy="16" r="3.2" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="32" cy="16" r="1.5" fill="#e0f2fe" />

            {/* Screen Face Plate */}
            <rect x="15" y="27" width="34" height="18" rx="9" fill="#061536" stroke="#38bdf8" strokeWidth="1.3" />

            <defs>
              <linearGradient id="ginnieBodyGrad" x1="16" y1="14" x2="48" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2454d9" />
                <stop offset="1" stopColor="#0b2860" />
              </linearGradient>
              <linearGradient id="ginnieTailGrad" x1="20" y1="50" x2="34" y2="74" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="1" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Expressive Cyan ASCII Face */}
          <div className="ginnie-face-plate">
            <motion.span
              key={faceExpression}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="ginnie-avatar-face-text"
            >
              {faceExpression}
            </motion.span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function QuestionScreen({
  questionIndex,
  answers,
  xp,
  celebration,
  onAnswer,
  onBack,
  onHome,
}: {
  questionIndex: number;
  answers: Record<number, number>;
  xp: number;
  celebration: number | null;
  onAnswer: (value: number) => void;
  onBack: () => void;
  onHome: () => void;
}) {
  const current = questionList[questionIndex];
  const Icon = current.pillar.icon;
  const selected = answers[questionIndex];
  const isLocked = celebration !== null;

  return (
    <div className="min-h-screen bg-[#f8fbff]">
      <div className="relative z-20 flex h-[58px] items-center justify-between border-b border-[#d9e4f7] bg-white/85 px-4 backdrop-blur-md sm:px-8 lg:px-12">
        <button
          onClick={onHome}
          className="text-button flex items-center gap-1.5 text-xs font-bold"
          aria-label="Exit assessment"
        >
          <ChevronLeft size={16} /> Exit
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          {typeof xp === "number" && (
            <div className="xp-pill" aria-live="polite">
              <Zap size={13} strokeWidth={2.6} />
              <span>{xp} XP</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#63708c]">
            <Clock3 size={14} className="text-[#2454d9]" />
            <span className="hidden sm:inline">3 min assessment</span>
          </div>
        </div>
      </div>
      <main className="relative mx-auto flex min-h-[calc(100vh-58px)] max-w-[1120px] flex-col px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
        <JourneyProgress questionIndex={questionIndex} xp={xp} />

        <AnimatePresence mode="wait">
          <motion.div
            key={questionIndex}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col justify-center py-8 sm:py-12"
          >
            <div className="mb-5 flex items-center gap-3 sm:mb-7">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6eeff] text-[#2454d9] sm:h-10 sm:w-10">
                <Icon size={19} />
              </span>
              <span className="text-[12px] font-black uppercase tracking-[0.14em] text-[#2454d9] sm:text-sm sm:tracking-[0.16em]">
                {current.pillar.id} · {current.pillar.title}
              </span>
            </div>
            <h1 className="max-w-[920px] text-balance text-[clamp(1.65rem,6vw,3.9rem)] font-bold leading-[1.12] tracking-[-0.025em] text-[#102044]">
              <span className="mr-2 text-[#8aa1c7] sm:mr-3">{questionIndex + 1}.</span>
              {current.question}
            </h1>

            <div className="mt-8 grid gap-3 sm:grid-cols-5 sm:gap-2.5 lg:mt-10 lg:gap-3.5" role="radiogroup" aria-label="Choose your answer">
              {scale.map((option) => (
                <button
                  key={option.value}
                  role="radio"
                  aria-checked={selected === option.value}
                  disabled={isLocked}
                  onClick={() => onAnswer(option.value)}
                  className={`answer-option ${selected === option.value ? "is-selected" : ""} ${isLocked ? "is-locked" : ""}`}
                >
                  <span className="option-number-badge">{option.value}</span>
                  <span className="text-[14px] font-bold text-[#1e293b] sm:text-xs lg:text-sm">{option.label}</span>
                  {selected === option.value && (
                    <span className="option-check-wrap">
                      <Check size={14} strokeWidth={3.2} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between border-t border-[#d9e4f7] py-4 sm:py-5">
          <button onClick={onBack} className="text-button" disabled={isLocked}>
            <ArrowLeft size={17} /> Back
          </button>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#8b99b5] sm:text-xs">
            {Math.floor(questionIndex / 2) + 1} / 6 dimensions
          </p>
        </div>

        {/* FLOATING DRAGGABLE GINNIE AVATAR (Interactive, not in layout flow, user can place anywhere) */}
        <GinnieAvatar
          questionIndex={questionIndex}
          currentPillar={current.pillar}
          selectedScore={selected}
          celebration={celebration}
        />

        <AnimatePresence>{celebration !== null && <CelebrationOverlay pillarIndex={celebration} />}</AnimatePresence>
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
    const palette = ["#2454d9", "#ffd51d", "#0b2860", "#6d94ee", "#ffe88a", "#ffffff", "#d9b800", "#8fb0ea"];
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
      const isGold = color === "#ffd51d" || color === "#ffe88a" || color === "#d9b800";
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
      ? `linear-gradient(135deg, #fff6c8 0%, ${p.color} 45%, #c79a00 100%)`
      : p.color === "#ffffff"
        ? "#ffffff"
        : `linear-gradient(135deg, ${p.color} 0%, ${p.color} 60%, rgba(11,40,96,0.35) 130%)`;
    base.boxShadow = p.color === "#ffffff"
      ? "0 0 0 1px rgba(36,84,217,0.20), 0 2px 10px rgba(11,40,96,0.12)"
      : p.isGold
        ? "0 2px 10px rgba(217,184,0,0.45)"
        : "0 2px 10px rgba(11,40,96,0.22)";
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
      <div className="absolute inset-[-14px] rounded-full bg-[radial-gradient(circle,rgba(36,84,217,0.12),transparent_65%)]" aria-hidden="true" />
      <svg className="relative h-full w-full -rotate-90" viewBox="0 0 214 214" aria-hidden="true">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2454d9" />
            <stop offset="100%" stopColor="#6d94ee" />
          </linearGradient>
        </defs>
        <circle cx="107" cy="107" r={radius} fill="none" stroke="#e1e9f6" strokeWidth="14" />
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
      <motion.div
        className="absolute right-1 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#ffd51d] text-[#0b2860] border-2 border-white shadow-[0_4px_14px_rgba(11,40,96,0.16)]"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 12 }}
        aria-label="Score status badge"
      >
        <Award size={18} strokeWidth={2.4} />
      </motion.div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-[56px] font-black leading-none tracking-[-0.07em] text-[#0b2860] sm:text-[68px]"
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
  onNameChange,
}: {
  name: string;
  overall: number;
  status: string;
  scores: Record<PillarId, number>;
  onNameChange: (n: string) => void;
}) {
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [qrUrl, setQrUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let live = true;
    getQrDataUrl().then((url) => {
      if (live) setQrUrl(url);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!editing) setDraft(name);
    if (editing) setTimeout(() => inputRef.current?.focus(), 60);
  }, [editing, name]);

  const save = () => {
    onNameChange(draft.trim().slice(0, 32));
    setEditing(false);
  };

  return (
    <div className="certificate-premium" aria-label="MIND UP certificate preview">
      <div className="cert-frame-yellow">
        <div className="cert-frame-blue">
          <div className="cert-paper">
            <div className="cert-watermark" aria-hidden="true">MIND UP</div>
            <span className="cert-corner tl" aria-hidden="true" />
            <span className="cert-corner tr" aria-hidden="true" />
            <span className="cert-corner bl" aria-hidden="true" />
            <span className="cert-corner br" aria-hidden="true" />

            <div className="cert-head">
              <div className="cert-head-brand">
                <Logo />
              </div>
              <div className="cert-head-center">
                <h3 className="cert-brand-title">MIND UP™</h3>
                <p className="cert-brand-subtitle">PERSONAL GROWTH ASSESSMENT</p>
              </div>
              <div className="cert-seal-premium">
                <span className="seal-ring">
                  <Trophy size={16} />
                </span>
                <div className="seal-text-col">
                  <span className="seal-rank">EXPLORER</span>
                  <span className="seal-status">VERIFIED</span>
                </div>
              </div>
            </div>

            <div className="cert-title-block">
              <span className="cert-rule" aria-hidden="true" />
              <p className="cert-title">Certificate of Completion</p>
              <span className="cert-rule" aria-hidden="true" />
            </div>
            <p className="cert-presented">Proudly presented to</p>

            <div className="cert-name-wrap-premium">
              {editing ? (
                <div className="cert-edit-row">
                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") save();
                      if (e.key === "Escape") setEditing(false);
                    }}
                    onBlur={save}
                    maxLength={32}
                    placeholder="Your Name"
                    className="cert-name-input"
                    aria-label="Edit name on certificate"
                  />
                  <button onClick={save} className="cert-edit-save" aria-label="Save name">
                    <Check size={16} strokeWidth={3} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditing(true)} className="cert-name-display-premium" title="Click to edit your name">
                  <span className={name ? "" : "is-placeholder"}>{name || "Your Name"}</span>
                  <span className="cert-edit-btn" aria-hidden="true">
                    <Pencil size={13} />
                  </span>
                </button>
              )}
              {!editing && <p className="cert-edit-hint">Tap name to edit · prints on download</p>}
            </div>

            <p className="cert-subtitle">has successfully completed the MIND UP Assessment</p>

            <div className="cert-divider" aria-hidden="true">
              <span className="line" /><span className="diamond" /><span className="line" />
            </div>

            <div className="cert-score-row-premium">
              <div className="cert-overall-premium">
                <span className="cert-caption-light">Overall MIND UP Score</span>
                <strong>{overall}<small>/100</small></strong>
                <span className="cert-status-gold">{status}</span>
                <span className="cert-overall-shine" aria-hidden="true" />
              </div>
              <div className="cert-pillars-premium">
                {pillars.map((p) => (
                  <div key={p.id} className="cert-pillar-premium">
                    <span className="pillar-letter">{p.id}</span>
                    <strong>{roundedPillar(scores[p.id])}</strong>
                    <em>{p.shortTitle}</em>
                  </div>
                ))}
              </div>
            </div>

            <div className="cert-footer-premium">
              <div className="cert-footer-left">
                <span className="cert-date">{today}</span>
                <span className="cert-verified">
                  <BadgeCheck size={14} /> Verified · MIND UP™
                </span>
                <span className="cert-tagline">Your starting point, not your destination.</span>
              </div>
              <div className="cert-qr-premium">
                <div className="qr-box-premium">
                  {qrUrl ? (
                    <img src={qrUrl} alt={`QR code linking to ${QR_URL}`} width={76} height={76} />
                  ) : (
                    <span className="cert-qr-fallback">QR</span>
                  )}
                  <span className="qr-logo" aria-hidden="true">
                    <img src="/logos/site-logo.png" alt="" className="h-3.5 w-auto object-contain" />
                  </span>
                </div>
                <span className="cert-site-premium">website:{QR_SITE}</span>
              </div>
            </div>
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
  const baseW = 1600;
  const baseH = 1130;
  const scale = 2; // 3200 x 2260 physical pixels for 0 pixelation Retina clarity
  const canvas = document.createElement("canvas");
  canvas.width = baseW * scale;
  canvas.height = baseH * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.scale(scale, scale);
  const W = baseW;
  const H = baseH;

  // Triple-layer prestige frame: First Blue -> Then Yellow -> Then Blue
  // Layer 1: Outer Deep Blue Frame
  ctx.fillStyle = "#0b2860";
  ctx.fillRect(0, 0, W, H);

  // Layer 2: Middle Brand Yellow Frame
  ctx.fillStyle = "#ffd51d";
  ctx.fillRect(16, 16, W - 32, H - 32);

  // Layer 3: Inner Deep Blue Frame
  ctx.fillStyle = "#0b2860";
  ctx.fillRect(26, 26, W - 52, H - 52);

  // Certificate Paper: Pure White
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(36, 36, W - 72, H - 72);

  // Subtle paper pattern: faint dots
  ctx.fillStyle = "rgba(36,84,217,0.035)";
  for (let y = 60; y < H - 60; y += 36) {
    for (let x = 60; x < W - 60; x += 36) {
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Watermark
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = "#0b2860";
  ctx.font = "900 180px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("MIND UP", W / 2, H / 2 + 60);
  ctx.restore();

  // Corner ornaments (Camera corner brackets in Yellow)
  ctx.strokeStyle = "#ffd51d";
  ctx.lineWidth = 5;
  const c = 66;
  const len = 44;
  const corners: [number, number, number, number][] = [
    [c, c, 1, 1],
    [W - c, c, -1, 1],
    [c, H - c, 1, -1],
    [W - c, H - c, -1, -1],
  ];
  corners.forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x + dx * len, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * len);
    ctx.stroke();
  });

  const cx = W / 2;

  // Header Row: Top Left Logo, Top Center Title, Top Right Explorer Seal
  try {
    const brandLogo = await loadImage("/logos/site-logo.png");
    const logoH = 44;
    const logoW = (brandLogo.width / brandLogo.height) * logoH;
    ctx.drawImage(brandLogo, 86, 116, logoW, logoH);
  } catch {}

  // 100% Center-aligned MIND UP ™ & PERSONAL GROWTH ASSESSMENT
  ctx.textAlign = "center";
  ctx.fillStyle = "#0b2860";
  ctx.font = "900 46px Arial, sans-serif";
  ctx.fillText("MIND UP™", cx, 142);

  ctx.fillStyle = "#2454d9";
  ctx.font = "800 17px Arial, sans-serif";
  if ("letterSpacing" in ctx) (ctx as any).letterSpacing = "4px";
  ctx.fillText("PERSONAL GROWTH ASSESSMENT", cx, 172);
  if ("letterSpacing" in ctx) (ctx as any).letterSpacing = "0px";

  // Top Right: EXPLORER VERIFIED Seal Badge
  const sealBadgeW = 186;
  const sealBadgeH = 58;
  const sealBadgeX = W - 86 - sealBadgeW;
  const sealBadgeY = 112;
  ctx.fillStyle = "#fffbe6";
  ctx.strokeStyle = "#ffd51d";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  (ctx as any).roundRect?.(sealBadgeX, sealBadgeY, sealBadgeW, sealBadgeH, 29);
  ctx.fill();
  ctx.stroke();
  if (!(ctx as any).roundRect) {
    ctx.fillRect(sealBadgeX, sealBadgeY, sealBadgeW, sealBadgeH);
    ctx.strokeRect(sealBadgeX, sealBadgeY, sealBadgeW, sealBadgeH);
  }
  // Seal star icon
  ctx.fillStyle = "#ffd51d";
  ctx.beginPath();
  ctx.arc(sealBadgeX + 29, sealBadgeY + 29, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#0b2860";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sealBadgeX + 29, sealBadgeY + 29, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#0b2860";
  ctx.font = "900 18px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("★", sealBadgeX + 29, sealBadgeY + 35);
  // Seal text
  ctx.textAlign = "left";
  ctx.fillStyle = "#0b2860";
  ctx.font = "900 14px Arial, sans-serif";
  if ("letterSpacing" in ctx) (ctx as any).letterSpacing = "1.5px";
  ctx.fillText("EXPLORER", sealBadgeX + 58, sealBadgeY + 26);
  ctx.fillStyle = "#2454d9";
  ctx.font = "800 11px Arial, sans-serif";
  ctx.fillText("VERIFIED", sealBadgeX + 58, sealBadgeY + 44);
  if ("letterSpacing" in ctx) (ctx as any).letterSpacing = "0px";

  // Title with gold rules
  ctx.textAlign = "center";
  ctx.fillStyle = "#2454d9";
  ctx.font = "900 24px Arial, sans-serif";
  if ("letterSpacing" in ctx) (ctx as any).letterSpacing = "3px";
  ctx.fillText("CERTIFICATE OF COMPLETION", cx, 248);
  if ("letterSpacing" in ctx) (ctx as any).letterSpacing = "0px";

  ctx.strokeStyle = "#ffd51d";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 380, 266);
  ctx.lineTo(cx - 130, 266);
  ctx.moveTo(cx + 130, 266);
  ctx.lineTo(cx + 380, 266);
  ctx.stroke();

  ctx.fillStyle = "#ffd51d";
  ctx.save();
  ctx.translate(cx, 266);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-6, -6, 12, 12);
  ctx.restore();

  ctx.fillStyle = "#71809b";
  ctx.font = "500 20px Arial, sans-serif";
  ctx.fillText("Proudly presented to", cx, 316);

  ctx.fillStyle = "#0b2860";
  const displayName = (name || "Your Name").slice(0, 32);
  let nameFont = 74;
  ctx.font = `900 ${nameFont}px Georgia, serif`;
  const maxNameW = W - 340;
  while (nameFont > 32 && ctx.measureText(displayName).width > maxNameW) {
    nameFont -= 4;
    ctx.font = `900 ${nameFont}px Georgia, serif`;
  }
  ctx.fillText(displayName, cx, 396);

  // Gold underline flourish under name
  const measuredW = ctx.measureText(displayName).width;
  const nameW = Math.min(740, Math.max(220, measuredW + 60));
  const grad = ctx.createLinearGradient(cx - nameW / 2, 0, cx + nameW / 2, 0);
  grad.addColorStop(0, "rgba(255,213,29,0)");
  grad.addColorStop(0.2, "#ffd51d");
  grad.addColorStop(0.8, "#ffd51d");
  grad.addColorStop(1, "rgba(255,213,29,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(cx - nameW / 2, 412, nameW, 5);

  ctx.fillStyle = "#4f5e79";
  ctx.font = "500 20px Arial, sans-serif";
  ctx.fillText("has successfully completed the MIND UP Assessment", cx, 452);

  // Overall premium card (navy with gold border)
  const ow = 340;
  const ox = 110;
  const oy = 496;
  const oh = 306;
  const cardGrad = ctx.createLinearGradient(ox, oy, ox + ow, oy + oh);
  cardGrad.addColorStop(0, "#0b2860");
  cardGrad.addColorStop(1, "#1a3f8f");
  ctx.fillStyle = cardGrad;
  ctx.fillRect(ox, oy, ow, oh);
  ctx.strokeStyle = "#ffd51d";
  ctx.lineWidth = 3;
  ctx.strokeRect(ox, oy, ow, oh);

  ctx.fillStyle = "#ffd51d";
  ctx.font = "800 15px Arial, sans-serif";
  ctx.textAlign = "center";
  if ("letterSpacing" in ctx) (ctx as any).letterSpacing = "2.5px";
  ctx.fillText("OVERALL MIND UP SCORE", ox + ow / 2, oy + 44);
  if ("letterSpacing" in ctx) (ctx as any).letterSpacing = "0px";

  // Score number + /100
  const overallStr = String(overall);
  ctx.font = "900 118px Arial, sans-serif";
  const overallW = ctx.measureText(overallStr).width;
  ctx.font = "800 32px Arial, sans-serif";
  const suffixW = ctx.measureText("/100").width;
  const scoreGap = 14;
  const totalScoreW = overallW + scoreGap + suffixW;
  const scoreStartX = ox + (ow - totalScoreW) / 2;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 118px Arial, sans-serif";
  ctx.fillText(overallStr, scoreStartX, oy + 174);
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = "800 32px Arial, sans-serif";
  ctx.fillText("/100", scoreStartX + overallW + scoreGap, oy + 170);

  // status gold pill
  ctx.fillStyle = "#ffd51d";
  const pillW = 270;
  const pillH = 50;
  const pillX = ox + 35;
  const pillY = oy + 214;
  ctx.beginPath();
  (ctx as any).roundRect?.(pillX, pillY, pillW, pillH, 25);
  ctx.fill();
  if (!(ctx as any).roundRect) ctx.fillRect(pillX, pillY, pillW, pillH);
  ctx.fillStyle = "#0b2860";
  ctx.font = "900 20px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(status.toUpperCase().slice(0, 20), pillX + pillW / 2, pillY + 33);

  // Pillars 3x2 premium
  ctx.textAlign = "left";
  pillars.forEach((p, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 490 + col * 334;
    const y = oy + row * 160;
    ctx.fillStyle = "#f8fbff";
    ctx.fillRect(x, y, 312, 144);
    ctx.strokeStyle = "#d9e4f7";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, 312, 144);
    ctx.fillStyle = "#ffd51d";
    ctx.fillRect(x, y, 312, 7);
    // letter badge
    ctx.fillStyle = "#0b2860";
    ctx.beginPath();
    ctx.arc(x + 42, y + 60, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 22px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(p.id, x + 42, y + 68);
    ctx.textAlign = "left";
    ctx.fillStyle = "#0b2860";
    ctx.font = "900 52px Arial, sans-serif";
    ctx.fillText(String(roundedPillar(scores[p.id])), x + 78, y + 80);
    ctx.fillStyle = "#4f5e79";
    ctx.font = "700 16px Arial, sans-serif";
    ctx.fillText(p.shortTitle.slice(0, 20), x + 20, y + 118);
  });

  // Footer divider gold
  ctx.strokeStyle = "#ffd51d";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(110, 850);
  ctx.lineTo(W - 110, 850);
  ctx.stroke();

  // Footer left
  ctx.textAlign = "left";
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  ctx.fillStyle = "#0b2860";
  ctx.font = "800 20px Arial, sans-serif";
  ctx.fillText(today, 110, 898);
  ctx.fillStyle = "#2454d9";
  ctx.font = "800 19px Arial, sans-serif";
  ctx.fillText("Verified · MIND UP™", 110, 928);
  ctx.fillStyle = "#8b99b5";
  ctx.font = "500 16px Arial, sans-serif";
  ctx.fillText("Your starting point, not your destination.", 110, 956);

  // QR without border, safely away from bottom right corner bracket
  try {
    const qrData = await getQrDataUrl();
    if (qrData) {
      const img = await loadImage(qrData);
      const qSize = 136;
      // Position QR code safely inside, well to the left of the corner bracket at (1534, 1064)
      const qx = W - 180 - qSize;
      const qy = 868;
      // Clean white card without border
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qx, qy, qSize, qSize);
      ctx.drawImage(img, qx, qy, qSize, qSize);
      // center logo: white circle + site logo + gold ring
      const lcX = qx + qSize / 2;
      const lcY = qy + qSize / 2;
      const lr = 24;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(lcX, lcY, lr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffd51d";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(lcX, lcY, lr, 0, Math.PI * 2);
      ctx.stroke();
      try {
        const logoImg = await loadImage("/logos/site-logo.png");
        const lw = 32;
        const lh = (logoImg.height / logoImg.width) * lw;
        ctx.drawImage(logoImg, lcX - lw / 2, lcY - lh / 2, lw, lh);
      } catch {
        ctx.fillStyle = "#0b2860";
        ctx.font = "900 22px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("S", lcX, lcY + 7);
      }
      // website centered under QR box, safely away from bottom right corner
      ctx.fillStyle = "#0b2860";
      ctx.font = "800 18px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`website:${QR_SITE}`, qx + qSize / 2, qy + qSize + 24);
    }
  } catch {}

  return canvas;
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
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ffd51d] text-[#0b2860]">
              <Award size={26} />
            </div>
            <h3 className="mt-4 text-center text-2xl font-black tracking-[-0.04em] text-[#0b2860]">
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
                placeholder="e.g. Alex Morgan"
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
  onReset,
  onRetake,
  onHome,
}: {
  scores: Record<PillarId, number>;
  overall: number;
  previous: StoredResult | null;
  explorerName: string;
  setExplorerName: (n: string) => void;
  onReset: () => void;
  onRetake: () => void;
  onHome: () => void;
}) {
  const status = statusBands.find((band) => overall >= band.min)!;
  const growth = pillars.reduce((lowest, item) => (scores[item.id] < scores[lowest.id] ? item : lowest));
  const GrowthIcon = growth.icon;
  const [notice, setNotice] = useState("");
  const [nameOpen, setNameOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "download" | "instagram" | "whatsapp" | "twitter" | "linkedin" | "facebook"
  >("download");
  const [sharing, setSharing] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [hintPlayed, setHintPlayed] = useState(false);
  const [certScale, setCertScale] = useState(1);
  const carouselRef = useRef<HTMLDivElement>(null);
  const certOuterRef = useRef<HTMLDivElement>(null);
  const certInnerRef = useRef<HTMLDivElement>(null);
  const CERT_DESIGN_W = 860;

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(""), 3600);
    return () => window.clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mobile download banner appears after 2s, auto-closes after 3s
  useEffect(() => {
    if (bannerDismissed) return;
    const t = window.setTimeout(() => setShowBanner(true), 2000);
    return () => window.clearTimeout(t);
  }, [bannerDismissed]);

  useEffect(() => {
    if (!showBanner || bannerDismissed) return;
    const t = window.setTimeout(() => {
      setShowBanner(false);
      setBannerDismissed(true);
    }, 3000);
    return () => window.clearTimeout(t);
  }, [showBanner, bannerDismissed]);

  // Certificate full-show scaling on mobile & tablet (fills available section width, never overflows)
  useEffect(() => {
    const update = () => {
      const outer = certOuterRef.current;
      const inner = certInnerRef.current;
      if (!outer) return;
      const avail = outer.clientWidth || outer.parentElement?.clientWidth || (window.innerWidth - 32);
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

  const getShareUrl = (name: string) => {
    const safeName = name.trim() || "Explorer";
    // Always use public SITE.url (https://sagarlad.com) so social platform bots (WhatsApp, Twitter, LinkedIn, Facebook) can unfurl the OpenGraph card and certificate
    const origin = SITE.url;
    const params = new URLSearchParams({
      name: safeName,
      score: String(overall),
      status: status.label,
      m: String(scores.M),
      i: String(scores.I),
      n: String(scores.N),
      d: String(scores.D),
      u: String(scores.U),
      p: String(scores.P),
    });
    return `${origin}/mindup-score?${params.toString()}`;
  };

  const getCertificateFile = async (name: string) => {
    const canvas = await renderCertificateCanvas(name, overall, status.label, scores);
    const blob = await canvasToBlob(canvas);
    const safe = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "mind-up";
    const file = blob ? new File([blob], `mind-up-certificate-${safe}-${overall}.png`, { type: "image/png" }) : null;
    return { canvas, blob, file, safe };
  };

  const doDownload = async (name: string) => {
    setSharing(true);
    try {
      const { blob, safe } = await getCertificateFile(name);
      if (!blob) throw new Error("Could not generate certificate");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `mind-up-certificate-${safe}-${overall}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      setNotice("High-resolution certificate downloaded!");
    } catch {
      setNotice("Download failed. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  const openShareUrl = (url: string) => {
    try {
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (!win || win.closed || typeof win.closed === "undefined") {
        window.location.href = url;
      }
    } catch {
      window.location.href = url;
    }
  };

  const doWhatsApp = (name: string) => {
    const shareUrl = getShareUrl(name);
    const caption = getWhatsAppText(overall, status.label, scores, growth, name);
    const waMsg = `${caption}\n\n🏆 My Verified Certificate & Score Breakdown:\n${shareUrl}`;
    void copyText(waMsg);
    openShareUrl(`https://api.whatsapp.com/send?text=${encodeURIComponent(waMsg)}`);
    setNotice("WhatsApp opened with your score & breakdown prefilled!");
  };

  const doTwitter = (name: string) => {
    const shareUrl = getShareUrl(name);
    const tweetCaption = getTweetText(overall, status.label, scores, growth, name);
    void copyText(`${tweetCaption}\n${shareUrl}`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetCaption)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent("MINDUP,PersonalGrowth,SagarLad")}`;
    openShareUrl(twitterUrl);
    setNotice("X opened with your score & certificate prefilled! Just click Post.");
  };

  const doLinkedIn = (name: string) => {
    const shareUrl = getShareUrl(name);
    const caption = getShareText(overall, status.label, scores, growth, name);
    void copyText(caption);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    openShareUrl(linkedInUrl);
    setNotice("LinkedIn opened! Post caption copied to clipboard — just press Paste (Cmd+V / Ctrl+V).");
  };

  const doInstagramShare = async (name: string) => {
    try {
      const shareUrl = getShareUrl(name);
      const caption = getShareText(overall, status.label, scores, growth, name || undefined);
      const { blob } = await getCertificateFile(name);
      if (blob) await copyImageToClipboard(blob);
      await copyText(`${caption}\n\n${shareUrl}`);
      openShareUrl("https://www.instagram.com/create/select/");
      setNotice("Certificate copied to clipboard! Paste directly into Instagram Create (Cmd+V / Ctrl+V).");
    } catch {
      openShareUrl("https://www.instagram.com/");
      setNotice("Instagram opened!");
    }
  };

  const doFacebook = (name: string) => {
    const shareUrl = getShareUrl(name);
    const caption = getShareText(overall, status.label, scores, growth, name);
    void copyText(caption);
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    openShareUrl(fbUrl);
    setNotice("Facebook opened! Post caption copied to clipboard — just press Paste (Cmd+V / Ctrl+V).");
  };

  const handleDownloadClick = () => {
    if (explorerName.trim().length >= 2) {
      void doDownload(explorerName.trim());
    } else {
      setPendingAction("download");
      setNameOpen(true);
    }
  };

  const handleWhatsApp = () => {
    if (explorerName.trim().length >= 2) {
      void doWhatsApp(explorerName.trim());
    } else {
      setPendingAction("whatsapp");
      setNameOpen(true);
    }
  };

  const handleTwitter = () => {
    if (explorerName.trim().length >= 2) {
      void doTwitter(explorerName.trim());
    } else {
      setPendingAction("twitter");
      setNameOpen(true);
    }
  };

  const handleInstagram = () => {
    if (explorerName.trim().length >= 2) {
      void doInstagramShare(explorerName.trim());
    } else {
      setPendingAction("instagram");
      setNameOpen(true);
    }
  };

  const handleLinkedIn = () => {
    if (explorerName.trim().length >= 2) {
      void doLinkedIn(explorerName.trim());
    } else {
      setPendingAction("linkedin");
      setNameOpen(true);
    }
  };

  const handleFacebook = () => {
    if (explorerName.trim().length >= 2) {
      void doFacebook(explorerName.trim());
    } else {
      setPendingAction("facebook");
      setNameOpen(true);
    }
  };

  const handleNameConfirm = (name: string) => {
    setExplorerName(name);
    setNameOpen(false);
    if (pendingAction === "instagram") void doInstagramShare(name);
    else if (pendingAction === "whatsapp") void doWhatsApp(name);
    else if (pendingAction === "twitter") void doTwitter(name);
    else if (pendingAction === "linkedin") void doLinkedIn(name);
    else if (pendingAction === "facebook") void doFacebook(name);
    else void doDownload(name);
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
    const p = Math.min(1, Math.max(0, el.scrollLeft / max));
    setCarouselIndex(Math.round(p * 5));
  };

  const delta = previous && typeof previous.overall === "number" && previous.overall > 0 ? overall - previous.overall : null;

  return (
    <div className="min-h-screen bg-white">
      <main>
        <section className="relative overflow-hidden border-b border-[#d9e4f7] bg-[#f8fbff] px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <PremiumConfetti />
          <div className="absolute left-1/2 top-[-16rem] h-[30rem] w-[46rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(36,84,217,0.10),transparent_65%)]" aria-hidden="true" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto grid max-w-[1160px] items-center gap-8 lg:grid-cols-[auto_1fr] lg:gap-14"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto lg:mx-0"
            >
              <ScoreRing score={overall} />
            </motion.div>
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex flex-wrap items-center justify-center gap-3 lg:justify-start"
              >
                <p className="eyebrow">Your MIND UP score</p>
                <motion.span
                  className="status-chip"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.9, type: "spring", stiffness: 260, damping: 14 }}
                >
                  <Award size={13} strokeWidth={2.6} />
                  {status.label}
                </motion.span>
                {previous && typeof previous.overall === "number" && previous.overall > 0 && delta !== null && delta !== 0 && (
                  <span className={`delta-chip ${delta > 0 ? "is-up" : "is-down"}`}>
                    {delta > 0 ? `+${delta}` : delta} vs last time
                  </span>
                )}
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="mx-auto mt-4 max-w-[760px] text-balance text-[clamp(2rem,6vw,4.4rem)] font-black leading-[1.0] tracking-[-0.06em] text-[#0b2860] lg:mx-0"
              >
                {status.lead}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mx-auto mt-4 max-w-[700px] text-[15px] leading-7 text-[#60708b] sm:text-lg sm:leading-8 lg:mx-0"
              >
                {status.description}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-[#2454d9] lg:justify-start"
              >
                <BadgeCheck size={17} /> Your score is your starting point, not your destination.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.45 }}
                className="mt-6 flex justify-center lg:justify-start"
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
              <h2 className="section-title mt-3">Every dimension, clearly scored.</h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#60708b] sm:text-base">
                Each pillar is scored 0–100 from your two answers. Your overall score is the average of all six.
              </p>
            </motion.div>
            <div className="mt-8 divide-y divide-[#d9e4f7] border-y border-[#d9e4f7] sm:mt-10">
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
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10 ${isGrowth ? "bg-[#0b2860] text-[#ffd51d]" : "bg-[#edf3ff] text-[#2454d9]"}`}>
                        <Icon size={19} />
                      </span>
                      <div className="min-w-0">
                        <span className="mr-1.5 font-black text-[#2454d9]">{pillar.id}</span>
                        <span className="text-[14px] font-bold text-[#17243f] sm:text-[15px]">{pillar.shortTitle}</span>
                        {isGrowth && <span className="growth-tag">Growth zone</span>}
                      </div>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[#e7edf7] sm:h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${scores[pillar.id]}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.15 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className={`h-full rounded-full ${isGrowth ? "bg-gradient-to-r from-[#0b2860] to-[#2454d9]" : "bg-[#2454d9]"}`}
                      />
                    </div>
                    <PillarNumber value={val} />
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section className="result-section">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
              <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}>
                <p className="eyebrow">02 · Your next move</p>
                <h2 className="section-title mt-3">3 moves for your growth zone.</h2>
                <div className="mt-5 flex items-center gap-3 bg-[#f6f9ff] p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2454d9] text-white">
                    <GrowthIcon size={21} />
                  </span>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#2454d9]">Growth zone · {roundedPillar(scores[growth.id])}/100</p>
                    <p className="text-[15px] font-black text-[#0b2860]">{growth.title}</p>
                  </div>
                </div>
                <p className="mt-4 text-[15px] leading-7 text-[#60708b]">
                  Based on your lowest score. Do these three — nothing else — for the next 7 days.
                </p>
              </motion.div>
              <div>
                <ol className="divide-y divide-[#d9e4f7] border-y border-[#d9e4f7]">
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
                <p className="mt-4 bg-[#ffd51d]/40 px-4 py-3 text-[13px] font-black uppercase tracking-[0.12em] text-[#0b2860] sm:text-sm">
                  Focus: {growth.focus}
                </p>
                <p className="mt-4 border-l-4 border-[#2454d9] pl-4 text-[15px] font-bold italic leading-7 text-[#33415c]">
                  “{growth.reflection}”
                </p>
              </div>
            </div>
          </section>

          <section className="result-section">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="eyebrow">03 · MIND UP Explorer</p>
              <h2 className="section-title mx-auto mt-3 text-center">Congratulations, Explorer.</h2>
              <p className="mt-3 text-[15px] leading-7 text-[#60708b]">
                You completed all 6 dimensions and earned <strong className="text-[#0b2860]">+60 XP</strong>. Edit your name right on the certificate, then download or share — everything is pre-filled.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 26, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="mx-auto mt-8 w-full max-w-[920px]"
            >
              <div ref={certOuterRef} className="cert-scale-outer">
                <div
                  ref={certInnerRef}
                  className={`cert-scale-inner ${certScale < 1 ? "is-scaled force-desktop-cert" : ""}`}
                  style={certScale < 1 ? { width: CERT_DESIGN_W, transform: `scale(${certScale})` } : undefined}
                >
                  <CertificatePreview name={explorerName} overall={overall} status={status.label} scores={scores} onNameChange={setExplorerName} />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="mx-auto mt-7 w-full max-w-[920px]"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              onViewportEnter={playScrollHint}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#52617d]">
                  Swipe · 6 options
                  <span className="scroll-hint-arrows" aria-hidden="true">
                    <ChevronLeft size={14} /><ChevronRight size={14} />
                  </span>
                </p>
                <div className="flex gap-2">
                  <button onClick={() => scrollCarousel(-1)} className="carousel-arrow" aria-label="Previous option">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => scrollCarousel(1)} className="carousel-arrow" aria-label="Next option">
                    <ChevronRight size={18} />
                  </button>
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
                    onClick={handleWhatsApp}
                    className="share-card"
                    variants={{ hidden: { x: 90, opacity: 0 }, show: { x: 0, opacity: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
                  >
                    <span className="share-card-icon"><WhatsAppIcon size={22} /></span>
                    <strong>WhatsApp</strong>
                    <span>Real score & caption auto-filled</span>
                  </motion.button>
                  <motion.button
                    data-card
                    onClick={handleLinkedIn}
                    className="share-card"
                    variants={{ hidden: { x: 90, opacity: 0 }, show: { x: 0, opacity: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
                  >
                    <span className="share-card-icon"><LinkedInIcon size={22} /></span>
                    <strong>LinkedIn</strong>
                    <span>Score & insight pre-filled</span>
                  </motion.button>
                  <motion.button
                    data-card
                    onClick={handleTwitter}
                    className="share-card"
                    variants={{ hidden: { x: 90, opacity: 0 }, show: { x: 0, opacity: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
                  >
                    <span className="share-card-icon"><TwitterXIcon size={22} /></span>
                    <strong>X (Twitter)</strong>
                    <span>Tweet your score & move</span>
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
                    <span>Share certificate image</span>
                  </motion.button>
                  <motion.button
                    data-card
                    onClick={handleFacebook}
                    className="share-card"
                    variants={{ hidden: { x: 90, opacity: 0 }, show: { x: 0, opacity: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
                  >
                    <span className="share-card-icon"><FacebookIcon size={22} /></span>
                    <strong>Facebook</strong>
                    <span>Caption auto-copied</span>
                  </motion.button>
                </div>
                <span className="carousel-fade-edge" aria-hidden="true" />
              </div>
              <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden="true">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`carousel-dot ${carouselIndex === i ? "is-active" : ""}`} />
                ))}
              </div>
              <p className="mt-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-[#8b99b5]">
                Scroll sideways to explore all 6 share options
              </p>
            </motion.div>

          </section>

          <section className="result-section">
            <div className="reset-adaptive">
              <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0b2860] sm:text-xs">
                    <span className="rounded-full bg-[#ffd51d] px-3 py-1 font-black">{status.resetKicker} · for {status.label} scorers</span>
                  </p>
                  <h2 className="mt-4 text-[28px] font-black leading-tight tracking-[-0.03em] text-[#0b2860] sm:text-4xl lg:text-5xl">
                    {status.resetTitle}
                  </h2>
                  <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#52617d]">
                    {status.resetMessage}
                  </p>
                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#d8e5f8] bg-[#edf4fc] p-4">
                    <Target size={20} className="mt-0.5 shrink-0 text-[#0b2860]" />
                    <p className="text-sm font-bold leading-6 text-[#0b2860]">This week’s rule: {status.resetTip}</p>
                  </div>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button onClick={onReset} className="primary-button">
                      Get my 7-day reset <ChevronRight size={19} />
                    </button>
                    <button onClick={onRetake} className="secondary-button">
                      <RefreshCw size={17} /> Retake in 30 days
                    </button>
                  </div>
                </div>
                <div className="reset-preview-card">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#2454d9]">Week preview · {growth.shortTitle}</p>
                  <ol className="mt-4 space-y-2.5">
                    {growth.actions.slice(0, 3).map((a, i) => (
                      <li key={a} className="flex items-start gap-3 text-sm font-bold leading-6 text-[#283651]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2454d9] text-[11px] font-black text-white">{i + 1}</span>
                        {a}
                      </li>
                    ))}
                    <li className="flex items-start gap-3 text-sm font-bold leading-6 text-[#283651]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ffd51d] text-[11px] font-black text-[#0b2860]">4</span>
                      {status.resetTip}
                    </li>
                  </ol>
                  <div className="mt-4 border-t border-[#d9e4f7] pt-3 text-xs font-bold text-[#71809b]">
                    + 3 more days, trackers & reflection inside
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {nameOpen && (
        <NameModal
          open={nameOpen}
          initialName={explorerName}
          actionLabel={
            pendingAction === "instagram"
              ? "Continue to Instagram"
              : pendingAction === "whatsapp"
              ? "Continue to WhatsApp"
              : pendingAction === "twitter"
              ? "Continue to X (Twitter)"
              : pendingAction === "linkedin"
              ? "Continue to LinkedIn"
              : pendingAction === "facebook"
              ? "Continue to Facebook"
              : "Download certificate"
          }
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
    <strong className="text-left text-[22px] tracking-[-0.04em] text-[#0b2860] sm:text-right sm:text-2xl">
      {display}
    </strong>
  );
}

/* ---------- 7-DAY RESET GUIDE ---------- */
function ResetGuide({
  scores,
  overall,
  explorerName,
  onBack,
}: {
  scores: Record<PillarId, number>;
  overall: number;
  explorerName: string;
  onBack: () => void;
}) {
  const status = statusBands.find((b) => overall >= b.min)!;
  const strongest = pillars.reduce((best, item) => (scores[item.id] > scores[best.id] ? item : best));
  const growth = pillars.reduce((lowest, item) => (scores[item.id] < scores[lowest.id] ? item : lowest));
  const dailyActions = [
    growth.actions[0],
    growth.actions[1],
    growth.actions[2],
    status.resetTip,
    growth.actions[3],
    `Reflect: ${growth.reflection}`,
    "Review your week and choose one action to continue for 30 days.",
  ];

  return (
    <div className="min-h-screen bg-[#edf3fb] print:bg-white">
      <div className="no-print sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[#d9e4f7] bg-white px-4 py-3 sm:px-8 sm:py-4">
        <button onClick={onBack} className="text-button"><ArrowLeft size={18} /> <span className="hidden sm:inline">Back to results</span><span className="sm:hidden">Back</span></button>
        <button onClick={() => window.print()} className="primary-button small"><Printer size={17} /> <span className="hidden sm:inline">Download / print</span><span className="sm:hidden">Print</span></button>
      </div>

      <main className="reset-sheet mx-auto my-6 max-w-[920px] bg-white px-6 py-8 shadow-xl print:my-0 print:max-w-none print:shadow-none sm:my-8 sm:px-12 sm:py-10 lg:px-16">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-[#2454d9] pb-6">
          <Logo />
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#71809b]">Personal action guide · {status.label}</p>
        </div>

        <section className="py-8 sm:py-10">
          <p className="eyebrow">{status.resetKicker}{explorerName ? ` · prepared for ${explorerName}` : ""}</p>
          <h1 className="mt-3 text-[32px] font-black leading-tight tracking-[-0.055em] text-[#0b2860] sm:text-5xl lg:text-6xl">{status.resetTitle}</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#60708b] sm:text-lg sm:leading-8">{status.resetMessage}</p>
          <div className="mt-5 flex items-start gap-3 bg-[#fff6d6] p-4">
            <Zap size={19} className="mt-0.5 shrink-0 text-[#8a6d00]" />
            <p className="text-sm font-bold leading-6 text-[#5c4a00]">Designed for {status.label} ({overall}/100): {status.resetTip}</p>
          </div>
        </section>

        <section className="grid gap-5 border-y border-[#d9e4f7] py-7 sm:grid-cols-3 sm:gap-6 sm:py-8">
          <div><p className="score-caption">MIND UP score</p><p className="mt-1 text-4xl font-black text-[#0b2860] sm:text-5xl">{overall}<span className="text-lg text-[#71809b] sm:text-xl">/100</span></p></div>
          <div><p className="score-caption">Your strength</p><p className="mt-2 text-[15px] font-black text-[#0b2860]">{strongest.title}</p><p className="mt-1 text-sm font-bold text-[#2454d9]">{roundedPillar(scores[strongest.id])}/100</p></div>
          <div><p className="score-caption">Growth zone</p><p className="mt-2 text-[15px] font-black text-[#0b2860]">{growth.title}</p><p className="mt-1 text-sm font-bold text-[#2454d9]">{roundedPillar(scores[growth.id])}/100</p></div>
        </section>

        <section className="py-8 sm:py-9">
          <h2 className="text-xl font-black tracking-[-0.04em] text-[#102044] sm:text-2xl">Your six pillar scores</h2>
          <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 sm:gap-y-4">
            {pillars.map((pillar) => (
              <div key={pillar.id} className="flex items-center justify-between border-b border-[#d9e4f7] py-2.5 sm:py-3">
                <span className="text-sm font-bold text-[#4f5e79] sm:text-[15px]"><b className="mr-2 text-[#2454d9]">{pillar.id}</b>{pillar.shortTitle}</span>
                <strong className="text-[#0b2860]">{roundedPillar(scores[pillar.id])}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-[#d9e4f7] py-8 sm:py-9">
          <p className="eyebrow">Your seven daily actions</p>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.045em] text-[#102044] sm:text-3xl">Focus: {growth.focus}</h2>
          <div className="mt-6 space-y-2.5 sm:mt-7 sm:space-y-3">
            {dailyActions.map((action, index) => (
              <div key={`${action}-${index}`} className="grid grid-cols-[42px_1fr_auto] items-center gap-3 bg-[#f6f9ff] px-3 py-3.5 sm:grid-cols-[48px_1fr_auto] sm:gap-4 sm:px-4 sm:py-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2454d9] text-[13px] font-black text-white sm:h-9 sm:w-9 sm:text-sm">{index + 1}</span>
                <span className="text-[13px] font-bold leading-5 text-[#283651] sm:text-[15px] sm:leading-6">{action}</span>
                <span className="h-5 w-5 border-2 border-[#aab9d2] sm:h-6 sm:w-6" aria-label="Complete" />
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-[#d9e4f7] py-8 sm:py-9">
          <h2 className="text-2xl font-black tracking-[-0.045em] text-[#102044] sm:text-3xl">Reflection</h2>
          <p className="mt-4 text-[15px] font-bold text-[#52617d]">What changed when I took one small action consistently?</p>
          <div className="mt-6 space-y-8">
            {[1, 2, 3, 4].map((line) => <div key={line} className="border-b border-[#9dabc2]" />)}
          </div>
          <p className="mt-10 text-[15px] font-bold text-[#52617d]">What will I carry into the next 30 days?</p>
          <div className="mt-6 space-y-8">
            {[1, 2, 3].map((line) => <div key={line} className="border-b border-[#9dabc2]" />)}
          </div>
        </section>

        <footer className="mt-6 flex flex-col justify-between gap-2 border-t-4 border-[#ffd51d] pt-6 text-[13px] text-[#71809b] sm:flex-row sm:text-sm">
          <p className="font-bold text-[#0b2860]">Your score is your starting point, not your destination.</p>
          <p>website:{QR_SITE} · {QR_URL.replace("https://", "")}</p>
        </footer>
      </main>
    </div>
  );
}

/* ---------- APP ---------- */
export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [celebration, setCelebration] = useState<number | null>(null);
  const [previous, setPrevious] = useState<StoredResult | null>(null);
  const [explorerName, setExplorerName] = useState("");
  const advanceTimer = useRef<any>(null);
  const celebrationTimer = useRef<any>(null);

  const scores = useMemo(() => calculatePillarScores(answers), [answers]);
  const overall = useMemo(() => calculateOverall(scores), [scores]);

  const xp = useMemo(() => {
    let done = 0;
    for (let i = 0; i < 6; i++) {
      const a = answers[i * 2];
      const b = answers[i * 2 + 1];
      if (a >= 1 && a <= 5 && b >= 1 && b <= 5) done++;
    }
    return done * 10;
  }, [answers]);

  useEffect(() => {
    const stored = window.localStorage.getItem("mind-up-latest-result");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as StoredResult;
      setPrevious(parsed);
      if (parsed.name) setExplorerName(parsed.name);
    } catch {
      window.localStorage.removeItem("mind-up-latest-result");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
      if (celebrationTimer.current) window.clearTimeout(celebrationTimer.current);
    };
  }, []);

  const clearTimers = () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    if (celebrationTimer.current) window.clearTimeout(celebrationTimer.current);
    advanceTimer.current = null;
    celebrationTimer.current = null;
  };

  const start = () => {
    clearTimers();
    setCelebration(null);
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
    setCelebration(null);
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
    window.localStorage.setItem("mind-up-latest-result", JSON.stringify(result));
    setScreen("results");
    window.scrollTo(0, 0);
  };

  const handleAnswer = (value: number) => {
    if (celebration !== null) return;
    if (value < 1 || value > 5) return;
    const nextAnswers = { ...answers, [questionIndex]: value };
    setAnswers(nextAnswers);
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);

    advanceTimer.current = window.setTimeout(() => {
      if (questionIndex % 2 === 1) {
        const pillarIdx = Math.floor(questionIndex / 2);
        if (FULLSCREEN_XP_PILLARS.includes(pillarIdx)) {
          setCelebration(pillarIdx);
          celebrationTimer.current = window.setTimeout(() => {
            setCelebration(null);
            if (questionIndex === 11) {
              finishAssessment(nextAnswers);
            } else {
              setQuestionIndex(questionIndex + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }, 2000);
        } else {
          if (questionIndex === 11) {
            finishAssessment(nextAnswers);
          } else {
            setQuestionIndex(questionIndex + 1);
          }
        }
      } else {
        setQuestionIndex(questionIndex + 1);
      }
    }, 520);
  };

  const handleBack = () => {
    if (celebration !== null) return;
    clearTimers();
    if (questionIndex === 0) {
      setScreen("welcome");
      return;
    }
    setQuestionIndex((index) => index - 1);
  };

  if (screen === "welcome") return <Welcome onStart={start} />;
  if (screen === "question") {
    return (
      <QuestionScreen
        questionIndex={questionIndex}
        answers={answers}
        xp={xp}
        celebration={celebration}
        onAnswer={handleAnswer}
        onBack={handleBack}
        onHome={home}
      />
    );
  }
  if (screen === "reset")
    return <ResetGuide scores={scores} overall={overall} explorerName={explorerName} onBack={() => setScreen("results")} />;
  return (
    <ResultsScreen
      scores={scores}
      overall={overall}
      previous={previous}
      explorerName={explorerName}
      setExplorerName={setExplorerName}
      onReset={() => {
        setScreen("reset");
        window.scrollTo(0, 0);
      }}
      onRetake={start}
      onHome={home}
    />
  );
}
