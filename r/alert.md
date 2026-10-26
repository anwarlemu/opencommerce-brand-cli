# Alert
An inline notice: a white or pale blue sheet on the window edge with a blue glyph, a display-face title and muted detail.

Install: npx opencommerce-ds add alert
Requires: theme, utils
Packages: class-variance-authority
Exports: Alert, AlertAction, AlertDescription, AlertTitle, alertVariants
Client boundary: not required by this entry file
Reference: Extrapolated from opencommerce (banner.tsx sheet and type, globals.css .win edge and the status badge colors)


## Usage
Use inside a form, card or window for a note the reader should see in place: info for guidance, warning for something to check, destructive for a failure, success for a confirmation. Put a lucide glyph first, then AlertTitle and AlertDescription; add AlertAction for one small key. For a page-level notice with a title bar, use Banner.
- Avoid: A glyph and title in the same color as a warning
- Avoid: Filled colored backgrounds
- Avoid: Bold titles
- Avoid: More than one action


## Examples
Example components: npx opencommerce-ds add alert button
Example packages: lucide-react
[Site](https://opencommerce-ds.vercel.app/preview/alert/Site) | [Variants](https://opencommerce-ds.vercel.app/preview/alert/Variants)

examples/alert.tsx

```tsx
"use client";

import { useState } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function Site() {
  const [retried, setRetried] = useState(false);
  return (
    <div className="grid w-full max-w-2xl gap-4">
      <Alert variant="info">
        <Info strokeWidth={1.5} />
        <AlertTitle>Checkout runs in test mode</AlertTitle>
        <AlertDescription>Orders placed with a test key are routed to the merchant&apos;s sandbox. Nothing is charged.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <CircleAlert strokeWidth={1.5} />
        <AlertTitle>{retried ? "Retrying the order" : "Payment was declined at Staples"}</AlertTitle>
        <AlertDescription>{retried ? "The route is warming up again. This usually takes under ten seconds." : "The card on file reached its daily limit. Raise the limit or retry tomorrow."}</AlertDescription>
        <AlertAction>
          <Button size="sm" variant="secondary" disabled={retried} onClick={() => setRetried(true)}>
            Retry
          </Button>
        </AlertAction>
      </Alert>
    </div>
  );
}

export function Variants() {
  return (
    <div className="grid w-full max-w-2xl gap-4">
      <Alert>
        <Info strokeWidth={1.5} />
        <AlertTitle>One endpoint for every store</AlertTitle>
        <AlertDescription>
          Send the same request to Amazon, Target or Best Buy. <a href="#docs">Read the guide</a>.
        </AlertDescription>
      </Alert>
      <Alert variant="success">
        <CircleCheck strokeWidth={1.5} />
        <AlertTitle>Order #A-10293 confirmed</AlertTitle>
        <AlertDescription>2 items, $48.20, arriving Thursday.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <TriangleAlert strokeWidth={1.5} />
        <AlertTitle>Wayfair is responding slowly</AlertTitle>
        <AlertDescription>Purchases still go through; expect checkouts to take up to a minute.</AlertDescription>
      </Alert>
      <Alert>
        <AlertTitle>Without a glyph</AlertTitle>
        <AlertDescription>The title and detail take the full width.</AlertDescription>
      </Alert>
    </div>
  );
}

```

## Source

components/ui/alert.tsx

```tsx
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

```
