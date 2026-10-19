import * as React from "react";

import { OutlineWordmark } from "@/components/visuals/outline-wordmark";
import { cn } from "@/lib/utils";

// The footer (the opencommerce site, site-footer.tsx): on the page's own white under a hairline. At the left the name
// (17px display) with its byline (12px muted) and a short line about the product in 14px muted; at the right the link
// columns travel together, each a 13px display heading over 14px muted links that darken on hover. Under them, on
// another hairline, the small print in 12px muted. Along the bottom edge the name is set as wide as the page as a faint
// outline that lights up under the pointer (OutlineWordmark). On a phone the brand block sits over the columns.
type FooterLink = { label: React.ReactNode; href: string; external?: boolean };
type FooterGroup = { title: React.ReactNode; links: FooterLink[] };

type SiteFooterProps = Omit<React.ComponentProps<"footer">, "children"> & {
  /** The link columns (three reads best). */
  groups: FooterGroup[];
  name?: React.ReactNode;
  byline?: React.ReactNode;
  /** Your own logo in place of the name and byline. */
  logo?: React.ReactNode;
  /** The line under the name. */
  description?: React.ReactNode;
  /** The small print ("© 2026 Agentcard, Inc."). */
  legal?: React.ReactNode;
  /** The outlined word along the foot. null for none. */
  wordmark?: string | null;
};

function SiteFooter({ groups, name = "opencommerce", byline = "by Agentcard", logo, description, legal, wordmark = "opencommerce", className, ...props }: SiteFooterProps) {
  return (
    <footer data-slot="site-footer" className={cn("border-t border-line bg-surface text-fg", className)} {...props}>
      <div className="mx-auto w-(--ds-frame-column)">
        <div className="flex flex-col gap-10 py-14 md:flex-row md:justify-between">
          <div>
            {logo ?? (
              <p className="flex items-baseline font-display leading-none">
                <span className="text-h5 font-medium tracking-tight">{name}</span>
                {byline && <span className="ml-1.5 text-caption text-fg-muted">{byline}</span>}
              </p>
            )}
            {description && <p className="mt-4 max-w-xs text-body-sm leading-relaxed text-fg-muted">{description}</p>}
          </div>
          <div className="grid grid-cols-3 gap-x-6 md:gap-x-16 lg:gap-x-24">
            {groups.map((group, i) => (
              <nav key={i} aria-label={typeof group.title === "string" ? group.title : undefined}>
                <h2 className="font-display text-snippet leading-body font-medium tracking-normal">{group.title}</h2>
                <ul className="mt-4 flex list-none flex-col gap-2.5 p-0">
                  {group.links.map((link) => {
                    const external = link.external ?? /^https?:/.test(link.href);
                    return (
                      <li key={link.href + String(link.label)}>
                        <a
                          href={link.href}
                          {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                          className="rounded-chip text-body-sm text-fg-muted outline-none transition-colors duration-(--ds-duration-fast) ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring motion-reduce:transition-none"
                        >
                          {link.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        {legal && <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-line py-5 text-caption text-fg-muted">{legal}</div>}
      </div>
      {wordmark && <OutlineWordmark text={wordmark} />}
    </footer>
  );
}

export { SiteFooter };
export type { FooterGroup, FooterLink, SiteFooterProps };
