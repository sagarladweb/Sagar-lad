"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  title,
  subtitle,
  icon,
  onClose,
  children,
  footer,
  wide,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Lock background scroll while the modal is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[140] grid place-items-center overflow-y-auto p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="modal-scrim-enter fixed inset-0 bg-black/60 backdrop-blur-md [animation:scrim-in_0.18s_ease-out_both]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`modal-panel-enter relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-3xl border border-border bg-card [animation:modal-in_0.24s_cubic-bezier(0.22,1,0.36,1)_both] ${
          wide ? "max-w-3xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.35)]" : "max-w-xl shadow-[0_24px_64px_-16px_rgba(0,0,0,0.3)]"
        }`}
      >
        {/* Accent hairline */}
        <span
          aria-hidden="true"
          className="absolute inset-x-8 top-0 h-0.5 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent"
        />
        <div className="flex items-center gap-3.5 border-b border-border px-5 py-4 sm:px-6">
          {icon && (
            <span
              aria-hidden="true"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent/15 text-accent"
            >
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-lg font-bold leading-tight">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground active:scale-95"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
        {footer && (
          <div className="border-t border-border bg-card/95 px-5 py-4 backdrop-blur-sm sm:px-6">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
