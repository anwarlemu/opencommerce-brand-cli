# Aspect Ratio
Holds media at a fixed shape so the layout does not jump while it loads.

Install: npx opencommerce-ds add aspect-ratio
Requires: theme
Packages: @radix-ui/react-aspect-ratio
Exports: AspectRatio
Client boundary: yes
Reference: Extrapolated from opencommerce (the windows' framed screens)


## Usage
Use around images, video and screens that must keep their shape (a product shot, a merchant's preview). Round and clip the media inside with the window's corners and edge.
- Avoid: Stretching media to fill the ratio
- Avoid: A ratio frame with its own border style


## Examples
Example components: npx opencommerce-ds add aspect-ratio
[Site](https://opencommerce-ds.vercel.app/preview/aspect-ratio/Site) | [Square](https://opencommerce-ds.vercel.app/preview/aspect-ratio/Square)

examples/aspect-ratio.tsx

```tsx
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function Site() {
  return (
    <div className="w-full max-w-110 overflow-hidden rounded-panel border border-line-window bg-surface shadow-card">
      <AspectRatio ratio={16 / 9}>
        <div className="flex size-full flex-col justify-end gap-1 bg-subtle p-4">
          <span className="font-mono text-caption text-fg-muted">order.preview</span>
          <span className="font-sans text-body-sm text-fg">Standing desk, oak, 48 in</span>
        </div>
      </AspectRatio>
    </div>
  );
}

export function Square() {
  return (
    <div className="grid w-full max-w-110 grid-cols-3 gap-3">
      {["Wayfair", "Staples", "Best Buy"].map((store) => (
        <AspectRatio key={store} ratio={1} className="grid place-items-center rounded-control border border-line bg-surface">
          <span className="font-sans text-body-sm text-fg-muted">{store}</span>
        </AspectRatio>
      ))}
    </div>
  );
}

```

## Source

components/ui/aspect-ratio.tsx

```tsx
"use client";

import * as React from "react";
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

// Holds media at a fixed shape (a product shot, a store's logo tile, a screen in a window). The frame takes no style of
// its own; round and clip the media inside it with the window's corners and edge.
function AspectRatio(props: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };

```
