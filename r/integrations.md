# Integrations
Integration sections with selectable tools and matching previews.

Install: npx opencommerce-ds add integrations
Requires: theme, utils
Packages: @radix-ui/react-tabs
Exports: Integrations, IntegrationCode, IntegrationScreen, IntegrationRow, IntegrationOption
Client boundary: yes
Reference: Extension in the opencommerce site's voice (its windows, keys and code; opencommerce-agentcard-web src/components/window.tsx, in-action.tsx); the layout from agentcard.sh / (.v7-intg-row)


## Usage
Pass rows with a title, description and options. Each option supplies a label, icon and panel. Use IntegrationCode and IntegrationScreen to build the preview.
- Avoid: More than six tools in one row
- Avoid: Autoplaying the rows
- Avoid: A blue stage
- Avoid: Light code windows on the stage


## Examples
Example components: npx opencommerce-ds add integrations
Example packages: lucide-react
[Site](https://opencommerce-ds.vercel.app/preview/integrations/Site)

examples/integrations.tsx

```tsx
import { AppWindow, Bold, CircleDashed, MessageSquare, Triangle, Zap } from "lucide-react";

import { IntegrationCode, IntegrationScreen, Integrations } from "@/components/site/integrations";

function Field({ title, detail, status }: { title: string; detail: string; status: string }) {
  return (
    <div className="flex items-center gap-2 rounded-control border border-line px-2.5 py-2 text-fg">
      <span className="grid">
        <b className="font-medium">{title}</b>
        <small className="text-micro text-fg-muted">{detail}</small>
      </span>
      <em className="ml-auto rounded-chip bg-tint px-1.5 py-0.5 font-mono text-micro not-italic text-fg-brand">{status}</em>
    </div>
  );
}

function Browser(tool: string, code: string) {
  return (
    <>
      <IntegrationCode name={`${tool.toLowerCase()}.ts`}>{code}</IntegrationCode>
      <IntegrationScreen name={tool.toUpperCase()} address="vault · user-12345">
        <Field title="Agentcard" detail="Wallet" status="Connected" />
        <Field title="Order" detail="Card · $23.06 at amazon.com" status="Authorizing" />
        <p className="text-micro opacity-80">{tool} swaps the card in at its network edge</p>
      </IntegrationScreen>
    </>
  );
}

const CODE = `// One card item per purchase, in the
// user's vault
await client.vaults.items.upsert('order', {
  type: 'card',
  spec: { provider: 'agentcard',
    merchant: 'amazon.com',
    amount: 2306, currency: 'usd' },
});`;

export function Site() {
  return (
    <section className="mx-auto w-full max-w-(--ds-frame-column) py-20">
      <div className="mx-auto mb-9 max-w-(--ds-layout-heading) text-center">
        <h2 className="font-display text-h2 leading-heading font-medium tracking-tighter">Integrates natively with the tools you use</h2>
        <p className="mt-3.5 text-body-lg leading-6.5 tracking-tight opacity-70">Kernel, Browserbase, Browser Use, Anchor, your own browser, Linq and Blooio: the stack your agent already runs on.</p>
      </div>
      <Integrations
        rows={[
          {
            title: "Browser integrations",
            description: "Integrate with Kernel, Browserbase, Browser Use, Anchor or your own browser and automate purchases online.",
            options: [
              { label: "Kernel", icon: <Zap />, panel: Browser("Kernel", CODE) },
              { label: "Browserbase", icon: <Bold />, panel: Browser("Browserbase", CODE.replace("client", "bb")) },
              { label: "Browser Use", icon: <CircleDashed />, panel: Browser("Browser Use", CODE.replace("client", "browser")) },
              { label: "Anchor", icon: <Triangle />, panel: Browser("Anchor", CODE.replace("client", "anchor")) },
              { label: "Your own browser", icon: <AppWindow />, panel: Browser("Browser", CODE) },
            ],
          },
          {
            title: "Messaging integrations",
            description: "iMessage agents built on top of Linq and Blooio can use Agentcard to complete payments.",
            options: ["Linq", "Blooio"].map((tool) => ({
              label: tool,
              icon: <MessageSquare />,
              panel: (
                <>
                  <IntegrationCode name={`${tool.toLowerCase()} payments`}>{`POST api.${tool.toLowerCase()}.com/v3/payments\n\n{ "amount": 2306,\n  "currency": "usd",\n  "merchant": "amazon.com" }`}</IntegrationCode>
                  <IntegrationScreen>
                    <p className="w-fit rounded-card bg-surface px-3 py-1.5 text-fg">Found it. Ready to check out?</p>
                    <p className="ml-auto w-fit rounded-card bg-brand px-3 py-1.5">Approved</p>
                  </IntegrationScreen>
                </>
              ),
            })),
          },
        ]}
      />
    </section>
  );
}

```

## Source

components/site/integrations.tsx

```tsx
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

// The integrations, in the home page's voice: one card per kind of integration (white, a hairline, 12px corners and
// the window's soft drop). The copy sits at one side (a 32px display title, a 16px muted line, then a list of rows, one
// per tool); a mist stage at the other shows the chosen tool, usually a dark code window with a white card over its
// corner. Rows are flat keys with a hairline that take the mist under the pointer; the chosen one takes the blue edge
// and the pale blue, and the stage crossfades (200ms ease-out). Rows alternate sides; below 1024px the copy sits above.

type IntegrationOption = {
  label: React.ReactNode;
  /** The tool's mark, about 24px (decorative: the label is beside it). */
  icon?: React.ReactNode;
  /** What the stage shows for this tool: an IntegrationCode, an IntegrationScreen, or both. */
  panel: React.ReactNode;
};

type IntegrationRow = { title: React.ReactNode; description: React.ReactNode; options: IntegrationOption[] };

const ROW =
  "grid grid-cols-1 items-center gap-6 rounded-panel border border-line-strong bg-surface pt-6 pb-3 px-3 text-fg shadow-card lg:gap-[clamp(1.5rem,4vw,3.5rem)] lg:py-3";

const OPTION =
  "relative flex h-12 items-center gap-3 overflow-hidden rounded-control border border-line-strong bg-surface px-4 text-left text-body-sm font-medium text-fg outline-none transition-[border-color,background-color,color] duration-(--ds-duration-fast) ease-out hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring motion-reduce:transition-none " +
  // Picked: the blue edge, the pale blue and blue text.
  "data-[state=active]:border-brand data-[state=active]:bg-tint data-[state=active]:text-fg-brand data-[state=active]:hover:bg-tint";

function Row({ row, index }: { row: IntegrationRow; index: number }) {
  const [value, setValue] = React.useState("0");
  const reverse = index % 2 === 1;
  return (
    <TabsPrimitive.Root asChild value={value} onValueChange={setValue} orientation="vertical">
      <li
        className={cn(
          ROW,
          reverse ? "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.85fr)] lg:pr-[clamp(1.5rem,3vw,2.5rem)]" : "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)] lg:pl-[clamp(1.5rem,3vw,2.5rem)]",
        )}
      >
        <div className="px-3 lg:px-0">
          <h3 className="mb-3.5 font-display text-h2 leading-display font-medium tracking-tighter">{row.title}</h3>
          <p className="mb-7 max-w-[34ch] text-body leading-lead text-fg-muted">{row.description}</p>
          <TabsPrimitive.List className="grid gap-2" aria-label={typeof row.title === "string" ? row.title : undefined}>
            {row.options.map((option, i) => (
              <TabsPrimitive.Trigger key={i} value={String(i)} className={OPTION}>
                {option.icon && (
                  <span aria-hidden className="flex size-6 flex-none items-center justify-center [&>img]:size-full [&>svg]:size-full">
                    {option.icon}
                  </span>
                )}
                {option.label}
              </TabsPrimitive.Trigger>
            ))}
          </TabsPrimitive.List>
        </div>
        <div
          className={cn(
            "relative isolate flex items-center overflow-hidden rounded-card border border-line bg-subtle p-[clamp(1.125rem,2.4vw,2rem)] lg:min-h-105",
            reverse && "lg:order-first",
          )}
        >
          {/* Every tool's panel shares one cell, so the stage keeps the tallest one's height and never jumps. */}
          <div className="grid w-full items-center">
            {row.options.map((option, i) => (
              <TabsPrimitive.Content
                key={i}
                value={String(i)}
                forceMount
                className="[grid-area:1/1] outline-none transition-[opacity,visibility] duration-200 ease-out data-[state=inactive]:pointer-events-none data-[state=inactive]:invisible data-[state=inactive]:opacity-0 motion-reduce:transition-none"
              >
                {option.panel}
              </TabsPrimitive.Content>
            ))}
          </div>
        </div>
      </li>
    </TabsPrimitive.Root>
  );
}

/** The integration rows, alternating sides. */
function Integrations({ rows, className, ...props }: React.ComponentProps<"ul"> & { rows: IntegrationRow[] }) {
  return (
    <ul data-slot="integrations" className={cn("grid gap-6", className)} {...props}>
      {rows.map((row, i) => (
        <Row key={i} row={row} index={i} />
      ))}
    </ul>
  );
}

/** A code window for the stage: ink, a 30px bar with the file's name in the muted mono, code in the platform mono. */
function IntegrationCode({ name, children, className }: { name: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full overflow-hidden rounded-panel border border-line-strong bg-code text-fg-code shadow-code md:w-[88%] lg:h-78", className)}>
      <div className="flex h-7.5 items-center border-b border-line-on-code px-3.5 font-mono text-bar text-fg-code-dim">{name}</div>
      <pre className="overflow-hidden px-4 pt-3.5 pb-15 font-mono text-caption leading-code whitespace-pre md:text-snippet">{children}</pre>
    </div>
  );
}

/**
 * A white card for the stage, laid over the code window's lower corner when it follows one: a mist bar with the tool's
 * name and an address, then your content (rows, steps, a conversation).
 */
function IntegrationScreen({ name, address, children, className }: { name?: React.ReactNode; address?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative z-10 -mt-11 ml-auto overflow-hidden rounded-panel border border-line-strong bg-surface text-caption text-fg shadow-raised max-md:w-[92%] md:-mt-16 md:w-[68%]",
        className,
      )}
    >
      {(name || address) && (
        <div className="flex h-7.5 items-center gap-1.5 border-b border-line bg-subtle px-3 font-mono text-bar text-fg-muted">
          {name && <b className="font-medium text-fg">{name}</b>}
          {address && <span className="ml-2 flex-1 truncate rounded-chip border border-line bg-surface px-2 py-0.5">{address}</span>}
        </div>
      )}
      <div className="grid gap-3 p-3.5">{children}</div>
    </div>
  );
}

export { Integrations, IntegrationCode, IntegrationScreen, type IntegrationRow, type IntegrationOption };

```
