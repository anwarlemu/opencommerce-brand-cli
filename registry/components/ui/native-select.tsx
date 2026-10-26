import * as React from "react";

import { cn } from "@/lib/utils";

// The browser's own select dressed as the brand's field and select: 36px, 8px corners, white on the 16 percent ink edge,
// 14px Inter 12px in and the select's drawn chevron 12px from the right; focus turns the edge blue, with no glow.
// `size="sm"` is the 32px compact field. Use it where the platform picker is better (phones, long lists, forms without
// script).
type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & { size?: "sm" | "default" };

function NativeSelect({ className, size = "default", ...props }: NativeSelectProps) {
  return (
    <div data-slot="native-select-wrapper" data-size={size} className={cn("group/native-select relative w-fit has-[select:disabled]:opacity-50", className)}>
      <select
        data-slot="native-select"
        data-size={size}
        className="h-9 w-full min-w-0 cursor-pointer appearance-none rounded-control border border-hairline bg-surface py-0 pr-9 pl-3 font-sans text-body-sm leading-body text-fg outline-none transition-[border-color] duration-160 ease-out hover:border-line-field-hover focus-visible:border-line-brand disabled:cursor-not-allowed aria-invalid:border-danger data-[size=sm]:h-8 data-[size=sm]:pl-2.5 motion-reduce:transition-none"
        {...props}
      />
      <svg aria-hidden data-slot="native-select-icon" viewBox="0 0 10 6" className="pointer-events-none absolute top-1/2 right-3 h-1.5 w-2.5 -translate-y-1/2 fill-none stroke-current text-fg-muted [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.5]">
        <path d="M1 1l4 4 4-4" />
      </svg>
    </div>
  );
}

function NativeSelectOption({ className, ...props }: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" className={cn("bg-surface text-fg", className)} {...props} />;
}

function NativeSelectOptGroup({ className, ...props }: React.ComponentProps<"optgroup">) {
  return <optgroup data-slot="native-select-optgroup" className={cn("bg-surface text-fg", className)} {...props} />;
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
