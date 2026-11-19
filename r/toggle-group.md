# Toggle Group
The header's frosted tray of options with the chosen one a white key and a blue label, or separate white keys.

Install: npx opencommerce-ds add toggle-group
Requires: theme, toggle, utils
Packages: @radix-ui/react-toggle-group, class-variance-authority
Exports: ToggleGroup, ToggleGroupItem
Client boundary: yes
Reference: Extrapolated from opencommerce (the header's trays and the segmented control)


## Usage
Use type="single" for one view or filter among a few (Live, Failed, All) and type="multiple" for filters that combine. Use variant outline with spacing 0 for a joined bar of white keys. Prefer Tabs when each option shows its own panel.
- Avoid: A gliding key (choices change instantly)
- Avoid: More than six options in the tray
- Avoid: Blue filled keys for the chosen option


## Examples
Example components: npx opencommerce-ds add toggle-group
Example packages: lucide-react
[Site](https://opencommerce-ds.vercel.app/preview/toggle-group/Site) | [Outline](https://opencommerce-ds.vercel.app/preview/toggle-group/Outline) | [Sizes](https://opencommerce-ds.vercel.app/preview/toggle-group/Sizes)

examples/toggle-group.tsx

```tsx
"use client";

import * as React from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function Site() {
  const [view, setView] = React.useState("live");
  return (
    <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v)} aria-label="Route status">
      <ToggleGroupItem value="live">Live</ToggleGroupItem>
      <ToggleGroupItem value="degraded">Degraded</ToggleGroupItem>
      <ToggleGroupItem value="failed">Failed</ToggleGroupItem>
      <ToggleGroupItem value="all">All</ToggleGroupItem>
    </ToggleGroup>
  );
}

export function Outline() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <ToggleGroup type="multiple" variant="outline" defaultValue={["bold"]} aria-label="Text style">
        <ToggleGroupItem value="bold" aria-label="Bold">
          <Bold />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <Italic />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline">
          <Underline />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" variant="outline" spacing={0} defaultValue="left" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenter />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRight />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="grid gap-4">
      <ToggleGroup type="single" size="sm" defaultValue="day" aria-label="Range">
        <ToggleGroupItem value="day">24h</ToggleGroupItem>
        <ToggleGroupItem value="week">7d</ToggleGroupItem>
        <ToggleGroupItem value="month">30d</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" orientation="vertical" variant="outline" spacing={0} defaultValue="usd" aria-label="Currency" className="w-40">
        <ToggleGroupItem value="usd">USD</ToggleGroupItem>
        <ToggleGroupItem value="eur">EUR</ToggleGroupItem>
        <ToggleGroupItem value="gbp" disabled>GBP</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

```

## Source

components/ui/toggle-group.tsx

```tsx
"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

// The header's tray as a set of toggles (the segmented control's look): a frosted pane on the 10 percent ink edge with a
// 3px inset, and the chosen option a white key with 5px corners, the lit drop and a blue label. Choosing is instant (no
// gliding key): toggles change often and must feel immediate. `variant="outline"` drops the tray for separate white keys
// on the hairline, the chosen ones lit in blue. `spacing={0}` joins outline keys into one bar with shared edges.
const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants> & { spacing?: number; orientation?: "horizontal" | "vertical" }>({
  size: "default",
  variant: "default",
  spacing: 0.5,
  orientation: "horizontal",
});

function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  spacing = variant === "outline" ? 2 : 0.5,
  orientation = "horizontal",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants> & { spacing?: number; orientation?: "horizontal" | "vertical" }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      orientation={orientation}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit max-w-full items-center gap-[calc(var(--spacing)*var(--gap))] data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
        variant === "default" && "overflow-x-auto rounded-control border border-line-glass bg-glass p-0.75 shadow-glass backdrop-blur-lg backdrop-saturate-140 [scrollbar-width:none]",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing, orientation }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({ className, children, variant, size, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);
  const v = context.variant || variant || "default";
  const joined = v === "outline" && context.spacing === 0;
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={v}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({ variant: v, size: context.size || size }),
        // In the tray the chosen option is the white key with a blue label, as in the segmented control.
        v === "default" && "rounded-menu hover:bg-wash-glass-hover data-[state=on]:bg-surface data-[state=on]:text-fg-brand data-[state=on]:shadow-lit data-[state=on]:hover:bg-surface",
        joined && "rounded-none first:rounded-l-control last:rounded-r-control [&+&]:-ml-px data-[state=on]:z-10 group-data-[orientation=vertical]/toggle-group:first:rounded-t-control group-data-[orientation=vertical]/toggle-group:first:rounded-bl-none group-data-[orientation=vertical]/toggle-group:last:rounded-b-control group-data-[orientation=vertical]/toggle-group:last:rounded-tr-none group-data-[orientation=vertical]/toggle-group:[&+&]:-mt-px group-data-[orientation=vertical]/toggle-group:[&+&]:ml-0",
        "focus-visible:z-10",
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };

```
