# Input
Single-line text field with standard and search variants.

Install: npx opencommerce-ds add input
Requires: theme, field, utils
Packages: class-variance-authority
Exports: Input, inputVariants
Client boundary: yes
Reference: opencommerce-agentcard-web src/components/monitoring.tsx (#merchant-filter, computed)


## Usage
Use inside Field for a label and validation message. Set an appropriate input type. Use variant="search" for search or filtering and connect changes to the results.
- Avoid: Pill-shaped fields
- Avoid: Gray filled inputs
- Avoid: Placeholder text as the only label
- Avoid: A glow or ring on focus (the edge turns blue)


## Examples
Example components: npx opencommerce-ds add input field
[Site](https://opencommerce-ds.vercel.app/preview/input/Site) | [States](https://opencommerce-ds.vercel.app/preview/input/States) | [Search](https://opencommerce-ds.vercel.app/preview/input/Search)

examples/input.tsx

```tsx
"use client";

import { useState } from "react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function Site() {
  return (
    <div className="grid max-w-170 gap-4">
      <Field label="Your name" htmlFor="input-name">
        <Input id="input-name" autoComplete="name" />
      </Field>
      <Field label="Work email" htmlFor="input-email">
        <Input id="input-email" type="email" autoComplete="email" />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Company" htmlFor="input-company">
          <Input id="input-company" />
        </Field>
        <Field label="Website" htmlFor="input-site">
          <Input id="input-site" placeholder="acme.com" />
        </Field>
      </div>
    </div>
  );
}

export function States() {
  const [email, setEmail] = useState("ada@");
  const [valid, setValid] = useState(false);
  return (
    <div className="grid max-w-170 gap-4">
      <Field label="Work email" htmlFor="input-invalid" error={valid ? undefined : "Enter a valid work email address."} help="Email address accepted.">
        <Input id="input-invalid" type="email" value={email} required onChange={(event) => { setEmail(event.target.value); setValid(event.target.validity.valid); }} />
      </Field>
      <Field label="Card nickname" htmlFor="input-disabled" help="Set by your team admin.">
        <Input id="input-disabled" defaultValue="Travel agent" disabled />
      </Field>
    </div>
  );
}

export function Search() {
  const [query, setQuery] = useState("");
  const guides = ["Create a card", "Set spending limits", "Manage merchants"].filter((guide) => guide.toLowerCase().includes(query.toLowerCase().trim()));
  return (
    <div className="max-w-80">
      <Input variant="search" placeholder="Search the guides" aria-label="Search the guides" value={query} onChange={(event) => setQuery(event.target.value)} />
      <ul aria-live="polite" className="mt-3 text-body-sm text-fg-muted">{guides.length ? guides.map((guide) => <li key={guide}>{guide}</li>) : <li>No guides match your search.</li>}</ul>
    </div>
  );
}

```

## Source

components/ui/input.tsx

```tsx
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { useFieldControl } from "@/components/ui/field";
import { cn } from "@/lib/utils";

// The brand's field (monitoring.tsx, the merchant filter; computed): 36px, 8px corners, white on the 16 percent ink
// edge, 14px Inter, 12px in, a faint placeholder. Focus turns the edge blue (160ms ease-out), with no glow; an invalid
// field's edge is red. `search` is the same field with a drawn search mark 12px in.
const FIELD =
  "h-9 rounded-control border border-hairline px-3 font-sans text-body-sm leading-body transition-[border-color] duration-160 ease-out placeholder:text-fg-faint hover:border-line-field-hover focus-visible:border-line-brand aria-invalid:border-danger motion-reduce:transition-none";

const inputVariants = cva(
  "flex w-full min-w-0 bg-surface text-fg outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        field: `${FIELD} file:border-0 file:bg-transparent file:font-sans file:text-body-sm file:text-fg`,
        search: `${FIELD} pl-9 [&::-webkit-search-cancel-button]:hidden`,
      },
    },
    defaultVariants: { variant: "field" },
  },
);

function SearchIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute top-1/2 left-3 size-3.75 -translate-y-1/2 fill-none stroke-current text-fg-muted [stroke-linecap:round] [stroke-width:1.5]">
      <circle cx="7" cy="7" r="4.75" />
      <path d="M10.5 10.5 14 14" />
    </svg>
  );
}

function Input({ className, type, variant, ...props }: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  const input = <input type={variant === "search" ? (type ?? "search") : type} data-slot="input" className={cn(inputVariants({ variant }), variant !== "search" && className)} {...useFieldControl(props)} />;
  if (variant !== "search") return input;
  return (
    <div data-slot="search" className={cn("relative w-full", className)}>
      <SearchIcon />
      {input}
    </div>
  );
}

export { Input, inputVariants };

```
