import Link from "next/link";
import { Pill } from "@/components/ui/Pill";

export function MentorshipCta() {
  return (
    <section
      className="py-10 sm:py-14 md:py-16 border-b border-border bg-muted/30"
      aria-label="Mentorship"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Pill className="mb-4" supportLine="Let's connect">Work with me</Pill>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-accent-strong">
            Make better. Live better.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Let's make your business and life better-with better writing, speaking and mindset.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/hire-me"
              className="inline-flex items-center justify-center rounded-full bg-accent text-accent-foreground px-8 py-3 text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
            >
              Hire Me
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
