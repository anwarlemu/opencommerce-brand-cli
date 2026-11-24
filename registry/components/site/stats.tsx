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
