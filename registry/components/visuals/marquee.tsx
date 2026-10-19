"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// The running strip (the opencommerce hero's stores): bare marks or names in grey (ink at 45 percent), in one row,
// drifting left at a slow, steady pace (linear, 100s a lap) and fading out at both ends. Two copies sit end to end and
// the track moves by one copy's width, so the loop has no seam. A mouse resting on it holds it so a mark can be read.
// With reduced motion it stands still and scrolls by hand. The second copy is hidden from screen readers; the first is
// a list, and `label` names it.

function useReducedMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduce;
}

type MarqueeProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** The marks or names, in order. Give an image its alt here; the repeated copy is hidden from readers. */
  items: React.ReactNode[];
  /** The list's accessible name ("Stores"). */
  label?: string;
  /** Seconds for one lap (one copy of the row). */
  duration?: number;
};

function Marquee({ items, label, duration = 100, className, ...props }: MarqueeProps) {
  const trackRef = React.useRef<HTMLUListElement>(null);
  const animationRef = React.useRef<Animation | null>(null);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    const el = trackRef.current;
    if (!el || reduce || typeof el.animate !== "function") return;
    const animation = el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }], { duration: duration * 1000, iterations: Infinity, easing: "linear" });
    animationRef.current = animation;
    return () => {
      animation.cancel();
      animationRef.current = null;
    };
  }, [reduce, duration]);

  const pause = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") animationRef.current?.pause();
  };
  const play = () => animationRef.current?.play();

  const row = (copy: boolean) =>
    items.map((item, i) => (
      <li key={`${i}${copy ? "-copy" : ""}`} aria-hidden={copy || undefined} className="flex flex-none items-center pr-11">
        {item}
      </li>
    ));

  return (
    <div
      data-slot="marquee"
      onPointerEnter={pause}
      onPointerLeave={play}
      className={cn(
        "w-full text-[color-mix(in_srgb,var(--ds-color-ink)_45%,transparent)] [mask-image:linear-gradient(to_right,transparent,var(--ds-color-ink)_14%,var(--ds-color-ink)_86%,transparent)]",
        reduce ? "overflow-x-auto" : "overflow-hidden",
        className,
      )}
      {...props}
    >
      <ul ref={trackRef} aria-label={label} className="flex h-7 w-max list-none items-center p-0 text-body-sm whitespace-nowrap will-change-transform">
        {row(false)}
        {!reduce && row(true)}
      </ul>
    </div>
  );
}

export { Marquee };
export type { MarqueeProps };
