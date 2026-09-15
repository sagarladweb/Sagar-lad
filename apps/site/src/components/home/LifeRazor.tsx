import { getLifeRazor } from "@/lib/liferazor";
import { LifeRazorTypewriter } from "./LifeRazorTypewriter";

export async function LifeRazor() {
  const data = await getLifeRazor();

  return (
    <section className="py-16 md:py-24 border-b border-border bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <span className="lg:hidden inline-block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Daily wisdom
        </span>
        <span className="hidden lg:inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-brand border border-brand/20 rounded-full px-5 py-1.5 bg-brand/5">
          {data.pill}
        </span>
        <div className="mt-8">
          <LifeRazorTypewriter />
        </div>
        <p className="mt-7 mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
          {data.description}
        </p>
      </div>
    </section>
  );
}
