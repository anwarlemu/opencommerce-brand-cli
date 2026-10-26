# Badge
Mono chips for counts and tags, small pills for an order or route status.

Install: npx opencommerce-ds add badge
Requires: theme, utils
Packages: @radix-ui/react-slot, class-variance-authority
Exports: Badge, badgeVariants
Client boundary: not required by this entry file
Reference: opencommerce-agentcard-web src/components/pricing.tsx (the plan chip), features.tsx and globals.css (.feat-pill, .feat-pill-wait, .feat-pill-done)


## Usage
Use chip for a plan tag, a count or an endpoint (Every merchant, POST /buy). Use the status pills for an order or route (Processing, then Confirmed in brand). Use tag, tag-ink and tag-heart for added, improved and fixed updates.
- Avoid: Badges as buttons
- Avoid: Caps
- Avoid: Filled color badges
- Avoid: More than one tone per row


## Examples
Example components: npx opencommerce-ds add badge
[Site](https://opencommerce-ds.vercel.app/preview/badge/Site)

examples/badge.tsx

```tsx
import { Badge } from "@/components/ui/badge";

export function Site() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="chip">Every merchant</Badge>
        <Badge variant="chip">4000+ stores</Badge>
        <Badge variant="chip">POST /buy</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Processing</Badge>
        <Badge variant="brand">Confirmed</Badge>
        <Badge variant="success">Operational</Badge>
        <Badge variant="warning">Degraded</Badge>
        <Badge variant="destructive">Down</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="tag">Added</Badge>
        <Badge variant="tag-ink">Improved</Badge>
        <Badge variant="tag-heart">Fixed</Badge>
      </div>
    </div>
  );
}

```

## Source

components/ui/badge.tsx

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// A short label. `chip` is the brand's tag (the pricing card's "Every merchant", globals.css .rounded-chip; computed):
// the 11.5px platform mono in the blue on the pale blue, 2px corners, 4px by 8px. The status badges are the order card's
// pills (.feat-pill): a 10px pill at 500, gray while something waits (`default`), blue on sky once it is done
// (`brand`), and success, warning and destructive told apart by a dot and the color of their text. The tags (`tag`,
// `tag-ink`, `tag-heart`) are the chip's outlined kin for a changelog: the mono on a 1px rule in the text's own color,
// sentence case like everything else (the brand sets no caps).
const STATUS = "h-5.5 gap-1.5 rounded-pill px-2 font-sans text-micro font-medium leading-none";
const DOT = "border border-line bg-surface before:size-1.5 before:shrink-0 before:rounded-pill before:bg-current";

const TAG = "rounded-chip border border-current px-2 py-0.75 font-mono text-bar leading-snug";

const badgeVariants = cva("inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3", {
  variants: {
    variant: {
      default: `${STATUS} bg-wash-pill text-fg-muted`,
      brand: `${STATUS} bg-sky text-fg-brand`,
      success: `${STATUS} ${DOT} text-success`,
      warning: `${STATUS} ${DOT} text-warning`,
      destructive: `${STATUS} ${DOT} text-danger`,
      tag: `${TAG} text-fg-brand`,
      "tag-ink": `${TAG} text-fg`,
      "tag-heart": `${TAG} text-heart`,
      chip: "rounded-chip bg-blue-5 px-2 py-1 font-mono text-bar leading-snug text-fg-brand",
    },
  },
  defaultVariants: { variant: "default" },
});

function Badge({ className, variant, asChild = false, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

```
