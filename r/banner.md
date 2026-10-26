# Banner
Notice with a title, message and optional actions.

Install: npx opencommerce-ds add banner
Requires: theme, window, utils
Packages: none
Exports: Banner
Client boundary: not required by this entry file
Reference: Extension from opencommerce-agentcard-web src/app/globals.css (.win, .win-bar)


## Usage
Use info for general notices, brand for announcements and alert for problems. Set name for the title bar and provide an action when one is needed.
- Avoid: More than one banner at a time
- Avoid: Banners for marketing copy that belongs in a section
- Avoid: Bold titles
- Avoid: Gradients


## Examples
Example components: npx opencommerce-ds add banner button
[Site](https://opencommerce-ds.vercel.app/preview/banner/Site)

examples/banner.tsx

```tsx
"use client";

import { useState } from "react";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";

export function Site() {
  const [reviewing, setReviewing] = useState(false);
  return <div className="grid max-w-3xl gap-4">
    <Banner name="tracking.beta" title="Order tracking is in beta" actions={<Button size="sm" asChild><a href="#docs">Read the guide</a></Button>}>Your agent can now follow an order from checkout to the door.</Banner>
    <Banner tone="brand" name="merchants.news" title="Fifty new stores this month" actions={<Button size="sm" variant="secondary" asChild><a href="#monitoring">See the list</a></Button>}>Every one is monitored around the clock from day one.</Banner>
    <Banner tone="alert" name="agent.paused" title="Travel agent was paused" actions={<Button variant="secondary" size="sm" aria-expanded={reviewing} onClick={() => setReviewing(!reviewing)}>{reviewing ? "Hide details" : "Review"}</Button>}>It hit its monthly limit on Oct 14.</Banner>
    {reviewing && <p className="text-body-sm text-fg-muted">Travel agent has spent $2,000 of its $2,000 monthly limit. Purchases are paused until its limit resets.</p>}
  </div>;
}

```

## Source

components/ui/banner.tsx

```tsx
import * as React from "react";

import { WindowBar } from "@/components/ui/window";
import { cn } from "@/lib/utils";

// A notice as one of the brand's windows: the 16 percent ink edge, 12px corners and the window's soft drop, its mist
// bar labeled like a file (`name`), over a sheet with 14px of padding on top, 18px at the sides and 16px below. `info`
// is a note: the sheet on the pale blue. `brand` is the notice that matters: white, its title in blue. `alert` is
// trouble: white, its title in red. The title is 16px display at 500, tracked tight, the detail 14px Inter at 64
// percent ink, and actions sit at the end.

const TONES = {
  info: { bar: "mist", sheet: "bg-note", title: "text-fg", name: "note" },
  brand: { bar: "mist", sheet: "bg-surface", title: "text-fg-brand", name: "news" },
  alert: { bar: "mist", sheet: "bg-surface", title: "text-danger", name: "alert" },
} as const;

function Banner({
  tone = "info",
  title,
  name,
  actions,
  role,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  tone?: keyof typeof TONES;
  title: React.ReactNode;
  /** The bar's label, file-like: `voice.beta`, `card.paused`. Defaults to note, news or alert. */
  name?: React.ReactNode;
  actions?: React.ReactNode;
  role?: "status" | "alert";
}) {
  const t = TONES[tone];
  return (
    <div
      role={role ?? (tone === "alert" ? "alert" : "status")}
      data-slot="banner"
      data-tone={tone}
      className={cn("flex flex-col overflow-hidden rounded-panel border border-line-window text-fg shadow-card", t.sheet, className)}
      {...props}
    >
      <WindowBar aria-hidden name={name ?? t.name} tone={t.bar} className="[&>span:nth-child(2)]:text-left" />
      <div className="flex flex-col gap-3 px-4.5 pt-3.5 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className={cn("font-display text-body leading-snug font-medium tracking-tight", t.title)}>{title}</p>
          {children && (
            <div data-slot="banner-detail" className="mt-1 text-body-sm leading-relaxed text-fg-muted">
              {children}
            </div>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export { Banner };

```
