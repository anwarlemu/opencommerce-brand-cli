# Separator
Horizontal or vertical divider.

Install: npx opencommerce-ds add separator
Requires: theme, utils
Packages: @radix-ui/react-separator
Exports: Separator
Client boundary: yes
Reference: opencommerce-agentcard-web src/app/globals.css (--line)


## Usage
Use between related content groups or inline controls.
- Avoid: Thick or colored rules
- Avoid: Rules between every row of a card
- Avoid: Dotted or dashed rules


## Examples
Example components: npx opencommerce-ds add separator
[Site](https://opencommerce-ds.vercel.app/preview/separator/Site)

examples/separator.tsx

```tsx
import { Separator } from "@/components/ui/separator";

export function Site() {
  return (
    <div className="grid max-w-2xl gap-8">
      <div className="grid gap-4">
        <p className="font-mono text-bar text-fg-muted">get-started.md</p>
        <h2 className="text-h2 leading-display tracking-tighter">Give your agent a checkout</h2>
        <p className="text-body leading-lead text-fg-muted">One endpoint, every online store.</p>
      </div>
      <Separator />
      <div className="flex h-5 items-center gap-4 font-sans text-body-sm text-fg-muted">
        <span>Search</span>
        <Separator orientation="vertical" />
        <span>Checkout</span>
        <Separator orientation="vertical" />
        <span>Tracking</span>
      </div>
    </div>
  );
}

```

## Source

components/ui/separator.tsx

```tsx
"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

// The brand's rule: one pixel of ink at 14 percent, as between the FAQ's questions and under a page's title block.
function Separator({ className, orientation = "horizontal", decorative = true, ...props }: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn("shrink-0 bg-line data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px", className)}
      {...props}
    />
  );
}

export { Separator };

```
