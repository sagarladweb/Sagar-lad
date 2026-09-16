import { Pill } from "@/components/ui/Pill";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 md:py-14 text-center sm:text-left">
        {eyebrow && (
          <div>
            <Pill supportLine={eyebrow}>{eyebrow}</Pill>
          </div>
        )}
        <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
