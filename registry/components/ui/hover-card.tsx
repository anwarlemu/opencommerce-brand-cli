"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { usePortalContainer } from "@/lib/surface";
import { cn } from "@/lib/utils";

// A preview on hover (a merchant, an order behind a link): the brand's floating panel (popover.tsx), white, a 9 percent
// ink edge, 8px corners and a soft drop, 6px off its trigger, growing out of the side nearest it (scale 0.97 and a fade,
// 160ms ease-out). It waits 500ms before opening, so passing over a link does not flash it, and 200ms before closing,
// so the pointer can travel into it. Reduced motion keeps only the fade.
function HoverCard({ openDelay = 500, closeDelay = 200, ...props }: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" openDelay={openDelay} closeDelay={closeDelay} {...props} />;
}

function HoverCardTrigger(props: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />;
}

function HoverCardContent({ className, align = "center", sideOffset = 6, collisionPadding = 8, ...props }: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal" container={usePortalContainer()}>
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "z-50 w-72 max-w-(--radix-hover-card-content-available-width) origin-(--radix-hover-card-content-transform-origin) animate-pop-in rounded-control border border-line bg-surface p-4 text-body-sm text-fg shadow-floating outline-none motion-reduce:animate-none",
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardContent, HoverCardTrigger };
