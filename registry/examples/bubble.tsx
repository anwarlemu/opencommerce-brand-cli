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
