"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

// A small key: an 18px white box with 5px corners on the 16 percent ink edge; checked, it becomes the blue key (its
// darker blue edge) with a white check. The fill changes in 160ms ease-out.
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer grid size-4.5 shrink-0 place-items-center rounded-menu border border-hairline bg-surface text-on-primary outline-none transition-[background-color,border-color] duration-160 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger data-[state=checked]:border-line-brand-edge data-[state=checked]:bg-primary data-[state=indeterminate]:border-line-brand-edge data-[state=indeterminate]:bg-primary motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="grid place-items-center [&_svg]:size-3">
        {props.checked === "indeterminate" ? <Minus strokeWidth={2.25} /> : <Check strokeWidth={2.25} />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
