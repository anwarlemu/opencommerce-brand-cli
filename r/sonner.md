# Toast
Toast notifications with optional actions.

Install: npx opencommerce-ds add sonner
Requires: theme, utils
Packages: sonner
Exports: Toaster
Client boundary: yes
Reference: Extension from opencommerce-agentcard-web src/app/globals.css (.feat-order, .feat-node)


## Usage
Mount one Toaster near the application root. Show a toast after an action succeeds or fails. Connect any toast action to its intended behavior.
- Avoid: Toasts for errors that need an answer (use a dialog or a banner)
- Avoid: More than one action
- Avoid: Dark toasts
- Avoid: Long sentences in a toast


## Examples
Example components: npx opencommerce-ds add sonner button copy-button
Example packages: sonner
[Site](https://opencommerce-ds.vercel.app/preview/sonner/Site) | [Action](https://opencommerce-ds.vercel.app/preview/sonner/Action)

examples/sonner.tsx

```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/components/ui/copy-button";
import { Toaster } from "@/components/ui/sonner";

export function Site() {
  const { copy } = useCopy();
  return <div className="relative h-40">
    <Button variant="secondary" onClick={async () => {
      const copied = await copy("ac_demo_7Hq2");
      if (copied) toast.success("Key copied", { id: "key-copied", toasterId: "toast-example", description: "ac_demo_7Hq2" });
      else toast.error("Could not copy the key", { id: "key-copied", toasterId: "toast-example", description: "Check clipboard access and try again." });
    }}>Copy key</Button>
    <Toaster id="toast-example" style={{ position: "absolute" }} offset={{ left: 0, bottom: 0 }} mobileOffset={{ left: 0, bottom: 0 }} />
  </div>;
}
export function Action() {
  const [viewing, setViewing] = useState(false);
  return <div className="relative min-h-40">
    <Button variant="secondary" onClick={() => {
      setViewing(false);
      toast.success("Card created", { id: "card-created", toasterId: "toast-action", description: "Travel agent", duration: Infinity,
        action: { label: "View card", onClick: () => setViewing(true) } });
    }}>Create card</Button>
    {viewing && <p className="mt-3 text-body-sm" role="status">Travel agent · Active · $250 per purchase</p>}
    <Toaster id="toast-action" style={{ position: "absolute" }} offset={{ left: 0, bottom: 0 }} mobileOffset={{ left: 0, bottom: 0 }} />
  </div>;
}

```

## Source

components/ui/sonner.tsx

```tsx
"use client";

import * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { cn } from "@/lib/utils";

// The brand's toast: a white card at the bottom left, one 40px line high, a 9 percent ink edge, 8px corners and a soft
// drop; a 24px blue square with a white tick at its left (the order card's done step), then the title (14px Inter at
// 500) and its line (12px, 64 percent ink) side by side. An action is a small blue key at the right, cancel a small
// white one; both shrink to 0.97 when pressed. Sonner places, stacks and swipes it (its own
// enter and exit motion); this only draws it.
const KEY = "grid size-6 shrink-0 place-items-center rounded-sm border text-on-primary [&_svg]:size-3 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round] [&_svg]:[stroke-width:2]";

function Mark({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const TICK = "M3.5 8.5 6.5 11.5 12.5 4.5";

function Toaster({ toastOptions, ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      position="bottom-left"
      offset={{ left: 30, bottom: 20 }}
      mobileOffset={{ left: 18, bottom: 20 }}
      visibleToasts={3}
      icons={{
        success: <Mark d={TICK} />,
        info: <Mark d="M8 7v5M8 4.5v.01" />,
        warning: <Mark d="M8 4v5M8 11.5v.01" />,
        error: <Mark d="M4.5 4.5l7 7M11.5 4.5l-7 7" />,
      }}
      toastOptions={{
        unstyled: true,
        ...toastOptions,
        classNames: {
          toast:
            "flex h-10 w-max max-w-[calc(100vw-2.25rem)] items-center gap-2.5 rounded-control border border-line bg-surface pr-1.5 pl-1.75 font-sans text-fg shadow-floating [&:not(:has([data-button]))]:pr-3.5",
          icon: cn(KEY, "m-0 border-line-brand-edge bg-primary"),
          content: "flex min-w-0 items-baseline gap-2",
          title: "font-sans text-body-sm leading-snug font-medium whitespace-nowrap",
          description: "max-w-55 truncate font-sans text-caption leading-snug text-fg-muted",
          actionButton:
            "ml-1.5 h-7 shrink-0 cursor-pointer rounded-sm border border-line-brand-edge bg-primary px-2.5 font-sans text-caption font-medium text-on-primary outline-none transition-[background-color,scale] duration-160 ease-out hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring active:scale-97 motion-reduce:transition-[background-color] motion-reduce:active:scale-100",
          cancelButton:
            "ml-1.5 h-7 shrink-0 cursor-pointer rounded-sm border border-hairline bg-surface px-2.5 font-sans text-caption font-medium text-fg outline-none transition-[background-color,scale] duration-160 ease-out hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring active:scale-97 motion-reduce:transition-[background-color] motion-reduce:active:scale-100",
          error: "[&_[data-icon]]:border-danger [&_[data-icon]]:bg-danger",
          warning: "[&_[data-icon]]:border-warning [&_[data-icon]]:bg-warning",
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
}

export { Toaster };

```
