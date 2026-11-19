import { Hero } from "@/components/site/hero";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";
import { CodeWindow } from "@/components/ui/code-window";

// The page for an address that leads nowhere, in the home page's voice: the glass header, the hero's stack (the pill
// names the error, a short title and line, the blue key home and the white key to the docs), and under it the request
// that missed, in a code window over the field of *s and @s, then the footer. Keep it short: one message, two keys.

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
  { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Blog", href: "/blog" }, { label: "Contact", href: "/contact" }] },
];

const REQUEST = `GET /stores/acme-supply/old-checkout
404 Not found

// This page moved, or it never existed.
// Every store is still one call away.`;

export function NotFoundPage() {
  return (
    <div className="bg-surface text-fg">
      <SiteHeader href="/" links={LINKS} spy={false} action={{ label: "Get started", href: SIGNUP }} />
      <main className="overflow-x-clip">
        <Hero
          eyebrow="404"
          title="Page not found"
          subtitle="The page you were looking for is not here. The rest of the site is."
          actions={
            <>
              <Button asChild>
                <a href="/">Back home</a>
              </Button>
              <Button asChild variant="secondary">
                <a href={DOCS}>Read the docs</a>
              </Button>
            </>
          }
          media={<CodeWindow title="request.log" code={REQUEST} highlight={[1]} preClassName="text-caption leading-normal" />}
          className="pb-12 md:pb-20"
        />
      </main>
      <SiteFooter description="The open router for commerce. Buy from any online store from a single endpoint." legal={<span>© 2026 Agentcard, Inc.</span>} groups={FOOTER} />
    </div>
  );
}
