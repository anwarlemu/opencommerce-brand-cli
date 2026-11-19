# Direction
Sets left-to-right or right-to-left reading for every component inside it.

Install: npx opencommerce-ds add direction
Requires: theme
Packages: @radix-ui/react-direction
Exports: DirectionProvider, useDirection
Client boundary: yes
Reference: Extrapolated from opencommerce (no visible part)


## Usage
Wrap a right-to-left region (Arabic or Hebrew content) in DirectionProvider with dir="rtl", and set dir on the element too, so menus, sliders and tabs flip.
- Avoid: Mirroring a layout with CSS alone
- Avoid: Mixing directions inside one form


## Examples
Example components: npx opencommerce-ds add direction slider toggle-group
[Site](https://opencommerce-ds.vercel.app/preview/direction/Site)

examples/direction.tsx

```tsx
"use client";

import { DirectionProvider } from "@/components/ui/direction";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function Site() {
  return (
    <DirectionProvider dir="rtl">
      <div dir="rtl" className="grid max-w-110 gap-4 font-sans text-body-sm text-fg">
        <p>الطلبات</p>
        <ToggleGroup type="single" defaultValue="live" aria-label="الحالة">
          <ToggleGroupItem value="live">مباشر</ToggleGroupItem>
          <ToggleGroupItem value="failed">فشل</ToggleGroupItem>
          <ToggleGroupItem value="all">الكل</ToggleGroupItem>
        </ToggleGroup>
        <Slider defaultValue={[30]} aria-label="الميزانية" />
      </div>
    </DirectionProvider>
  );
}

```

## Source

components/ui/direction.tsx

```tsx
"use client";

import * as React from "react";
import * as DirectionPrimitive from "@radix-ui/react-direction";

// Sets the reading direction (ltr or rtl) for every Radix-based component inside it, so menus, sliders and tabs flip
// for right-to-left text. It renders nothing of its own; set dir on the element you wrap too.
function DirectionProvider({ dir, direction, children }: React.ComponentProps<typeof DirectionPrimitive.DirectionProvider> & { direction?: React.ComponentProps<typeof DirectionPrimitive.DirectionProvider>["dir"] }) {
  return <DirectionPrimitive.DirectionProvider dir={direction ?? dir}>{children}</DirectionPrimitive.DirectionProvider>;
}

const useDirection = DirectionPrimitive.useDirection;

export { DirectionProvider, useDirection };

```
