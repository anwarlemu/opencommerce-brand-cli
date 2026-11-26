# Label
Accessible label for a form control.

Install: npx opencommerce-ds add label
Requires: theme, utils
Packages: @radix-ui/react-label
Exports: Label
Client boundary: yes
Reference: Extension from opencommerce-agentcard-web src/components/monitoring.tsx (table head labels)


## Usage
Use the default form label above an input. Use variant=control for the larger label beside a checkbox, switch or radio. Connect htmlFor to the control id, or use Field to connect it automatically.
- Avoid: Bold labels
- Avoid: Caps labels
- Avoid: Labels without a control to point at


## Examples
Example components: npx opencommerce-ds add label checkbox input switch
[Site](https://opencommerce-ds.vercel.app/preview/label/Site)

examples/label.tsx

```tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function Site() {
  return <div className="grid max-w-sm gap-4">
    <div className="grid gap-1.5">
      <Label htmlFor="label-company">Company</Label>
      <Input id="label-company" name="company" placeholder="Acme" />
    </div>
    <Label variant="control"><Checkbox defaultChecked />Email me a receipt for every purchase</Label>
    <div className="flex items-center justify-between gap-4">
      <Label variant="control" htmlFor="label-switch">Pause this card</Label>
      <Switch id="label-switch" />
    </div>
  </div>;
}

```

## Source

components/ui/label.tsx

```tsx
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

// Form labels: 12px Inter at 64 percent ink, as the brand sets its table heads.
// The control variant pairs a body-size label with an inline checkbox or switch.
function Label({ className, variant = "form", ...props }: React.ComponentProps<typeof LabelPrimitive.Root> & { variant?: "form" | "control" }) {
  return <LabelPrimitive.Root data-slot="label" className={cn(
    "flex items-center gap-2 select-none peer-disabled:opacity-50 group-data-[disabled=true]:opacity-50 font-sans text-caption leading-normal text-fg-muted",
    variant === "control" && "font-sans text-body leading-snug text-fg",
    className,
  )} {...props} />;
}

export { Label };

```
