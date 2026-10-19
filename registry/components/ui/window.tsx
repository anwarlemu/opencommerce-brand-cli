import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// The brand's window (globals.css .win, .win-bar, .win-mark; computed): a plain white card on a 16 percent ink edge with
// 12px corners and the soft drop, under a quiet 36px title bar. The bar is mist (ink at 2.5 percent) over a 9 percent
// rule, set in the 11.5px platform mono at 64 percent ink: a dimmed arrow at the left, the file name centered, and the
// drawn [*] in blue at the right (or an action, such as Copy). `dark` puts the body on ink for code that runs. The other
// tones are kept for pages that need them: `sky` (a sky bar with blue marks), `blue` (white marks on the blue, for the
// one window that matters) and five pale tints for a grid of apps.
const windowBarVariants = cva(
  "grid min-h-9 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b pr-3 pl-3.5 font-mono text-bar leading-body",
  {
    variants: {
      tone: {
        mist: "border-line bg-window-bar text-fg-muted",
        sky: "border-line bg-sky text-fg-brand",
        blue: "border-line-brand-edge bg-brand text-on-brand",
        sage: "border-line bg-tint-sage text-fg",
        rose: "border-line bg-tint-rose text-fg",
        teal: "border-line bg-tint-teal text-fg",
        peach: "border-line bg-tint-peach text-fg",
        butter: "border-line bg-tint-butter text-fg",
      },
    },
    defaultVariants: { tone: "mist" },
  },
);

type Tone = NonNullable<VariantProps<typeof windowBarVariants>["tone"]>;

/** The [*] mark at the right of a window bar: an asterisk drawn in three strokes between brackets, in the bar's blue. */
function WindowMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("inline-flex items-center gap-px text-caption leading-none text-window-bar-fg", className)}>
      [
      <svg viewBox="0 0 12 12" className="size-[0.8em] fill-none stroke-current [stroke-linecap:square] [stroke-width:1.6]">
        <path d="M6 .5v11M1.24 3.25l9.52 5.5M1.24 8.75l9.52-5.5" />
      </svg>
      ]
    </span>
  );
}

function WindowBar({ name, tone, actions, className, ...props }: Omit<React.ComponentProps<"div">, "children"> & { name: React.ReactNode; tone?: Tone; actions?: React.ReactNode }) {
  const onColor = tone === "blue" || tone === "sky";
  return (
    <div data-slot="window-bar" className={cn(windowBarVariants({ tone }), className)} {...props}>
      <span aria-hidden className="justify-self-start opacity-60">
        ↳
      </span>
      <span className="min-w-0 truncate text-center">{name}</span>
      <span className="flex min-w-0 items-center justify-self-end">{actions ?? <WindowMark className={onColor ? "text-current" : undefined} />}</span>
    </div>
  );
}

/**
 * A window: the bar, then its body. `name` is the bar's file name (agent.ts, standard.plan); `tone` its bar; `dark`
 * puts the body on ink (code that runs); `actions` replaces the [*] (a Copy key). `raised` gives the firmer drop of a
 * card set on a picture.
 */
function Window({ name, tone, actions, raised = false, dark = false, className, bodyClassName, children, ...props }: React.ComponentProps<"div"> & { name: React.ReactNode; tone?: Tone; actions?: React.ReactNode; raised?: boolean; dark?: boolean; bodyClassName?: string }) {
  return (
    <div
      data-slot="window"
      className={cn("flex flex-col overflow-hidden rounded-panel border border-line-window bg-surface text-fg", raised ? "shadow-raised" : "shadow-card", className)}
      {...props}
    >
      <WindowBar name={name} tone={tone} actions={actions} />
      <div className={cn("min-h-0 flex-1", dark ? "bg-code text-fg-code" : "bg-surface", bodyClassName)}>{children}</div>
    </div>
  );
}

export { Window, WindowBar, WindowMark, windowBarVariants };
