# Site footer
White footer under a hairline: the name and a line, three link columns, the small print and the outlined wordmark.

Install: npx opencommerce-ds add site-footer
Requires: theme, outline-wordmark, utils
Packages: none
Exports: SiteFooter, FooterGroup, FooterLink, SiteFooterProps
Client boundary: not required by this entry file
Reference: opencommerce-agentcard-web src/components/site-footer.tsx, src/components/footer-wordmark.tsx


## Usage
Use once at the foot of every page. Provide link groups (three reads best), the description and the small print; check that every link resolves.
- Avoid: A blue or dark footer
- Avoid: Icons beside every link
- Avoid: More than four columns
- Avoid: Bold headings
- Avoid: A filled wordmark
`SiteFooter` props: `groups` ({ title, links: { label, href, external }[] }[]), `name` (default "opencommerce"),
`byline` (default "by Agentcard"), `logo`, `description`, `legal`, `wordmark` (string or null, default
"opencommerce"), plus footer props.

## Examples
Example components: npx opencommerce-ds add site-footer
[Site](https://opencommerce-ds.vercel.app/preview/site-footer/Site)

examples/site-footer.tsx

```tsx
import { SiteFooter } from "@/components/site/site-footer";

export function Site() {
  return (
    <SiteFooter
      description="The open router for commerce. Buy from any online store from a single endpoint."
      legal={<span>© 2026 Agentcard, Inc.</span>}
      groups={[
        { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Monitoring", href: "#monitoring" }, { label: "Pricing", href: "#pricing" }, { label: "FAQ", href: "#faq" }] },
        { title: "Developers", links: [{ label: "Docs", href: "https://docs.agentcard.sh" }, { label: "SDK", href: "https://www.npmjs.com/package/@agentcard/sdk" }, { label: "Status", href: "https://status.agentcard.sh" }] },
        { title: "Company", links: [{ label: "Agentcard", href: "https://agentcard.sh" }, { label: "Privacy", href: "https://agentcard.sh/privacy" }, { label: "Terms", href: "https://agentcard.sh/terms" }] },
      ]}
    />
  );
}

```

## Source

components/site/site-footer.tsx

```tsx
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

```
