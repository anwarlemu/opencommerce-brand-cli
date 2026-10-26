"use client";

import { Pin, Radio, Star } from "lucide-react";

import { Toggle } from "@/components/ui/toggle";

export function Site() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Show live routes only" defaultPressed>
        <Radio />
        Live only
      </Toggle>
      <Toggle variant="outline" aria-label="Pin merchant">
        <Pin />
        Pin merchant
      </Toggle>
      <Toggle variant="outline" size="sm" aria-label="Favorite" defaultPressed>
        <Star />
      </Toggle>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle variant="outline" size="sm">Small</Toggle>
      <Toggle variant="outline">Default</Toggle>
      <Toggle variant="outline" size="lg">Large</Toggle>
      <Toggle variant="outline" disabled>Disabled</Toggle>
    </div>
  );
}
