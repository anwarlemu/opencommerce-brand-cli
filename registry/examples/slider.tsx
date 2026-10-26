"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function Site() {
  const [budget, setBudget] = React.useState([200]);
  return (
    <div className="grid max-w-110 gap-3">
      <div className="flex items-baseline justify-between">
        <Label htmlFor="budget">Per-order budget</Label>
        <span className="font-mono text-caption text-fg">${budget[0]}</span>
      </div>
      <Slider id="budget" value={budget} onValueChange={setBudget} min={0} max={1000} step={10} aria-label="Per-order budget" />
    </div>
  );
}

export function Range() {
  const [range, setRange] = React.useState([40, 240]);
  return (
    <div className="grid max-w-110 gap-3">
      <div className="flex items-baseline justify-between">
        <Label>Price filter</Label>
        <span className="font-mono text-caption text-fg">
          ${range[0]} to ${range[1]}
        </span>
      </div>
      <Slider value={range} onValueChange={setRange} min={0} max={500} step={5} aria-label="Price filter" />
    </div>
  );
}

export function States() {
  return (
    <div className="flex max-w-110 items-start gap-10">
      <div className="grid flex-1 gap-3">
        <Label>Retries (disabled)</Label>
        <Slider defaultValue={[3]} max={10} step={1} disabled aria-label="Retries" />
      </div>
      <Slider defaultValue={[60]} orientation="vertical" aria-label="Volume" className="h-32" />
    </div>
  );
}
