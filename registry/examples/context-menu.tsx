"use client";

import * as React from "react";
import { Copy, ExternalLink, RotateCcw, Trash2 } from "lucide-react";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

function Order({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [status, setStatus] = React.useState("Right click the order, or press and hold on a phone.");
  const [notify, setNotify] = React.useState(true);
  const [speed, setSpeed] = React.useState("standard");
  return (
    <div className="grid w-full max-w-110 gap-3">
      <ContextMenu modal={!defaultOpen}>
        <ContextMenuTrigger className="grid gap-1 rounded-panel border border-line-window bg-surface p-5 shadow-card">
          <span className="flex items-baseline justify-between gap-3">
            <span className="font-display text-h5 font-medium tracking-tight text-fg">Northwind Outfitters</span>
            <span className="font-mono text-snippet text-fg tabular-nums">$222.00</span>
          </span>
          <span className="font-mono text-bar text-fg-muted">ord_8KQ2 · placed 2 minutes ago</span>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-60">
          <ContextMenuLabel>Order ord_8KQ2</ContextMenuLabel>
          <ContextMenuItem onSelect={() => setStatus("Copied ord_8KQ2.")}>
            <Copy strokeWidth={1.5} />
            Copy order ID
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => setStatus("Opened the merchant's receipt.")}>
            <ExternalLink strokeWidth={1.5} />
            Open receipt
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => setStatus("Checkout retried.")}>
            <RotateCcw strokeWidth={1.5} />
            Retry checkout
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Shipping</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuRadioGroup value={speed} onValueChange={setSpeed}>
                <ContextMenuRadioItem value="standard">Standard</ContextMenuRadioItem>
                <ContextMenuRadioItem value="express">Express</ContextMenuRadioItem>
                <ContextMenuRadioItem value="overnight">Overnight</ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuCheckboxItem checked={notify} onCheckedChange={(on) => setNotify(on === true)}>
            Email me on delivery
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive" onSelect={() => setStatus("Order canceled.")}>
            <Trash2 strokeWidth={1.5} />
            Cancel order
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <p role="status" className="text-body-sm text-fg-muted">
        {status} Shipping: {speed}. Delivery email {notify ? "on" : "off"}.
      </p>
    </div>
  );
}

export function Site() {
  return <Order />;
}
