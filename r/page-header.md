# Page header
Title, optional label and introduction for an inner page.

Install: npx opencommerce-ds add page-header
Requires: theme, section, utils
Packages: none
Exports: PageHeader
Client boundary: not required by this entry file
Reference: Extension in the opencommerce site's voice (.h-hero type, mono labels and hairlines; opencommerce-agentcard-web src/app/globals.css)


## Usage
Place below SiteHeader on company, form, legal or update pages. Put supporting title content in children.
- Avoid: A tinted ground behind it
- Avoid: Centered
- Avoid: A second title under it
- Avoid: More than one per page
`PageHeader` props: `eyebrow`, `title`, `lead`, `rule` (default true), `children` (inside the head, under the title).
The live /about sets its lead at 24px (18px on phones), not 19px; the component follows the live page.

## Examples
Example components: npx opencommerce-ds add page-header site-header
[Site](https://opencommerce-ds.vercel.app/preview/page-header/Site) | [Short](https://opencommerce-ds.vercel.app/preview/page-header/Short)

examples/page-header.tsx

```tsx
import { PageHeader } from "@/components/site/page-header";
import { SiteHeader } from "@/components/site/site-header";

const ACTION = { label: "Get started", href: "https://app.agentcard.sh" };

export function Site() {
  return (
    <div className="relative bg-surface pb-24">
      <SiteHeader fixed={false} action={ACTION} />
      <PageHeader
        eyebrow="Changelog"
        title="What’s new"
        lead="New stores, faster routes and the changes to the SDK, as they ship."
      />
    </div>
  );
}

export function Short() {
  return (
    <div className="relative bg-surface pb-24">
      <SiteHeader fixed={false} action={ACTION} />
      <PageHeader eyebrow="Get started" title="Let your agent buy">
        <p className="mt-3 text-body-sm text-fg-muted">A few answers, then a call</p>
      </PageHeader>
    </div>
  );
}

```

## Source

components/site/page-header.tsx

```tsx
import * as React from "react";

import { Eyebrow } from "@/components/site/section";
import { cn } from "@/lib/utils";

// An inner page's opening, in the home page's voice: on the 800px column, left aligned, 72px under the header (96px on
// wide screens): the small mono label, the 48px display title tracked -0.03em 12px under it (36px on phones), anything
// short that belongs to the title (`children`), then a hairline 28px below. The lead, when given, opens the page 32px
// under the rule in 20px muted text.
function PageHeader({
  eyebrow,
  title,
  lead,
  rule = true,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** The hairline under the title. */
  rule?: boolean;
}) {
  return (
    <div data-slot="page-header" className={cn("mx-auto w-(--ds-frame-column) max-w-(--ds-layout-medium) pt-18 md:pt-24", className)} {...props}>
      <header className={cn(rule && "border-b border-line pb-7")}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className={cn("font-display text-h1 leading-heading font-medium tracking-hero text-balance", eyebrow && "mt-3")}>{title}</h1>
        {children}
      </header>
      {lead && <p className="mt-8 max-w-(--ds-layout-heading) text-h4 leading-snug text-pretty text-fg-muted">{lead}</p>}
    </div>
  );
}

export { PageHeader };

```
