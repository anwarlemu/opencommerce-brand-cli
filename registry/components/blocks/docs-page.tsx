import type * as React from "react";

import { Prose } from "@/components/site/prose";
import { SiteSection } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { CodeWindow } from "@/components/ui/code-window";

// A docs article, in the legal page's voice: the glass header, the article on the 640px text column (the mono eyebrow,
// the 48px title, the mono date), its paragraphs and headings in Prose, and its code in the code window with the copy
// key, then the footer. Sample article; pass your own children.

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

const INSTALL = `npm install @agentcard/sdk`;
const CALL = `const order = await agentcard.purchase({
  store: "acme-supply",
  item: "Cup",
});`;

export function DocsPage({ children }: { children?: React.ReactNode }) {
  return (
    <div className="bg-surface text-fg">
      <SiteHeader href="/" links={LINKS} spy={false} action={{ label: "Get started", href: SIGNUP }} />
      <main>
        <SiteSection>
          <Prose eyebrow="Guides" title="Make your first purchase" meta="Updated November 2026">
            {children ?? (
              <>
                <p>An agent buys with one call: name the store and the item, and the order comes back as data.</p>
                <h2>Install the SDK</h2>
                <CodeWindow title="terminal" code={INSTALL} copy />
                <h2>Buy something</h2>
                <CodeWindow title="agent.ts" code={CALL} copy highlight={[1]} />
                <p>The call returns when the store confirms the order. Track it from the same endpoint.</p>
              </>
            )}
          </Prose>
        </SiteSection>
      </main>
      <SiteFooter description="The open router for commerce. Buy from any online store from a single endpoint." legal={<span>© 2026 Agentcard, Inc.</span>} groups={FOOTER} />
    </div>
  );
}
