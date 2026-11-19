# Kbd
Keyboard key or shortcut label.

Install: npx opencommerce-ds add kbd
Requires: theme, utils
Packages: class-variance-authority
Exports: Kbd, kbdVariants
Client boundary: not required by this entry file
Reference: Extension from opencommerce-agentcard-web src/app/globals.css (.code, --line-strong)


## Usage
Use in control hints, menu items and command palette instructions. The bare variant is for compact search hints.
- Avoid: Keys for things that are not keys
- Avoid: Dark keys
- Avoid: Keys in body copy larger than the text around them


## Examples
Example components: npx opencommerce-ds add kbd
[Site](https://opencommerce-ds.vercel.app/preview/kbd/Site) | [Bare](https://opencommerce-ds.vercel.app/preview/kbd/Bare)

examples/kbd.tsx

```tsx
import { Kbd } from "@/components/ui/kbd";

// The guides' search footer: keys on the sky strip, each followed by what it does.
export function Site() {
  return (
    <div className="grid max-w-160 gap-6">
      <div className="flex flex-wrap items-center gap-x-4.5 gap-y-2 rounded-control border border-line-window bg-sky px-3.5 py-2 font-display text-micro text-fg-brand">
        <span className="inline-flex items-center gap-1">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> to move
        </span>
        <span className="inline-flex items-center gap-1">
          <Kbd>↵</Kbd> to open
        </span>
        <span className="inline-flex items-center gap-1">
          <Kbd>Esc</Kbd> to close
        </span>
      </div>
      <p className="flex flex-wrap items-center gap-1 text-body-sm text-fg-muted">
        Press <Kbd>⌘</Kbd>
        <Kbd>K</Kbd> to search the guides.
      </p>
    </div>
  );
}

// The hint at the end of the guides' search box.
export function Bare() {
  return (
    <div className="flex h-9 max-w-95 items-center gap-2.5 rounded-control border border-line-field bg-surface px-3 text-body-sm text-fg-muted shadow-inset">
      <span className="flex-1">Search...</span>
      <Kbd variant="bare">⌘K</Kbd>
    </div>
  );
}

```

## Source

components/ui/kbd.tsx

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// A keyboard key in the brand's small parts: `key` (the default) is a white face on the 16 percent ink edge with 4px
// corners, the label in the 10px platform mono at 64 percent ink, at least 18px wide. `bare` is the hint at the end of a
// search box: the 12px mono at 42 percent ink, no face at all.
const kbdVariants = cva("inline-grid shrink-0 place-items-center font-mono leading-none whitespace-nowrap", {
  variants: {
    variant: {
      key: "h-5 min-w-4.5 rounded-[calc(var(--ds-radius-control)/2)] border border-hairline bg-surface px-1 text-micro text-fg-muted",
      bare: "text-caption text-fg-faint",
    },
  },
  defaultVariants: { variant: "key" },
});

function Kbd({ className, variant, ...props }: React.ComponentProps<"kbd"> & VariantProps<typeof kbdVariants>) {
  return <kbd data-slot="kbd" className={cn(kbdVariants({ variant }), className)} {...props} />;
}

export { Kbd, kbdVariants };

```
