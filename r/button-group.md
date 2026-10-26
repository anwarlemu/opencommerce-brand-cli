# Button Group
Keys joined into one bar with shared edges, with mist mono text segments and fields.

Install: npx opencommerce-ds add button-group
Requires: theme, utils
Packages: @radix-ui/react-slot, class-variance-authority
Exports: ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants
Client boundary: not required by this entry file
Reference: Extrapolated from opencommerce (the keys and the header's trays)


## Usage
Use to join related actions into one control (a split action, a pager, a copy key beside a field). Put Buttons, Inputs, Selects or ButtonGroupText inside; nest ButtonGroups for separated clusters; use orientation vertical for a stack.
- Avoid: Gaps between joined keys
- Avoid: Mixing blue and white keys without a separator
- Avoid: More than one primary key in a group


## Examples
Example components: npx opencommerce-ds add button-group button input
Example packages: lucide-react
[Site](https://opencommerce-ds.vercel.app/preview/button-group/Site) | [Split](https://opencommerce-ds.vercel.app/preview/button-group/Split) | [WithInput](https://opencommerce-ds.vercel.app/preview/button-group/WithInput) | [Vertical](https://opencommerce-ds.vercel.app/preview/button-group/Vertical)

examples/button-group.tsx

```tsx
"use client";

import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Copy, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";

export function Site() {
  const [page, setPage] = React.useState(1);
  return (
    <div className="flex flex-wrap items-center gap-4">
      <ButtonGroup aria-label="Order actions">
        <Button variant="secondary" size="sm">Reorder</Button>
        <Button variant="secondary" size="sm">Track</Button>
        <Button variant="secondary" size="sm">Refund</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Pages">
        <Button variant="secondary" size="sm" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          <ChevronLeft />
        </Button>
        <ButtonGroupText>Page {page} of 12</ButtonGroupText>
        <Button variant="secondary" size="sm" aria-label="Next page" disabled={page === 12} onClick={() => setPage((p) => p + 1)}>
          <ChevronRight />
        </Button>
      </ButtonGroup>
    </div>
  );
}

export function Split() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <ButtonGroup aria-label="Checkout">
        <Button size="sm">Buy now</Button>
        <ButtonGroupSeparator />
        <Button size="sm" aria-label="More checkout options">
          <ChevronDown />
        </Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Refresh">
        <Button variant="secondary" size="sm">
          <RefreshCw />
          Refresh
        </Button>
        <ButtonGroupText>2m ago</ButtonGroupText>
      </ButtonGroup>
    </div>
  );
}

export function WithInput() {
  return (
    <ButtonGroup className="w-full max-w-110" aria-label="Webhook">
      <ButtonGroupText>POST</ButtonGroupText>
      <Input aria-label="Webhook URL" defaultValue="https://acme.com/hooks/orders" />
      <Button variant="secondary" size="sm" aria-label="Copy URL" className="h-9">
        <Copy />
      </Button>
    </ButtonGroup>
  );
}

export function Vertical() {
  return (
    <ButtonGroup orientation="vertical" aria-label="Zoom" className="w-fit">
      <Button variant="secondary" size="sm">Zoom in</Button>
      <Button variant="secondary" size="sm">Zoom out</Button>
      <Button variant="secondary" size="sm">Reset</Button>
    </ButtonGroup>
  );
}

```

## Source

components/ui/button-group.tsx

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Keys joined into one control (extrapolated from the brand's keys and the header's trays): inner corners square off and
// the shared edges merge, so white keys read as one bar with 8px outer corners; a field, select or text segment can sit in
// the bar. ButtonGroupText is the mist segment with the platform mono at 64 percent ink (a prefix, a unit, a count);
// ButtonGroupSeparator is a 1px rule between blue keys, white at 30 percent.
const buttonGroupVariants = cva(
  "group/button-group flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[>input]:[&>[data-slot=button]]:h-9 has-[>input]:[&>[data-slot=button-group-text]]:h-9 [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal: "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
        vertical: "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
      },
    },
    defaultVariants: { orientation: "horizontal" },
  },
);

function ButtonGroup({ className, orientation, ...props }: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return <div role="group" data-slot="button-group" data-orientation={orientation ?? "horizontal"} className={cn(buttonGroupVariants({ orientation }), className)} {...props} />;
}

function ButtonGroupText({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="button-group-text"
      className={cn("flex items-center gap-2 rounded-control border border-hairline bg-subtle px-3 font-mono text-caption whitespace-nowrap text-fg-muted [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5", className)}
      {...props}
    />
  );
}

function ButtonGroupSeparator({ className, orientation = "vertical", ...props }: React.ComponentProps<"div"> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      data-slot="button-group-separator"
      data-orientation={orientation}
      className={cn("relative shrink-0 self-stretch bg-white/30", orientation === "vertical" ? "w-px" : "h-px", className)}
      {...props}
    />
  );
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants };

```
