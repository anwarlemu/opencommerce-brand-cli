# Careers page
Careers template with the header, the page's opening, the open roles as rows in one window, the closing card, and the footer.

Install: npx opencommerce-ds add careers-page
Requires: theme, cta, page-header, section, site-footer, site-header, button, window
Packages: none
Exports: CareersPage
Client boundary: not required by this entry file
Reference: Extension in the opencommerce site's voice, after about-page (opencommerce-agentcard-web globals.css .win rows, cta.tsx)


## Usage
Use for a careers page. Pass roles (title, team, place, href); keep each title short.
- Avoid: Photos of people who are not on the team
- Avoid: Perks lists in place of roles
- Avoid: A second blue key
`CareersPage` props: `roles` (`{ title, team, place, href }[]`, sample roles at Acme by default). Composed from
`SiteHeader`, `PageHeader`, `SiteSection`, `Window`, `Cta`, `Button` and `SiteFooter`.

## Examples
Example components: npx opencommerce-ds add careers-page
[Block](https://opencommerce-ds.vercel.app/preview/careers-page/Block)

examples/careers-page.tsx

```tsx
import { CareersPage } from "@/components/blocks/careers-page";

export function Block() {
  return <CareersPage />;
}

```

## Source

components/blocks/careers-page.tsx

```tsx
import { Cta } from "@/components/site/cta";
import { PageHeader } from "@/components/site/page-header";
import { SiteSection } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";
import { Window } from "@/components/ui/window";

// Careers, in the about page's voice: the page's opening, the open roles as rows in one window (roles.list: the title
// in the display face, the team and place in mono at 64 percent ink, a link to the role), and the closing card for
// anyone the list does not fit. Sample roles at Acme; pass your own.

const SIGNUP = "https://app.agentcard.sh";
const DOCS = "https://docs.agentcard.sh";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: DOCS },
];

const FOOTER = [
  { title: "Product", links: [{ label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }, { label: "Changelog", href: "/changelog" }] },
  { title: "Developers", links: [{ label: "Docs", href: DOCS }, { label: "SDK", href: "https://www.npmjs.com/package/@agentcard/sdk" }] },
  { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Careers", href: "/careers" }, { label: "Contact", href: "/contact" }] },
];

type Role = { title: string; team: string; place: string; href: string };

const ROLES: Role[] = [
  { title: "Backend engineer", team: "Platform", place: "Remote", href: "#backend" },
  { title: "Developer advocate", team: "Developers", place: "New York", href: "#advocate" },
  { title: "Product designer", team: "Design", place: "Remote", href: "#design" },
];

export function CareersPage({ roles = ROLES }: { roles?: Role[] }) {
  return (
    <div className="bg-surface text-fg">
      <SiteHeader href="/" links={LINKS} spy={false} action={{ label: "Get started", href: SIGNUP }} />
      <main>
        <PageHeader eyebrow="Careers" title="Build the checkout for agents" lead="A small team, shipping every week. Here is who we are looking for." />
        <SiteSection width="medium" className="pt-12">
          <Window name="roles.list">
            <ul className="divide-y divide-line">
              {roles.map((role) => (
                <li key={role.title}>
                  <a href={role.href} className="flex flex-wrap items-baseline justify-between gap-2 px-6 py-5 outline-none transition-[background-color] duration-150 ease-out hover:bg-wash-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none">
                    <span className="font-display text-h4 leading-snug font-medium tracking-tight">{role.title}</span>
                    <span className="font-mono text-caption text-fg-muted">
                      {role.team} · {role.place}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Window>
        </SiteSection>
        <SiteSection>
          <Cta
            title="Not on the list?"
            description="Tell us what you would build."
            actions={
              <Button asChild>
                <a href="/contact">Write to us</a>
              </Button>
            }
          />
        </SiteSection>
      </main>
      <SiteFooter description="The open router for commerce. Buy from any online store from a single endpoint." legal={<span>© 2026 Agentcard, Inc.</span>} groups={FOOTER} />
    </div>
  );
}

```
