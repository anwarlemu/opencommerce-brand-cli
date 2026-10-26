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
