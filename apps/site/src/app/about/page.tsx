"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ArrowRight, Trophy, Medal, Footprints } from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import { Timeline } from "@/components/about/Timeline";
import { TraveledMap } from "@/components/about/TraveledMap";
import { JsonLd } from "@/components/JsonLd";
import { SITE } from "@/lib/site";

import { METRICS, metricNum } from "@/lib/metrics";

const stats = [
  { value: metricNum(METRICS.yearsExperience), suffix: "+", label: "Years in tech & data" },
  { value: metricNum(METRICS.countriesTravelled), suffix: "+", label: "Countries travelled" },
  { value: metricNum(METRICS.booksPublished), suffix: "+", label: "Books published" },
  { value: metricNum(METRICS.communityReached), suffix: "K+", label: "Community reached" },
];

const pageNav = [
  ["belief", "Professional Bio"],
  ["journey", "My Journey"],
  ["travel", "Travel"],
  ["running", "Runner for Life"],
  ["connect", "Connect"],
];

export default function AboutPage() {
  const root = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>("belief");

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((block) => {
        gsap.fromTo(
          block,
          { opacity: 0, y: 36, filter: "blur(4px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // Runner race cards — staggered slide-in + count-up
      const runnerCards = gsap.utils.toArray<HTMLElement>("[data-runner-card]");
      if (runnerCards.length) {
        gsap.fromTo(
          runnerCards,
          { opacity: 0, x: 40, scale: 0.95 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: "[data-runner-cards]",
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
        // Count-up for the race counts
        runnerCards.forEach((card) => {
          const countEl = card.querySelector<HTMLElement>(".runner-count");
          const target = Number(card.dataset.count);
          if (!countEl || !target) return;
          gsap.fromTo(
            { val: 0 },
            { val: target },
            {
              val: target,
              duration: 1.2,
              ease: "power2.out",
              delay: 0.3,
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none none",
              },
              onUpdate(this: gsap.core.Tween) {
                const v = Math.round(this.vars.val as number);
                countEl.textContent = `×${v}`;
              },
            }
          );
        });
      }
    }, el);

    // ScrollTrigger measured positions before fonts/images settled, which on
    // mobile leaves below-fold sections stuck at opacity 0. Recalibrate once
    // layout is stable so every section reveals correctly on all devices.
    const refresh = () => ScrollTrigger.refresh();
    window.setTimeout(refresh, 0);
    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh).catch(() => {});
    }
    window.addEventListener("load", refresh, { once: true });

    return () => ctx.revert();
  }, []);

  // Sub-nav scrollspy: highlight the section currently under the sticky bar across all devices.
  useEffect(() => {
    const ids = pageNav.map(([id]) => id);

    const onScroll = () => {
      // Threshold takes into account sticky main navbar (64px) + sticky subnav (~48px) + offset
      const threshold = 140;
      let current = ids[0];

      for (const id of ids) {
        const s = document.getElementById(id);
        if (s) {
          const top = s.getBoundingClientRect().top;
          if (top <= threshold) {
            current = id;
          }
        }
      }

      // If scrolled near bottom of page, activate last item
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 60
      ) {
        current = ids[ids.length - 1];
      }

      setActiveSection(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // When activeSection changes, auto-scroll active pill into view on mobile
  useEffect(() => {
    if (!navContainerRef.current) return;
    const activeEl = navContainerRef.current.querySelector<HTMLElement>(
      `[data-nav-pill="${activeSection}"]`
    );
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeSection]);

  const handleNavClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setActiveSection(id);
    const target = document.getElementById(id);
    if (target) {
      // 64px site navbar + 50px sub-nav + 6px breathing room
      const navOffset = 120;
      const targetTop =
        target.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  // Counting animation for stat numbers
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.querySelectorAll<HTMLElement>("[data-stat]").forEach((card) => {
        const numEl = card.querySelector("[data-stat-num]");
        if (!numEl) return;
        const target = Number(card.dataset.stat || "0");
        const suffix = card.dataset.statSuffix || "";
        numEl.textContent = `${target.toLocaleString("en-US")}${suffix}`;
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-stat]").forEach((card, i) => {
        const numEl = card.querySelector("[data-stat-num]");
        if (!numEl) return;
        const target = Number(card.dataset.stat || "0");
        const suffix = card.dataset.statSuffix || "";
        const counter = { v: 0 };
        const render = () => {
          numEl.textContent = `${Math.round(counter.v).toLocaleString("en-US")}${suffix}`;
        };
        render();
        gsap.fromTo(
          counter,
          { v: 0 },
          {
            v: target,
            duration: 2,
            delay: i * 0.08,
            ease: "power2.out",
            onUpdate: render,
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="bg-background overflow-x-clip">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About Sagar Lad",
          description: "Background, journey and timeline of Sagar Lad — author and public speaker.",
          url: `${SITE.url}/about`,
          mainEntity: {
            "@type": "Person",
            name: "Sagar Lad",
            url: SITE.url,
            jobTitle: "Author · Public Speaker",
          },
        }}
      />
      {/* ---------- Visual Hero ---------- */}
      <section className="relative -mt-16 min-h-[calc(100svh+4rem)] border-b border-border bg-foreground text-background overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/about me hero.webp"
            alt="About Sagar Lad"
            fill
            priority
            className="object-cover object-[63%_50%] sm:object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 min-h-[100svh] flex flex-col justify-end py-12 sm:py-32">
          <div className="max-w-3xl text-center sm:text-left mt-auto" style={{ display: "grid", gap: "0" }}>
            <div data-reveal className="mb-4">
              <span className="inline-block text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-white/70 border border-white/20 rounded-full px-5 py-1.5">
                The full story
              </span>
            </div>
            
            <p data-reveal className="mb-8 text-base sm:text-lg text-white/75 leading-relaxed max-w-xl">
              Data &amp; AI Architect by profession, TEDx Speaker, and
              published author of 6+ books. Founder of the MIND UP Framework —
              a system for thinking clearly and acting intentionally.
            </p>

            <p data-reveal className="mb-10 border-l-2 border-accent pl-4 font-display text-base sm:text-lg font-semibold leading-snug text-white/90 text-left max-w-xl mx-auto sm:mx-0">
              People don&apos;t make poor choices — they make the best choices
              they can with the information they have.
            </p>

            <div data-reveal className="mb-8">
              <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                MIND UP.
              </p>
              <p className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Change your <span className="text-[#ffd51d]">MIND</span>.
              </p>
              <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Change your <span className="text-[#ffd51d]">life</span>.
              </p>
            </div>

            <div data-reveal className="mt-2">
              <SiteLogo light className="h-12 w-auto mx-auto sm:mx-0" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Personal Story ---------- */}
      <section className="py-16 md:py-24 border-b border-border bg-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div data-reveal className="space-y-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
            <p>
              You are probably on this page because you want to know more about
              me. I&apos;m not going to lie, changing my life wasn&apos;t
              glamorous.
            </p>
            <p>
              It was grueling.
            </p>
            <p>
              I know what it feels like to lose yourself. At 31, I hit rock
              bottom. I had lost someone closest to me, my confidence, my
              direction, and my sense of what life could look like. I was
              living with fear, doubt, sleepless nights, and a future I
              couldn&apos;t see.
            </p>
            <p>
              Then I discovered something that changed my life: The biggest
              transformation had to begin in my mind.
            </p>
            <p>
              That realization led me to create MIND UP Theory™ — a simple
              approach to making small shifts in the mind that can create a
              bigger impact in life.
            </p>
            <p>
              Today, my mission is simple: Help people understand their minds,
              discover their natural potential, and build a life they are
              proud of.
            </p>
            <p>
              I believe you don&apos;t have to be fearless. You don&apos;t need
              a perfect plan. You simply need to decide that where you are is
              not where you want to stay. Because when you change the way you
              use your mind, you can change what is possible for your life.
            </p>
            <div className="pt-3">
              <span className="inline-block bg-[#ffd51d] text-black px-3 py-1 rounded font-display text-lg sm:text-xl md:text-2xl font-bold tracking-tight shadow-xs">
                MIND UP. Change your mind. Change your life.
              </span>
            </div>
          </div>
          <div data-reveal className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">Love,</p>
            <SiteLogo className="h-12 w-auto mt-3" />
          </div>
        </div>
      </section>

      {/* ---------- In-page navigation ---------- */}
      <nav
        aria-label="On this page"
        className="sticky top-16 z-40 border-b border-border bg-background/90 backdrop-blur-md"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div
            ref={navContainerRef}
            className="no-scrollbar flex items-center justify-start gap-2 overflow-x-auto px-1 py-3 md:justify-center"
          >
            {pageNav.map(([id, label]) => {
              const isActive = activeSection === id;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => handleNavClick(e, id)}
                  data-nav-pill={id}
                  className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-brand text-white shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {label}
                </a>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ---------- Stats Band ---------- */}
      <section
        data-reveal
        className="card-hover border-b border-border bg-card/40 py-10"
        aria-label="Quick facts about Sagar"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                data-stat={s.value}
                data-stat-suffix={s.suffix}
                className="flex flex-col text-center md:text-left"
              >
                <dt className="order-2 mt-1 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  {s.label}
                </dt>
                <dd className="order-1 font-display text-4xl md:text-5xl font-extrabold text-accent-strong tabular-nums">
                  <span data-stat-num>0{s.suffix}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Professional Bio ---------- */}
      <section id="belief" className="scroll-mt-32 py-20 md:py-28 border-b border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p data-reveal className="inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">
            Professional Bio
          </p>
          <div data-reveal className="mt-6 space-y-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
            <p>
              Sagar Lad works as a Data &amp; AI Architect with a software
              company. He is also a TEDx Speaker and author of 6+ books. But
              his story started long before technology, books, or the TEDx
              stage.
            </p>
            <p>
              Growing up with very little, Sagar learned early that
              circumstances may shape your starting point — but your thinking
              can shape where you go next.
            </p>
            <p>
              He studied Computer Engineering, built a career in technology,
              moved to Europe, worked in Data &amp; AI, travelled across
              countries, and spent years learning from people, books,
              experiences, and life itself.
            </p>
            <p>
              But somewhere along the journey, his questions became bigger than
              technology.
            </p>
            <ol className="list-decimal list-inside space-y-1 text-foreground font-semibold text-base sm:text-lg pl-2">
              <li>How do we make better decisions?</li>
              <li>Why do we think the way we think?</li>
              <li>And what becomes possible when we truly understand our own minds?</li>
            </ol>
            <p>
              Those questions eventually led him to create MIND UP Theory™ — his
              framework for helping people understand their minds, discover their
              potential, and make better choices in life and work.
            </p>
            <p>
              Today, Sagar works at the intersection of AI, technology,
              self-growth, and human potential, sharing ideas through his books,
              speaking, and content.
            </p>
            <p>
              He believes that real growth begins with understanding yourself.
              When you understand your mind, your strengths, and your choices,
              you can take greater responsibility for the life you create.
            </p>
            <p className="font-semibold text-foreground">
              His mission is simple: help people become more aware, make better
              choices, and turn their potential into possibility.
            </p>
            <p className="font-display text-xl sm:text-2xl font-bold text-foreground pt-2">
              Because when you change the way you use your mind, you can change
              what is possible.
            </p>
            <p className="btn-premium inline-block bg-accent text-black px-3 py-0.5 font-display text-xl sm:text-2xl font-bold">
              MIND UP.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Journey Timeline ---------- */}
      <div id="journey" className="scroll-mt-32">
        <Timeline />
      </div>

      {/* ---------- Traveled Countries (Global Explorations) ---------- */}
      <section id="travel" className="scroll-mt-32 py-16 md:py-24 border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <span data-reveal className="inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">
              Global Journey
            </span>
            <h2 data-reveal className="mt-3 font-display text-3xl sm:text-4xl font-bold text-foreground">
              Countries I&apos;ve Traveled
            </h2>
          </div>
          <TraveledMap />
        </div>
      </section>

      {/* ---------- Runner for Life ---------- */}
      <section id="running" className="card-hover scroll-mt-32 py-16 md:py-28 border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Desktop: side-by-side. Mobile: stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Left: header text */}
            <div className="lg:col-span-5 text-center lg:text-left">
              <span data-reveal className="inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">Off the clock</span>
              <h2 data-reveal className="mt-3 font-display text-3xl sm:text-4xl font-bold">
                Runner for life
              </h2>
              <p data-reveal className="mt-4 text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                MIND UP isn&apos;t just something I write about — I live it. Running
                is where I practice the discipline I preach: one step at a time,
                showing up again and again, until the distance becomes part of you.
              </p>
              <div data-reveal className="mt-5 flex items-start gap-3 text-sm text-muted-foreground leading-relaxed justify-center lg:justify-start">
                <Footprints className="w-5 h-5 text-accent-strong shrink-0 mt-0.5" />
                <span>
                  Seven races across three distances — every medal a reminder
                  that consistency beats intensity.
                </span>
              </div>
            </div>

            {/* Right: race cards + marathon images */}
            <div className="lg:col-span-7 space-y-4">
              {/* Race Cards */}
              <div
                data-runner-cards
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {[
                  {
                    icon: Medal,
                    race: "TCS Amsterdam Half Marathon",
                    distance: "21 km",
                    count: 3,
                    label: "×3",
                  },
                  {
                    icon: Trophy,
                    race: "TCS Amsterdam Marathon",
                    distance: "8 km",
                    count: 2,
                    label: "×2",
                  },
                  {
                    icon: Trophy,
                    race: "Amsterdam DAM to DAM",
                    distance: "16 km",
                    count: 2,
                    label: "×2",
                  },
                ].map((r) => {
                  const Icon = r.icon;
                  return (
                    <div
                      key={r.race}
                      data-runner-card
                      data-count={r.count}
                      className="card-hover rounded-xl border border-border bg-background p-5 text-center"
                    >
                      <div className="mx-auto w-10 h-10 rounded-lg bg-brand-light/15 grid place-items-center text-brand">
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="mt-3 font-display text-2xl font-extrabold text-accent-strong runner-count">
                        {r.label}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
                        {r.race}
                      </p>
                      <p className="mt-1 text-sm font-bold">{r.distance}</p>
                    </div>
                  );
                })}
              </div>

              {/* Marathon Images */}
              <div data-reveal className="grid grid-cols-3 gap-3">
                {[
                  { src: "/about me merathon/Sagar Lad Marathon 2017.webp", alt: "Sagar Lad Marathon 2017" },
                  { src: "/about me merathon/Sagar Lad Marathon 2021 .webp", alt: "Sagar Lad Marathon 2021" },
                  { src: "/about me merathon/Sagar Lad Marathon 2022.webp", alt: "Sagar Lad Marathon 2022" },
                ].map((img) => (
                  <div key={img.src} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border group">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 640px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Connect CTA ---------- */}
      <section id="connect" className="card-hover scroll-mt-32 py-20 md:py-28 bg-card/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
          <h2 data-reveal className="font-display text-3xl sm:text-4xl font-bold">
            Come say hi &amp; connect.
          </h2>
          <p data-reveal className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            I&apos;m active on Instagram, LinkedIn. Reach out for
            speaking, book discussions, or tech advice.
          </p>
            <div data-reveal className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2 relative z-10">
            <Link
              href="/contact"
              className="btn-premium inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-7 py-3.5 text-sm font-semibold hover:opacity-95 shadow-lg"
            >
              Get in touch <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/speaking/contact"
              className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-semibold hover:bg-muted transition-colors"
            >
              Book for a talk
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
