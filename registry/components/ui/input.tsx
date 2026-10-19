"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { useFieldControl } from "@/components/ui/field";
import { cn } from "@/lib/utils";

// The brand's field (monitoring.tsx, the merchant filter; computed): 36px, 8px corners, white on the 16 percent ink
// edge, 14px Inter, 12px in, a faint placeholder. Focus turns the edge blue (160ms ease-out), with no glow; an invalid
// field's edge is red. `search` is the same field with a drawn search mark 12px in.
const FIELD =
  "h-9 rounded-control border border-hairline px-3 font-sans text-body-sm leading-body transition-[border-color] duration-160 ease-out placeholder:text-fg-faint hover:border-line-field-hover focus-visible:border-line-brand aria-invalid:border-danger motion-reduce:transition-none";

const inputVariants = cva(
  "flex w-full min-w-0 bg-surface text-fg outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        field: `${FIELD} file:border-0 file:bg-transparent file:font-sans file:text-body-sm file:text-fg`,
        search: `${FIELD} pl-9 [&::-webkit-search-cancel-button]:hidden`,
      },
    },
    defaultVariants: { variant: "field" },
  },
);

function SearchIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute top-1/2 left-3 size-3.75 -translate-y-1/2 fill-none stroke-current text-fg-muted [stroke-linecap:round] [stroke-width:1.5]">
      <circle cx="7" cy="7" r="4.75" />
      <path d="M10.5 10.5 14 14" />
    </svg>
  );
}

function Input({ className, type, variant, ...props }: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  const input = <input type={variant === "search" ? (type ?? "search") : type} data-slot="input" className={cn(inputVariants({ variant }), variant !== "search" && className)} {...useFieldControl(props)} />;
  if (variant !== "search") return input;
  return (
    <div data-slot="search" className={cn("relative w-full", className)}>
      <SearchIcon />
      {input}
    </div>
  );
}

export { Input, inputVariants };
