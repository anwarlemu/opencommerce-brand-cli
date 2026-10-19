"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// The footer's big name (the opencommerce site's footer wordmark): the word set as wide as the page in the display face,
// drawn as a faint outline. While a mouse is over it, a soft spotlight follows the pointer and draws the letters under
// it in the brand blue, feathering out to nothing. Two copies share one box so they line up glyph for glyph: the
// outline, and the lit copy masked to a circle at the pointer (--x, --y). The pointer only writes those two
// properties, so nothing re-renders. Touch screens have no hover and keep the plain outline. The spotlight fades in
// and out (200ms ease-out); with reduced motion it simply appears.

const SPOT = "radial-gradient(circle clamp(5.625rem,14vw,13.75rem) at var(--x,50%) var(--y,50%),var(--ds-color-ink) 0%,color-mix(in srgb,var(--ds-color-ink) 55%,transparent) 40%,transparent 100%)";

function OutlineWordmark({ text, className, ...props }: Omit<React.ComponentProps<"p">, "children"> & { text: string }) {
  const ref = React.useRef<HTMLParagraphElement>(null);
  const track = (e: React.PointerEvent<HTMLParagraphElement>) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return (
    <p
      ref={ref}
      aria-hidden
      data-slot="outline-wordmark"
      onPointerEnter={track}
      onPointerMove={track}
      className={cn(
        "group/wordmark relative overflow-x-clip text-center font-display text-[clamp(3.5rem,13.2vw,var(--ds-text-display))] leading-none font-medium tracking-display whitespace-nowrap text-transparent select-none",
        className,
      )}
    >
      <span className="block [-webkit-text-stroke:1px_color-mix(in_srgb,var(--ds-color-ink)_13%,transparent)]">{text}</span>
      <span
        style={{ maskImage: SPOT, WebkitMaskImage: SPOT }}
        className="pointer-events-none absolute inset-0 bg-[color-mix(in_srgb,var(--ds-color-brand)_6%,transparent)] bg-clip-text opacity-0 transition-opacity duration-(--ds-duration-base) ease-out [-webkit-text-stroke:1.25px_var(--ds-color-brand)] motion-reduce:transition-none [@media(hover:hover)]:group-hover/wordmark:opacity-100"
      >
        {text}
      </span>
    </p>
  );
}

export { OutlineWordmark };
