import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// A keyboard key in the brand's small parts: `key` (the default) is a white face on the 16 percent ink edge with 4px
// corners, the label in the 10px platform mono at 64 percent ink, at least 18px wide. `bare` is the hint at the end of a
// search box: the 12px mono at 42 percent ink, no face at all.
const kbdVariants = cva("inline-grid shrink-0 place-items-center font-mono leading-none whitespace-nowrap", {
  variants: {
    variant: {
      key: "h-5 min-w-4.5 rounded-[calc(var(--ds-radius-control)/2)] border border-hairline bg-surface px-1 text-micro text-fg-muted",
      bare: "text-caption text-fg-faint",
    },
  },
  defaultVariants: { variant: "key" },
});

function Kbd({ className, variant, ...props }: React.ComponentProps<"kbd"> & VariantProps<typeof kbdVariants>) {
  return <kbd data-slot="kbd" className={cn(kbdVariants({ variant }), className)} {...props} />;
}

export { Kbd, kbdVariants };
