import * as React from "react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

// A link out to the docs or a guide: 14px Inter in ink on a blue underline, the text turning blue under the pointer
// (160ms ease-out), and an arrow pointing out that stays still (only its color follows). Opens in a new tab.
function DocsLink({ className, children = "Read the docs", ...props }: React.ComponentProps<"a">) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      data-slot="docs-link"
      className={cn(
        "group inline-flex w-fit shrink-0 items-center gap-1 font-sans text-body-sm whitespace-nowrap text-fg underline decoration-line-brand decoration-1 underline-offset-4 transition-[color] duration-160 ease-out outline-none hover:text-fg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring",
        className,
      )}
      {...props}
    >
      {children}
      <ArrowUpRight
        className="size-3.5 shrink-0"
        strokeWidth={1.75}
        aria-hidden
      />
    </a>
  );
}

export { DocsLink };
