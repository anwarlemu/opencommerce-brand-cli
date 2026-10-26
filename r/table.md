# Table
Responsive table that stacks row content on phones.

Install: npx opencommerce-ds add table
Requires: theme, utils
Packages: none
Exports: Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow
Client boundary: not required by this entry file
Reference: opencommerce-agentcard-web src/components/monitoring.tsx (the merchant table)


## Usage
Use for live records (merchants, routes, orders) or a plan comparison. Set figures in the mono (font-mono text-snippet). Give each TableCell after the first a label for the mobile layout. Use Badge for statuses.
- Avoid: Zebra stripes
- Avoid: Bold or caps headers
- Avoid: Rules between columns
- Avoid: Tables nested in a card (the table is its own frame; inside a Window drop its frame with your own classes)


## Examples
Example components: npx opencommerce-ds add table badge
[Site](https://opencommerce-ds.vercel.app/preview/table/Site) | [Compare](https://opencommerce-ds.vercel.app/preview/table/Compare)

examples/table.tsx

```tsx
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ROWS = [
  { merchant: "DoorDash", success: "100%", last: "5 min ago", duration: "12 sec", status: "Operational" },
  { merchant: "Amazon", success: "99.9%", last: "1 min ago", duration: "9 sec", status: "Operational" },
  { merchant: "Best Buy", success: "99.6%", last: "7 min ago", duration: "16 sec", status: "Degraded" },
] as const;

export function Site() {
  return (
    <Table label="Merchant monitoring">
      <TableHeader>
        <TableRow>
          <TableHead>Merchant</TableHead>
          <TableHead>Success rate</TableHead>
          <TableHead>Last purchase</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.merchant}>
            <TableCell className="font-medium">{row.merchant}</TableCell>
            <TableCell label="Success rate" className="font-mono text-snippet">
              {row.success}
            </TableCell>
            <TableCell label="Last purchase" className="text-fg-muted">
              {row.last}
            </TableCell>
            <TableCell label="Duration" className="font-mono text-snippet text-fg-muted">
              {row.duration}
            </TableCell>
            <TableCell label="Status">
              <Badge variant={row.status === "Operational" ? "success" : "warning"}>{row.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// A comparison, the row names in the first column.
export function Compare() {
  const rows = [
    ["Merchants", "5 of your choice", "Every merchant"],
    ["Payment providers", "2", "Every provider"],
    ["Platform fee", "None", "1% of each completed order"],
  ];
  return (
    <Table label="Free and Standard compared">
      <TableHeader>
        <TableRow>
          <TableHead>
            <span className="sr-only">Topic</span>
          </TableHead>
          <TableHead>Free</TableHead>
          <TableHead>Standard</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(([topic, free, standard]) => (
          <TableRow key={topic}>
            <TableCell className="text-fg-muted">{topic}</TableCell>
            <TableCell label="Free">{free}</TableCell>
            <TableCell label="Standard" className="text-fg-brand">{standard}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

```

## Source

components/ui/table.tsx

```tsx
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

```
