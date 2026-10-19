import * as React from "react";

import { cn } from "@/lib/utils";

// The brand's table (monitoring.tsx, the live merchant table; computed): a white frame with 12px corners on the 16
// percent ink edge and the window's soft drop; the head's labels in 12px Inter at 64 percent ink, normal weight, on a 9
// percent rule; 14px Inter rows, each on a 9 percent rule, that take the mist under the pointer (160ms). Figures read best
// in the mono (font-mono and the 13px code size on the cell). It scrolls sideways inside its frame when too wide, never the page. On a
// phone (below 640px) each row stacks: the first cell as its title, then each other cell under its column's name (pass
// `label` to TableCell), the head kept for screen readers.
function Table({ className, label = "Table", ...props }: React.ComponentProps<"table"> & { label?: string }) {
  return (
    <div
      data-slot="table-container"
      role="region"
      aria-label={label}
      tabIndex={0}
      className="relative w-full overflow-x-auto rounded-panel border border-line-window bg-surface shadow-card outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring"
    >
      <table data-slot="table" className={cn("w-full caption-bottom border-collapse text-left text-body-sm leading-normal text-fg max-sm:block", className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("max-sm:sr-only", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("max-sm:block [@media(hover:hover)]:[&>tr:hover]:bg-subtle", className)} {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return <tfoot data-slot="table-footer" className={cn("font-medium max-sm:block", className)} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr data-slot="table-row" className={cn("transition-[background-color] duration-160 ease-out data-[state=selected]:bg-wash-selected motion-reduce:transition-none max-sm:block max-sm:py-3 max-sm:[&+&]:border-t max-sm:[&+&]:border-line", className)} {...props} />;
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn("px-4 py-3 align-bottom font-sans text-caption font-normal whitespace-nowrap text-fg-muted", className)}
      {...props}
    />
  );
}

function TableCell({ className, label, ...props }: React.ComponentProps<"td"> & { label?: string }) {
  return (
    <td
      data-slot="table-cell"
      data-label={label}
      className={cn(
        "min-w-35 border-t border-line px-4 py-4 align-middle text-body-sm leading-normal text-fg tabular-nums",
        // A phone's stacked row: no rules inside it, the first cell its title, the others under their column's name.
        "max-sm:block max-sm:min-w-0 max-sm:border-0 max-sm:px-3.5 max-sm:py-1 max-sm:text-left max-sm:first:font-medium ",
        "max-sm:data-label:not-first:before:mb-0.5 max-sm:data-label:not-first:before:block max-sm:data-label:not-first:before:font-sans max-sm:data-label:not-first:before:text-caption max-sm:data-label:not-first:before:text-fg-muted max-sm:data-label:not-first:before:content-[attr(data-label)]",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("px-4 py-3 text-left text-body-sm text-fg-muted", className)} {...props} />;
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
