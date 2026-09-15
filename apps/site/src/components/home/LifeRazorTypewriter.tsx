"use client";

import { useEffect, useRef, useState } from "react";

const TYPING_TEXT = "Be Dumb. Don't worry about what others think.";

export function LifeRazorTypewriter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    if (typed.length >= TYPING_TEXT.length) return;

    const timer = setTimeout(() => {
      setTyped(TYPING_TEXT.slice(0, typed.length + 1));
    }, 45);

    return () => clearTimeout(timer);
  }, [started, typed]);

  return (
    <div ref={sectionRef} className="mt-10 min-h-[3rem] flex items-center justify-center">
      <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#1e293b]">
        {typed}
        {started && typed.length < TYPING_TEXT.length && (
          <span className="typewriter-cursor" />
        )}
      </p>
    </div>
  );
}
