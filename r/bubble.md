# Bubble
A message bubble: the agent's own in the blue with white text, the other side on the mist, 12px corners with the tail squared.

Install: npx opencommerce-ds add bubble
Requires: theme, utils
Packages: @radix-ui/react-slot, class-variance-authority
Exports: Bubble, BubbleContent, BubbleGroup, BubbleReactions, bubbleVariants
Client boundary: not required by this entry file
Reference: Extrapolated from opencommerce (the blue key, the window edge and mist, 12px window corners)


## Usage
Use for the lines of an agent conversation, inside Message. Use default for the agent's own messages (align end), secondary for the person or store it talks to, tinted for another agent, muted for a system line, destructive for a message that failed. Group consecutive bubbles in BubbleGroup.
- Avoid: Gradients or shadows on bubbles
- Avoid: Animating bubbles in
- Avoid: Round pill-shaped bubbles


## Examples
Example components: npx opencommerce-ds add bubble
Example packages: lucide-react
[Site](https://opencommerce-ds.vercel.app/preview/bubble/Site) | [Variants](https://opencommerce-ds.vercel.app/preview/bubble/Variants)

examples/bubble.tsx

```tsx
"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";

import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@/components/ui/bubble";

export function Site() {
  return (
    <div className="mx-auto grid w-full max-w-xl gap-4">
      <BubbleGroup>
        <Bubble variant="secondary">
          <BubbleContent>Can you order a USB-C hub under $40?</BubbleContent>
        </Bubble>
        <Bubble variant="secondary">
          <BubbleContent>Same-day delivery if possible.</BubbleContent>
        </Bubble>
      </BubbleGroup>
      <BubbleGroup>
        <Bubble align="end">
          <BubbleContent>Found one at Best Buy for $34.99, arriving today by 6pm.</BubbleContent>
        </Bubble>
        <Bubble align="end">
          <BubbleContent>Placing the order now.</BubbleContent>
        </Bubble>
      </BubbleGroup>
    </div>
  );
}

export function Variants() {
  const [liked, setLiked] = useState(false);
  return (
    <div className="mx-auto grid w-full max-w-xl gap-5">
      <Bubble variant="tinted">
        <BubbleContent>travel-agent: the hotel is booked; pass me the card for the flight.</BubbleContent>
      </Bubble>
      <Bubble variant="muted">
        <BubbleContent>Route to Wayfair warmed.</BubbleContent>
      </Bubble>
      <Bubble variant="outline">
        <BubbleContent>Order #A-10293 shipped.</BubbleContent>
        <BubbleReactions>
          <button type="button" aria-label="Like" aria-pressed={liked} onClick={() => setLiked((l) => !l)} className="inline-flex items-center gap-1 rounded-pill px-1.5 py-0.5 font-mono text-bar text-fg-muted outline-none transition-[color] duration-160 ease-out aria-pressed:text-fg-brand focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-focus-ring">
            <ThumbsUp aria-hidden strokeWidth={1.5} className="size-3.5" />
            {liked ? "1" : null}
          </button>
        </BubbleReactions>
      </Bubble>
      <Bubble variant="destructive" align="end">
        <BubbleContent>Could not send: the store closed the cart.</BubbleContent>
      </Bubble>
      <Bubble variant="ghost">
        <BubbleContent>A plain line with no bubble, for long agent output.</BubbleContent>
      </Bubble>
      <Bubble variant="secondary">
        <BubbleContent asChild>
          <button type="button">Show the cart</button>
        </BubbleContent>
      </Bubble>
    </div>
  );
}

```

## Source

components/ui/bubble.tsx

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// A message bubble in an agent conversation, in the site's two voices (extrapolated from the keys and windows in
// globals.css; computed): the agent's own message is the blue of the main action with white text; the other side is the
// mist on the 9 percent ink edge with ink text. 14px Inter on a 1.625 line, 14px by 10px inside, 12px corners (the
// window's) with the tail corner (bottom left incoming, bottom right outgoing) squared to 2px, as the brand keeps its
// chrome nearly square. In a BubbleGroup only the last bubble keeps the tail. Bubbles never animate in: a conversation
// is read, not watched.
function BubbleGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="bubble-group" className={cn("flex min-w-0 flex-col gap-1 [&>[data-slot=bubble]:not(:last-child)>[data-slot=bubble-content]]:rounded-panel", className)} {...props} />;
}

