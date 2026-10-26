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
