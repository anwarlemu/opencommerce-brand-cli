# Empty
A quiet centered message for an empty list: an optional merchant-tile mark, a display-face title, one muted line and the next action.

Install: npx opencommerce-ds add empty
Requires: theme, utils
Packages: class-variance-authority
Exports: Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle
Client boundary: not required by this entry file
Reference: Extrapolated from opencommerce (empty-state.tsx body, the merchant tiles in features.tsx)


## Usage
Use when a list, search or panel has nothing to show. Put it inside a Window (or use EmptyState) when it stands for a whole list. Give it EmptyMedia with variant icon and a lucide glyph, EmptyTitle, EmptyDescription and one action in EmptyContent.
- Avoid: Illustrations that shout
- Avoid: More than one main action
- Avoid: Copy that blames the reader
- Avoid: An empty state without a way forward


## Examples
Example components: npx opencommerce-ds add empty button input window
Example packages: lucide-react
[Site](https://opencommerce-ds.vercel.app/preview/empty/Site) | [NoResults](https://opencommerce-ds.vercel.app/preview/empty/NoResults) | [Plain](https://opencommerce-ds.vercel.app/preview/empty/Plain)

examples/empty.tsx

```tsx
"use client";

import { useState } from "react";
import { Package, Search, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Window } from "@/components/ui/window";

export function Site() {
  const [connected, setConnected] = useState(false);
  return (
    <Window name="orders.list" className="mx-auto w-full max-w-2xl">
      {connected ? (
        <p role="status" className="px-6 py-12 text-center text-body-sm text-fg-muted">
          Waiting for your agent&apos;s first order.
        </p>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Package strokeWidth={1.5} />
            </EmptyMedia>
            <EmptyTitle>No orders yet</EmptyTitle>
            <EmptyDescription>Connect an agent and its first purchase will show up here, with every step from cart to delivery.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setConnected(true)}>Connect an agent</Button>
          </EmptyContent>
        </Empty>
      )}
    </Window>
  );
}

export function NoResults() {
  const [query, setQuery] = useState("Kohl’s outlet");
  const stores = ["Amazon", "Target", "Best Buy", "Staples", "Wayfair"].filter((s) => s.toLowerCase().includes(query.toLowerCase().trim()));
  return (
    <div className="mx-auto grid w-full max-w-2xl gap-4">
      <Input variant="search" aria-label="Search merchants" value={query} onChange={(e) => setQuery(e.target.value)} />
      {stores.length ? (
        <ul aria-live="polite" className="grid">
          {stores.map((s) => (
            <li key={s} className="border-b border-line py-3 text-body-sm">
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <Empty className="rounded-panel border border-line-window">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search strokeWidth={1.5} />
            </EmptyMedia>
            <EmptyTitle>No merchant matches</EmptyTitle>
            <EmptyDescription>Try the store&apos;s name as it appears on its site.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="secondary" onClick={() => setQuery("")}>
              Clear search
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}

export function Plain() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <Store strokeWidth={1.25} className="size-8 text-fg-faint" />
        </EmptyMedia>
        <EmptyTitle>No stores paused</EmptyTitle>
        <EmptyDescription>Every route is healthy right now.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

```

## Source

components/ui/empty.tsx

```tsx
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

```
