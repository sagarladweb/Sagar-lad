"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  Mail,
  Send,
} from "lucide-react";
import { validateContact, sanitizeText, digitsOnly } from "@/lib/client-validators";
import { Dropdown } from "@/components/ui/Dropdown";
import { Calendar } from "@/components/ui/Calendar";
import { Pill } from "@/components/ui/Pill";
import { SocialLinks } from "@/components/SocialLinks";
import { JsonLd } from "@/components/JsonLd";
import { SITE } from "@/lib/site";

const initial = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  organization: "",
  eventDate: "",
  message: "",
  type: "KEYNOTE" as string,
};

type Errors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  organization?: string;
  message?: string;
};

export default function SpeakingContactPage() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function update<K extends keyof typeof initial>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as keyof Errors]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      firstName: sanitizeText(form.firstName),
      lastName: sanitizeText(form.lastName),
      email: form.email.trim().toLowerCase(),
      phone: digitsOnly(form.phone),
      organization: sanitizeText(form.organization),
      eventDate: form.eventDate,
      message: form.message.trim(),
      type: form.type === "INTERVIEW" ? "INTERVIEW" : "SPEAKING",
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
          "Thank you! Your booking request has been received. Sagar's team will get back to you within 24–48 hours."
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

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Speaking Contact — Sagar Lad",
          description: "Book Sagar Lad for keynotes, panels, corporate events and speaking engagements.",
          url: `${SITE.url}/speaking/contact`,
          mainEntity: {
            "@type": "Person",
            name: "Sagar Lad",
            url: SITE.url,
            jobTitle: "Author · Public Speaker",
          },
        }}
      />
      {/* Event Booking Hero — Clean, authoritative speaker banner */}
      <header className="overflow-hidden border-b border-border bg-background text-foreground py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="relative mx-auto w-full max-w-[360px]">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 aspect-square w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#0d21a1]/25 via-brand-light/15 to-transparent blur-2xl"
              />
              <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden border border-border/80 shadow-2xl bg-muted/40">
                <Image
                  src="/images/speaking/sagar-lad-tedx-speaker.webp"
                  alt="Sagar Lad – Keynote & TEDx Speaker"
                  fill
                  priority
                  sizes="(max-width: 1024px) 360px, 420px"
                  className="object-cover object-[center_28%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating trust badges */}
                <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 text-white backdrop-blur-md border border-white/20 text-[11px] font-medium shadow-lg">
                  TEDx Speaker
                </div>
                <div className="absolute bottom-3.5 right-3.5 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 text-white backdrop-blur-md border border-white/20 text-[11px] font-medium shadow-lg">
                  50+ Keynotes
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 lg:pl-4 text-center lg:text-left">
            <Pill>Speaking &amp; Keynotes</Pill>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl tracking-tight text-foreground">
              Book Sagar for your next <span className="text-brand">event</span>
            </h1>
            <p className="mt-4 max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Story-driven keynotes, interactive workshops, and executive panels on AI leadership, financial freedom, and career momentum.
            </p>
            <ul className="mt-6 space-y-3 max-w-lg mx-auto lg:mx-0 text-left">
              {[
                "Keynotes, corporate summits & executive retreats",
                "Customized content mapped specifically to your event theme",
                "High audience engagement with live Q&A and actionable frameworks",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-semibold text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Column: Fast turnaround, Session formats & Direct desk */}
        <div className="lg:col-span-5 space-y-5">
          {/* Fast Response Commitment */}
          <div className="rounded-2xl border border-brand/20 bg-brand/5 p-5 flex items-start gap-3.5 shadow-2xs">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0d21a1] text-white shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Fast 24–48h Turnaround</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Direct review by Sagar&apos;s speaking desk with customized topic proposals, speaker bio kits, and availability.
              </p>
            </div>
          </div>

          {/* Session Formats Card — Minimal */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-2xs">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Session Formats Available
            </h3>
            <div className="space-y-3">
              {[
                {
                  title: "Keynote Addresses",
                  desc: "30–60 min anchor talks for conferences, annual summits & corporate events",
                },
                {
                  title: "Executive Masterclasses",
                  desc: "Deep-dives on Gen AI, Cloud architecture & leadership strategies",
                },
                {
                  title: "Fireside Chats & Panels",
                  desc: "Moderated discussions, executive dialogues & interactive audience Q&A",
                },
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

          {/* Direct Desk & Socials — Minimal */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-2xs">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Direct Desk &amp; Socials
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Prefer direct email or have a custom speaker agency request?
            </p>
            <div>
              <a
                href="mailto:contact@sagarlad.com"
                className="inline-flex items-center gap-2 text-xs font-semibold text-foreground hover:text-brand transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                contact@sagarlad.com
              </a>
            </div>
            <div className="pt-2 border-t border-border/60">
              <SocialLinks />
            </div>
          </div>
        </div>

        {/* Right Column: Premium Booking Form Card */}
        <div className="lg:col-span-7">
          <form
            onSubmit={onSubmit}
            className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm space-y-5"
            noValidate
          >
            <div className="border-b border-border/60 pb-5">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Speaking Inquiry Form
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Share your event dates, venue, and audience details. We customize every keynote to your objectives.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  First name *
                </label>
                <input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  maxLength={80}
                  placeholder="e.g. Rahul"
                  autoComplete="given-name"
                  aria-invalid={!!errors.firstName}
                  aria-describedby={errors.firstName ? "firstName-error" : undefined}
                  className={input(!!errors.firstName)}
                  required
                />
                {fieldError("firstName")}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Last name
                </label>
                <input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  maxLength={80}
                  placeholder="e.g. Sharma"
                  autoComplete="family-name"
                  aria-invalid={!!errors.lastName}
                  aria-describedby={errors.lastName ? "lastName-error" : undefined}
                  className={input(!!errors.lastName)}
                />
                {fieldError("lastName")}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Work Email *
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  maxLength={100}
                  placeholder="rahul.sharma@company.in"
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
                  Phone / WhatsApp
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
                />
                {fieldError("phone")}
              </div>
            </div>

            <div>
              <label htmlFor="organization" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                Organization / Event Name *
              </label>
              <input
                id="organization"
                value={form.organization}
                onChange={(e) => update("organization", e.target.value)}
                maxLength={120}
                placeholder="e.g. IIT Bombay Techfest / TCS / Infosys"
                autoComplete="organization"
                aria-invalid={!!errors.organization}
                aria-describedby={errors.organization ? "organization-error" : undefined}
                className={input(!!errors.organization)}
                required
              />
              {fieldError("organization")}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span id="eventDate-label" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Tentative date
                </span>
                <Calendar
                  id="eventDate"
                  label="Tentative event date"
                  value={form.eventDate}
                  onChange={(value) => update("eventDate", value)}
                  placeholder="Select a date"
                />
              </div>
              <div>
                <span id="type-label" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                  Engagement type
                </span>
                <Dropdown
                  id="type"
                  label="Engagement type"
                  value={form.type}
                  onChange={(value) => update("type", value)}
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

            <div>
              <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                Tell me more about your event
              </label>
              <textarea
                id="message"
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                maxLength={2000}
                placeholder="Share event theme, expected attendees, city (e.g. Bengaluru, Mumbai), or virtual format..."
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
                className={`${input(!!errors.message)} h-28 resize-y py-2.5`}
                rows={4}
              />
              {fieldError("message")}
            </div>

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
                Submit Booking Request
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
        </div>
      </div>
    </>
  );
}