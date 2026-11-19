# Collapsible
A section that slides open in place under a quiet row with a turning chevron.

Install: npx opencommerce-ds add collapsible
Requires: theme, utils
Packages: @radix-ui/react-collapsible
Exports: Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger
Client boundary: yes
Reference: Extension from opencommerce-agentcard-web src/app/globals.css (the questions' slide) and accordion.tsx


## Usage
Use to tuck away secondary detail on a page (an order's line items, advanced checkout settings). Make the CollapsibleTrigger a row with its name and a CollapsibleChevron. For a list of questions use the accordion.
- Avoid: Hiding the main content of a page
- Avoid: A collapsible inside a collapsible
- Avoid: Opening on hover


## Examples
Example components: npx opencommerce-ds add collapsible
[Site](https://opencommerce-ds.vercel.app/preview/collapsible/Site) | [Settings](https://opencommerce-ds.vercel.app/preview/collapsible/Settings)

examples/collapsible.tsx

```tsx
"use client";

import * as React from "react";

import { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const ITEMS = [
  { name: "Trail runner, size 10", qty: 1, price: "$128.00" },
  { name: "Merino socks, 3 pack", qty: 2, price: "$36.00" },
  { name: "Water bottle, 750ml", qty: 1, price: "$22.00" },
];

export function Site() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="w-full max-w-110 rounded-panel border border-line-window bg-surface p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-h5 font-medium tracking-tight text-fg">Order ord_8KQ2</p>
        <p className="font-mono text-snippet text-fg tabular-nums">$222.00</p>
      </div>
      <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 rounded-menu py-1.5 text-left text-body-sm text-fg-muted transition-colors duration-150 ease-out hover:text-fg motion-reduce:transition-none">
          {open ? "Hide items" : "Show 3 items"}
          <CollapsibleChevron />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="mt-2 border-t border-line">
            {ITEMS.map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-4 border-b border-line py-2.5 text-body-sm last:border-b-0">
                <span className="text-fg">
                  {item.name} <span className="text-fg-muted">x{item.qty}</span>
                </span>
                <span className="font-mono text-snippet text-fg tabular-nums">{item.price}</span>
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function Settings() {
  return (
    <Collapsible defaultOpen className="w-full max-w-110">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 border-b border-line py-3 text-left text-body text-fg">
        Advanced checkout settings
        <CollapsibleChevron />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 py-3 text-body-sm">
          <dt className="text-fg-muted">Retry a failed checkout</dt>
          <dd className="text-fg">Twice</dd>
          <dt className="text-fg-muted">Ask before orders over</dt>
          <dd className="font-mono text-snippet text-fg tabular-nums">$500.00</dd>
          <dt className="text-fg-muted">Ship to</dt>
          <dd className="text-fg">Billing address</dd>
        </dl>
      </CollapsibleContent>
    </Collapsible>
  );
}

```

## Source

components/ui/collapsible.tsx

```tsx
"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

import { cn } from "@/lib/utils";

// A section that opens in place (the questions' slide, accordion.tsx): the content slides open to its height (200ms
// ease-out) and closes faster (160ms). The trigger is the page's quiet row: 14px Inter at 64 percent ink that
// turns ink under the pointer, with a drawn chevron that turns a half when open. Reduced motion opens it at once.
function Collapsible(props: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({ className, ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn(
        "group/collapsible-trigger outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/** The chevron a trigger can carry: it points down, and up while open (200ms ease-out). */
function CollapsibleChevron({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      data-slot="collapsible-chevron"
      viewBox="0 0 16 16"
      className={cn("size-3.5 shrink-0 fill-none stroke-current text-fg-muted transition-[rotate] duration-200 ease-out [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.5] group-data-[state=open]/collapsible-trigger:rotate-180 motion-reduce:transition-none", className)}
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

function CollapsibleContent({ className, ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return (
    <CollapsiblePrimitive.Content
      data-slot="collapsible-content"
      className={cn(
        "overflow-hidden [--radix-accordion-content-height:var(--radix-collapsible-content-height)] motion-safe:data-[state=closed]:animate-accordion-up data-[state=closed]:[animation-duration:var(--ds-duration-fast)] motion-safe:data-[state=open]:animate-accordion-down motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

export { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger };

```
