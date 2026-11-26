# Copy button
A small Copy key that swaps to Copied in place, on white or on ink.

Install: npx opencommerce-ds add copy-button
Requires: theme, tooltip, utils
Packages: none
Exports: useCopy, CopyButton
Client boundary: yes
Reference: opencommerce-agentcard-web src/components/copy-button.tsx; src/app/globals.css (.copy-layer, .key-white, .key-dark)


## Usage
Place beside a command, key or file and pass its value: in a window bar's corner, at the top right of a code card or in an install box. Use dark on ink. Use compact only where there is no room for the word.
- Avoid: A copy button without a label for screen readers
- Avoid: Green or red copy states
- Avoid: Copying without visible feedback
- Avoid: A key that changes width when it says Copied
`CopyButton` takes `value`, `label` (the accessible name, default "Copy"), `dark` (on ink), `compact` (the icon only,
named by a tooltip) and `className`. It also exports `useCopy()`, which returns `{ hasCopied, error, copy }` for a
control of your own.

## Examples
Example components: npx opencommerce-ds add copy-button
[Site](https://opencommerce-ds.vercel.app/preview/copy-button/Site)

examples/copy-button.tsx

```tsx
import { CopyButton } from "@/components/ui/copy-button";

export function Site() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <div className="flex items-center gap-3 rounded-control border border-hairline bg-surface py-2 pr-2 pl-4">
        <code className="min-w-0 flex-1 truncate font-mono text-snippet text-fg">npm install @agentcard/sdk</code>
        <CopyButton value="npm install @agentcard/sdk" label="Copy command" />
      </div>
      <div className="flex items-center gap-3 rounded-panel bg-code py-2 pr-2 pl-4">
        <code className="min-w-0 flex-1 truncate font-mono text-snippet text-fg-code">pnpm add @agentcard/sdk</code>
        <CopyButton value="pnpm add @agentcard/sdk" label="Copy command" dark />
        <CopyButton value="pnpm add @agentcard/sdk" label="Copy command" dark compact />
      </div>
    </div>
  );
}

```

## Source

components/ui/copy-button.tsx

```tsx
"use client";

import * as React from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const COPIED_MS = 2000;

/** Copies text and reports it for a moment, so the button can say so. */
export function useCopy() {
  const [hasCopied, setHasCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const timeout = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(() => () => clearTimeout(timeout.current), []);
  const copy = React.useCallback(async (text: string) => {
    clearTimeout(timeout.current);
    setError(null);
    setHasCopied(false);
    try {
      const policy = (document as Document & { permissionsPolicy?: { allowsFeature: (name: string) => boolean }; featurePolicy?: { allowsFeature: (name: string) => boolean } });
      if (navigator.clipboard && (policy.permissionsPolicy ?? policy.featurePolicy)?.allowsFeature("clipboard-write") !== false) {
        await navigator.clipboard.writeText(text);
      } else {
        // Sandboxed previews and older browsers can still copy a user-selected string synchronously.
        const previous = document.activeElement;
        const selection = document.getSelection();
        const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index)) : [];
        const field = document.createElement("textarea");
        field.value = text;
        field.style.cssText = "position:fixed;opacity:0;pointer-events:none";
        document.body.append(field);
        try {
          field.focus({ preventScroll: true });
          field.select();
          if (!document.execCommand("copy")) throw new Error("Copy unavailable");
        } finally {
          field.remove();
          if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
          selection?.removeAllRanges();
          for (const range of ranges) selection?.addRange(range);
        }
      }
    } catch {
      setError("Copy failed. Try again.");
      return false;
    }
    setHasCopied(true);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setHasCopied(false), COPIED_MS);
    return true;
  }, []);
  return { hasCopied, error, copy };
}

// The brand's copy key (copy-button.tsx, globals.css .copy-layer, .key-white, .key-dark; computed): a 28px key with 6px
// corners and the 12px platform mono, "Copy" beside a drawn clipboard. White with blue text on white; on ink (`dark`)
// an outline at 15 percent white that brightens with its label under the pointer. Copied, the two states swap in one
// cell, so the key never changes width: the leaving one lifts away, shrinking a touch and blurring as it fades (160ms),
// the arriving one rises from below (250ms ease-out) and its tick draws once the label has landed. A press shrinks the
// key to 0.97. Reduced motion only crossfades. `compact` drops the words for a tight bar (the tooltip names it).
const LAYER =
  "col-start-1 row-start-1 flex items-center justify-center gap-1.5 transition-[opacity,translate,scale,filter] duration-250 ease-out motion-reduce:transition-[opacity] motion-reduce:duration-150";
const OUT = "pointer-events-none -translate-y-1.75 scale-94 opacity-0 blur-xs duration-160 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:blur-none";

function CopyIcon() {
  return (
    <svg aria-hidden viewBox="0 0 12 12" className="size-3 fill-none stroke-current">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <path d="M8.5 1.5h-5.5a1.5 1.5 0 0 0-1.5 1.5v5.5" strokeLinecap="round" />
    </svg>
  );
}

function TickIcon({ drawn }: { drawn: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 12 12" className="size-3 fill-none stroke-current">
      <path
        d="M2 6.4l2.6 2.6L10 3.4"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={drawn ? 0 : 1}
        className="transition-[stroke-dashoffset] delay-100 duration-200 ease-out motion-reduce:transition-none"
      />
    </svg>
  );
}

function CopyButton({ value, label = "Copy", dark = false, compact = false, className }: { value: string; label?: string; dark?: boolean; compact?: boolean; className?: string }) {
  const { hasCopied, error, copy } = useCopy();
  const button = (
    <button
      type="button"
      data-slot="copy-button"
      data-copied={hasCopied || undefined}
      onClick={() => copy(value)}
      aria-label={hasCopied ? "Copied" : error ?? label}
      className={cn(
        "relative grid h-7 shrink-0 place-items-center overflow-hidden rounded-sm border font-mono text-caption leading-none outline-none transition-[background-color,border-color,color,scale] duration-160 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring active:scale-97 motion-reduce:transition-[background-color,border-color,color] motion-reduce:active:scale-100",
        compact ? "w-7" : "px-2.5",
        dark ? "border-line-on-code text-white/70 hover:border-line-on-code-hover hover:text-white" : "border-hairline bg-surface text-fg-brand hover:bg-subtle",
        className,
      )}
    >
      <span aria-hidden className={cn(LAYER, hasCopied && OUT)}>
        <CopyIcon />
        {!compact && "Copy"}
      </span>
      <span aria-hidden className={cn(LAYER, !hasCopied && OUT, !hasCopied && "translate-y-1.75", dark && "text-sky")}>
        <TickIcon drawn={hasCopied} />
        {!compact && "Copied"}
      </span>
    </button>
  );
  return (
    <>
      {compact ? (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="top">{hasCopied ? "Copied" : error ?? label}</TooltipContent>
        </Tooltip>
      ) : (
        button
      )}
      <span role="status" className="sr-only">{hasCopied ? "Copied" : error}</span>
    </>
  );
}

export { CopyButton };

```
