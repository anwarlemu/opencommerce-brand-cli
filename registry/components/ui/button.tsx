import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// The brand's keys (globals.css .btn, .btn-primary, .btn-secondary, .nav-cta; computed): flat, 8px corners, a border a
// shade darker than the fill and no shadow; 15px Inter at 500. `primary` is the blue key (#2E3AE8, its edge the blue
// mixed toward ink) that lifts toward white under the pointer; `secondary` the white key on the hairline that takes the
// mist; `on-brand` the white key with blue text for the rare blue band; `ghost` a bare label that washes on hover. A
// press shrinks a key to 0.97 (no sinking). Colors ease in 160ms, the press in the same strong ease-out.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-control border font-sans font-medium leading-none outline-none select-none transition-[background-color,border-color,color,scale] duration-160 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring active:scale-97 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-[background-color,border-color,color] motion-reduce:active:scale-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        primary: "border-line-brand-edge bg-primary text-on-primary hover:bg-primary-hover",
        secondary: "border-hairline bg-surface text-fg hover:bg-subtle",
        "on-brand": "border-hairline bg-white text-fg-brand hover:bg-subtle",
        ghost: "border-transparent text-fg-muted hover:bg-wash-hover hover:text-fg data-[state=open]:bg-wash-hover data-[state=open]:text-fg",
      },
      size: {
        // The page's key: 40px, 18px of padding, 15px Inter.
        md: "h-10 px-4.5 text-button leading-body",
        // The small key: 34px, 14px of padding, 14px. The header's Get started is sm with 6px corners (rounded-sm).
        sm: "h-8.5 px-3.5 text-body-sm",
        icon: "size-8 px-0 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" type={asChild ? type : (type ?? "button")} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
