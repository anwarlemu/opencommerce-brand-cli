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
