import * as React from "react";

import { PageHeader } from "@/components/site/page-header";
import { Prose } from "@/components/site/prose";
import { Eyebrow } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Item } from "@/components/ui/item";

// A legal page (terms or privacy) in the home page's voice: the glass header, the page's opening on the 800px column
// with the date it last changed in the platform mono, then the contents at the left (held in view on wide screens,
// over the text on a phone) and the text in the 576px reading column (Prose), each section's heading the target of its
// link. Sample text in the shape of terms; have counsel write the real ones.

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
  { title: "Legal", links: [{ label: "Terms", href: "/terms" }, { label: "Privacy", href: "/privacy" }, { label: "Contact", href: "/contact" }] },
];

const SECTIONS = [
  {
    id: "the-service",
    title: "The service",
    body: (
      <>
        <p>opencommerce lets software agents search online stores, place orders and follow them through one endpoint. These terms cover your use of the API, the SDK and the dashboard.</p>
        <p>By creating an account you agree to them on behalf of yourself and the company you represent.</p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts and keys",
    body: (
      <>
        <p>Keep your client secret private. You are responsible for every call made with it.</p>
        <ul>
          <li>Rotate a key as soon as you think it has been exposed.</li>
          <li>Give each environment its own key.</li>
          <li>Tell us within a day of any unauthorized use.</li>
        </ul>
      </>
    ),
  },
  {
    id: "purchases",
    title: "Purchases your agents make",
    body: (
      <>
        <p>Each order is a purchase between your customer and the store. We route it and report on it; the store fulfills it under its own terms.</p>
        <p>Your customers set spending limits. An agent may not place an order past them, and we decline any order that would.</p>
      </>
    ),
  },
  {
    id: "fees",
    title: "Fees",
    body: (
      <>
        <p>
          The Standard plan charges 1% of each completed order. Failed and cancelled orders cost nothing. Current prices are on the <a href="/pricing">pricing page</a>.
        </p>
        <table>
          <thead>
            <tr>
              <th>Plan</th>
              <th>Fee</th>
              <th>Billed</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Free</td>
              <td>None</td>
              <td>Never</td>
            </tr>
            <tr>
              <td>Standard</td>
              <td>1% per completed order</td>
              <td>Monthly</td>
            </tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: <p>Do not use the service to buy goods a store or the law forbids, to resell access to it, or to load stores beyond what an ordinary shopper would.</p>,
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: <p>We will post changes here and email account owners at least 30 days before they take effect.</p>,
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions about these terms go to <a href="mailto:legal@agentcard.sh">legal@agentcard.sh</a>.
      </p>
    ),
  },
];

export function LegalPage() {
  return (
    <div className="bg-surface text-fg">
      <SiteHeader href="/" links={LINKS} spy={false} action={{ label: "Get started", href: SIGNUP }} />
      <main>
        <PageHeader eyebrow="Legal" title="Terms of service">
          <p className="mt-3 font-mono text-caption leading-body text-fg-muted">
            Last updated <time dateTime="2026-11-01">November 1, 2026</time>
          </p>
        </PageHeader>
        <div className="mx-auto grid w-(--ds-frame-column) max-w-(--ds-layout-medium) gap-10 pt-10 pb-18 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-8 md:pb-30">
          <nav aria-label="Contents" className="md:sticky md:top-24 md:self-start">
            <Eyebrow className="mb-2 px-2">Contents</Eyebrow>
            <ol className="m-0 flex list-none flex-col gap-0.5 p-0">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <Item asChild size="xs" className="text-fg-muted">
                    <a href={`#${section.id}`}>{section.title}</a>
                  </Item>
                </li>
              ))}
            </ol>
          </nav>
          <Prose className="mx-0">
            {SECTIONS.map((section) => (
              <React.Fragment key={section.id}>
                <h2 id={section.id} className="scroll-mt-24">
                  {section.title}
                </h2>
                {section.body}
              </React.Fragment>
            ))}
          </Prose>
        </div>
      </main>
      <SiteFooter description="The open router for commerce. Buy from any online store from a single endpoint." legal={<span>© 2026 Agentcard, Inc.</span>} groups={FOOTER} />
    </div>
  );
}
