import * as React from "react";

import { WindowBar } from "@/components/ui/window";
import { cn } from "@/lib/utils";

// An empty list or a search with no results, as a quiet window: the 16 percent ink edge and 12px corners with no drop,
// the mist title bar (`name`, file-like: `orders.list`, `search.results`), and a centered body on white: an optional
// mark, a title in the 20px display face at 500, one line in Inter at 64 percent ink, and an optional key.
function EmptyState({
  title,
  description,
  action,
  icon,
  name = "empty",
  tone,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** The one thing to do next, usually a Button. */
  action?: React.ReactNode;
  /** A small mark above the title (an icon or an illustration passed in). */
  icon?: React.ReactNode;
  /** The title bar's label; pass null to drop the bar. */
  name?: React.ReactNode;
  tone?: React.ComponentProps<typeof WindowBar>["tone"];
}) {
  return (
    <div data-slot="empty-state" className={cn("flex flex-col overflow-hidden rounded-panel border border-line-window bg-surface text-fg", className)} {...props}>
      {name !== null && <WindowBar name={name} tone={tone} />}
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-surface px-6 py-12 text-center md:py-16">
        {icon && (
          <div aria-hidden className="mb-1 grid size-10 place-items-center rounded-card border border-line bg-surface text-fg-brand shadow-tile [&_svg]:size-4.5">
            {icon}
          </div>
        )}
        <p className="font-display text-h4 leading-snug font-medium tracking-tight text-fg">{title}</p>
        {description && <p className="max-w-sm text-body-sm leading-relaxed text-fg-muted">{description}</p>}
        {children}
        {action && <div className="mt-2 flex flex-wrap justify-center gap-3">{action}</div>}
      </div>
    </div>
  );
}

export { EmptyState };
