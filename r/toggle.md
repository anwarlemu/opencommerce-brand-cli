# Toggle
A 34px key that stays pressed: a quiet label on the wash, or a white key that lights blue.

Install: npx opencommerce-ds add toggle
Requires: theme, utils
Packages: @radix-ui/react-toggle, class-variance-authority
Exports: Toggle, toggleVariants
Client boundary: yes
Reference: Extrapolated from opencommerce (the keys and the header's trays)


## Usage
Use for an on or off option that acts at once in a toolbar (show live routes only, pin a merchant). Give an icon-only toggle an aria-label. Use outline when the toggle sits among white keys.
- Avoid: A toggle for a setting saved later (use Switch or Checkbox)
- Avoid: Blue fill for the pressed state
- Avoid: An icon that moves when pressed


## Examples
Example components: npx opencommerce-ds add toggle
Example packages: lucide-react
[Site](https://opencommerce-ds.vercel.app/preview/toggle/Site) | [Sizes](https://opencommerce-ds.vercel.app/preview/toggle/Sizes)

examples/toggle.tsx

```tsx
"use client";

import { Pin, Radio, Star } from "lucide-react";

import { Toggle } from "@/components/ui/toggle";

export function Site() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Show live routes only" defaultPressed>
        <Radio />
        Live only
      </Toggle>
      <Toggle variant="outline" aria-label="Pin merchant">
        <Pin />
        Pin merchant
      </Toggle>
      <Toggle variant="outline" size="sm" aria-label="Favorite" defaultPressed>
        <Star />
      </Toggle>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle variant="outline" size="sm">Small</Toggle>
      <Toggle variant="outline">Default</Toggle>
      <Toggle variant="outline" size="lg">Large</Toggle>
      <Toggle variant="outline" disabled>Disabled</Toggle>
    </div>
  );
}

```

## Source

components/ui/toggle.tsx

```tsx
"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Extrapolated from the brand's keys and the header's trays: a 34px key with 8px corners and a 14px Inter label at 500
// beside a 14px glyph. `default` is the ghost key: a bare muted label that washes under the pointer and, when pressed on,
// holds the wash with ink text. `outline` is the white key on the 16 percent ink edge; on, its label and glyph turn blue
// and it takes the pale blue wash, as the lit tile does. A press shrinks it to 97 percent; the state change is color only.
const toggleVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control border font-sans text-body-sm leading-none font-medium whitespace-nowrap outline-none select-none transition-[background-color,border-color,color,scale] duration-160 ease-out active:scale-97 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger motion-reduce:transition-[background-color,border-color,color] motion-reduce:active:scale-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: "border-transparent text-fg-muted hover:bg-wash-hover hover:text-fg data-[state=on]:bg-wash-pill data-[state=on]:text-fg",
        outline: "border-hairline bg-surface text-fg hover:bg-subtle data-[state=on]:border-line-brand data-[state=on]:bg-wash-selected data-[state=on]:text-fg-brand",
      },
      size: {
        default: "h-8.5 min-w-8.5 px-3",
        sm: "h-7 min-w-7 px-2.5 text-caption",
        lg: "h-10 min-w-10 px-4 text-button",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Toggle({ className, variant, size, ...props }: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return <TogglePrimitive.Root data-slot="toggle" className={cn(toggleVariants({ variant, size, className }))} {...props} />;
}

export { Toggle, toggleVariants };

```
