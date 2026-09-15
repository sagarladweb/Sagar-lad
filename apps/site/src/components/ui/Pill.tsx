type PillProps = {
  children: React.ReactNode;
  className?: string;
  /** Subtle text shown on mobile/tablet instead of the pill. Pill shows on desktop only. */
  supportLine?: string;
};

export function Pill({ children, className = "", supportLine }: PillProps) {
  if (supportLine) {
    return (
      <>
        {/* Mobile / Tablet: support line text */}
        <span className={`lg:hidden inline-block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground ${className}`}>
          {supportLine}
        </span>
        {/* Desktop: pill */}
        <span className={`hidden lg:inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-brand border border-brand/20 rounded-full px-5 py-1.5 bg-brand/5 ${className}`}>
          {children}
        </span>
      </>
    );
  }

  return (
    <span
      className={`inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-brand border border-brand/20 rounded-full px-5 py-1.5 bg-brand/5 ${className}`}
    >
      {children}
    </span>
  );
}
