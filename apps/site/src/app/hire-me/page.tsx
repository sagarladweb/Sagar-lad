"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  Mail,
  Send,
  Pen,
  Mic2,
} from "lucide-react";
import { validateContact, sanitizeText, digitsOnly } from "@/lib/client-validators";
import { Dropdown } from "@/components/ui/Dropdown";
import { Calendar } from "@/components/ui/Calendar";
import { Pill } from "@/components/ui/Pill";
import { SocialLinks } from "@/components/SocialLinks";
import { JsonLd } from "@/components/JsonLd";
import { SITE } from "@/lib/site";

const initial = {
  fullName: "",
  email: "",
  phone: "",
  organization: "",
  eventDate: "",
  message: "",
  type: "SPEAKING" as string,
  service: "SPEAKER" as string,
};

type Errors = {
  fullName?: string;
  email?: string;
  phone?: string;
  organization?: string;
  message?: string;
};

function DesktopCarousel({
  slides,
  active,
  setActive,
  next,
}: {
  slides: { src: string; alt: string; label: string; caption: string }[];
  active: number;
  setActive: (i: number) => void;
  next: () => void;
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [inView, next]);

  return (
    <section ref={ref} className="relative w-full h-[80vh] overflow-hidden bg-black">
      {slides.map((s, i) => (
        <div
          key={s.src}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === active ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <Image
            src={s.src}
            alt={s.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-contain object-center p-12"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>
      ))}

      {/* Content overlay — left side */}
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto max-w-7xl w-full px-6">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <Pill>Hire Sagar</Pill>
              <span className="inline-flex items-center rounded-full bg-white/15 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                6+ Books Published
              </span>
              <span className="inline-flex items-center rounded-full bg-white/15 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                Author &amp; Speaker
              </span>
            </div>
            <h1 className="font-display text-5xl xl:text-6xl font-bold leading-tight tracking-tight text-white">
              Let&apos;s <span className="text-[#ffd51d]">collaborate</span>
            </h1>
            <p className="mt-5 text-lg text-white/80 leading-relaxed">
              Whether you need a keynote speaker for your next event or a writer for your next book — Sagar brings
              story-driven impact to every project.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Keynotes, workshops & executive panels on AI and leadership",
                "Book writing, ghostwriting & manuscript development",
                "Customized content mapped to your vision and audience",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-semibold text-white/90">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ffd51d]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((s, i) => (
          <button
            key={s.src}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-all ${i === active ? "bg-white w-5" : "bg-white/40"}`}
          />
        ))}
      </div>
    </section>
  );
}

function WorkShowcase() {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const slides = [
    {
      src: "/images/books/Book_hero.png",
      alt: "MIND UP and AI Foundry — books by Sagar Lad",
      label: "Published Author",
      caption: "MIND UP & AI Foundry",
    },
    {
      src: "/images/speaking/Sagarlad_speaker.webp",
      alt: "Sagar Lad speaking at TEDx AICS on AI, Awareness, Integration, and Mastery",
      label: "TEDx Speaker",
      caption: "TEDx AICS",
    },
  ];

  const next = useCallback(() => setActive((i) => (i + 1) % slides.length), [slides.length]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [inView, next]);

  return (
    <section ref={ref} className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] overflow-hidden bg-black">
      {slides.map((s, i) => (
        <div
          key={s.src}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === active ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <Image
            src={s.src}
            alt={s.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-contain object-center p-4 sm:p-8 md:p-12"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      ))}

      {/* Caption overlay */}
      <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 px-4 sm:px-6 text-center z-10">
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/70 mb-1">
          {slides[active].label}
        </p>
        <p className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white">
          {slides[active].caption}
        </p>
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((s, i) => (
          <button
            key={s.src}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-all ${i === active ? "bg-white w-5" : "bg-white/40"}`}
          />
        ))}
      </div>
    </section>
  );
}