const bubbleVariants = cva(
  "group/bubble relative flex w-fit max-w-[80%] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end data-[align=start]:*:data-[slot=bubble-content]:rounded-bl-chip data-[align=end]:*:data-[slot=bubble-content]:rounded-br-chip data-[variant=ghost]:max-w-full",
  {
    variants: {
      variant: {
        // The agent's own: the blue key.
        default: "*:data-[slot=bubble-content]:border-line-brand-edge *:data-[slot=bubble-content]:bg-primary *:data-[slot=bubble-content]:text-on-primary [&>[data-slot=bubble-content]:is(button,a):hover]:bg-primary-hover",
        // The other side: the mist.
        secondary: "*:data-[slot=bubble-content]:border-line *:data-[slot=bubble-content]:bg-subtle *:data-[slot=bubble-content]:text-fg [&>[data-slot=bubble-content]:is(button,a):hover]:bg-wash-hover",
        // A system line or a quote: the pill wash at 64 percent ink.
        muted: "*:data-[slot=bubble-content]:bg-wash-pill *:data-[slot=bubble-content]:text-fg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:bg-wash-hover",
        // Another agent: the pale blue.
        tinted: "*:data-[slot=bubble-content]:bg-blue-5 *:data-[slot=bubble-content]:text-fg [&>[data-slot=bubble-content]:is(button,a):hover]:bg-blue-10",
        outline: "*:data-[slot=bubble-content]:border-hairline *:data-[slot=bubble-content]:bg-surface *:data-[slot=bubble-content]:text-fg [&>[data-slot=bubble-content]:is(button,a):hover]:bg-subtle",
        ghost: "*:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 *:data-[slot=bubble-content]:text-fg",
        // A message that failed to send.
        destructive: "*:data-[slot=bubble-content]:border-danger *:data-[slot=bubble-content]:bg-surface *:data-[slot=bubble-content]:text-danger [&>[data-slot=bubble-content]:is(button,a):hover]:bg-subtle",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Bubble({ variant = "default", align = "start", className, ...props }: React.ComponentProps<"div"> & VariantProps<typeof bubbleVariants> & { align?: "start" | "end" }) {
  return <div data-slot="bubble" data-variant={variant} data-align={align} className={cn(bubbleVariants({ variant }), className)} {...props} />;
}

function BubbleContent({ asChild = false, className, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="bubble-content"
      className={cn(
        "w-fit max-w-full min-w-0 overflow-hidden rounded-panel border border-transparent px-3.5 py-2.5 font-sans text-body-sm leading-relaxed break-words group-data-[align=end]/bubble:self-end [button]:cursor-pointer [button]:text-left [button,a]:outline-none [button,a]:transition-[background-color] [button,a]:duration-160 [button,a]:ease-out [button,a]:focus-visible:outline-2 [button,a]:focus-visible:outline-offset-2 [button,a]:focus-visible:outline-solid [button,a]:focus-visible:outline-focus-ring motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

const bubbleReactionsVariants = cva(
  "absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-pill border border-line bg-surface px-1.5 py-0.5 text-caption leading-tight text-fg shadow-tile has-[button]:p-0",
  {
    variants: {
      side: { top: "top-0 -translate-y-3/4", bottom: "bottom-0 translate-y-3/4" },
      align: { start: "left-3", end: "right-3" },
    },
    defaultVariants: { side: "bottom", align: "end" },
  },
);

/** Reactions pinned to a bubble's edge: a small white pill on the 9 percent edge. */
function BubbleReactions({ side = "bottom", align = "end", className, ...props }: React.ComponentProps<"div"> & { align?: "start" | "end"; side?: "top" | "bottom" }) {
  return <div data-slot="bubble-reactions" data-align={align} data-side={side} className={cn(bubbleReactionsVariants({ side, align }), className)} {...props} />;
}

export { Bubble, BubbleContent, BubbleGroup, BubbleReactions, bubbleVariants };

```
