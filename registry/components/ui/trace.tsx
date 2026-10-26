"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

// An agent's steps as it works, in the voice of the site's step list and live logs (in-action.tsx, monitoring.tsx;
// computed): each line is 14px Inter at 64 percent ink with a 16px lucide glyph (stroke 1.5) 8px before it, and its
// figure (a duration, a count) in the 11.5px platform mono at 42 percent ink. A line that is a link or a button turns
// ink under the pointer (160ms). A running step's title breathes, held still with reduced motion; a pending one is
// faded; a failed one is red. A step that can open shows a chevron after its title that turns a quarter when open; its
// detail hangs from a 9 percent rule 16px in, in 14px ink, and opens with its height (200ms, the strong ease-out; it
// closes in 160ms).
function Trace({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="trace"
      className={cn(
        "flex w-full min-w-0 flex-col gap-2 *:has-[>[data-slot=trace-line]]:flex *:has-[>[data-slot=trace-line]]:w-fit *:has-[>[data-slot=trace-line]]:max-w-full *:has-[>[data-slot=trace-line]]:min-w-0 *:has-[>[data-slot=trace-line]]:rounded-chip *:has-[>[data-slot=trace-line]]:text-left *:has-[>[data-slot=trace-line]]:outline-none *:has-[>[data-slot=trace-line]]:focus-visible:outline-2 *:has-[>[data-slot=trace-line]]:focus-visible:outline-offset-2 *:has-[>[data-slot=trace-line]]:focus-visible:outline-solid *:has-[>[data-slot=trace-line]]:focus-visible:outline-focus-ring",
        className,
      )}
      {...props}
    />
  );
}

function TraceLine({ className, status, ...props }: React.ComponentProps<"span"> & { status?: "running" | "error" | "pending" }) {
  return (
    <span
      data-slot="trace-line"
      data-status={status}
      className={cn(
        "flex w-fit max-w-full min-w-0 items-center gap-2 font-sans text-body-sm leading-relaxed text-fg-muted transition-[color] duration-160 ease-out in-[a,button]:cursor-pointer in-[a:hover,button:hover]:text-fg data-[status=error]:text-danger data-[status=error]:in-[a:hover,button:hover]:text-danger data-[status=pending]:opacity-60 data-[status=running]:*:data-[slot=trace-title]:animate-pulse motion-reduce:transition-none motion-reduce:data-[status=running]:*:data-[slot=trace-title]:animate-none",
        className,
      )}
      {...props}
    />
  );
}

function TraceIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="trace-icon"
      aria-hidden="true"
      className={cn("flex size-4 shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [[data-slot=trace-title]~&]:-ml-1", className)}
      {...props}
    />
  );
}

function TraceTitle({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="trace-title" className={cn("min-w-0 truncate", className)} {...props} />;
}

/** A step's figure at its end: a duration or a count, in the mono at 42 percent ink with even figures. */
function TraceDescription({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="trace-description" className={cn("shrink-0 font-mono text-bar text-fg-faint tabular-nums", className)} {...props} />;
}

function TraceCollapsible({ className, ...props }: Omit<React.ComponentProps<typeof CollapsiblePrimitive.Root>, "asChild">) {
  return <CollapsiblePrimitive.Root data-slot="trace-collapsible" className={cn("flex w-full min-w-0 flex-col", className)} {...props} />;
}

function TraceCollapsibleTrigger({ className, children, ...props }: Omit<React.ComponentProps<typeof CollapsiblePrimitive.Trigger>, "asChild">) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="trace-collapsible-trigger"
      className={cn(
        "group/trace-collapsible-trigger flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-1 rounded-chip text-left text-fg-muted outline-none transition-[color] duration-160 ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring has-[[data-status=error]]:text-danger motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      {children}
      <TraceIcon className="transition-[rotate] duration-200 ease-out group-aria-expanded/trace-collapsible-trigger:rotate-90 motion-reduce:transition-none">
        <ChevronRight strokeWidth={1.75} className="size-3.5" />
      </TraceIcon>
    </CollapsiblePrimitive.Trigger>
  );
}

// Radix sets the content's measured height as --radix-collapsible-content-height; the shared open and close keyframes
// read the accordion's name for it, so it is passed on under that name.
const HEIGHT = { "--radix-accordion-content-height": "var(--radix-collapsible-content-height)" } as React.CSSProperties;

function TraceCollapsibleContent({ className, children, style, ...props }: Omit<React.ComponentProps<typeof CollapsiblePrimitive.Content>, "asChild">) {
  return (
    <CollapsiblePrimitive.Content
      data-slot="trace-collapsible-content"
      style={{ ...HEIGHT, ...style }}
      className="min-w-0 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none"
      {...props}
    >
      <div data-slot="trace-collapsible-content-inner" className={cn("mt-2 mb-1 ml-2 min-w-0 border-l border-line pr-1 pl-4 font-sans text-body-sm leading-relaxed [overflow-wrap:anywhere] text-fg", className)}>
        {children}
      </div>
    </CollapsiblePrimitive.Content>
  );
}

export { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceTitle };
