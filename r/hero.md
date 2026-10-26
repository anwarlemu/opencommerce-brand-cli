# Hero
White, centered page opening: a pill, the title, a line, two keys, the strip of marks and a code window over a field of glyphs.

Install: npx opencommerce-ds add hero
Requires: theme, glyph-field, utils
Packages: none
Exports: Hero, HeroProps
Client boundary: not required by this entry file
Reference: opencommerce-agentcard-web src/components/hero.tsx, src/components/binary-stage.tsx, src/app/globals.css (.h-hero, .lead, .hero-binary)


## Usage
Use at the top of the home page. Pass the primary and secondary Buttons as actions, LogoStrip as strip and a CodeWindow as media. Use titleClassName to adjust wrapping for a longer headline.
- Avoid: A blue or tinted hero
- Avoid: A gradient behind the title
- Avoid: More than two keys
- Avoid: Long paragraphs in the hero
- Avoid: An image in place of the code
- Avoid: The glyph field over the title
`Hero` props: `title`, `titleClassName`, `eyebrow` (the pill), `eyebrowHref`, `subtitle`, `actions`, `strip`,
`media`, `glyphs` (default true: the field behind the media), plus section props.

## Examples
Example components: npx opencommerce-ds add hero logo-strip button code-window
Example packages: @agentcard/sdk
[Site](https://opencommerce-ds.vercel.app/preview/hero/Site)

examples/hero.tsx

```tsx
import { Hero } from "@/components/site/hero";
import { LogoStrip } from "@/components/site/logo-strip";
import { Button } from "@/components/ui/button";
import { CodeWindow } from "@/components/ui/code-window";

const CODE = `import { Agentcard } from "@agentcard/sdk";

const agentcard = new Agentcard({
  clientSecret: process.env.AGENTCARD_SECRET,
});

// One call: find the item, check out, track the order.
const order = await agentcard.commerce.buy({
  query: "USB-C charger, 65W",
  maxPrice: 40,
});`;

const STORES = ["Northwind", "Acme Supply", "Globex", "Initech", "Umbrella", "Hooli", "Vandelay", "Soylent"].map((name) => ({ name }));

export function Site() {
  return (
    <Hero
      eyebrow="Buy from 4000+ stores"
      eyebrowHref="#monitoring"
      title="Open router for commerce"
      subtitle="Let your agent buy from any online store through one endpoint."
      actions={
        <>
          <Button asChild>
            <a href="https://app.agentcard.sh">Get started</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="https://docs.agentcard.sh">Read the docs</a>
          </Button>
        </>
      }
      strip={<LogoStrip brands={STORES} />}
      media={<CodeWindow title="agent.ts" code={CODE} copy highlight={[7, 8, 9, 10]} preClassName="text-caption leading-normal" />}
    />
  );
}

```

## Source

components/site/hero.tsx

```tsx
import * as React from "react";

import { GlyphField } from "@/components/visuals/glyph-field";
import { cn } from "@/lib/utils";

// The hero (the opencommerce site, hero.tsx): white like the rest of the page, stacked and centered. A squarish pill
// link (6px corners, a hairline, 14px muted type that darkens on hover) names the reach; under it the 54px display title
// (40px on phones) tracked -0.03em on leading 1.02, a one-line 16px standfirst in muted ink, and the actions 40px
// lower (the blue key and the white key). Then the strip of marks (LogoStrip), and the media in the 800px column (a
// code window) with the field of *s and @s behind it, spilling wide past the card and feathering out, so the card stays
// the subject. The field is clipped at the screen's edges, not the column's.
type HeroProps = Omit<React.ComponentProps<"section">, "title"> & {
  title: React.ReactNode;
  /** Override title sizing and wrapping for shorter or longer headlines. */
  titleClassName?: string;
  /** The pill over the title: a short line, optionally a link. */
  eyebrow?: React.ReactNode;
  eyebrowHref?: string;
  subtitle?: React.ReactNode;
  /** The keys under the title: the primary Button, then the secondary. Two at most. */
  actions?: React.ReactNode;
  /** The strip of marks between the actions and the media (LogoStrip). */
  strip?: React.ReactNode;
  /** The media in the 800px column (a code window). */
  media?: React.ReactNode;
  /** The field of *s and @s behind the media. */
  glyphs?: boolean;
};

const PILL = "inline-flex items-center rounded-card border border-line-strong bg-surface px-3.5 py-1.5 text-body-sm leading-body font-medium tracking-snug text-fg-muted";

function Hero({ title, titleClassName, eyebrow, eyebrowHref, subtitle, actions, strip, media, glyphs = true, className, ...props }: HeroProps) {
  return (
    <section data-slot="hero" className={cn("relative overflow-x-clip", className)} {...props}>
      <div className="mx-auto flex w-(--ds-frame-column) flex-col items-center gap-12 pt-14 pb-14 md:gap-14 md:pt-12 md:pb-20">
        <div className="relative z-10 flex flex-col items-center text-center">
          {eyebrow &&
            (eyebrowHref ? (
              <a
                href={eyebrowHref}
                className={cn(
                  PILL,
                  "outline-none transition-colors duration-(--ds-duration-fast) ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring motion-reduce:transition-none",
                )}
              >
                {eyebrow}
              </a>
            ) : (
              <p className={PILL}>{eyebrow}</p>
            ))}
          <h1 className={cn("mt-4 font-display text-hero leading-heading font-medium tracking-hero text-balance", !eyebrow && "mt-0", titleClassName)}>{title}</h1>
          {subtitle && <p className="mt-3 max-w-md text-body leading-lead text-pretty text-fg-muted">{subtitle}</p>}
          {actions && <div className="mt-10 flex flex-wrap justify-center gap-2">{actions}</div>}
        </div>
        {strip && <div className="w-full max-w-(--ds-layout-medium)">{strip}</div>}
        {media && (
          <div className="relative isolate w-full max-w-(--ds-layout-medium) min-w-0">
            {glyphs && <GlyphField className="absolute -top-8 left-[calc(-1*max(32vw,1.5rem))] -z-10 h-[calc(100%+8.75rem)] w-[calc(100%+2*max(32vw,1.5rem))]" />}
            <div className="relative z-10">{media}</div>
          </div>
        )}
      </div>
    </section>
  );
}

export { Hero };
export type { HeroProps };

```
