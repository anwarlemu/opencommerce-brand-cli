# Card
Container for related content, with default and raised variants.

Install: npx opencommerce-ds add card
Requires: theme, utils
Packages: class-variance-authority
Exports: Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent, cardVariants
Client boundary: not required by this entry file
Reference: opencommerce-agentcard-web src/app/globals.css (.feat-tile, .feat-order)


## Usage
Use default for a small group of related lines. Use raised for a card set on a picture (an order, a receipt). For code, plans and features use Window: the brand names its containers like files.
- Avoid: Gray card backgrounds
- Avoid: Heavy or offset shadows
- Avoid: Cards inside cards
- Avoid: Rounded corners above 8px


## Examples
Example components: npx opencommerce-ds add card badge
[Site](https://opencommerce-ds.vercel.app/preview/card/Site) | [Raised](https://opencommerce-ds.vercel.app/preview/card/Raised)

examples/card.tsx

```tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Site() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Every merchant</CardTitle>
          <CardDescription>One endpoint reaches any online store: catalog search, checkout and order tracking.</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Warmed routes</CardTitle>
          <CardDescription>The stores your agents buy from most are kept warm, so a purchase finishes in seconds.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

// The order card, set on a feature's picture.
export function Raised() {
  return (
    <div className="flex justify-center rounded-panel border border-line bg-surface px-6 py-10">
      <Card variant="raised" className="w-full max-w-75">
        <div className="flex items-center justify-between border-b border-line pb-2.5 font-mono text-bar text-fg-muted">
          <span>Order · Amazon</span>
          <Badge variant="brand">Confirmed</Badge>
        </div>
        <ol className="mt-1 grid gap-2 text-body-sm">
          {[
            ["Cart", "2 items · $48.20"],
            ["Payment", "Visa ···· 4832"],
            ["Confirmed", "#A-10293"],
          ].map(([step, detail]) => (
            <li key={step} className="flex items-baseline justify-between gap-3">
              <span>{step}</span>
              <span className="font-mono text-bar text-fg-muted">{detail}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

```

## Source

components/ui/card.tsx

```tsx
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

```
