import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// The brand's cards (globals.css .feat-tile, .feat-order; computed). `default` is the small white card: a 9 percent ink
// edge, 6px corners and a hairline drop. `raised` is the card set on a picture (the order card): 8px corners and a
// firmer, longer drop. For anything with a name of its own (code, a plan, a feature), use a Window instead.
const cardVariants = cva("flex flex-col border border-line bg-surface text-fg", {
  variants: {
    variant: {
      default: "gap-2 rounded-card p-6 shadow-tile",
      raised: "gap-2 rounded-control px-3.5 pt-3 pb-3.5 shadow-raised",
    },
  },
  defaultVariants: { variant: "default" },
});

function Card({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return <div data-slot="card" className={cn(cardVariants({ variant }), className)} {...props} />;
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 has-data-[slot=card-action]:grid-cols-[1fr_auto]", className)} {...props} />;
}

// 20px display at 500, tracked tight (.h-card).
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-title" className={cn("font-display text-h4 leading-snug font-medium tracking-tight text-fg", className)} {...props} />;
}

// 16px Inter at 64 percent ink.
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-description" className={cn("text-body leading-relaxed text-fg-muted", className)} {...props} />;
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-action" className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("text-body-sm text-fg", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("mt-auto flex items-center gap-3 pt-3", className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent, cardVariants };
