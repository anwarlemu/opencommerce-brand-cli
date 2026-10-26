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
