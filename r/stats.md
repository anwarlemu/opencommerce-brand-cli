# Stats
Figures in windows: the number in the display face, its label under it, in a row that wraps, under an optional heading.

Install: npx opencommerce-ds add stats
Requires: theme, section, window, utils
Packages: none
Exports: Stats, Stat
Client boundary: not required by this entry file
Reference: Extension in the opencommerce site's voice (the live numbers in monitoring.tsx and features.tsx, globals.css .win)


## Usage
Use for two to four figures that matter (orders a day, stores reached). Pass stats with value, label and an optional window name.
- Avoid: Figures nobody can check
- Avoid: More than four in a row
- Avoid: Blue figures
`Stats` props: `title`, `description`, `stats` (`{ value, label, name? }[]`), plus div props.

## Examples
Example components: npx opencommerce-ds add stats
[Site](https://opencommerce-ds.vercel.app/preview/stats/Site)

examples/stats.tsx

```tsx
import { Stats } from "@/components/site/stats";

export function Site() {
  return (
    <Stats
      title="Built for volume"
      stats={[
        { value: "1,200+", label: "Stores an agent can buy from", name: "stores.live" },
        { value: "3 s", label: "From request to confirmed order", name: "checkout.live" },
        { value: "99.9%", label: "Uptime over the last 90 days", name: "uptime.live" },
      ]}
    />
  );
}

```

## Source

components/site/stats.tsx

```tsx
import * as React from "react";

import { SectionHeading } from "@/components/site/section";
import { Window } from "@/components/ui/window";
import { cn } from "@/lib/utils";

// Figures, as the site sets its live numbers: each in a window (its name file-like, the figure in the display face at
// 500 tracked tight, its label in Inter at 64 percent ink), in a row that wraps on phones, under an optional heading.
type Stat = { value: React.ReactNode; label: React.ReactNode; name?: string };

function Stats({ title, description, stats, className, ...props }: Omit<React.ComponentProps<"div">, "title"> & { title?: React.ReactNode; description?: React.ReactNode; stats: Stat[] }) {
  return (
    <div data-slot="stats" className={cn("w-full", className)} {...props}>
      {title && <SectionHeading title={title} description={description} />}
      <ul className={cn("grid gap-4 sm:grid-cols-2", stats.length > 2 && "lg:grid-cols-3", stats.length > 3 && "lg:grid-cols-4")}>
        {stats.map((stat, i) => (
          <li key={stat.name ?? i}>
            <Window name={stat.name ?? `figure-${i + 1}.live`} bodyClassName="px-6 py-7">
              <p className="font-display text-h1 leading-none font-medium tracking-hero">{stat.value}</p>
              <p className="mt-3 text-body-sm leading-relaxed text-fg-muted">{stat.label}</p>
            </Window>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { Stats };
export type { Stat };

```
