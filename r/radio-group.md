# Radio Group
18px white circles on the hairline; the chosen one takes the blue edge and a blue dot.

Install: npx opencommerce-ds add radio-group
Requires: theme, field, utils
Packages: @radix-ui/react-radio-group
Exports: RadioGroup, RadioGroupItem
Client boundary: yes
Reference: Extrapolated from opencommerce (the checkbox and the blue key)


## Usage
Use for one choice among two to five options that should stay visible (a checkout mode, a shipping speed). Label every option with a Label (variant control) beside its circle, and give the group a name for FormData. For more options use Select; for a compact row of choices use Toggle Group.
- Avoid: A radio for a yes or no setting (use Switch)
- Avoid: Options without a visible label
- Avoid: A filled blue circle with no white ring


## Examples
Example components: npx opencommerce-ds add radio-group label
[Site](https://opencommerce-ds.vercel.app/preview/radio-group/Site) | [States](https://opencommerce-ds.vercel.app/preview/radio-group/States)

examples/radio-group.tsx

```tsx
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

```

## Source

components/ui/radio-group.tsx

```tsx
"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { useFieldControl } from "@/components/ui/field";
import { cn } from "@/lib/utils";

// Extrapolated from the brand's checkbox and keys: an 18px white circle on the 16 percent ink edge; chosen, it takes the
// blue key's darker blue edge and a 8px blue dot at its center. Options stack 10px apart, each label 15px Inter 8px from
// its circle (wrap item and label in a `label`, or pair them with htmlFor). The edge and dot change color in 160ms.
function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  const { required, ...control } = useFieldControl(props);
  return <RadioGroupPrimitive.Root data-slot="radio-group" required={required} className={cn("grid gap-2.5", className)} {...control} />;
}

function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "peer grid aspect-square size-4.5 shrink-0 cursor-pointer place-items-center rounded-pill border border-hairline bg-surface outline-none transition-[border-color] duration-160 ease-out hover:border-line-field-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger data-[state=checked]:border-line-brand-edge motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator data-slot="radio-group-indicator" className="block size-2 rounded-pill bg-primary" />
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };

```
