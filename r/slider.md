# Slider
A 4px rule filled with the blue up to the value, with a small white key you drag or step with the arrow keys.

Install: npx opencommerce-ds add slider
Requires: theme, utils
Packages: @radix-ui/react-slider
Exports: Slider
Client boundary: yes
Reference: Extrapolated from opencommerce (the switch key and the speed bars in speed.feature)


## Usage
Use to set a number in a known range where the rough value matters more than the exact one (a per-order budget, a retry count). Show the current value beside it in the platform mono. Pass two values for a range, and set step for whole units.
- Avoid: A slider for an exact amount the user must type
- Avoid: A round blue knob
- Avoid: Animating the key between values


## Examples
Example components: npx opencommerce-ds add slider label
[Site](https://opencommerce-ds.vercel.app/preview/slider/Site) | [Range](https://opencommerce-ds.vercel.app/preview/slider/Range) | [States](https://opencommerce-ds.vercel.app/preview/slider/States)

examples/slider.tsx

```tsx
"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function Site() {
  const [budget, setBudget] = React.useState([200]);
  return (
    <div className="grid max-w-110 gap-3">
      <div className="flex items-baseline justify-between">
        <Label htmlFor="budget">Per-order budget</Label>
        <span className="font-mono text-caption text-fg">${budget[0]}</span>
      </div>
      <Slider id="budget" value={budget} onValueChange={setBudget} min={0} max={1000} step={10} aria-label="Per-order budget" />
    </div>
  );
}

export function Range() {
  const [range, setRange] = React.useState([40, 240]);
  return (
    <div className="grid max-w-110 gap-3">
      <div className="flex items-baseline justify-between">
        <Label>Price filter</Label>
        <span className="font-mono text-caption text-fg">
          ${range[0]} to ${range[1]}
        </span>
      </div>
      <Slider value={range} onValueChange={setRange} min={0} max={500} step={5} aria-label="Price filter" />
    </div>
  );
}

export function States() {
  return (
    <div className="flex max-w-110 items-start gap-10">
      <div className="grid flex-1 gap-3">
        <Label>Retries (disabled)</Label>
        <Slider defaultValue={[3]} max={10} step={1} disabled aria-label="Retries" />
      </div>
      <Slider defaultValue={[60]} orientation="vertical" aria-label="Volume" className="h-32" />
    </div>
  );
}

```

## Source

components/ui/slider.tsx

```tsx
"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

// Extrapolated from the brand's switch and the speed bars in speed.feature: a 4px track in the 9 percent ink rule, filled
// with the blue up to the value, and an 18px white key with 5px corners on the 16 percent ink edge with the switch key's
// faint drop. Focus draws the outline ring; the key follows the pointer and never animates its position. Pass two values
// for a range.
function Slider({ className, defaultValue, value, min = 0, max = 100, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const values = React.useMemo(() => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]), [value, defaultValue, min, max]);
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-chip bg-line data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1"
      >
        <SliderPrimitive.Range data-slot="slider-range" className="absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full" />
      </SliderPrimitive.Track>
      {Array.from({ length: values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          aria-label={props["aria-label"] ? undefined : values.length > 1 ? (index === 0 ? "Minimum" : "Maximum") : undefined}
          className="block size-4.5 shrink-0 cursor-grab rounded-menu border border-hairline bg-white shadow-tile outline-none transition-[border-color] duration-160 ease-out hover:border-line-field-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring active:cursor-grabbing disabled:pointer-events-none motion-reduce:transition-none"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };

```
