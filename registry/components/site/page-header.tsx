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
