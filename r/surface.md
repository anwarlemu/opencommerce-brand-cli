# Surface
Background and text context shared by a section and its overlays.

Install: npx opencommerce-ds add surface
Requires: utils
Packages: none
Exports: Surface, usePortalContainer
Client boundary: yes
Reference: opencommerce-agentcard-web src/app/globals.css (--ground, --mist); src/components/cta.tsx (the mist card)


## Usage
Wrap an area with the white or mist ground (the closing card, an inset) so content and overlays use matching colors.
- Avoid: A blue ground for a section (the page is white throughout)
- Avoid: Mist behind long text


## Source

lib/surface.tsx

```tsx
"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// A ground: white (the page, every card and window), mist (ink at 2.5 percent: the closing card, a window bar, an
// inset; `paper` is the same tint under its older name) or blue (a rare deliberate band; the page itself
// never sits on blue). Blue sets white text and sky labels for everything inside. Dialogs, menus and tooltips opened
// inside a Surface render inside it too, so they keep its ground.
const PortalContainer = React.createContext<HTMLElement | null>(null);

const GROUNDS = {
  white: "bg-surface text-fg",
  mist: "bg-subtle text-fg",
  paper: "bg-paper text-fg",
  blue: "bg-brand text-on-brand",
} as const;

export function Surface({ ground = "white", className, children, ...props }: React.ComponentProps<"div"> & { ground?: keyof typeof GROUNDS }) {
  const [element, setElement] = React.useState<HTMLDivElement | null>(null);
  return (
    <div ref={setElement} data-ground={ground} className={cn(GROUNDS[ground], className)} {...props}>
      <PortalContainer.Provider value={element}>{children}</PortalContainer.Provider>
    </div>
  );
}

/** Where overlays render: the nearest Surface, else the page body. */
export function usePortalContainer() {
  return React.useContext(PortalContainer) ?? undefined;
}

```