export default function HireMePage() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      src: "/images/books/Book_hero.png",
      alt: "MIND UP and AI Foundry — books by Sagar Lad",
      label: "Published Author",
      caption: "MIND UP & AI Foundry",
    },
    {
      src: "/images/speaking/Sagarlad_speaker.webp",
      alt: "Sagar Lad speaking at TEDx AICS on AI, Awareness, Integration, and Mastery",
      label: "TEDx Speaker",
      caption: "TEDx AICS",
    },
  ];

  const nextSlide = useCallback(() => setActiveSlide((i) => (i + 1) % slides.length), [slides.length]);

  function update<K extends keyof typeof initial>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as keyof Errors]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      firstName: sanitizeText(form.fullName),
      lastName: "",
      email: form.email.trim().toLowerCase(),
      phone: digitsOnly(form.phone),
      organization: sanitizeText(form.organization),
      eventDate: form.eventDate,
      message: `[${form.service}] ${form.message.trim()}`,
      type: form.service === "WRITER" ? "INTERVIEW" : form.type === "INTERVIEW" ? "INTERVIEW" : "SPEAKING",
    };
    const validationErrors = validateContact(payload);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setState("error");
      setMessage("Please fix the highlighted fields.");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setState("success");
        setForm(initial);
        setErrors({});
        setMessage(
          "Thank you! Your inquiry has been received. Sagar's team will get back to you within 24–48 hours."
        );
      } else {
        const data = await res.json().catch(() => ({}));
        setState("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  }

  const input = (hasError?: boolean) =>
    `h-11 rounded-xl border px-3.5 text-sm outline-none focus:ring-2 w-full transition-all shadow-2xs ${
      hasError
        ? "border-red-400 bg-red-50/30 dark:bg-red-950/20 focus:ring-red-300"
        : "border-border bg-background focus:border-[#0d21a1] focus:ring-[#0d21a1]/15"
    }`;

  const fieldError = (key: keyof Errors) =>
    errors[key] ? (
      <p id={`${key}-error`} role="alert" className="mt-1.5 text-xs text-red-600 font-medium">
        {errors[key]}
      </p>
    ) : null;

  const isSpeaker = form.service === "SPEAKER";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Hire Sagar Lad — Speaker & Writer",
          description: "Hire Sagar Lad for keynotes, speaking engagements, book writing, ghostwriting, and content projects.",
          url: `${SITE.url}/hire-me`,
          mainEntity: {
            "@type": "Person",
            name: "Sagar Lad",
            url: SITE.url,
            jobTitle: "Author · Public Speaker · Writer",
          },
        }}
      />

      {/* ===== MOBILE / TABLET: Original layout (hero → carousel → form) ===== */}
      <div className="lg:hidden">
        {/* Hero */}
        <header className="overflow-hidden border-b border-border bg-background text-foreground py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
            <Pill>Hire Sagar</Pill>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl tracking-tight text-foreground">
              Let&apos;s <span className="text-brand">collaborate</span>
            </h1>
            <p className="mt-4 max-w-xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
              Whether you need a keynote speaker for your next event or a writer for your next book — Sagar brings
              story-driven impact to every project.
            </p>
            <ul className="mt-6 space-y-3 max-w-lg mx-auto text-left">
              {[
                "Keynotes, workshops & executive panels on AI and leadership",
                "Book writing, ghostwriting & manuscript development",
                "Customized content mapped to your vision and audience",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-semibold text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </header>

        {/* Carousel */}
        <WorkShowcase />

        {/* Form + Cards */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20 grid grid-cols-1 gap-10 items-start">
          {/* Cards */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-brand/20 bg-brand/5 p-5 flex items-start gap-3.5 shadow-2xs">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0d21a1] text-white shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Fast 24–48h Turnaround</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Direct review by Sagar&apos;s team with customized proposals and availability.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Mic2 className="w-4 h-4 text-brand" />
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Speaking Services</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { title: "Keynote Addresses", desc: "30–60 min anchor talks for conferences, summits & corporate events" },
                    { title: "Executive Masterclasses", desc: "Deep-dives on AI, cloud architecture & leadership" },
                    { title: "Fireside Chats & Panels", desc: "Moderated discussions, Q&A & interactive dialogues" },
                  ].map((f) => (
                    <div key={f.title} className="flex items-start gap-2.5 text-xs">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
                      <div>
                        <p className="font-semibold text-foreground text-xs">{f.title}</p>
                        <p className="text-muted-foreground leading-snug mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Pen className="w-4 h-4 text-brand" />
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Writing Services</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { title: "Book Writing & Ghostwriting", desc: "Full manuscript development from concept to publication" },
                    { title: "Content & Copywriting", desc: "Articles, blogs, brand narratives & thought leadership" },
                    { title: "Book Coaching", desc: "Guidance for first-time authors on structure, voice & publishing" },
                  ].map((f) => (
                    <div key={f.title} className="flex items-start gap-2.5 text-xs">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
                      <div>
                        <p className="font-semibold text-foreground text-xs">{f.title}</p>
                        <p className="text-muted-foreground leading-snug mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-2xs">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Direct Contact</h3>
              <a href="mailto:contact@sagarlad.com" className="inline-flex items-center gap-2 text-xs font-semibold text-foreground hover:text-brand transition-colors">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                contact@sagarlad.com
              </a>
              <div className="pt-2 border-t border-border/60">
                <SocialLinks />
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            <ServiceToggle service={form.service} onChange={(v) => update("service", v)} />
            <Form
              form={form}
              errors={errors}
              state={state}
              message={message}
              input={input}
              fieldError={fieldError}
              update={update}
              onSubmit={onSubmit}
            />
          </div>
        </div>
      </div>

      {/* ===== DESKTOP: Carousel hero (content overlay) → Form ===== */}
      <div className="hidden lg:block">
        {/* Carousel hero — content overlaid on images */}
        <DesktopCarousel
          slides={slides}
          active={activeSlide}
          setActive={setActiveSlide}
          next={nextSlide}
        />

        {/* Form + Cards */}
        <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-12 gap-12 items-start">
          {/* Left: Cards */}
          <div className="col-span-5 space-y-5">
            <div className="rounded-2xl border border-brand/20 bg-brand/5 p-5 flex items-start gap-3.5 shadow-2xs">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0d21a1] text-white shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Fast 24–48h Turnaround</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Direct review by Sagar&apos;s team with customized proposals and availability.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <Mic2 className="w-4 h-4 text-brand" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Speaking Services</h3>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Keynote Addresses", desc: "30–60 min anchor talks for conferences, summits & corporate events" },
                  { title: "Executive Masterclasses", desc: "Deep-dives on AI, cloud architecture & leadership" },
                  { title: "Fireside Chats & Panels", desc: "Moderated discussions, Q&A & interactive dialogues" },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-2.5 text-xs">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
                    <div>
                      <p className="font-semibold text-foreground text-xs">{f.title}</p>
                      <p className="text-muted-foreground leading-snug mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <Pen className="w-4 h-4 text-brand" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Writing Services</h3>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Book Writing & Ghostwriting", desc: "Full manuscript development from concept to publication" },
                  { title: "Content & Copywriting", desc: "Articles, blogs, brand narratives & thought leadership" },
                  { title: "Book Coaching", desc: "Guidance for first-time authors on structure, voice & publishing" },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-2.5 text-xs">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
                    <div>
                      <p className="font-semibold text-foreground text-xs">{f.title}</p>
                      <p className="text-muted-foreground leading-snug mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-2xs">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Direct Contact</h3>
              <a href="mailto:contact@sagarlad.com" className="inline-flex items-center gap-2 text-xs font-semibold text-foreground hover:text-brand transition-colors">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                contact@sagarlad.com
              </a>
              <div className="pt-2 border-t border-border/60">
                <SocialLinks />
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="col-span-7">
            <ServiceToggle service={form.service} onChange={(v) => update("service", v)} />
            <Form
              form={form}
              errors={errors}
              state={state}
              message={message}
              input={input}
              fieldError={fieldError}
              update={update}
              onSubmit={onSubmit}
            />
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Shared sub-components ─── */

function ServiceToggle({ service, onChange }: { service: string; onChange: (v: string) => void }) {
  const isSpeaker = service === "SPEAKER";
  return (
    <div className="flex gap-3 mb-6">
      <button
        type="button"
        onClick={() => onChange("SPEAKER")}
        className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all cursor-pointer ${
          isSpeaker
            ? "border-[#0d21a1] bg-[#0d21a1] text-white shadow-md"
            : "border-border bg-card text-muted-foreground hover:border-foreground/30"
        }`}
      >
        <Mic2 className="w-4 h-4" />
        Hire as Speaker
      </button>
      <button
        type="button"
        onClick={() => onChange("WRITER")}
        className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all cursor-pointer ${
          !isSpeaker
            ? "border-[#0d21a1] bg-[#0d21a1] text-white shadow-md"
            : "border-border bg-card text-muted-foreground hover:border-foreground/30"
        }`}
      >
        <Pen className="w-4 h-4" />
        Hire as Writer
      </button>
    </div>
  );
}

function Form({
  form,
  errors,
  state,
  message,
  input,
  fieldError,
  update,
  onSubmit,
}: {
  form: typeof initial;
  errors: Errors;
  state: string;
  message: string;
  input: (e?: boolean) => string;
  fieldError: (k: keyof Errors) => React.ReactNode;
  update: <K extends keyof typeof initial>(key: K, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const isSpeaker = form.service === "SPEAKER";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm space-y-5"
      noValidate
    >
      <div className="border-b border-border/60 pb-5">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {isSpeaker ? "Speaking Inquiry" : "Writing Inquiry"}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          {isSpeaker
            ? "Share your event dates, venue, and audience details. We customize every keynote to your objectives."
            : "Tell us about your project — topic, scope, timeline, and any publishing goals."}
        </p>
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
          Full Name *
        </label>
        <input
          id="fullName"
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          maxLength={120}
          placeholder="e.g. Rahul Sharma"
          autoComplete="name"
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          className={input(!!errors.fullName)}
          required
        />
        {fieldError("fullName")}
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
            Email *
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            maxLength={100}
            placeholder="rahul@company.in"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={input(!!errors.email)}
            required
          />
          {fieldError("email")}
        </div>
        <div>
          <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
            Mobile Number *
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={form.phone}
            onChange={(e) => update("phone", digitsOnly(e.target.value).slice(0, 10))}
            placeholder="e.g. 9876543210"
            maxLength={10}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            className={input(!!errors.phone)}
            required
          />
          {fieldError("phone")}
        </div>
      </div>

      {/* Organization */}
      <div>
        <label htmlFor="organization" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
          {isSpeaker ? "Organization / Event Name *" : "Company / Project Name *"}
        </label>
        <input
          id="organization"
          value={form.organization}
          onChange={(e) => update("organization", e.target.value)}
          maxLength={120}
          placeholder={isSpeaker ? "e.g. IIT Bombay Techfest / TCS" : "e.g. Penguin Random House / Personal Project"}
          autoComplete="organization"
          aria-invalid={!!errors.organization}
          aria-describedby={errors.organization ? "organization-error" : undefined}
          className={input(!!errors.organization)}
          required
        />
        {fieldError("organization")}
      </div>

      {/* Speaker-only fields */}
      {isSpeaker && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Tentative date</span>
            <Calendar
              id="eventDate"
              label="Tentative event date"
              value={form.eventDate}
              onChange={(v) => update("eventDate", v)}
              placeholder="Select a date"
            />
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Engagement type</span>
            <Dropdown
              id="type"
              label="Engagement type"
              value={form.type}
              onChange={(v) => update("type", v)}
              placeholder="Select an engagement type"
              options={[
                { value: "KEYNOTE", label: "Keynote / Conference" },
                { value: "WORKSHOP", label: "Executive Workshop" },
                { value: "CAMPUS", label: "Campus / University" },
                { value: "INTERVIEW", label: "Podcast / Interview" },
              ]}
            />
          </div>
        </div>
      )}

      {/* Writer-only fields */}
      {!isSpeaker && (
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">Project type</span>
          <Dropdown
            id="projectType"
            label="Project type"
            value={form.type}
            onChange={(v) => update("type", v)}
            placeholder="Select a project type"
            options={[
              { value: "GHOSTWRITING", label: "Book Ghostwriting" },
              { value: "COAUTHORING", label: "Co-Authoring" },
              { value: "CONTENT", label: "Content / Articles" },
              { value: "CONSULTING", label: "Book Consulting" },
            ]}
          />
        </div>
      )}

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
          {isSpeaker ? "Tell us about your event" : "Tell us about your project"}
        </label>
        <textarea
          id="message"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          maxLength={2000}
          placeholder={
            isSpeaker
              ? "Share event theme, expected attendees, city, or virtual format..."
              : "Describe your book/project idea, target audience, timeline, and any specific requirements..."
          }
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`${input(!!errors.message)} h-28 resize-y py-2.5`}
          rows={4}
        />
        {fieldError("message")}
      </div>

      {/* Submit */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <button
          type="submit"
          disabled={state === "loading"}
          className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#0d21a1] hover:bg-[#08166d] text-white px-8 py-3.5 text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
        >
          {state === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Submit Inquiry
        </button>
        <span className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-muted-foreground">
          <Lock className="w-3.5 h-3.5 text-muted-foreground/70" />
          Direct &amp; confidential inquiry
        </span>
      </div>

      {state === "success" && (
        <div className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-medium flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <span>{message}</span>
        </div>
      )}
      {state === "error" && (
        <div className="mt-4 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs sm:text-sm font-medium flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          <span>{message}</span>
        </div>
      )}
    </form>
  );
}
