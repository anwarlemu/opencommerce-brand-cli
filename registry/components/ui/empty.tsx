import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Nothing here yet, in the brand's quiet voice (the body of empty-state.tsx, globals.css .win): centered on white with
// 48px of air (64px from 768px), an optional mark, the title in the 20px display face at 500 tracked tight, one line of
// 14px Inter at 64 percent ink, at most 384px wide, then the next action. `icon` media is the merchant tile's shape: a
// 40px white square with 6px corners on the 9 percent ink edge and a hairline drop, its 18px glyph in the blue. Put it
// in a Window (as EmptyState does) when it stands for a whole list. Nothing moves.
function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="empty" className={cn("flex min-w-0 flex-1 flex-col items-center justify-center gap-5 px-6 py-12 text-center text-balance md:py-16", className)} {...props} />;
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="empty-header" className={cn("flex max-w-sm flex-col items-center gap-3", className)} {...props} />;
}

const emptyMediaVariants = cva("mb-1 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0", {
  variants: {
    variant: {
      default: "bg-transparent",
      icon: "size-10 rounded-card border border-line bg-surface text-fg-brand shadow-tile [&_svg:not([class*='size-'])]:size-4.5",
    },
  },
  defaultVariants: { variant: "default" },
});

function EmptyMedia({ className, variant = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return <div data-slot="empty-media" data-variant={variant} aria-hidden className={cn(emptyMediaVariants({ variant }), className)} {...props} />;
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="empty-title" className={cn("font-display text-h4 leading-snug font-medium tracking-tight text-fg", className)} {...props} />;
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="empty-description" className={cn("max-w-sm text-body-sm leading-relaxed text-pretty text-fg-muted [&>a]:text-fg-brand [&>a]:underline [&>a]:underline-offset-3", className)} {...props} />;
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="empty-content" className={cn("flex w-full max-w-sm min-w-0 flex-col items-center gap-3 text-body-sm text-balance", className)} {...props} />;
}

export { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle };
