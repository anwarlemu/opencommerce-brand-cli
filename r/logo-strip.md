# Logo strip
The stores or customers as bare grey marks drifting left in one row under the hero's keys.

Install: npx opencommerce-ds add logo-strip
Requires: theme, marquee, utils
Packages: none
Exports: LogoStrip, Brand
Client boundary: not required by this entry file
Reference: opencommerce-agentcard-web src/components/logo-strip.tsx, src/components/merchant-logo.tsx, src/app/globals.css (THE LOGO STRIP, .logo-mask)


## Usage
Pass the brands with an image src (drawn as a mask, so any color works), a mark node in currentColor, or just a name. Use once, in the hero.
- Avoid: Logos in their own colors
- Avoid: Tiles or borders around the marks
- Avoid: A fast drift
- Avoid: Two strips on a page
`LogoStrip` props: `brands` ({ name, src, logo, ratio }[]), `label` (the list's name, default "Stores"),
`duration` (seconds a lap, default 100), plus div props. Built on Marquee.

## Examples
Example components: npx opencommerce-ds add logo-strip
[Site](https://opencommerce-ds.vercel.app/preview/logo-strip/Site)

examples/logo-strip.tsx

```tsx
import { LogoStrip } from "@/components/site/logo-strip";

const Dot = () => (
  <svg viewBox="0 0 24 24" className="fill-current">
    <circle cx="12" cy="12" r="9" />
  </svg>
);
const Square = () => (
  <svg viewBox="0 0 24 24" className="fill-current">
    <rect x="4" y="4" width="16" height="16" rx="3" />
  </svg>
);

const NAMES = ["Northwind", "Acme Supply", "Globex", "Initech", "Umbrella", "Hooli", "Vandelay", "Soylent", "Wonka", "Pied Piper"];

export function Site() {
  return (
    <div className="py-12">
      <LogoStrip brands={NAMES.map((name, i) => (i % 3 === 0 ? { name, logo: i % 2 ? <Square /> : <Dot /> } : { name }))} />
    </div>
  );
}

```

## Source

components/site/logo-strip.tsx

```tsx
import * as React from "react";

import { Marquee } from "@/components/visuals/marquee";
import { cn } from "@/lib/utils";

// The stores a product reaches (the opencommerce hero, logo-strip.tsx): the marks bare, no tiles, in grey, in one row
// as wide as the 800px column, drifting left and fading out at both ends (the Marquee). A mark given as an image `src`
// is drawn as a mask, so a white silhouette or a colored logo takes the strip's grey alike; a mark given as a node
// should draw in currentColor. Square marks stand 20px tall; long wordmarks are held to 84px wide, so they carry about
// the same weight.

type Brand = {
  name: string;
  /** An image of the mark (any color; it is used as a mask). */
  src?: string;
  /** Or the mark itself, drawn in currentColor. */
  logo?: React.ReactNode;
  /** Width over height, for an image; default 1. */
  ratio?: number;
};

function Mark({ brand }: { brand: Brand }) {
  if (brand.logo) {
    return (
      <span role="img" aria-label={brand.name} className="flex h-5 items-center [&>svg]:h-full [&>svg]:w-auto">
        {brand.logo}
      </span>
    );
  }
  if (brand.src) {
    const ratio = brand.ratio ?? 1;
    const height = Math.round(Math.min(20, 84 / ratio));
    const mask = `url("${brand.src}") center / contain no-repeat`;
    return <span role="img" aria-label={brand.name} className="block bg-current" style={{ height, width: Math.round(height * ratio), mask, WebkitMask: mask }} />;
  }
  return <span className="font-display text-h5 leading-none font-medium tracking-tight">{brand.name}</span>;
}

function LogoStrip({ brands, label = "Stores", duration, className, ...props }: Omit<React.ComponentProps<"div">, "children"> & { brands: Brand[]; label?: string; duration?: number }) {
  return <Marquee data-slot="logo-strip" label={label} duration={duration} items={brands.map((b) => <Mark key={b.name} brand={b} />)} className={cn("mx-auto max-w-(--ds-layout-medium)", className)} {...props} />;
}

export { LogoStrip };
export type { Brand };

```
