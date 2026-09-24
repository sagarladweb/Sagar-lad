"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "framer-motion";
import { X, Check, ChevronDown } from "lucide-react";
import { cn } from "@/components/newsletter-composer/lib/utils";

/* ------------------------------------------------------------------ *
 *  shadcn/ui registry primitives (the base layer)
 * ------------------------------------------------------------------ */
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/newsletter-composer/ui/accordion";
import { Badge as ShadcnBadge } from "@/components/newsletter-composer/ui/badge";
import { Button as ShadcnButton } from "@/components/newsletter-composer/ui/button";
import { Input as ShadcnInput } from "@/components/newsletter-composer/ui/input";
import { ScrollArea as ShadcnScrollArea } from "@/components/newsletter-composer/ui/scroll-area";
import { Separator as ShadcnSeparator } from "@/components/newsletter-composer/ui/separator";
import { Slider as ShadcnSlider } from "@/components/newsletter-composer/ui/slider";
import { Switch as ShadcnSwitch } from "@/components/newsletter-composer/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/newsletter-composer/ui/tabs";
import {
  Tooltip as TooltipRoot,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/newsletter-composer/ui/tooltip";
import { Textarea as ShadcnTextarea } from "@/components/newsletter-composer/ui/textarea";

/* ------------------------------------------------------------------ *
 *  Pass-throughs
 * ------------------------------------------------------------------ */
export const Button = ShadcnButton;
export type ButtonProps = React.ComponentProps<typeof ShadcnButton>;

export const Switch = ShadcnSwitch;
export const ScrollArea = ShadcnScrollArea;
export const Separator = ShadcnSeparator;

/* ------------------------------------------------------------------ *
 *  Inputs
 * ------------------------------------------------------------------ */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <ShadcnInput
    ref={ref}
    className={cn("h-9 rounded-control bg-surface text-[13px]", className)}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <ShadcnTextarea
    ref={ref}
    className={cn(
      "rounded-control bg-surface px-3 py-2 text-[13px] leading-relaxed",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

/* ------------------------------------------------------------------ *
 *  Label + Field row
 * ------------------------------------------------------------------ */
export function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
  action,
}: {
  label?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <div className="flex items-center justify-between gap-2">
          <Label>{label}</Label>
          {action}
        </div>
      ) : null}
      {children}
      {hint ? <p className="text-[11px] text-ink-muted">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Switch row
 * ------------------------------------------------------------------ */
export function ToggleRow({
  label,
  hint,
  checked,
  onChange,
  icon,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-control border border-line bg-surface px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        {icon ? <span className="text-ink-muted">{icon}</span> : null}
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-ink">{label}</p>
          {hint ? (
            <p className="truncate text-[11px] text-ink-muted">{hint}</p>
          ) : null}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Slider — thin adapter over the Radix slider (number in, number out)
 *
 *  Uses local state while dragging so the parent store isn't hit on
 *  every pixel move.  The real onChange fires only on pointer-up via
 *  onValueCommit, keeping the inspector snappy.
 * ------------------------------------------------------------------ */
export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className,
  suffix,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  suffix?: string;
}) {
  const [local, setLocal] = React.useState(value);
  const dragging = React.useRef(false);

  React.useEffect(() => {
    if (!dragging.current) setLocal(value);
  }, [value]);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <ShadcnSlider
        className="flex-1"
        value={[local]}
        min={min}
        max={max}
        step={step}
        onValueChange={(next) => {
          dragging.current = true;
          setLocal(next[0] ?? min);
        }}
        onValueCommit={(next) => {
          dragging.current = false;
          const v = next[0] ?? min;
          setLocal(v);
          onChange(v);
        }}
      />
      <span className="w-12 shrink-0 text-right font-mono text-[11px] tabular-nums text-ink-soft">
        {local}
        {suffix ?? ""}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Select — lightweight custom dropdown, portaled to avoid overflow clipping
 * ------------------------------------------------------------------ */
export function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      const inTrigger = triggerRef.current?.contains(e.target as Node);
      const inDropdown = dropdownRef.current?.contains(e.target as Node);
      if (!inTrigger && !inDropdown) setOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  React.useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width });
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-control border border-line bg-surface px-3 text-[13px] text-ink transition hover:bg-canvas",
          className,
        )}
      >
        <span className={cn("truncate", !selected && "text-ink-muted")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-ink-muted transition-transform", open && "rotate-180")} />
      </button>
      {open
        ? createPortal(
            <div
              ref={dropdownRef}
              onPointerDown={(e) => e.stopPropagation()}
              className="fixed z-[9999] max-h-60 overflow-y-auto rounded-xl border border-line bg-surface shadow-lg"
              style={{ top: pos.top, left: pos.left, width: pos.width }}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-[13px] text-left transition hover:bg-canvas",
                    option.value === value && "bg-brand-50 font-medium text-brand",
                  )}
                >
                  {option.value === value && <Check className="h-3.5 w-3.5 shrink-0 text-brand" />}
                  <span className={cn(option.value !== value && "pl-5.5")}>{option.label}</span>
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

/* ------------------------------------------------------------------ *
 *  Segmented — clean animated tab switcher
 * ------------------------------------------------------------------ */
export function Segmented<T extends string>({
  value,
  onChange,
  items,
  className,
  size = "md",
  layoutId,
  fullWidth = false,
}: {
  value: T;
  onChange: (value: T) => void;
  items: { value: T; label: string; icon?: React.ReactNode }[];
  className?: string;
  size?: "sm" | "md";
  layoutId?: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-line bg-[#f0eee8] p-1",
        fullWidth ? "w-full" : "w-fit",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-[8px] transition-colors duration-150 select-none outline-none cursor-pointer",
              fullWidth ? "flex-1" : "shrink-0",
              size === "sm"
                ? "h-8 px-3 text-[12px]"
                : "h-8.5 px-3.5 text-[13px]",
              active
                ? "bg-brand text-white font-semibold border border-brand shadow-none"
                : "text-ink-soft font-medium hover:text-ink hover:bg-black/[0.04] border border-transparent",
            )}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Accordion section — one independent Radix accordion per section, so
 *  sections open and close independently like the original inspector.
 * ------------------------------------------------------------------ */
export function AccordionSection({
  title,
  children,
  defaultOpen = true,
  right,
  dense,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  right?: React.ReactNode;
  dense?: boolean;
}) {
  const id = React.useId();
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? id : undefined}
      className="border-b border-line last:border-b-0"
    >
      <AccordionItem value={id} className="border-b-0">
        <AccordionTrigger
          className={cn(
            "gap-2 px-4 py-3 text-[12px] font-semibold tracking-[-0.01em] text-ink",
            "no-underline hover:bg-black/[0.015] hover:no-underline",
          )}
        >
          <span className="flex w-full items-center justify-between gap-2">
            <span>{title}</span>
            {right ? <span className="flex items-center gap-2">{right}</span> : null}
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-4">
          <div className={cn("space-y-3", dense && "space-y-2")}>{children}</div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/* ------------------------------------------------------------------ *
 *  Badge — shadcn badge with the composer's tone palette
 * ------------------------------------------------------------------ */
const badgeTones = cva(
  "border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em]",
  {
    variants: {
      tone: {
        neutral: "border-line bg-canvas text-ink-muted",
        brand: "border-brand/20 bg-brand-50 text-brand",
        accent: "border-gold/40 bg-gold-50 text-[#8A6A05]",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        danger: "border-red-200 bg-red-50 text-red-600",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({
  className,
  tone,
  children,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeTones>) {
  return (
    <ShadcnBadge
      variant="outline"
      className={cn(badgeTones({ tone }), className)}
      {...props}
    >
      {children}
    </ShadcnBadge>
  );
}

/* ------------------------------------------------------------------ *
 *  Modal — Radix-free dialog shell with Framer Motion choreography
 * ------------------------------------------------------------------ */
export function Modal({
  open,
  onClose,
  children,
  title,
  description,
  width = "max-w-5xl",
  footer,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  width?: string;
  footer?: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#111827]/35 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className={cn(
              "relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-lift",
              width,
            )}
          >
            {title ? (
              <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
                <div>
                  <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                    {title}
                  </h2>
                  {description ? (
                    <p className="mt-0.5 text-[12px] text-ink-muted">{description}</p>
                  ) : null}
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
            <div className="min-h-0 flex-1 overflow-auto scroll-thin">{children}</div>
            {footer ? (
              <div className="flex items-center justify-between gap-3 border-t border-line bg-canvas/60 px-5 py-3">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ *
 *  Tooltip — shadcn tooltip with the composer's label API
 * ------------------------------------------------------------------ */
export function Tooltip({
  label,
  children,
  side = "bottom",
}: {
  label: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}) {
  if (!label) return <>{children}</>;
  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={100}>
      <TooltipRoot>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={6}
          className="rounded-[8px] bg-ink px-2 py-1 text-[11px] font-medium text-white shadow-lift"
        >
          {label}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ *
 *  Colour input — local draft while typing, commit on blur / picker close
 * ------------------------------------------------------------------ */
export function ColorInput({
  value,
  onChange,
  allowTransparent,
}: {
  value: string;
  onChange: (value: string) => void;
  allowTransparent?: boolean;
}) {
  const [draft, setDraft] = React.useState(value);
  const editing = React.useRef(false);
  const pickerOpen = React.useRef(false);

  React.useEffect(() => {
    if (!editing.current) setDraft(value);
  }, [value]);

  const commit = (v: string) => {
    editing.current = false;
    setDraft(v);
    onChange(v);
  };

  const isTransparent = draft === "transparent";
  return (
    <div className="flex items-center gap-2 rounded-control border border-line bg-surface px-2 py-1.5">
      <label className="relative h-6 w-6 shrink-0 cursor-pointer overflow-hidden rounded-[7px] border border-line">
        <span
          className={cn("absolute inset-0", isTransparent && "checkerboard")}
          style={{ background: isTransparent ? undefined : draft }}
        />
        <input
          type="color"
          value={isTransparent ? "#ffffff" : draft}
          onPointerDown={() => { pickerOpen.current = true; }}
          onChange={(event) => {
            editing.current = true;
            setDraft(event.target.value);
          }}
          onBlur={() => {
            if (pickerOpen.current) {
              pickerOpen.current = false;
              editing.current = false;
              onChange(draft);
            }
          }}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      <input
        value={draft}
        onChange={(event) => {
          editing.current = true;
          setDraft(event.target.value);
        }}
        onBlur={() => commit(draft)}
        className="min-w-0 flex-1 bg-transparent font-mono text-[11px] uppercase text-ink outline-none"
      />
      {allowTransparent ? (
        <button
          type="button"
          onClick={() => commit(isTransparent ? "#FFFFFF" : "transparent")}
          className="rounded-[6px] px-1.5 py-0.5 text-[10px] font-medium text-ink-muted transition hover:bg-black/[0.05] hover:text-ink"
        >
          {isTransparent ? "solid" : "none"}
        </button>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Skeleton
 * ------------------------------------------------------------------ */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[10px] bg-[linear-gradient(90deg,#F1EFE9_25%,#F7F6F2_37%,#F1EFE9_63%)] bg-[length:400%_100%]",
        className,
      )}
    />
  );
}
