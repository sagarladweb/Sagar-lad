"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Quote as QuoteIcon } from "lucide-react";
import { DotPagination } from "@/components/ui/CarouselNav";
import { Pill } from "@/components/ui/Pill";

const testimonials = [
  {
    quote:
      "Sagar is very dedicated to his job. He quickly understands what you need and delivers very promptly.",
    name: "Traas Evelyn",
    role: "Senior Coordinator, ABN AMRO Private Banking",
  },
  {
    quote:
      "Proactive result oriented, responsible and technically sound. Ready to pull all his energies and time to get the job done.",
    name: "Manoj Kumar",
    role: "Enterprise Cloud Architect",
  },
  {
    quote:
      "Sagar is really good at what he does, he is always a team player to rely on and a continuous learner. It was a good learning experience working alongside him in setting up our applications initially.",
    name: "Vinod Kolli",
    role: "Domain Architect · Data Lineage · Data Marketplace · Data Governance",
  },
  {
    // Lengthiest quote placed at the very last
    quote:
      "I worked with Sagar on different projects. Sagar is always keen to rapidly pick up additional knowledge that is required to get the job done. He also keeps his cool in stressful moments and clearly communicates with the other project team members in order to reach the team goal.",
    name: "Glenn De Boeck",
    role: "Head Digital Office & Business Analytics, ABN AMRO",
  },
];

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fullyVisible, setFullyVisible] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const total = testimonials.length;

  const go = useCallback((next: number) => {
    setIndex(((next % total) + total) % total);
  }, [total]);

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // IntersectionObserver: start auto-scroll only when visible
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setFullyVisible(entry.isIntersecting),
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 8-second auto-swipe interval
  useEffect(() => {
    if (paused || !fullyVisible) return;
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, [next, paused, fullyVisible]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Touch handlers: one swipe at a time, doesn't hamper vertical page scrolling
  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    swipedRef.current = false;
    setPaused(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || swipedRef.current) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;

    // Only swipe if horizontal movement is greater than vertical movement
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX < 0) {
        next();
      } else {
        prev();
      }
      swipedRef.current = true; // One swipe per gesture
    }
  };

  const onTouchEnd = () => {
    touchStartRef.current = null;
    swipedRef.current = false;
    setPaused(false);
  };

  const t = testimonials[index];

  return (
    <section ref={rootRef} className="card-hover py-10 sm:py-14 md:py-16 border-b border-border bg-card/40 group/carousel" aria-label="Testimonials">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center">
           <Pill supportLine="What people say">Testimonials</Pill>
           <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold">
             What people say
           </h2>
         </div>

         <div className="mt-8">
          <div className="flex items-center gap-3">
            {/* Prev arrow: hidden on mobile & tablet, visible on desktop hover */}
            <button
              type="button"
              onClick={prev}
              aria-label="Previous testimonial"
              className="btn-premium shrink-0 hidden lg:grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-foreground shadow-sm hover:bg-muted opacity-0 group-hover/carousel:opacity-100 transition-opacity"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>

            {/* Card: swipeable on mobile/tablet */}
            <div
              className="card-hover min-w-0 flex-1 overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-10 md:p-12 text-center touch-pan-y select-none transition-all"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onTouchCancel={onTouchEnd}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <QuoteIcon className="w-10 h-10 mx-auto text-brand-light shrink-0" aria-hidden="true" />
              <blockquote className="mt-6 font-display text-xl sm:text-2xl md:text-3xl font-bold leading-snug min-h-[100px] sm:min-h-[120px] flex items-center justify-center px-2">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <p className="mt-6 font-semibold">{t.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t.role}</p>
            </div>

            {/* Next arrow: hidden on mobile & tablet, visible on desktop hover */}
            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="btn-premium shrink-0 hidden lg:grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-foreground shadow-sm hover:bg-muted opacity-0 group-hover/carousel:opacity-100 transition-opacity"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>

        <DotPagination
          total={total}
          current={index}
          onChange={go}
          label="testimonial"
          className="mt-8"
        />
      </div>
    </section>
  );
}
