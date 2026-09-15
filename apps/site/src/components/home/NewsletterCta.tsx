"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2, AlertCircle, Mail } from "lucide-react";
import { validateEmail } from "@/lib/client-validators";
import { SiteLogo } from "@/components/SiteLogo";
import { Pill } from "@/components/ui/Pill";

export function NewsletterCta() {
  const [email, setEmail] = useState("");
  const [terms, setTerms] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!terms) {
      setState("error");
      setMessage("Please accept the privacy policy to subscribe.");
      return;
    }
    const emailError = validateEmail(email);
    if (emailError) {
      setState("error");
      setMessage(emailError);
      return;
    }

    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), acceptedTerms: terms }),
      });
      if (res.ok) {
        setState("success");
        setEmail("");
        setMessage("You're in! Check your inbox to confirm.");
      } else {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setState("success");
          setMessage("You're already subscribed! Thank you.");
        } else {
          setState("error");
          setMessage(data.error ?? "Something went wrong. Please try again.");
        }
      }
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <section
      className="border-b border-border bg-background py-10 sm:py-14 md:py-16"
      aria-label="Subscribe to the newsletter"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)]">
          <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
            {/* Photo column — showcases vertical photo of Sagar with coffee */}
            <div className="relative md:col-span-5 min-h-[260px] sm:min-h-[300px] md:min-h-full aspect-[4/3] md:aspect-auto overflow-hidden bg-muted/40">
              <Image
                src="/images/newsletter/sagar-lad-newsletter-mindset-coffee.webp"
                alt="Sagar Lad Newsletter – One practical idea every week"
                fill
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover object-[47%_20%] sm:object-[45%_24%] lg:object-[46%_23%]"
              />
              <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black/50 via-black/15 to-transparent md:hidden pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 md:hidden">
                <SiteLogo light className="h-7 w-auto" />
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
                  One useful idea, every week
                </p>
              </div>
            </div>

            {/* Newsletter form column */}
            <div
              className="md:col-span-7 flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12"
              style={{
                background: "linear-gradient(180deg, #e8f0fe 0%, #f4f7fd 45%, #ffffff 85%)",
              }}
            >
              <div className="w-full text-center md:text-left max-w-md mx-auto md:mx-0">
                <Pill supportLine="Stay in the loop">The Sagar Lad Letter</Pill>
                <h2 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-foreground">
                  One practical idea. Every week.
                </h2>
                <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Unfiltered thoughts on money, mindset, speaking and intentional
                  living — one practical idea, every week. No spam, ever.
                </p>

              {state === "success" ? (
                <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-brand-light/20 border border-border text-foreground text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-brand" />
                  <span>{message}</span>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-6 space-y-3.5 max-w-md mx-auto md:mx-0" noValidate>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your best email address"
                      aria-label="Your email address"
                      className="w-full rounded-full border border-border bg-background pl-11 pr-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all placeholder:text-muted-foreground"
                    />
                  </div>

                  <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer pt-0.5">
                    <input
                      type="checkbox"
                      checked={terms}
                      onChange={(e) => setTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-border bg-background accent-brand shrink-0"
                    />
                    <span className="leading-normal">
                      I agree to the{" "}
                      <Link
                        href="/privacy"
                        className="text-brand underline underline-offset-2 hover:opacity-80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        privacy policy
                      </Link>{" "}
                      &amp; terms. No spam, ever.
                    </span>
                  </label>

                  {state === "error" && (
                    <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {message}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={state === "loading"}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-accent text-accent-foreground px-6 py-3.5 text-sm font-semibold shadow-sm hover:opacity-95 transition-all disabled:opacity-60"
                  >
                    {state === "loading" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
}
