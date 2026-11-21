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

// Layout classes (display, gaps, alignment, grid tracks, child selectors) passed to PopoverContent lay out the content,
// so they go to the scrolling body; the rest (width, padding, colors) style the panel.
const LAYOUT = /^(?:[\w-]+:)*(?:block|flex|grid|inline-(?:block|flex|grid)|flow-root|flex-(?:row|col)(?:-reverse)?|flex-(?:wrap|nowrap)|gap(?:-[xy])?-.+|space-[xy]-.+|divide-.+|items-.+|justify-.+|place-.+|grid-(?:cols|rows|flow)-.+|auto-(?:cols|rows)-.+|content-(?:start|end|center|between|around|evenly|stretch|normal|baseline)|\*.*|\[&>.*)$/;
const splitLayout = (className?: string) => {
  const parts = (className ?? "").split(/\s+/).filter(Boolean);
  return [parts.filter((part) => !LAYOUT.test(part)).join(" "), parts.filter((part) => LAYOUT.test(part)).join(" ")];
};

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({ className, align = "start", sideOffset = 6, collisionPadding = 8, variant = "default", children, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content> & { variant?: keyof typeof VARIANTS }) {
  const [panel, layout] = splitLayout(className);
  return (
    <PopoverPrimitive.Portal container={usePortalContainer()}>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        data-variant={variant}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn("z-50 w-72 max-w-(--radix-popover-content-available-width) max-h-(--radix-popover-content-available-height) flex flex-col overflow-hidden origin-(--radix-popover-content-transform-origin) animate-pop-in motion-reduce:animate-none rounded-control border p-4 text-body-sm outline-none", VARIANTS[variant], panel)}
        {...props}
      >
        {/* The content scrolls inside the panel (so its drop stays) and fades at an edge with more past it; 6px of the
            panel's padding moves inside the scroller so focus rings near an edge are not clipped. */}
        <div data-slot="popover-body" className={cn("-m-1.5 min-h-0 flex-1 overflow-y-auto overscroll-contain fade-y p-1.5", layout)}>
          {children}
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor(props: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
