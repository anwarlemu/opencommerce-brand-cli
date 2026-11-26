# Hover Card
A preview of a merchant, an order or a person that opens beside a link under the pointer.

Install: npx opencommerce-ds add hover-card
Requires: theme, surface, utils
Packages: @radix-ui/react-hover-card
Exports: HoverCard, HoverCardContent, HoverCardTrigger
Client boundary: yes
Reference: Extension from opencommerce-agentcard-web src/app/globals.css (.win) and popover.tsx


## Usage
Use to preview what a link points to without leaving the page (a merchant's status, an order's items). The trigger must still work as a link on its own; the card is for sighted pointer users only, so never put the only copy of anything in it.
- Avoid: Actions or forms inside the card (use a popover)
- Avoid: A hover card on a button
- Avoid: The only way to reach information


## Examples
Example components: npx opencommerce-ds add hover-card badge
[Site](https://opencommerce-ds.vercel.app/preview/hover-card/Site) | [Open](https://opencommerce-ds.vercel.app/preview/hover-card/Open)

examples/hover-card.tsx

```tsx
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

function Merchant() {
  return (
    <div className="grid gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-0.5">
          <p className="font-display text-h5 leading-display font-medium tracking-tight text-fg">Northwind Outfitters</p>
          <p className="font-mono text-bar text-fg-muted">northwind.example</p>
        </div>
        <Badge variant="success">Operational</Badge>
      </div>
      <p className="text-body-sm leading-relaxed text-fg-muted">Search, checkout and order tracking are live. Median checkout in the last hour: 3.4s.</p>
      <dl className="grid grid-cols-2 gap-2 border-t border-line pt-3 text-caption">
        <dt className="text-fg-muted">Checkouts today</dt>
        <dd className="text-right font-mono text-fg tabular-nums">1,284</dd>
        <dt className="text-fg-muted">Success rate</dt>
        <dd className="text-right font-mono text-fg tabular-nums">99.2%</dd>
      </dl>
    </div>
  );
}

export function Site() {
  return (
    <p className="max-w-120 text-body leading-relaxed text-fg-muted">
      Your agent's last order went to{" "}
      <HoverCard>
        <HoverCardTrigger href="#merchant" className="text-fg-brand underline decoration-line-brand underline-offset-4">
          Northwind Outfitters
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <Merchant />
        </HoverCardContent>
      </HoverCard>{" "}
      and shipped this morning.
    </p>
  );
}

export function Open() {
  return (
    <div className="h-64">
      <HoverCard defaultOpen>
        <HoverCardTrigger href="#merchant" className="text-body text-fg-brand underline decoration-line-brand underline-offset-4">
          Northwind Outfitters
        </HoverCardTrigger>
        <HoverCardContent align="start" className="w-80">
          <Merchant />
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}

```

## Source

components/ui/hover-card.tsx

```tsx
"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A preview on hover (a merchant, an order behind a link): the brand's floating panel (popover.tsx), white, a 9 percent
// ink edge, 8px corners and a soft drop, 6px off its trigger, growing out of the side nearest it (scale 0.97 and a fade,
// 160ms ease-out). It waits 500ms before opening, so passing over a link does not flash it, and 200ms before closing,
// so the pointer can travel into it. Reduced motion keeps only the fade.
function HoverCard({ openDelay = 500, closeDelay = 200, ...props }: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" openDelay={openDelay} closeDelay={closeDelay} {...props} />;
}

function HoverCardTrigger(props: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />;
}

function HoverCardContent({ className, align = "center", sideOffset = 6, collisionPadding = 8, ...props }: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal" container={usePortalContainer()}>
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "z-50 w-72 max-w-(--radix-hover-card-content-available-width) origin-(--radix-hover-card-content-transform-origin) animate-pop-in rounded-control border border-line bg-surface p-4 text-body-sm text-fg shadow-floating outline-none motion-reduce:animate-none",
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardContent, HoverCardTrigger };

```
