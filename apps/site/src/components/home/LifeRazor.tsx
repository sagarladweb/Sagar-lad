import { getLifeRazor } from "@/lib/liferazor";

export async function LifeRazor() {
  const data = await getLifeRazor();

  return (
    <section className="py-16 md:py-24 border-b border-border bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <p className="inline-block text-xs font-semibold tracking-wide text-brand bg-brand-light/10 rounded-full px-4 py-1.5">
          {data.pill}
        </p>
        <h2 className="mt-8 font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight">
          {data.heading}{" "}
          <span className="text-accent-strong">
            {data.accent}
          </span>
        </h2>
        <p className="mt-7 mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
          {data.description}
        </p>
      </div>
    </section>
  );
}
