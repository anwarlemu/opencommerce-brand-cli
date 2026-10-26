import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// A row of content, drawn from the live merchant table and the step list (monitoring.tsx, in-action.tsx; computed): 16px
// Inter in ink over a 14px line at 64 percent ink, on 9 percent rules when grouped. `default` is bare and, when it is a
// link or a button, takes the mist under the pointer (160ms); a current row (aria-current or data-selected) sits on the
// pale blue with 6px corners, as the selected step does. `outline` is the small white card (the 9 percent edge, 6px
// corners, the hairline drop); `muted` sits on the mist. Media: `icon` is the merchant tile (a 32px white square on the
// edge, its glyph in the blue), `image` a 40px square photo.
function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="list" data-slot="item-group" className={cn("group/item-group flex flex-col", className)} {...props} />;
}

function ItemSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="item-separator" orientation="horizontal" className={cn("my-0", className)} {...props} />;
}

const itemVariants = cva(
  "group/item flex flex-wrap items-center rounded-card border border-transparent font-sans text-body leading-snug text-fg outline-none transition-[background-color,border-color] duration-160 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring aria-[current=page]:bg-blue-5 aria-[current=true]:bg-blue-5 data-[selected=true]:bg-blue-5 motion-reduce:transition-none [a]:hover:bg-subtle [button]:hover:bg-subtle",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-line bg-surface shadow-tile",
        muted: "bg-subtle [a]:hover:bg-wash-hover [button]:hover:bg-wash-hover",
      },
      size: {
        default: "gap-3.5 px-4 py-3.5",
        sm: "gap-2.5 px-3 py-2.5",
        xs: "gap-2 px-2 py-1.5 text-body-sm",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Item({ className, variant = "default", size = "default", asChild = false, ...props }: React.ComponentProps<"div"> & VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";
  return <Comp data-slot="item" data-variant={variant} data-size={size} className={cn(itemVariants({ variant, size, className }))} {...props} />;
}

const itemMediaVariants = cva("flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none", {
  variants: {
    variant: {
      default: "bg-transparent",
      icon: "size-8 rounded-card border border-line bg-surface text-fg-brand shadow-tile [&_svg:not([class*='size-'])]:size-4",
      image: "size-10 overflow-hidden rounded-card border border-line [&_img]:size-full [&_img]:object-cover",
    },
  },
  defaultVariants: { variant: "default" },
});

function ItemMedia({ className, variant = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return <div data-slot="item-media" data-variant={variant} className={cn(itemMediaVariants({ variant, className }))} {...props} />;
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-content" className={cn("flex min-w-0 flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none", className)} {...props} />;
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-title" className={cn("flex w-fit min-w-0 items-center gap-2 text-body leading-snug text-fg", className)} {...props} />;
}

/** The line under a title, 14px at 64 percent ink, clamped to two lines. */
function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="item-description" className={cn("line-clamp-2 text-body-sm leading-relaxed font-normal text-balance text-fg-muted [&>a]:text-fg-brand [&>a]:underline [&>a]:underline-offset-3", className)} {...props} />;
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-actions" className={cn("flex items-center gap-2", className)} {...props} />;
}

/** The top line of an item: what it is at the left, a figure or a status at the right. */
function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-header" className={cn("flex basis-full items-center justify-between gap-2", className)} {...props} />;
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-footer" className={cn("flex basis-full items-center justify-between gap-2", className)} {...props} />;
}

export { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle };
