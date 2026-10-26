import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// An inline notice: the banner's sheet without its window bar, for a note that sits inside a form, a card or a window
// (extrapolated from banner.tsx and globals.css .win). The 16 percent ink edge with 6px corners on white, 14px by 16px
// inside; a 16px lucide glyph at stroke 1.5, the title in the 16px display face at 500 tracked tight, the detail in 14px
// Inter at 64 percent ink. `default` keeps the glyph blue; `info` sets the sheet on the pale blue (the guides' note);
// `warning`, `success` and `destructive` tell themselves apart by the glyph's and the title's color only, as the
// brand's status badges do. Actions (AlertAction) sit at the right. Nothing moves.
const alertVariants = cva(
  "group/alert relative grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 rounded-card border px-4 py-3.5 font-sans text-body-sm leading-relaxed text-fg has-[>svg]:grid-cols-[auto_minmax(0,1fr)_auto] [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-line-window bg-surface [&>svg]:text-fg-brand",
        info: "border-line-window bg-note [&>svg]:text-fg-brand",
        success: "border-line-window bg-surface [&>svg]:text-success [&>[data-slot=alert-title]]:text-success",
        warning: "border-line-window bg-surface [&>svg]:text-warning [&>[data-slot=alert-title]]:text-warning",
        destructive: "border-line-window bg-surface [&>svg]:text-danger [&>[data-slot=alert-title]]:text-danger",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Alert({ className, variant, role, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" data-variant={variant ?? "default"} role={role ?? (variant === "destructive" ? "alert" : "status")} className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("col-start-1 min-w-0 font-display text-body leading-snug font-medium tracking-tight text-fg group-has-[>svg]/alert:col-start-2", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn("col-start-1 min-w-0 text-body-sm leading-relaxed text-fg-muted group-has-[>svg]/alert:col-start-2 [&_a]:text-fg-brand [&_a]:underline [&_a]:underline-offset-3 [&_p]:leading-relaxed", className)} {...props} />;
}

/** What sits at the right of an alert: a small key or a link. */
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-action" className={cn("col-start-2 row-span-2 row-start-1 flex items-center gap-2 self-center group-has-[>svg]/alert:col-start-3", className)} {...props} />;
}

export { Alert, AlertAction, AlertDescription, AlertTitle, alertVariants };
