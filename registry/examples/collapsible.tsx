"use client";

import * as React from "react";

import { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const ITEMS = [
  { name: "Trail runner, size 10", qty: 1, price: "$128.00" },
  { name: "Merino socks, 3 pack", qty: 2, price: "$36.00" },
  { name: "Water bottle, 750ml", qty: 1, price: "$22.00" },
];

export function Site() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="w-full max-w-110 rounded-panel border border-line-window bg-surface p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-h5 font-medium tracking-tight text-fg">Order ord_8KQ2</p>
        <p className="font-mono text-snippet text-fg tabular-nums">$222.00</p>
      </div>
      <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 rounded-menu py-1.5 text-left text-body-sm text-fg-muted transition-colors duration-150 ease-out hover:text-fg motion-reduce:transition-none">
          {open ? "Hide items" : "Show 3 items"}
          <CollapsibleChevron />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="mt-2 border-t border-line">
            {ITEMS.map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-4 border-b border-line py-2.5 text-body-sm last:border-b-0">
                <span className="text-fg">
                  {item.name} <span className="text-fg-muted">x{item.qty}</span>
                </span>
                <span className="font-mono text-snippet text-fg tabular-nums">{item.price}</span>
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function Settings() {
  return (
    <Collapsible defaultOpen className="w-full max-w-110">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 border-b border-line py-3 text-left text-body text-fg">
        Advanced checkout settings
        <CollapsibleChevron />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 py-3 text-body-sm">
          <dt className="text-fg-muted">Retry a failed checkout</dt>
          <dd className="text-fg">Twice</dd>
          <dt className="text-fg-muted">Ask before orders over</dt>
          <dd className="font-mono text-snippet text-fg tabular-nums">$500.00</dd>
          <dt className="text-fg-muted">Ship to</dt>
          <dd className="text-fg">Billing address</dd>
        </dl>
      </CollapsibleContent>
    </Collapsible>
  );
}
