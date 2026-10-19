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
