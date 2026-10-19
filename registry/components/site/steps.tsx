"use client";

import * as React from "react";

import { CodeWindow } from "@/components/ui/code-window";
import { cn } from "@/lib/utils";

// How it works (the opencommerce site, in-action.tsx): the steps listed down the left, the open step's code on the
// right in a dark code window. A step is a row with its number in a small square (blue and filled when open, a hairline
// otherwise) and its title; the open one sits on the pale blue with a faint blue ring. The steps play through on a
// timer: a 2px bar fills along the foot of the open step (linear, it is a clock), and when it is full the next opens,
// back to the first after the last. The bar's own CSS animation is the clock, so pausing it (pointer or focus inside,
// or the steps off screen) holds the time exactly. A click jumps to that step and starts its bar over. Reduced motion
// gets no timer at all. Each step's code comes in through a breath of blur, so the swap reads as one change.

type Step = {
  title: React.ReactNode;
  code: string;
  /** The code window's name; defaults to step-1.ts. */
  file?: string;
  language?: string;
};

const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (cb: () => void) => {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** The open step's clock: a 2px bar along the row's foot, over its border, filling left to right. */
function TimerBar({ duration, running, onDone }: { duration: number; running: boolean; onDone: () => void }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const anim = React.useRef<Animation | null>(null);
  const done = React.useRef(onDone);
  done.current = onDone;
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.animate !== "function") return;
    const a = el.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration, easing: "linear", fill: "forwards" });
    a.onfinish = () => done.current();
    anim.current = a;
    return () => a.cancel();
  }, [duration]);
  React.useEffect(() => {
    if (running) anim.current?.play();
    else anim.current?.pause();
  }, [running]);
  return (
    <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5">
      <span ref={ref} className="block h-full origin-left scale-x-0 bg-brand" />
    </span>
  );
}

function Steps({ steps, interval = 6000, label = "Steps", className, ...props }: Omit<React.ComponentProps<"div">, "children"> & { steps: Step[]; /** ms each step stays open. */ interval?: number; label?: string }) {
  const [active, setActive] = React.useState(0);
  const [held, setHeld] = React.useState(false);
  const [onScreen, setOnScreen] = React.useState(false);
  // The server assumes reduced motion, so no bar renders before the browser says otherwise.
  const still = React.useSyncExternalStore(subscribeMotion, () => window.matchMedia(REDUCE).matches, () => true);
  const root = React.useRef<HTMLDivElement>(null);
  const id = React.useId();
  const step = steps[active];

  React.useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const next = () => setActive((i) => (i + 1) % steps.length);
  const running = !held && onScreen;

  // Arrow keys move between the steps, as in any tab list.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let to: number | undefined;
    if (e.key in keys) to = (active + keys[e.key] + steps.length) % steps.length;
    if (e.key === "Home") to = 0;
    if (e.key === "End") to = steps.length - 1;
    if (to === undefined) return;
    e.preventDefault();
    setActive(to);
    root.current?.querySelector<HTMLElement>(`#${CSS.escape(`${id}-tab-${to}`)}`)?.focus();
  };

  return (
    <div
      ref={root}
      data-slot="steps"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHeld(false)}
      className={cn("grid items-start gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-12", className)}
      {...props}
    >
      <div role="tablist" aria-label={label} aria-orientation="vertical" onKeyDown={onKeyDown} className="flex flex-col gap-1">
        {steps.map((s, i) => {
          const on = i === active;
          return (
            <button
              key={i}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={on}
              aria-controls={`${id}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                "relative flex items-center gap-4 overflow-hidden rounded-card px-4 py-4 text-left outline-none transition-colors duration-(--ds-duration-fast) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring motion-reduce:transition-none",
                on ? "bg-tint ring-1 ring-brand/20 ring-inset" : "hover:bg-subtle",
              )}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-chip font-mono text-caption transition-colors duration-(--ds-duration-fast) ease-out motion-reduce:transition-none",
                  on ? "bg-brand text-on-brand" : "border border-line-strong text-fg-muted",
                )}
              >
                {i + 1}
              </span>
              <span className={cn("text-button leading-snug transition-colors duration-(--ds-duration-fast) ease-out motion-reduce:transition-none", on ? "text-fg" : "text-fg-muted")}>{s.title}</span>
              {on && !still && (
                <TimerBar key={active} duration={interval} running={running} onDone={next} />
              )}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`}>
        <CodeWindow
          key={active}
          title={step.file ?? `step-${active + 1}.ts`}
          code={step.code}
          language={step.language}
          copy
          dark
          className="transition-[opacity,filter] duration-(--ds-duration-base) ease-out starting:opacity-0 starting:blur-xs motion-reduce:transition-opacity motion-reduce:starting:blur-none"
          preClassName="min-h-75"
        />
      </div>
    </div>
  );
}

export { Steps };
export type { Step };
