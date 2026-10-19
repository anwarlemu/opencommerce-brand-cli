import * as React from "react";

import { cn } from "@/lib/utils";

// A section of the page (the opencommerce site, .sec): generous air above (120px, 72px on phones) and nothing ruled;
// the next section's air is the gap, so a section has no padding below unless it closes the page (add pb-18
// md:pb-30). Content sits on the 1200px frame with 40px of gutter (20px on phones); `width="medium"` narrows it to the
// 800px column most sections use (features, pricing, the questions), `wide` keeps the frame (a live table, the steps,
// the closing card). The page is white throughout; `mist` is the one tint, for an inset band.
const GROUNDS = {
  white: "bg-surface text-fg",
  mist: "bg-subtle text-fg",
} as const;

const WIDTHS = {
  wide: "w-(--ds-frame-column)",
  medium: "w-(--ds-frame-column) max-w-(--ds-layout-medium)",
} as const;

type SectionGround = keyof typeof GROUNDS;

function SiteSection({
  ground = "white",
  width = "wide",
  contained = true,
  className,
  innerClassName,
  children,
  ...props
}: React.ComponentProps<"section"> & {
  ground?: SectionGround;
  /** The column: the 1200px frame (wide) or the 800px medium column. */
  width?: keyof typeof WIDTHS;
  /** Hold the content to the column. Off for a band whose content runs edge to edge. */
  contained?: boolean;
  innerClassName?: string;
}) {
  return (
    <section data-slot="site-section" data-ground={ground} className={cn("relative pt-18 md:pt-30", GROUNDS[ground], className)} {...props}>
      {contained ? <div className={cn("mx-auto", WIDTHS[width], innerClassName)}>{children}</div> : children}
    </section>
  );
}

/** A small label over a title: the platform mono, small, in the brand blue. Sentence case, never caps. */
function Eyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="eyebrow" className={cn("font-mono text-caption leading-body tracking-label text-fg-label", className)} {...props} />;
}

/**
 * A section's opening, centered as the brand sets them: the 44px display title (32px on phones) tracked tight, and
 * its 16px standfirst 16px below in muted ink, held to 576px. 48px (56px on wide screens) of air before the content.
 */
function SectionHeading({
  title,
  description,
  eyebrow,
  as: Heading = "h2",
  align = "center",
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  align?: "center" | "start";
}) {
  const centered = align === "center";
  return (
    <div data-slot="section-heading" className={cn("pb-12 md:pb-14", centered ? "mx-auto max-w-(--ds-layout-heading) text-center" : "text-left", className)} {...props}>
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <Heading className="font-display text-h2 leading-display font-medium tracking-tighter text-balance">{title}</Heading>
      {description && <p className={cn("mt-4 max-w-(--ds-layout-text) text-body leading-lead text-pretty text-fg-muted", centered && "mx-auto")}>{description}</p>}
    </div>
  );
}

export { SiteSection, SectionHeading, Eyebrow };
export type { SectionGround };
