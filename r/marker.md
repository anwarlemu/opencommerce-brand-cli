# Marker
A small mono label in a conversation or list: plain, centered between rules, ruled underneath, or the blue unread rule.

Install: npx opencommerce-ds add marker
Requires: theme, utils
Packages: @radix-ui/react-slot, class-variance-authority
Exports: Marker, MarkerContent, MarkerIcon, markerVariants
Client boundary: not required by this entry file
Reference: Extrapolated from opencommerce (window bar and chart labels in the platform mono)


## Usage
Use to mark time or state in a conversation or a log: separator for a day (Today), unread for where new messages start, border for a heading over a group. Put a lucide glyph in MarkerIcon and the words in MarkerContent.
- Avoid: Caps or bold labels
- Avoid: Colors other than muted ink and the blue
- Avoid: Markers between every message


## Examples
Example components: npx opencommerce-ds add marker
Example packages: lucide-react
[Site](https://opencommerce-ds.vercel.app/preview/marker/Site)

examples/marker.tsx

```tsx
import { Clock, Inbox } from "lucide-react";

import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";

export function Site() {
  return (
    <div className="mx-auto grid w-full max-w-xl gap-5">
      <Marker variant="separator">
        <MarkerContent>Today</MarkerContent>
      </Marker>
      <Marker variant="unread">
        <MarkerContent>3 new updates</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerIcon>
          <Inbox strokeWidth={1.5} />
        </MarkerIcon>
        <MarkerContent>Order #A-10293</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>
          <Clock strokeWidth={1.5} />
        </MarkerIcon>
        <MarkerContent>
          Checkout took 9s. <a href="#route">See the route</a>
        </MarkerContent>
      </Marker>
    </div>
  );
}

```

## Source

components/ui/marker.tsx

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// A marker in a conversation or a list, in the site's small print (the window bar and the chart's axis labels; computed):
// the 11.5px platform mono at 64 percent ink. `separator` centers it between two 9 percent rules ("Today"), `border`
// rules it underneath, and `unread` is the blue rule where new messages begin.
const markerVariants = cva(
  "group/marker relative flex min-h-4 w-full items-center gap-2 text-left font-mono text-bar leading-tight text-fg-muted [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 [a]:underline [a]:underline-offset-3 [a]:hover:text-fg",
  {
    variants: {
      variant: {
        default: "",
        separator: "before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-line after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-line",
        border: "border-b border-line pb-2",
        unread: "text-fg-brand before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-brand after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-brand",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Marker({ className, variant = "default", asChild = false, ...props }: React.ComponentProps<"div"> & VariantProps<typeof markerVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";
  return <Comp data-slot="marker" data-variant={variant} role={variant === "default" ? undefined : "separator"} className={cn(markerVariants({ variant }), className)} {...props} />;
}

function MarkerIcon({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="marker-icon" aria-hidden="true" className={cn("inline-flex size-3.5 shrink-0 items-center justify-center [&_svg:not([class*='size-'])]:size-3.5", className)} {...props} />;
}

function MarkerContent({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="marker-content" className={cn("min-w-0 break-words group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center group-data-[variant=unread]/marker:flex-none *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-fg", className)} {...props} />;
}

export { Marker, MarkerContent, MarkerIcon, markerVariants };

```
