# Segmented control
Single-value selector with radio semantics and arrow-key navigation.

Install: npx opencommerce-ds add segmented-control
Requires: theme, use-tab-glide, utils
Packages: none
Exports: SegmentedControl
Client boundary: yes
Reference: opencommerce-agentcard-web src/components/nav-pills.tsx; src/app/globals.css (.nav-tray, .nav-link, .nav-lit)


## Usage
Use for a small set of options such as a billing period or a package manager. Connect value and onValueChange. Use size="sm" in compact layouts and variant="plain" in toolbars.
- Avoid: Switching between pages or panels (use tabs)
- Avoid: More than four options
- Avoid: Pill-shaped tracks


## Examples
Example components: npx opencommerce-ds add segmented-control
[Site](https://opencommerce-ds.vercel.app/preview/segmented-control/Site) | [Plain](https://opencommerce-ds.vercel.app/preview/segmented-control/Plain)

examples/segmented-control.tsx

```tsx
"use client";

import * as React from "react";

import { SegmentedControl } from "@/components/ui/segmented-control";

export function Site() {
  const [period, setPeriod] = React.useState<"month" | "year">("month");
  const [kind, setKind] = React.useState<"prepaid" | "commercial" | "virtual">("prepaid");
  return (
    <div className="grid gap-6">
      <SegmentedControl
        label="Billing"
        value={period}
        onValueChange={setPeriod}
        options={[
          { value: "month", label: "Monthly" },
          { value: "year", label: "Yearly" },
        ]}
      />
      <SegmentedControl
        label="Card type"
        size="sm"
        value={kind}
        onValueChange={setKind}
        options={[
          { value: "prepaid", label: "Prepaid", count: 4 },
          { value: "commercial", label: "Commercial", count: 2 },
          { value: "virtual", label: "Single use", count: 9 },
        ]}
      />
    </div>
  );
}

export function Plain() {
  const [range, setRange] = React.useState<"day" | "week" | "month">("week");
  return (
    <SegmentedControl
      label="Range"
      variant="plain"
      value={range}
      onValueChange={setRange}
      options={[
        { value: "day", label: "Day" },
        { value: "week", label: "Week" },
        { value: "month", label: "Month" },
      ]}
    />
  );
}

```

## Source

components/ui/segmented-control.tsx

```tsx
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

```
