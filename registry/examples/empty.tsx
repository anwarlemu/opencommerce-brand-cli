"use client";

import { useState } from "react";
import { Package, Search, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Window } from "@/components/ui/window";

export function Site() {
  const [connected, setConnected] = useState(false);
  return (
    <Window name="orders.list" className="mx-auto w-full max-w-2xl">
      {connected ? (
        <p role="status" className="px-6 py-12 text-center text-body-sm text-fg-muted">
          Waiting for your agent&apos;s first order.
        </p>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Package strokeWidth={1.5} />
            </EmptyMedia>
            <EmptyTitle>No orders yet</EmptyTitle>
            <EmptyDescription>Connect an agent and its first purchase will show up here, with every step from cart to delivery.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setConnected(true)}>Connect an agent</Button>
          </EmptyContent>
        </Empty>
      )}
    </Window>
  );
}

export function NoResults() {
  const [query, setQuery] = useState("Kohl’s outlet");
  const stores = ["Amazon", "Target", "Best Buy", "Staples", "Wayfair"].filter((s) => s.toLowerCase().includes(query.toLowerCase().trim()));
  return (
    <div className="mx-auto grid w-full max-w-2xl gap-4">
      <Input variant="search" aria-label="Search merchants" value={query} onChange={(e) => setQuery(e.target.value)} />
      {stores.length ? (
        <ul aria-live="polite" className="grid">
          {stores.map((s) => (
            <li key={s} className="border-b border-line py-3 text-body-sm">
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <Empty className="rounded-panel border border-line-window">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search strokeWidth={1.5} />
            </EmptyMedia>
            <EmptyTitle>No merchant matches</EmptyTitle>
            <EmptyDescription>Try the store&apos;s name as it appears on its site.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="secondary" onClick={() => setQuery("")}>
              Clear search
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}

export function Plain() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <Store strokeWidth={1.25} className="size-8 text-fg-faint" />
        </EmptyMedia>
        <EmptyTitle>No stores paused</EmptyTitle>
        <EmptyDescription>Every route is healthy right now.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
