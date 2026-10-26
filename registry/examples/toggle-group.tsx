"use client";

import * as React from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function Site() {
  const [view, setView] = React.useState("live");
  return (
    <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v)} aria-label="Route status">
      <ToggleGroupItem value="live">Live</ToggleGroupItem>
      <ToggleGroupItem value="degraded">Degraded</ToggleGroupItem>
      <ToggleGroupItem value="failed">Failed</ToggleGroupItem>
      <ToggleGroupItem value="all">All</ToggleGroupItem>
    </ToggleGroup>
  );
}

export function Outline() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <ToggleGroup type="multiple" variant="outline" defaultValue={["bold"]} aria-label="Text style">
        <ToggleGroupItem value="bold" aria-label="Bold">
          <Bold />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <Italic />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline">
          <Underline />
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" variant="outline" spacing={0} defaultValue="left" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenter />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRight />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="grid gap-4">
      <ToggleGroup type="single" size="sm" defaultValue="day" aria-label="Range">
        <ToggleGroupItem value="day">24h</ToggleGroupItem>
        <ToggleGroupItem value="week">7d</ToggleGroupItem>
        <ToggleGroupItem value="month">30d</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" orientation="vertical" variant="outline" spacing={0} defaultValue="usd" aria-label="Currency" className="w-40">
        <ToggleGroupItem value="usd">USD</ToggleGroupItem>
        <ToggleGroupItem value="eur">EUR</ToggleGroupItem>
        <ToggleGroupItem value="gbp" disabled>GBP</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
