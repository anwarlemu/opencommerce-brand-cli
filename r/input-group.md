# Input Group
The brand's field with glyphs, text, keys or a mist mono segment inside its edge.

Install: npx opencommerce-ds add input-group
Requires: theme, button, utils
Packages: class-variance-authority
Exports: InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea
Client boundary: yes
Reference: Extrapolated from opencommerce (the input, the search field and the merchant filter in monitoring.live)


## Usage
Use when something belongs inside the field: a search mark, a unit or domain (segment), a copy or clear key, a count. Put InputGroupInput or InputGroupTextarea inside InputGroup and InputGroupAddon at either end (inline-start, inline-end) or above or below a textarea (block-start, block-end).
- Avoid: A second border around the inner control
- Avoid: A glow on focus
- Avoid: Addons that are not clickable but look like keys


## Examples
Example components: npx opencommerce-ds add input-group label
Example packages: lucide-react
[Site](https://opencommerce-ds.vercel.app/preview/input-group/Site) | [WithButton](https://opencommerce-ds.vercel.app/preview/input-group/WithButton) | [Textarea](https://opencommerce-ds.vercel.app/preview/input-group/Textarea) | [States](https://opencommerce-ds.vercel.app/preview/input-group/States)

examples/input-group.tsx

```tsx
"use client";

import * as React from "react";
import { Check, Copy, Search, X } from "lucide-react";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";

export function Site() {
  const [query, setQuery] = React.useState("");
  return (
    <div className="grid w-full max-w-100 gap-4">
      <InputGroup>
        <InputGroupAddon>
          <Search strokeWidth={1.5} />
        </InputGroupAddon>
        <InputGroupInput type="search" placeholder="Filter merchants..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Filter merchants" />
        {query && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" aria-label="Clear" onClick={() => setQuery("")}>
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
      <div className="grid gap-1.5">
        <Label htmlFor="store-domain">Store domain</Label>
        <InputGroup>
          <InputGroupAddon variant="segment">https://</InputGroupAddon>
          <InputGroupInput id="store-domain" placeholder="acme" />
          <InputGroupAddon variant="segment" align="inline-end">
            .myshopify.com
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}

export function WithButton() {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="grid w-full max-w-100 gap-4">
      <InputGroup>
        <InputGroupInput readOnly value="oc_live_7f3k2v9m1q" aria-label="API key" className="font-mono" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="xs" onClick={() => setCopied(true)}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput inputMode="decimal" placeholder="0.00" aria-label="Budget" />
        <InputGroupAddon align="inline-end">
          <InputGroupText className="font-mono text-caption">USD</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

export function Textarea() {
  const [note, setNote] = React.useState("");
  return (
    <InputGroup className="max-w-110">
      <InputGroupTextarea placeholder="Tell the agent what to buy..." value={note} onChange={(e) => setNote(e.target.value)} aria-label="Instructions" />
      <InputGroupAddon align="block-end" className="justify-between">
        <InputGroupText className="font-mono text-caption">{note.length}/500</InputGroupText>
        <InputGroupButton variant="primary" size="sm" disabled={!note}>
          Send
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export function States() {
  return (
    <div className="grid w-full max-w-100 gap-3">
      <InputGroup>
        <InputGroupInput defaultValue="not-a-domain" aria-invalid aria-label="Webhook URL" />
        <InputGroupAddon align="inline-end">
          <X className="text-danger" strokeWidth={1.75} />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput disabled placeholder="Disabled" aria-label="Disabled" />
      </InputGroup>
    </div>
  );
}

```

## Source

components/ui/input-group.tsx

```tsx
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The brand's field with things inside it (extrapolated from the input, the search field and the merchant filter): the
// field's 36px, 8px corners and 16 percent ink edge around a borderless control, with addons at either end: a muted
// glyph or text, a small ghost key, or a `segment`, the mist strip with a hairline divider and the platform mono (a
// unit, a scheme, `.myshopify.com`). The whole group takes the blue edge on focus and the red edge when invalid, with
// no glow. Addons can also sit above or below a textarea (block-start, block-end).
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-9 w-full min-w-0 items-center overflow-hidden rounded-control border border-hairline bg-surface transition-[border-color] duration-160 ease-out hover:border-line-field-hover motion-reduce:transition-none",
        "has-[[data-slot=input-group-control]:focus-visible]:border-line-brand",
        "has-[[data-slot][aria-invalid=true]]:border-danger",
        "has-[[data-slot=input-group-control]:read-only]:bg-subtle has-[[data-slot=input-group-control]:disabled]:opacity-50",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto",
        "has-[>[data-align=inline-start]]:[&>input]:pl-2 has-[>[data-align=inline-end]]:[&>input]:pr-2 has-[>[data-align=block-start]]:[&>textarea]:pt-1 has-[>[data-align=block-end]]:[&>textarea]:pb-1",
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex h-auto shrink-0 cursor-text items-center justify-center gap-2 font-sans text-body-sm leading-body text-fg-muted select-none group-has-[[data-slot=input-group-control]:disabled]/input-group:cursor-not-allowed [&>kbd]:rounded-sm [&>svg:not([class*='size-'])]:size-3.75",
  {
    variants: {
      align: {
        "inline-start": "order-first pl-3 has-[>button]:pl-1",
        "inline-end": "order-last pr-3 has-[>button]:pr-1",
        "block-start": "order-first w-full justify-start px-3 pt-2",
        "block-end": "order-last w-full justify-start px-3 pb-2",
      },
      variant: {
        plain: "",
        segment: "self-stretch border-line bg-subtle px-3 font-mono text-caption",
      },
    },
    compoundVariants: [
      { variant: "segment", align: "inline-end", className: "border-l pr-3" },
      { variant: "segment", align: "inline-start", className: "border-r pl-3" },
    ],
    defaultVariants: { align: "inline-start", variant: "plain" },
  },
);

function InputGroupAddon({ className, align = "inline-start", variant = "plain", ...props }: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      data-variant={variant}
      className={cn(inputGroupAddonVariants({ align, variant }), className)}
      onClick={(e) => {
        // A click on the addon (not on a button in it) focuses the control, as a click inside a field would.
        if ((e.target as HTMLElement).closest("button")) return;
        e.currentTarget.parentElement?.querySelector<HTMLElement>("input, textarea")?.focus();
      }}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva("", {
  variants: {
    size: {
      xs: "h-6.5 gap-1 rounded-sm px-2 text-caption [&>svg:not([class*='size-'])]:size-3.5",
      sm: "h-7 gap-1.5 rounded-sm px-2.5 text-body-sm",
      "icon-xs": "size-6.5 rounded-sm p-0 [&>svg:not([class*='size-'])]:size-3.5",
      "icon-sm": "size-7 rounded-sm p-0 [&>svg:not([class*='size-'])]:size-4",
    },
  },
  defaultVariants: { size: "xs" },
});

function InputGroupButton({ className, type = "button", variant = "ghost", size = "xs", ...props }: Omit<React.ComponentProps<typeof Button>, "size"> & VariantProps<typeof inputGroupButtonVariants>) {
  return <Button type={type} data-size={size} variant={variant} className={cn(inputGroupButtonVariants({ size }), className)} {...props} />;
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("flex items-center gap-2 font-sans text-body-sm leading-body text-fg-muted [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.75", className)} {...props} />;
}

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input-group-control"
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent px-3 font-sans text-body-sm leading-body text-fg outline-none placeholder:text-fg-faint read-only:text-fg-muted disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="input-group-control"
      className={cn(
        "field-sizing-content flex min-h-16 w-full min-w-0 flex-1 resize-none bg-transparent px-3 py-2 font-sans text-body-sm leading-body text-fg outline-none placeholder:text-fg-faint read-only:text-fg-muted disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea };

```
