"use client";

type AnnouncementBarProps = {
  text: string;
  link?: string | null;
  barStyle: string;
  speed: number;
  bgColor?: string | null;
  textColor?: string | null;
};

export function AnnouncementBar({
  text,
  link,
  barStyle,
  speed,
  bgColor,
  textColor,
}: AnnouncementBarProps) {
  const duration = Math.max(8, Math.round(600 / Math.max(10, speed)));
  const bg = bgColor || "#dbeafe";
  const fg = textColor || "#1e3a5f";
  const isScrolling = barStyle === "scrolling";

  const renderItemSet = () => (
    <div className="flex items-center shrink-0">
      {Array.from({ length: 12 }).map((_, idx) => (
        <span
          key={idx}
          className="nl-marquee-text inline-flex items-center gap-6 shrink-0"
          style={{ color: fg }}
        >
          <span>{text}</span>
          <span className="opacity-40" aria-hidden="true">•</span>
        </span>
      ))}
    </div>
  );

  const inner = isScrolling ? (
    <div
      className="nl-marquee flex items-center select-none"
      style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
    >
      <div className="flex items-center shrink-0">
        {renderItemSet()}
      </div>
      <div className="flex items-center shrink-0" aria-hidden>
        {renderItemSet()}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center py-2">
      <span className="whitespace-nowrap px-6 py-2 text-xs sm:text-sm font-semibold tracking-wide" style={{ color: fg }}>
        {text}
      </span>
    </div>
  );

  return (
    <div
      className="relative z-50 overflow-hidden border-b border-border"
      style={{ backgroundColor: bg }}
    >
      <div className="flex items-center min-h-[36px]">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="flex-1 overflow-hidden">
            {inner}
          </a>
        ) : (
          <div className="flex-1 overflow-hidden">{inner}</div>
        )}
      </div>
    </div>
  );
}
