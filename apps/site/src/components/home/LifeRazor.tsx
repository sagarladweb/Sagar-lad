import { getLifeRazor } from "@/lib/liferazor";
import { LifeRazorTypewriter } from "./LifeRazorTypewriter";
import { Pill } from "@/components/ui/Pill";

export async function LifeRazor() {
  const data = await getLifeRazor();

  return (
    <section className="py-10 sm:py-14 md:py-16 border-b border-border bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <Pill supportLine="Current Life Razor">{data.pill}</Pill>
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
