"use client";

import { Hero } from "@/components/site/hero";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";
import { CodeWindow } from "@/components/ui/code-window";

// The page for a request the server could not finish (500), in the not-found page's voice: the pill names the error, a
// short title and line, the blue key to try again and the white key to the status page, and the failed request in a
// code window over the field of *s and @s. One message, two keys; no blame.

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

const REQUEST = `POST /checkout
500 Something broke on our side

// Nothing was charged. Try again in a moment.`;

export function ServerErrorPage({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="bg-surface text-fg">
      <SiteHeader href="/" links={LINKS} spy={false} action={{ label: "Get started", href: SIGNUP }} />
      <main className="overflow-x-clip">
        <Hero
          eyebrow="500"
          title="Something went wrong"
          subtitle="The request did not finish on our side. Nothing was charged; try again in a moment."
          actions={
            <>
              <Button type="button" onClick={onRetry ?? (() => window.location.reload())}>
                Try again
              </Button>
              <Button asChild variant="secondary">
                <a href="/status">Service status</a>
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
