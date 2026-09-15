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
    <div ref={sectionRef} className="mt-10">
      <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight">
        {typed.split("Don't worry about what others think.").length > 1 ? (
          <>
            Be Dumb.{" "}
            <span className="text-accent-strong">
              Don&apos;t worry about what others think.
            </span>
          </>
        ) : (
          <>{typed}</>
        )}
        {started && typed.length < TYPING_TEXT.length && (
          <span className="typewriter-cursor" />
        )}
      </h2>
    </div>
  );
}
