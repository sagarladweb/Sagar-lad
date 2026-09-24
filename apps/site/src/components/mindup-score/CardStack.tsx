import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

type PillarId = "M" | "I" | "N" | "D" | "U" | "P";

const cards: { id: PillarId; title: string; image: string }[] = [
  { id: "M", title: "Mindset", image: "/images/mindup/master-your-mind.png" },
  { id: "I", title: "Health", image: "/images/mindup/invest-in-your-health.png" },
  { id: "N", title: "Relationships", image: "/images/mindup/relationship.png" },
  { id: "D", title: "Skills", image: "/images/mindup/develop-skills.png" },
  { id: "U", title: "Potential", image: "/images/mindup/unlock-potential.png" },
  { id: "P", title: "Progress", image: "/images/mindup/progress.png" },
];

type Phase = "scatter" | "attract" | "stack" | "lineup" | "flip" | "hold" | "fade-back";

function seeded(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function isMob() {
  return typeof window !== "undefined" && window.innerWidth < 640;
}

function makeScatterPositions(count: number, mob: boolean, loopKey: number) {
  const rx = mob ? 130 : 200;
  const ry = mob ? 80 : 120;
  return Array.from({ length: count }).map((_, i) => {
    const s = loopKey * 100 + i;
    const angle = seeded(s) * Math.PI * 2;
    const dist = 0.4 + seeded(s + 1) * 0.6;
    return {
      x: Math.cos(angle) * rx * dist,
      y: Math.sin(angle) * ry * dist,
      rot: (seeded(s + 2) - 0.5) * 60,
      orbitSpeed: 0.003 + seeded(s + 3) * 0.006,
      orbitPhase: seeded(s + 4) * Math.PI * 2,
      orbitRadius: 6 + seeded(s + 5) * 12,
    };
  });
}

export function CardStack() {
  const [phase, setPhase] = useState<Phase>("scatter");
  const [tick, setTick] = useState(0);
  const [flipped, setFlipped] = useState([false, false, false, false, false, false]);
  const [loopKey, setLoopKey] = useState(0);
  const [showText, setShowText] = useState(false);

  const mob = isMob();
  const cardW = mob ? 80 : 112;
  const cardH = mob ? 112 : 156;
  const lineGap = mob ? 62 : 84;

  const scatterPos = useMemo(() => makeScatterPositions(6, mob, loopKey), [loopKey, mob]);
  const linePos = useMemo(
    () => cards.map((_, i) => ({ x: (i - 2.5) * lineGap, y: 0, rot: 0 })),
    [lineGap]
  );

  /* Tick for scatter orbit */
  useEffect(() => {
    if (phase !== "scatter" && phase !== "fade-back") return;
    let raf: number;
    const loop = () => { setTick((t) => t + 1); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  /* Phase orchestration */
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (phase === "scatter") {
      timers.push(setTimeout(() => setPhase("attract"), 2800));
    } else if (phase === "attract") {
      timers.push(setTimeout(() => setPhase("stack"), 700));
    } else if (phase === "stack") {
      timers.push(setTimeout(() => setPhase("lineup"), 500));
    } else if (phase === "lineup") {
      timers.push(setTimeout(() => setPhase("flip"), 350));
    } else if (phase === "flip") {
      let delay = 0;
      cards.forEach((_, i) => {
        timers.push(setTimeout(() => {
          setFlipped((p) => { const n = [...p]; n[i] = true; return n; });
        }, delay));
        delay += 600;
      });
      timers.push(setTimeout(() => setPhase("hold"), delay + 300));
    } else if (phase === "hold") {
      /* Show "MIND UP" text after cards are revealed */
      timers.push(setTimeout(() => setShowText(true), 300));
      /* Hold for 3 seconds, then fade back to restart loop seamlessly */
      timers.push(setTimeout(() => {
        setShowText(false);
        setFlipped([false, false, false, false, false, false]);
        setPhase("fade-back");
      }, 3000));
    } else if (phase === "fade-back") {
      /* Cards drift back toward scatter positions, then restart */
      timers.push(setTimeout(() => {
        setLoopKey((k) => k + 1);
        setPhase("scatter");
      }, 1400));
    }

    return () => timers.forEach(clearTimeout);
  }, [phase, loopKey]);

  /* Per-card state */
  const getCard = useCallback(
    (i: number) => {
      const sp = scatterPos[i];
      const lp = linePos[i];

      /* SCATTER: organic orbit drift */
      if (phase === "scatter") {
        const a = sp.orbitPhase + tick * sp.orbitSpeed;
        const dx = Math.cos(a) * sp.orbitRadius;
        const dy = Math.sin(a) * sp.orbitRadius * 0.7;
        const dr = Math.sin(tick * 0.004 + i * 1.3) * 2;
        const depth = 0.85 + (i / 5) * 0.15;
        return {
          x: sp.x + dx * depth, y: sp.y + dy * depth,
          rot: sp.rot + dr, scale: 0.78 + (i / 5) * 0.08,
          opacity: 0.7 + (i / 5) * 0.2, ry: 0,
        };
      }

      /* ATTRACT: magnetic convergence */
      if (phase === "attract") {
        return {
          x: sp.x * 0.06, y: sp.y * 0.06 - 8,
          rot: sp.rot * 0.04, scale: 0.88,
          opacity: 1, ry: 0,
        };
      }

      /* STACK: pile with wobble */
      if (phase === "stack") {
        const w = Math.sin(tick * 0.025 + i * 0.7) * 1.2;
        return {
          x: w, y: -i * 2.5, rot: 0, scale: 0.95, opacity: 1, ry: 0,
        };
      }

      /* LINEUP / FLIP / HOLD: spread in row */
      if (phase === "lineup" || phase === "flip" || phase === "hold") {
        const isFlipped = flipped[i];
        const breathe = phase === "hold" ? 1 + Math.sin(tick * 0.012 + i * 0.9) * 0.012 : 1;
        const liftY = isFlipped ? -10 : 0;
        return {
          x: lp.x, y: lp.y + liftY, rot: 0,
          scale: breathe, opacity: 1,
          ry: isFlipped ? 180 : 0,
        };
      }

      /* FADE-BACK: cards drift from lineup toward new scatter positions, unflipped */
      if (phase === "fade-back") {
        const targetSp = scatterPos[i];
        return {
          x: lp.x * 0.3 + targetSp.x * 0.7,
          y: lp.y * 0.3 + targetSp.y * 0.7,
          rot: targetSp.rot * 0.5,
          scale: 0.82,
          opacity: 0.6,
          ry: 0,
        };
      }

      return { x: 0, y: 0, rot: 0, scale: 1, opacity: 1, ry: 0 };
    },
    [phase, tick, flipped, scatterPos, linePos]
  );

  /* Spring configs */
  const spring = useCallback(
    (i: number) => {
      switch (phase) {
        case "scatter":
          return { type: "spring" as const, stiffness: 25, damping: 15 };
        case "attract":
          return { type: "spring" as const, stiffness: 180, damping: 22, delay: i * 0.03 };
        case "stack":
          return { type: "spring" as const, stiffness: 260, damping: 26, delay: i * 0.015 };
        case "lineup":
          return { type: "spring" as const, stiffness: 140, damping: 18, delay: i * 0.07 };
        case "flip":
          return { type: "spring" as const, stiffness: 120, damping: 16, mass: 0.8 };
        case "hold":
          return { type: "spring" as const, stiffness: 60, damping: 20 };
        case "fade-back":
          return { type: "spring" as const, stiffness: 40, damping: 18, delay: i * 0.03 };
        default:
          return { type: "spring" as const, stiffness: 100, damping: 18 };
      }
    },
    [phase]
  );

  const showLine = phase === "lineup" || phase === "flip" || phase === "hold" || phase === "fade-back";
  const isScatter = phase === "scatter";
  const isAttracting = phase === "attract";

  return (
    <div className="cardstack-wrap" role="img" aria-label="MIND UP visual showcase">
      {/* Ambient glow */}
      <motion.div
        className="cardstack-ambient-glow"
        animate={{
          opacity: isAttracting ? 0.6 : isScatter ? 0.15 : 0.25,
          scale: isAttracting ? 1.2 : 1,
        }}
        transition={{ duration: 0.8 }}
        aria-hidden="true"
      />

      {/* Dust particles */}
      <div className="cardstack-dust" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => {
          const s = loopKey * 50 + i;
          return (
            <motion.div
              key={`d-${loopKey}-${i}`}
              className="cardstack-dust-particle"
              style={{
                left: `${seeded(s) * 100}%`,
                top: `${seeded(s + 10) * 100}%`,
                width: 2 + seeded(s + 20) * 3,
                height: 2 + seeded(s + 20) * 3,
              }}
              animate={{
                x: [0, (seeded(s + 30) - 0.5) * 40, 0],
                y: [0, (seeded(s + 40) - 0.5) * 30, 0],
                opacity: isAttracting ? [0.3, 0.7, 0.3] : [0.1, 0.3, 0.1],
                scale: isAttracting ? [1, 1.8, 1] : [0.7, 1.2, 0.7],
              }}
              transition={{
                duration: isAttracting ? 1.5 : 3 + seeded(s + 50) * 2,
                repeat: Infinity,
                delay: seeded(s + 60) * 1.5,
              }}
            />
          );
        })}
      </div>

      {/* Cards */}
      <div className="cardstack-stage">
        {cards.map((card, i) => {
          const s = getCard(i);
          const t = spring(i);

          return (
            <motion.div
              key={`${loopKey}-${card.id}`}
              className="cardstack-card-wrap"
              animate={{
                x: s.x, y: s.y, rotate: s.rot,
                scale: s.scale, opacity: s.opacity,
                zIndex: showLine ? i : 10 - i,
              }}
              transition={t}
              style={{
                width: cardW, height: cardH,
                filter: showLine
                  ? `drop-shadow(0 8px 20px rgba(13,33,161,${0.12 + i * 0.03}))`
                  : isAttracting
                  ? `drop-shadow(0 0 ${12 + i * 2}px rgba(255,213,29,0.3))`
                  : "none",
              }}
            >
              <motion.div
                className="cardstack-card"
                animate={{ rotateY: s.ry }}
                transition={t}
              >
                <div className="cardstack-inner">
                  {/* Back face */}
                  <div className="cardstack-face cardstack-back">
                    <div className="cardstack-back-pattern">
                      <motion.div
                        className="cardstack-back-ring"
                        animate={
                          isAttracting
                            ? { scale: [1, 1.15, 1], opacity: [0.15, 0.35, 0.15] }
                            : { scale: 1, opacity: 0.15 }
                        }
                        transition={{ duration: 1.2, repeat: isAttracting ? Infinity : 0 }}
                      />
                      <div className="cardstack-back-diamond" />
                      <div className="cardstack-back-arrow">
                        <ArrowUp size={28} strokeWidth={3} />
                        <span className="cardstack-back-label">RISE</span>
                      </div>
                    </div>
                  </div>

                  {/* Front face: letter + image */}
                  <div className="cardstack-face cardstack-front">
                    <span className="cardstack-letter">{card.id}</span>
                    <img src={card.image} alt={card.title} className="cardstack-img" />
                    <span className="cardstack-title">{card.title}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
        {/* "MIND UP" text — fades in from bottom after all cards flip */}
        <AnimatePresence>
          {showText && (
            <motion.div
              className="cardstack-mindup-label"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span className="cardstack-mindup-text">M I N D &nbsp; U P</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
