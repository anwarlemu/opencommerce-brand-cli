"use client";

import * as React from "react";

import { useFieldControl } from "@/components/ui/field";
import { cn } from "@/lib/utils";

// The brand's field over several lines: the same 8px corners, 16 percent ink edge and 14px Inter as the input, 8px by
// 12px of padding, at least 84px tall and growing only downward; focus turns the edge blue, with no glow.
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "block min-h-21 w-full min-w-0 resize-y rounded-control border border-hairline bg-surface px-3 py-2 font-sans text-body-sm leading-body text-fg outline-none transition-[border-color] duration-160 ease-out placeholder:text-fg-faint hover:border-line-field-hover focus-visible:border-line-brand disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger motion-reduce:transition-none",
        className,
      )}
      {...useFieldControl(props)}
    />
  );
}

export { Textarea };
