# Pagination
Page keys under a table: the current page a white key, the others bare, Previous and Next with chevrons.

Install: npx opencommerce-ds add pagination
Requires: theme, utils
Packages: lucide-react
Exports: Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious
Client boundary: not required by this entry file
Reference: Extension from opencommerce-agentcard-web src/app/globals.css (.btn-secondary) and monitoring.tsx


## Usage
Use under a table or list that is split into pages. Show the first and last pages, the current one and its neighbors, with PaginationEllipsis between. Mark the current page with isActive and an unavailable Previous or Next with aria-disabled.
- Avoid: Pagination for fewer than two pages
- Avoid: Numbered pages for a live feed (load more instead)
- Avoid: Blue page keys


## Examples
Example components: npx opencommerce-ds add pagination
[Site](https://opencommerce-ds.vercel.app/preview/pagination/Site) | [Few](https://opencommerce-ds.vercel.app/preview/pagination/Few)

examples/pagination.tsx

```tsx
"use client";

import * as React from "react";

import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

function pages(page: number, count: number): (number | "gap")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const set = [...new Set([1, count, page - 1, page, page + 1].filter((p) => p >= 1 && p <= count))].sort((a, b) => a - b);
  return set.flatMap((p, i) => (i && p - set[i - 1] > 1 ? (["gap", p] as const) : [p]));
}

function Pager({ count, start = 1 }: { count: number; start?: number }) {
  const [page, setPage] = React.useState(start);
  const go = (p: number) => (event: React.MouseEvent) => {
    event.preventDefault();
    if (p >= 1 && p <= count) setPage(p);
  };
  return (
    <div className="grid w-full gap-3">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" onClick={go(page - 1)} aria-disabled={page === 1 || undefined} tabIndex={page === 1 ? -1 : undefined} />
          </PaginationItem>
          {pages(page, count).map((p, i) =>
            p === "gap" ? (
              <PaginationItem key={`gap-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink href="#" isActive={p === page} onClick={go(p)} aria-label={`Page ${p}`}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext href="#" onClick={go(page + 1)} aria-disabled={page === count || undefined} tabIndex={page === count ? -1 : undefined} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <p role="status" className="text-center text-body-sm text-fg-muted">
        Orders {(page - 1) * 25 + 1} to {Math.min(page * 25, count * 25 - 9)} of {count * 25 - 9}
      </p>
    </div>
  );
}

export function Site() {
  return <Pager count={12} start={4} />;
}

export function Few() {
  return <Pager count={3} />;
}

```

## Source

components/ui/pagination.tsx

```tsx
import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

// Paging through a long table (the monitoring table's foot): page numbers are 34px keys in 14px Inter, the current one
// the white key on the 16 percent ink edge with ink text, the others bare at 64 percent ink that take the faint wash and
// ink text under the pointer (150ms). Previous and Next are bare keys with a chevron. Every key shrinks to 0.97 when
// pressed, as the brand's keys do. An unavailable step (the first page's Previous) is faded and inert.
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav data-slot="pagination" role="navigation" aria-label="pagination" className={cn("mx-auto flex w-full justify-center", className)} {...props} />;
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="pagination-content" className={cn("flex flex-row items-center gap-1", className)} {...props} />;
}

function PaginationItem(props: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = { isActive?: boolean; size?: "icon" | "default" } & React.ComponentProps<"a">;

const LINK =
  "inline-flex h-8.5 shrink-0 items-center justify-center gap-1.5 rounded-control border font-sans text-body-sm leading-none whitespace-nowrap tabular-nums outline-none select-none transition-[background-color,border-color,color,scale] duration-150 ease-out active:scale-97 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring aria-disabled:pointer-events-none aria-disabled:opacity-40 motion-reduce:transition-[background-color,border-color,color] motion-reduce:active:scale-100 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0";

function PaginationLink({ className, isActive, size = "icon", ...props }: PaginationLinkProps) {
  return (
    <a
      data-slot="pagination-link"
      data-active={isActive || undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        LINK,
        size === "icon" ? "min-w-8.5 px-2" : "px-3",
        isActive ? "border-hairline bg-surface text-fg" : "border-transparent text-fg-muted hover:bg-wash-hover hover:text-fg",
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({ className, children = "Previous", ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Go to previous page" size="default" className={cn("pl-2.5", className)} {...props}>
      <ChevronLeft strokeWidth={1.5} />
      <span className="max-sm:sr-only">{children}</span>
    </PaginationLink>
  );
}

function PaginationNext({ className, children = "Next", ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Go to next page" size="default" className={cn("pr-2.5", className)} {...props}>
      <span className="max-sm:sr-only">{children}</span>
      <ChevronRight strokeWidth={1.5} />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="pagination-ellipsis" aria-hidden className={cn("flex size-8.5 items-center justify-center text-fg-faint [&_svg]:size-4", className)} {...props}>
      <MoreHorizontal strokeWidth={1.5} />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious };

```
