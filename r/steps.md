# Steps
How it works: steps listed down the left, each with its code in a dark window, playing through on a timer.

Install: npx opencommerce-ds add steps
Requires: theme, code-window, utils
Packages: none
Exports: Steps, Step
Client boundary: yes
Reference: opencommerce-agentcard-web src/components/in-action.tsx, src/app/globals.css (.swap-in, step-timer)


## Usage
Use once on the home page, in a wide SiteSection, for three to six steps from first call to result. Each step carries the code that does it.
- Avoid: More than six steps
- Avoid: Steps without code
- Avoid: A timer faster than 4 seconds a step
- Avoid: Auto-advancing under reduced motion
- Avoid: Light code windows here
`Steps` props: `steps` ({ title, code, file, language }[]), `interval` (ms a step stays open, default 6000), `label`
(the tab list's name, default "Steps"), plus div props. Arrow keys, Home and End move between steps.

Motion: the timer bar fills linearly (it is a clock) and holds while the pointer or focus is inside or the steps are off
screen; the new code fades in through a breath of blur (200ms ease-out). Reduced motion: no timer, and only the fade.

## Examples
Example components: npx opencommerce-ds add steps
Example packages: @agentcard/sdk
[Site](https://opencommerce-ds.vercel.app/preview/steps/Site)

examples/steps.tsx

```tsx
import { Steps } from "@/components/site/steps";

const STEPS = [
  { title: "Add the commerce tool to your agent", code: `npm install @agentcard/sdk\n\nimport { Agentcard } from "@agentcard/sdk";\n\nconst agentcard = new Agentcard({\n  clientSecret: process.env.AGENTCARD_SECRET,\n});\n\nconst tools = [agentcard.tools.commerce()];` },
  { title: "Search catalogues and place orders conversationally", code: `const results = await agentcard.commerce.search({\n  query: "running shoes, size 10",\n  maxPrice: 120,\n});` },
  { title: "Pay with your customer’s stored card", code: `const order = await agentcard.commerce.checkout({\n  item: results[0].id,\n  card: customer.cardId,\n});` },
  { title: "Follow orders and report back", code: `const status = await agentcard.commerce.track(order.id);\n// "shipped", with the carrier and tracking number` },
];

export function Site() {
  return (
    <div className="mx-auto w-(--ds-frame-column) py-16">
      <Steps steps={STEPS} />
    </div>
  );
}

```

## Source

components/site/steps.tsx

```tsx
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

```
