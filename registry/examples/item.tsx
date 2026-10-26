"use client";

import { useState } from "react";
import { ChevronRight, CreditCard, Package, ShoppingCart, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item";

const ORDERS = [
  { id: "A-10293", store: "Amazon", items: "2 items", total: "$48.20", status: "Delivered" },
  { id: "T-48211", store: "Target", items: "1 item", total: "$19.99", status: "Shipped" },
  { id: "S-77310", store: "Staples", items: "6 items", total: "$112.45", status: "Confirmed" },
];

export function Site() {
  const [current, setCurrent] = useState("A-10293");
  return (
    <ItemGroup className="mx-auto w-full max-w-xl">
      {ORDERS.map((order, i) => (
        <div key={order.id}>
          {i > 0 && <ItemSeparator />}
          <Item asChild>
            <button type="button" aria-current={current === order.id || undefined} onClick={() => setCurrent(order.id)} className="w-full text-left">
              <ItemMedia variant="icon">
                <Package strokeWidth={1.5} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{order.store}</ItemTitle>
                <ItemDescription>
                  {order.items} <span className="font-mono text-bar">#{order.id}</span>
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <span className="font-mono text-snippet text-fg">{order.total}</span>
                <ChevronRight aria-hidden strokeWidth={1.5} className="size-4 text-fg-faint" />
              </ItemActions>
            </button>
          </Item>
        </div>
      ))}
    </ItemGroup>
  );
}

export function Variants() {
  return (
    <div className="mx-auto grid w-full max-w-xl gap-3">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <CreditCard strokeWidth={1.5} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Travel agent card</ItemTitle>
          <ItemDescription>Visa ending 4832, $2,000 a month.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="secondary">
            Manage
          </Button>
        </ItemActions>
      </Item>
      <Item variant="muted">
        <ItemMedia variant="icon">
          <Truck strokeWidth={1.5} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Tracking every order</ItemTitle>
          <ItemDescription>Your agent hears about each shipment as the carrier scans it.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="outline" size="sm">
        <ItemHeader>
          <Badge variant="chip">checkout</Badge>
          <span className="font-mono text-bar text-fg-muted">9s</span>
        </ItemHeader>
        <ItemContent>
          <ItemTitle>Purchase from Best Buy</ItemTitle>
        </ItemContent>
        <ItemFooter>
          <span className="font-mono text-bar text-fg-muted">route warmed</span>
          <Badge variant="success">Confirmed</Badge>
        </ItemFooter>
      </Item>
      <Item size="xs">
        <ItemMedia>
          <ShoppingCart aria-hidden strokeWidth={1.5} className="size-4 text-fg-brand" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Cart saved at Wayfair</ItemTitle>
        </ItemContent>
      </Item>
    </div>
  );
}
