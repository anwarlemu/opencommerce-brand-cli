"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const MODES = [
  { value: "auto", label: "Buy automatically", hint: "The agent checks out when the total is under the budget." },
  { value: "confirm", label: "Ask before buying", hint: "The agent stops at payment and waits for a yes." },
  { value: "quote", label: "Quote only", hint: "The agent builds the cart and returns a price." },
];

export function Site() {
  const [mode, setMode] = React.useState("confirm");
  return (
    <div className="grid max-w-110 gap-3">
      <p id="checkout-mode" className="font-sans text-caption text-fg-muted">
        Checkout mode
      </p>
      <RadioGroup value={mode} onValueChange={setMode} name="mode" aria-labelledby="checkout-mode">
        {MODES.map((m) => (
          <div key={m.value} className="flex items-start gap-2.5">
            <RadioGroupItem value={m.value} id={`mode-${m.value}`} className="mt-0.5" />
            <div className="grid gap-0.5">
              <Label variant="control" htmlFor={`mode-${m.value}`}>
                {m.label}
              </Label>
              <p className="font-sans text-body-sm text-fg-muted">{m.hint}</p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

export function States() {
  return (
    <RadioGroup defaultValue="standard" aria-label="Shipping speed" className="max-w-80">
      <div className="flex items-center gap-2.5">
        <RadioGroupItem value="standard" id="ship-standard" />
        <Label variant="control" htmlFor="ship-standard">Standard</Label>
      </div>
      <div className="flex items-center gap-2.5">
        <RadioGroupItem value="express" id="ship-express" />
        <Label variant="control" htmlFor="ship-express">Express</Label>
      </div>
      <div className="flex items-center gap-2.5">
        <RadioGroupItem value="same-day" id="ship-same-day" disabled />
        <Label variant="control" htmlFor="ship-same-day">Same day (not offered by this store)</Label>
      </div>
      <div className="flex items-center gap-2.5">
        <RadioGroupItem value="pickup" id="ship-pickup" aria-invalid />
        <Label variant="control" htmlFor="ship-pickup">Store pickup (needs an address)</Label>
      </div>
    </RadioGroup>
  );
}
