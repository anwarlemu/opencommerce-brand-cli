import * as React from "react";

import { cn } from "@/lib/utils";

// The brand's logo (logo.tsx, icon2.svg; brand/logo). The lockup is typeset, not drawn: the name in the display face at
// 17px, 500 and tracked tight, with "by Agentcard" beside it at 12px in 64 percent ink. `compact` folds the byline away
// (the header does once the page scrolls: width, opacity and margin over 250ms ease-out); `byline={false}` leaves it out.
// The mark is the [*] in white on a blue square with rounded corners, for tight spots (an app icon, an avatar, a tab).
// `tone` picks one of the brand's colors: ink (the default for the lockup), blue, white, or the text color around it.
const TONES = {
  current: "",
  brand: "text-fg-brand",
  white: "text-white",
  ink: "text-fg",
} as const;

type Tone = keyof typeof TONES;

type LogoProps = {
  /** The accessible name. Pass null when a link around the logo already names it (then the logo is hidden from readers). */
  label?: string | null;
  tone?: Tone;
};

type LockupProps = Omit<React.ComponentProps<"span">, "children"> &
  LogoProps & {
    /** Show "by Agentcard" beside the name (default true). */
    byline?: boolean;
    /** Fold the byline away, as the header does once the page scrolls. */
    compact?: boolean;
  };

/** The lockup: the name and its byline, typeset. Size it with a text size on the name (the default is 17px). */
function Lockup({ label = "opencommerce by Agentcard", tone = "ink", byline = true, compact = false, className, ...props }: LockupProps) {
  return (
    <span
      data-slot="lockup"
      role={label ? "img" : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      className={cn("inline-flex shrink-0 items-baseline font-display leading-none whitespace-nowrap", TONES[tone], className)}
      {...props}
    >
      <span data-logo-name className="text-h5 font-medium tracking-tight">
        opencommerce
      </span>
      {byline && (
        <span
          className={cn(
            "overflow-x-clip text-caption transition-[max-width,opacity,margin] duration-250 ease-out motion-reduce:transition-[opacity]",
            tone === "white" ? "text-fg-on-brand-muted" : "text-fg-muted",
            compact ? "ml-0 max-w-0 opacity-0" : "ml-1.5 max-w-25 opacity-100",
          )}
        >
          by Agentcard
        </span>
      )}
    </span>
  );
}

/** The mark alone: the [*] on a blue square. Size it by width (w-8); the height follows. */
function LogoMark({ label = "opencommerce", tone = "brand", className, ...props }: Omit<React.ComponentProps<"svg">, "children"> & LogoProps) {
  return (
    <svg
      data-slot="logo-mark"
      viewBox="0 0 32 32"
      role={label ? "img" : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className={cn("block h-auto w-8 shrink-0", TONES[tone], className)}
      {...props}
    >
      <rect width="32" height="32" rx="7" className="fill-current" />
      <g className={cn("fill-none [stroke-linecap:square] [stroke-width:2.4]", tone === "white" ? "stroke-brand" : "stroke-white")}>
        <path d="M9.5 8.5H7.25v15H9.5M22.5 8.5h2.25v15H22.5" />
        <path d="M16 11v10M11.67 13.5l8.66 5M11.67 18.5l8.66-5" />
      </g>
    </svg>
  );
}

export { Lockup, LogoMark };
export type { LogoProps, LockupProps };
