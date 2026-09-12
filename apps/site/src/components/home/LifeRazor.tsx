"use client";

export function LifeRazor() {
  return (
    <section className="py-16 md:py-24 border-b border-border bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <p className="inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">
          Current Life Razor
        </p>
        <h2 className="mt-8 font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight">
          Be Dumb.{" "}
          <span className="text-accent-strong">
            Don&apos;t worry about what others think.
          </span>
        </h2>
        <p className="mt-7 mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
          A razor is a rule you cut your life with. Mine is a reminder to stay
          curious, keep asking the &ldquo;dumb&rdquo; questions, and never let
          the noise of other people&apos;s opinions decide my next step.
        </p>
      </div>
    </section>
  );
}
