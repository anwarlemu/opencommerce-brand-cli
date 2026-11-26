# CTA
The closing card: mist, a hairline and 16px corners, the headline, two keys and the install box, glyphs gathering at its edges.

Install: npx opencommerce-ds add cta
Requires: theme, glyph-field, utils
Packages: none
Exports: Cta, CtaProps
Client boundary: not required by this entry file
Reference: opencommerce-agentcard-web src/components/cta.tsx, src/components/install-tabs.tsx, src/app/globals.css (.cta-binary)


## Usage
Use once near the end of the home page, in a wide SiteSection. Pass the primary and secondary Buttons as actions and InstallTabs as media.
- Avoid: More than one per page
- Avoid: A blue card
- Avoid: Two primary keys
- Avoid: A gradient or glow behind the headline
- Avoid: Long copy
`Cta` props: `title`, `description`, `actions`, `media`, `glyphs` (default true), plus div props.

## Examples
Example components: npx opencommerce-ds add cta button install-tabs
[Site](https://opencommerce-ds.vercel.app/preview/cta/Site)

examples/cta.tsx

```tsx
import { Cta } from "@/components/site/cta";
import { Button } from "@/components/ui/button";
import { InstallTabs } from "@/components/ui/install-tabs";

export function Site() {
  return (
    <div className="mx-auto w-(--ds-frame-column) py-16">
      <Cta
        title="Give your agent a checkout"
        description="One endpoint, every online store. Start free: your first purchase can go through today."
        actions={
          <>
            <Button asChild>
              <a href="https://app.agentcard.sh">Get started</a>
            </Button>
            <Button asChild variant="secondary">
              <a href="https://cal.com/agentcard">Book a call</a>
            </Button>
          </>
        }
        media={
          <InstallTabs
            className="w-full max-w-md"
            commands={[
              { label: "npm", command: "npm install @agentcard/sdk" },
              { label: "pnpm", command: "pnpm add @agentcard/sdk" },
              { label: "yarn", command: "yarn add @agentcard/sdk" },
              { label: "bun", command: "bun add @agentcard/sdk" },
            ]}
          />
        }
      />
    </div>
  );
}

```

## Source

components/site/cta.tsx

```tsx
import * as React from "react";

import { GlyphField } from "@/components/visuals/glyph-field";
import { cn } from "@/lib/utils";

// The call to action (the opencommerce site, cta.tsx): one quiet card on the page's white, across the whole column: mist,
// a hairline, 16px corners, 80px of air top and bottom. The 48px display headline, one 16px line in muted ink, the two
// keys (the blue key, then the white), and room under them for the install box. The field of *s and @s drifts in from
// the card's edges and clears toward the middle, so the copy sits on clean ground. The copy is its own composited layer
// over the field, so every browser paints it above the canvas.
type CtaProps = Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode;
  /** One line under the headline. */
  description?: React.ReactNode;
  /** The keys: the primary Button, then the secondary. */
  actions?: React.ReactNode;
  /** Under the keys: the install box (InstallTabs) or a code window. */
  media?: React.ReactNode;
  /** The field of *s and @s round the edges. */
  glyphs?: boolean;
};

function Cta({ title, description, actions, media, glyphs = true, className, ...props }: CtaProps) {
  return (
    <div data-slot="cta" className={cn("relative isolate overflow-hidden rounded-shell border border-line bg-subtle px-6 py-16 text-center md:py-20", className)} {...props}>
      {glyphs && <GlyphField seed={11} fade="in" className="absolute inset-0 size-full" />}
      <div className="relative z-10 [transform:translateZ(0)]">
        <h2 className="mx-auto max-w-xl font-display text-h1 leading-display font-medium tracking-hero text-balance">{title}</h2>
        {description && <p className="mx-auto mt-4 max-w-md text-body leading-lead text-pretty text-fg-muted">{description}</p>}
        {actions && <div className="mt-8 flex flex-wrap justify-center gap-2">{actions}</div>}
        {media && <div className="mx-auto mt-10 flex justify-center text-left">{media}</div>}
      </div>
    </div>
  );
}

export { Cta };
export type { CtaProps };

```
