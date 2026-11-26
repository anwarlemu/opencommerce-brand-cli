# Textarea
Resizable multi-line text field.

Install: npx opencommerce-ds add textarea
Requires: theme, field, utils
Packages: none
Exports: Textarea
Client boundary: yes
Reference: Extension from opencommerce-agentcard-web src/components/monitoring.tsx (#merchant-filter)


## Usage
Use inside Field for messages, notes and other longer input. Connect value and onChange when the form owns the state.
- Avoid: Corners other than 8px
- Avoid: Gray fills
- Avoid: Resizing sideways


## Examples
Example components: npx opencommerce-ds add textarea button field
[Site](https://opencommerce-ds.vercel.app/preview/textarea/Site) | [States](https://opencommerce-ds.vercel.app/preview/textarea/States)

examples/textarea.tsx

```tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export function Site() {
  const [brief, setBrief] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [saved, setSaved] = React.useState("");
  const error = submitted && !brief.trim() ? "Enter what your agent should buy." : undefined;
  return <form noValidate className="grid max-w-170 gap-4" onSubmit={(event) => {
    event.preventDefault();
    setSubmitted(true);
    setSaved(brief.trim() ? brief.trim() : "");
  }} onReset={() => { setBrief(""); setSubmitted(false); setSaved(""); }}>
    <Field label="What should your agent buy?" htmlFor="textarea-brief" required error={error} help={`${brief.length}/500 characters`}>
      <Textarea id="textarea-brief" name="brief" value={brief} maxLength={500}
        onChange={(event) => { setBrief(event.target.value); setSaved(""); }}
        placeholder="Book flights and hotels for the sales team" />
    </Field>
    <div className="flex gap-3">
      <Button type="submit">Save brief</Button>
      <Button type="reset" variant="secondary">Reset</Button>
    </div>
    <p role="status" className="text-body-sm text-fg-muted">{saved ? `Saved: ${saved}` : ""}</p>
  </form>;
}

export function States() {
  return <div className="grid max-w-170 gap-4">
    <Field label="Purchase notes" htmlFor="textarea-notes" help="Four rows; resize vertically for longer notes.">
      <Textarea id="textarea-notes" rows={4} defaultValue={"Buy two train tickets.\nKeep the total under $200."} />
    </Field>
    <Field label="Read-only brief" htmlFor="textarea-readonly">
      <Textarea id="textarea-readonly" readOnly value="Book a meeting room for six people." />
    </Field>
    <Field label="Unavailable brief" htmlFor="textarea-disabled">
      <Textarea id="textarea-disabled" disabled placeholder="Select an agent first" />
    </Field>
  </div>;
}

```

## Source

components/ui/textarea.tsx

```tsx
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

```
