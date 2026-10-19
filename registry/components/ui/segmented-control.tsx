"use client";

import * as React from "react";

import { useTabGlide } from "@/hooks/use-tab-glide";
import { cn } from "@/lib/utils";

// The header's tray (see Tabs) used as a value picker (a billing period, a package manager): the frosted pane and the
// white pill that glides to the selected option, each option sized to its label, with radio semantics. `plain` drops
// the tray for dense rows: quiet labels with a pale wash gliding between them.
type Option<T extends string> = { value: T; label: React.ReactNode; count?: number; disabled?: boolean };
type Variant = "default" | "plain";

const KEY: Record<Variant, string> = {
  default: "rounded-menu bg-surface shadow-lit",
  plain: "rounded-sm bg-wash-pill",
};

function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  label,
  size = "md",
  variant = "default",
  className,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: Option<T>[];
  label: string;
  size?: "sm" | "md";
  variant?: Variant;
  className?: string;
}) {
  const keyRef = React.useRef<HTMLSpanElement>(null);
  const isPlaced = useTabGlide(keyRef, value);
  const enabled = options.filter((option) => !option.disabled);
  const tabStop = enabled.find((option) => option.value === value)?.value ?? enabled[0]?.value;
  const track = variant === "default";

  return (
    <div
      role="radiogroup"
      aria-label={label}
      data-slot="segmented-control"
      className={cn("relative isolate inline-flex w-fit items-center", track ? "gap-0.5 rounded-control border border-line-glass bg-glass p-0.75 shadow-glass backdrop-blur-lg backdrop-saturate-140" : "gap-0.5", className)}
    >
      {/* The hook measures from the outer edge; -1px puts the key back inside the track's border. */}
      <span ref={keyRef} aria-hidden className={cn("pointer-events-none absolute -z-10", track ? "-top-px -left-px" : "top-0 left-0", KEY[variant], !isPlaced && "invisible")} />
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            data-tab-id={o.value}
            disabled={o.disabled}
            tabIndex={o.value === tabStop ? 0 : -1}
            onClick={() => onValueChange(o.value)}
            onKeyDown={(event) => {
              if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key) || !enabled.length) return;
              event.preventDefault();
              const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
              const forward = event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight");
              const index = enabled.findIndex((option) => option.value === o.value);
              const next = event.key === "Home" ? 0 : event.key === "End" ? enabled.length - 1 : (index + (forward ? 1 : -1) + enabled.length) % enabled.length;
              const target = enabled[next].value;
              onValueChange(target);
              const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button[role="radio"]');
              Array.from(buttons ?? []).find((button) => button.dataset.tabId === target)?.focus();
            }}
            className={cn(
              "disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5 font-sans leading-none whitespace-nowrap outline-none transition-[background-color,color] duration-160 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring motion-reduce:transition-none",
              track ? "rounded-menu" : "rounded-sm",
              size === "sm" ? "h-7 px-2.5 text-caption" : track ? "h-8 px-3.5 text-body-sm" : "h-8 px-3 text-body-sm",
              // Only the label and a faint wash answer the pointer, so nothing fades over the key gliding in beneath.
              selected ? (track ? "text-fg-brand" : "text-fg") : cn("text-fg-muted hover:text-fg", track && "hover:bg-wash-hover"),
              // Until the key lands, the selected option draws it itself so the first paint matches.
              selected && !isPlaced && KEY[variant],
            )}
          >
            {o.label}
            {o.count !== undefined && <span className={cn("tabular-nums", selected && track ? "text-fg-brand" : "text-fg-faint")}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export { SegmentedControl };
