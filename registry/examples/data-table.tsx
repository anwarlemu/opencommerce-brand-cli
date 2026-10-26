"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

type Order = { id: string; merchant: string; agent: string; total: number; status: "Delivered" | "Shipped" | "Placed" | "Failed"; placed: string };

const MERCHANTS = ["Northwind Outfitters", "Contoso Coffee", "Fabrikam Home", "Tailspin Toys", "Litware Books"];
const AGENTS = ["travel-agent", "office-supplies", "gift-buyer"];
const STATUSES: Order["status"][] = ["Delivered", "Shipped", "Placed", "Delivered", "Failed", "Shipped"];

const ORDERS: Order[] = Array.from({ length: 36 }, (_, i) => ({
  id: `ord_${(8000 + i * 37).toString(36).toUpperCase()}`,
  merchant: MERCHANTS[(i * 3) % MERCHANTS.length],
  agent: AGENTS[i % AGENTS.length],
  total: Math.round(((i * 7919) % 48000) + 1200) / 100,
  status: STATUSES[i % STATUSES.length],
  placed: `2026-10-${String(26 - (i % 20)).padStart(2, "0")}`,
}));

const STATUS_BADGE = { Delivered: "success", Shipped: "brand", Placed: "default", Failed: "destructive" } as const;

const COLUMNS: DataTableColumn<Order>[] = [
  { id: "id", header: "Order", accessor: (o) => o.id, cell: (o) => <span className="font-mono text-snippet">{o.id}</span>, hideable: false },
  { id: "merchant", header: "Merchant", accessor: (o) => o.merchant, sortable: true },
  { id: "agent", header: "Agent", accessor: (o) => o.agent, cell: (o) => <span className="font-mono text-snippet text-fg-muted">{o.agent}</span> },
  { id: "status", header: "Status", accessor: (o) => o.status, sortable: true, cell: (o) => <Badge variant={STATUS_BADGE[o.status]}>{o.status}</Badge> },
  { id: "placed", header: "Placed", accessor: (o) => o.placed, sortable: true, hidden: true, cell: (o) => <span className="font-mono text-snippet">{o.placed}</span> },
  { id: "total", header: "Total", accessor: (o) => o.total, sortable: true, align: "end", cell: (o) => <span className="font-mono text-snippet">${o.total.toFixed(2)}</span> },
];

export function Site() {
  return <DataTable columns={COLUMNS} data={ORDERS} getRowId={(o) => o.id} filter={{ placeholder: "Filter orders" }} pageSize={8} pageSizes={[8, 16, 32]} defaultSort={{ id: "total", desc: true }} rowName="order" />;
}

export function Selection() {
  const [selection, setSelection] = React.useState<string[]>([]);
  const [message, setMessage] = React.useState("");
  return (
    <div className="grid gap-3">
      <DataTable
        columns={COLUMNS}
        data={ORDERS}
        getRowId={(o) => o.id}
        filter={{ placeholder: "Filter orders", columns: ["id", "merchant", "agent"] }}
        selectable
        selection={selection}
        onSelectionChange={setSelection}
        pageSize={6}
        rowName="order"
        toolbar={
          <Button
            variant="secondary"
            size="sm"
            disabled={!selection.length}
            onClick={() => {
              setMessage(`Retried ${selection.length} ${selection.length === 1 ? "checkout" : "checkouts"}.`);
              setSelection([]);
            }}
          >
            Retry selected
          </Button>
        }
      />
      <p role="status" className="text-body-sm text-fg-muted empty:hidden">
        {message}
      </p>
    </div>
  );
}

export function Empty() {
  return <DataTable columns={COLUMNS} data={[]} getRowId={(o) => o.id} filter={{ placeholder: "Filter orders" }} empty="No orders yet. Your agent's first checkout shows up here." rowName="order" />;
}
