"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The brand's field with things inside it (extrapolated from the input, the search field and the merchant filter): the
// field's 36px, 8px corners and 16 percent ink edge around a borderless control, with addons at either end: a muted
// glyph or text, a small ghost key, or a `segment`, the mist strip with a hairline divider and the platform mono (a
// unit, a scheme, `.myshopify.com`). The whole group takes the blue edge on focus and the red edge when invalid, with
// no glow. Addons can also sit above or below a textarea (block-start, block-end).
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-9 w-full min-w-0 items-center overflow-hidden rounded-control border border-hairline bg-surface transition-[border-color] duration-160 ease-out hover:border-line-field-hover motion-reduce:transition-none",
        "has-[[data-slot=input-group-control]:focus-visible]:border-line-brand",
        "has-[[data-slot][aria-invalid=true]]:border-danger",
        "has-[[data-slot=input-group-control]:read-only]:bg-subtle has-[[data-slot=input-group-control]:disabled]:opacity-50",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto",
        "has-[>[data-align=inline-start]]:[&>input]:pl-2 has-[>[data-align=inline-end]]:[&>input]:pr-2 has-[>[data-align=block-start]]:[&>textarea]:pt-1 has-[>[data-align=block-end]]:[&>textarea]:pb-1",
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex h-auto shrink-0 cursor-text items-center justify-center gap-2 font-sans text-body-sm leading-body text-fg-muted select-none group-has-[[data-slot=input-group-control]:disabled]/input-group:cursor-not-allowed [&>kbd]:rounded-sm [&>svg:not([class*='size-'])]:size-3.75",
  {
    variants: {
      align: {
        "inline-start": "order-first pl-3 has-[>button]:pl-1",
        "inline-end": "order-last pr-3 has-[>button]:pr-1",
        "block-start": "order-first w-full justify-start px-3 pt-2",
        "block-end": "order-last w-full justify-start px-3 pb-2",
      },
      variant: {
        plain: "",
        segment: "self-stretch border-line bg-subtle px-3 font-mono text-caption",
      },
    },
    compoundVariants: [
      { variant: "segment", align: "inline-end", className: "border-l pr-3" },
      { variant: "segment", align: "inline-start", className: "border-r pl-3" },
    ],
    defaultVariants: { align: "inline-start", variant: "plain" },
  },
);

function InputGroupAddon({ className, align = "inline-start", variant = "plain", ...props }: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      data-variant={variant}
      className={cn(inputGroupAddonVariants({ align, variant }), className)}
      onClick={(e) => {
        // A click on the addon (not on a button in it) focuses the control, as a click inside a field would.
        if ((e.target as HTMLElement).closest("button")) return;
        e.currentTarget.parentElement?.querySelector<HTMLElement>("input, textarea")?.focus();
      }}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva("", {
  variants: {
    size: {
      xs: "h-6.5 gap-1 rounded-sm px-2 text-caption [&>svg:not([class*='size-'])]:size-3.5",
      sm: "h-7 gap-1.5 rounded-sm px-2.5 text-body-sm",
      "icon-xs": "size-6.5 rounded-sm p-0 [&>svg:not([class*='size-'])]:size-3.5",
      "icon-sm": "size-7 rounded-sm p-0 [&>svg:not([class*='size-'])]:size-4",
    },
  },
  defaultVariants: { size: "xs" },
});

function InputGroupButton({ className, type = "button", variant = "ghost", size = "xs", ...props }: Omit<React.ComponentProps<typeof Button>, "size"> & VariantProps<typeof inputGroupButtonVariants>) {
  return <Button type={type} data-size={size} variant={variant} className={cn(inputGroupButtonVariants({ size }), className)} {...props} />;
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("flex items-center gap-2 font-sans text-body-sm leading-body text-fg-muted [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.75", className)} {...props} />;
}

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input-group-control"
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent px-3 font-sans text-body-sm leading-body text-fg outline-none placeholder:text-fg-faint read-only:text-fg-muted disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="input-group-control"
      className={cn(
        "field-sizing-content flex min-h-16 w-full min-w-0 flex-1 resize-none bg-transparent px-3 py-2 font-sans text-body-sm leading-body text-fg outline-none placeholder:text-fg-faint read-only:text-fg-muted disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea };
