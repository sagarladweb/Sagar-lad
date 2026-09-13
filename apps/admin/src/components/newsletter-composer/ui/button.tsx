import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/components/newsletter-composer/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-[13px] font-semibold whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-white hover:bg-brand-700 shadow-none border border-brand",
        primary:
          "bg-brand text-white hover:bg-brand-700 shadow-none border border-brand",
        accent:
          "bg-gold text-ink hover:bg-gold-600 shadow-none border border-gold-600/30",
        subtle:
          "bg-black/[0.04] text-ink hover:bg-black/[0.07] border border-transparent shadow-none",
        danger:
          "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/60 shadow-none",
        text: "px-0 text-brand hover:underline shadow-none",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-none border border-red-600",
        outline:
          "border border-line bg-surface text-ink shadow-none hover:bg-black/[0.04] hover:text-ink hover:border-line-strong",
        secondary:
          "bg-[#f0eee8] text-ink border border-line shadow-none hover:bg-surface hover:text-ink",
        ghost:
          "text-ink hover:bg-black/[0.05] shadow-none",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8.5 px-3.5 text-[13px]",
        md: "h-8.5 px-3.5 text-[13px]",
        iconSm: "size-7.5 rounded-lg",
        xs: "h-6.5 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8.5 gap-1.5 rounded-lg px-3.5 text-[13px] has-[>svg]:px-2.5",
        lg: "h-9.5 rounded-lg px-4.5 text-[13.5px]",
        icon: "size-8.5 rounded-lg",
        "icon-xs": "size-6.5 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8.5 rounded-lg",
        "icon-lg": "size-9.5 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
