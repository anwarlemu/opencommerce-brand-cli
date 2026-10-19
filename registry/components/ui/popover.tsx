"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// The brand's floating panel: white, a 9 percent ink edge, 8px corners and a soft drop, 6px off its trigger, growing out
// of the side nearest the trigger (scale 0.97 and a fade, 160ms ease-out). `glass` is the header's tray as a panel: white
// at 72 percent under a light sheen and a blur, a 10 percent ink edge. Reduced motion keeps only the fade.
const VARIANTS = {
  default: "border-line bg-surface text-fg shadow-floating",
  glass: "border-line-glass bg-glass bg-(image:--ds-glass-sheen) text-fg shadow-floating [backdrop-filter:var(--ds-glass-blur)]",
} as const;

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({ className, align = "start", sideOffset = 6, collisionPadding = 8, variant = "default", ...props }: React.ComponentProps<typeof PopoverPrimitive.Content> & { variant?: keyof typeof VARIANTS }) {
  return (
    <PopoverPrimitive.Portal container={usePortalContainer()}>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        data-variant={variant}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn("z-50 w-72 max-w-(--radix-popover-content-available-width) max-h-(--radix-popover-content-available-height) overflow-y-auto overscroll-contain origin-(--radix-popover-content-transform-origin) animate-pop-in motion-reduce:animate-none rounded-control border p-4 text-body-sm outline-none", VARIANTS[variant], className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor(props: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
