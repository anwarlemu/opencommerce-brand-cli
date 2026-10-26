"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

import { cn } from "@/lib/utils";

// A section that opens in place (the questions' slide, accordion.tsx): the content slides open to its height (200ms
// ease-out) and closes faster (160ms). The trigger is the page's quiet row: 14px Inter at 64 percent ink that
// turns ink under the pointer, with a drawn chevron that turns a half when open. Reduced motion opens it at once.
function Collapsible(props: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({ className, ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn(
        "group/collapsible-trigger outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/** The chevron a trigger can carry: it points down, and up while open (200ms ease-out). */
function CollapsibleChevron({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      data-slot="collapsible-chevron"
      viewBox="0 0 16 16"
      className={cn("size-3.5 shrink-0 fill-none stroke-current text-fg-muted transition-[rotate] duration-200 ease-out [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.5] group-data-[state=open]/collapsible-trigger:rotate-180 motion-reduce:transition-none", className)}
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

function CollapsibleContent({ className, ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return (
    <CollapsiblePrimitive.Content
      data-slot="collapsible-content"
      className={cn(
        "overflow-hidden [--radix-accordion-content-height:var(--radix-collapsible-content-height)] motion-safe:data-[state=closed]:animate-accordion-up data-[state=closed]:[animation-duration:var(--ds-duration-fast)] motion-safe:data-[state=open]:animate-accordion-down motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

export { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger };
