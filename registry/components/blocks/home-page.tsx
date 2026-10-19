import { Cta } from "@/components/site/cta";
import { Faq } from "@/components/site/faq";
import { FeatureGrid } from "@/components/site/feature-rows";
import { Hero } from "@/components/site/hero";
import { LogoStrip } from "@/components/site/logo-strip";
import { Pricing } from "@/components/site/pricing";
import { SectionHeading, SiteSection } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { StatusTable, type DayStatus } from "@/components/site/status-table";
import { Steps } from "@/components/site/steps";
import { Button } from "@/components/ui/button";
import { CodeWindow } from "@/components/ui/code-window";
import { InstallTabs } from "@/components/ui/install-tabs";

// The home page as the opencommerce site draws it, top to bottom on one white page: the glass header, the hero (pill,
// title, two keys, the strip of stores, the code over its field of glyphs), what you get (four feature windows), how it
// works (the steps and their code), the live status table, pricing, the closing card with the install box, the
// questions, and the footer with its outlined wordmark. Sample content in its shape; replace it with your own and check
// every link.

const SIGNUP = "https://app.agentcard.sh";
const DOCS = "https://docs.agentcard.sh";

const LINKS = [
  { label: "Home", href: "#top" },
  { label: "Features", href: "#features" },
  { label: "Monitoring", href: "#monitoring" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Docs", href: DOCS },
];

const HERO_CODE = `import { Agentcard } from "@agentcard/sdk";

const agentcard = new Agentcard({
  clientSecret: process.env.AGENTCARD_SECRET,
});

// One call: find the item, check out, track the order.
const order = await agentcard.commerce.buy({
  query: "USB-C charger, 65W",
  maxPrice: 40,
});`;

const STORES = ["Northwind", "Acme Supply", "Globex", "Initech", "Umbrella", "Hooli", "Vandelay", "Soylent", "Wonka", "Pied Piper"].map((name) => ({ name }));

// Thirty days drawn in left to right when the card is first seen; the one rough day stays pale.
function Uptime() {
  return (
    <div aria-hidden className="w-full max-w-75 font-mono text-snippet">
      <div className="flex items-baseline justify-between text-fg-muted">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-brand" />
          Uptime
        </span>
        <span className="text-fg">99.9%</span>
      </div>
      <div className="mt-2.5 flex h-14 items-end gap-0.75">
        {Array.from({ length: 30 }, (_, i) => (
          <span
            key={i}
            style={{ animationDelay: `${i * 26}ms` }}
            className={`h-full flex-1 origin-bottom rounded-chip group-data-[state=idle]/feature:scale-y-0 group-data-[state=play]/feature:animate-chart-bar ${i === 19 ? "bg-brand/25" : "bg-brand"}`}
          />
        ))}
      </div>
    </div>
  );
}

function Route({ label, time, width, warm }: { label: string; time: string; width: string; warm?: boolean }) {
  return (
    <div>
      <div className={warm ? "flex justify-between text-fg-brand" : "flex justify-between text-fg-muted"}>
        <span>{label}</span>
        <span>{time}</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-chip bg-line">
        <div style={{ width }} className={warm ? "h-full bg-brand" : "h-full bg-line-strong"} />
      </div>
    </div>
  );
}

function Race() {
  return (
    <div aria-hidden className="flex w-full max-w-75 flex-col gap-5 font-mono text-snippet">
      <Route label="Cold route" time="2m 40s" width="100%" />
      <Route label="Warmed route" time="9s" width="6%" warm />
    </div>
  );
}

const FEATURES = [
  { title: "Every store, one endpoint", description: "Search the catalogue, check out and track the order at any store through the same call.", media: <Race />, file: "merchants.feature" },
  { title: "Uptime you can see", description: "Every route is exercised around the clock, so you know a store works before your agent tries it.", media: <Uptime />, file: "uptime.feature" },
  { title: "Warmed routes", description: "The stores your agents use most stay warm, so a purchase takes seconds, not minutes.", media: <Race />, file: "speed.feature" },
  { title: "Checkout that finishes", description: "Payment, shipping and confirmation, with the order number back in your agent’s hands.", media: <Uptime />, file: "checkout.feature" },
];

const STEPS = [
  { title: "Add the commerce tool to your agent", code: `npm install @agentcard/sdk\n\nimport { Agentcard } from "@agentcard/sdk";\n\nconst agentcard = new Agentcard({\n  clientSecret: process.env.AGENTCARD_SECRET,\n});\n\nconst tools = [agentcard.tools.commerce()];` },
  { title: "Search catalogues and place orders conversationally", code: `const results = await agentcard.commerce.search({\n  query: "running shoes, size 10",\n  maxPrice: 120,\n});` },
  { title: "Pay with your customer’s stored card", code: `const order = await agentcard.commerce.checkout({\n  item: results[0].id,\n  card: customer.cardId,\n});` },
  { title: "Follow orders and report back to users", code: `const status = await agentcard.commerce.track(order.id);\n// "shipped", with the carrier and tracking number` },
];

// Deterministic per name, so the server and the browser draw the same bars.
function history(name: string): DayStatus[] {
  let seed = [...name].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
  return Array.from({ length: 45 }, () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const r = seed / 2 ** 32;
    return r < 0.03 ? "down" : r < 0.08 ? "degraded" : "up";
  });
}

const STATUS = [
  ["Northwind", "100%", "5 min ago", "12 sec"],
  ["Acme Supply", "99.9%", "1 min ago", "9 sec"],
  ["Globex", "99.8%", "2 min ago", "14 sec"],
  ["Initech", "100%", "4 min ago", "11 sec"],
  ["Umbrella", "99.6%", "7 min ago", "16 sec"],
].map(([name, ...values]) => ({ name, values, days: history(name) }));

const FAQS = [
  { question: "What is opencommerce?", answer: "An open router for commerce: one endpoint your agent calls to search a store, check out and track the order." },
  { question: "Which stores can my agent buy from?", answer: "More than 4,000 online stores, from marketplaces to restaurants, with new routes added every week." },
  { question: "How are payments handled?", answer: "Your customers’ cards stay in Agentcard’s vault; the agent pays with them, within the limits they set." },
  { question: "Which agent frameworks does it work with?", answer: "Any that can call a tool: the SDK ships tools for the common frameworks and a plain HTTP API." },
  { question: "What happens when a merchant’s checkout changes?", answer: "The route is re-learned within minutes; monitoring shows the store as degraded until it is." },
  { question: "How does the 1% platform fee work?", answer: "It is charged on each completed order. Failed and cancelled orders cost nothing." },
];

const FOOTER = [
  { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Monitoring", href: "#monitoring" }, { label: "Pricing", href: "#pricing" }, { label: "FAQ", href: "#faq" }] },
  { title: "Developers", links: [{ label: "Docs", href: DOCS }, { label: "SDK", href: "https://www.npmjs.com/package/@agentcard/sdk" }] },
  { title: "Company", links: [{ label: "Agentcard", href: "https://agentcard.sh" }, { label: "Contact", href: "mailto:hello@agentcard.sh" }] },
];

export function HomePage() {
  return (
    <div id="top" className="bg-surface text-fg">
      <SiteHeader links={LINKS} action={{ label: "Get started", href: SIGNUP }} />
      <main className="overflow-x-clip">
        <Hero
          eyebrow="Buy from 4000+ stores"
          eyebrowHref="#monitoring"
          title="Open router for commerce"
          subtitle="Let your agent buy from any online store through one endpoint."
          actions={
            <>
              <Button asChild>
                <a href={SIGNUP}>Get started</a>
              </Button>
              <Button asChild variant="secondary">
                <a href={DOCS}>Read the docs</a>
              </Button>
            </>
          }
          strip={<LogoStrip brands={STORES} />}
          media={<CodeWindow title="agent.ts" code={HERO_CODE} copy highlight={[7, 8, 9, 10]} preClassName="text-caption leading-normal" />}
        />
        <SiteSection id="features" aria-label="Features" width="medium">
          <SectionHeading title="Everything your agent needs to buy" description="One endpoint for every store, routes kept warm, and checkout that finishes." />
          <FeatureGrid features={FEATURES} />
        </SiteSection>
        <SiteSection id="in-action" aria-label="In action">
          <SectionHeading title="See it in action" description="From a single tool call to a delivered order. Pick a step to see the code behind it." />
          <Steps steps={STEPS} />
        </SiteSection>
        <SiteSection id="monitoring" aria-label="Monitoring">
          <SectionHeading title="Merchant monitoring" description="Every route is exercised around the clock. This is the live picture of the stores your agents buy from most." />
          <StatusTable
            nameLabel="Merchant"
            columns={[{ label: "Success rate", mono: true }, { label: "Last purchase", muted: true }, { label: "Duration", mono: true, muted: true }]}
            daysLabel="Uptime · 45 days"
            filterLabel="Filter merchants"
            filterPlaceholder="Filter merchants…"
            note="+ 4000 more merchants"
            rows={STATUS}
          />
        </SiteSection>
        <SiteSection id="pricing" aria-label="Pricing">
          <Pricing
            title="Pricing"
            description="Start free while you build. Move to Standard when your agent is buying for real."
            rows={["Platform fees", "Merchants", "PSPs"]}
            plans={[
              { name: "Free", price: "$0", unit: "while you build", blurb: "Everything you need to wire up your agent and make its first purchases.", values: ["N/A", "5 merchants", "2 PSPs"], action: { label: "Try free", href: SIGNUP } },
              { name: "Standard", badge: "Every merchant", price: "1%", unit: "of each completed order", blurb: "For agents buying for real, across every store and payment provider.", values: ["1%", "Every merchant", "Every PSP"], featured: true, action: { label: "Get started", href: SIGNUP } },
            ]}
          />
        </SiteSection>
        <SiteSection aria-label="Get started">
          <Cta
            title="Give your agent a checkout"
            description="One endpoint, every online store. Start free: your first purchase can go through today."
            actions={
              <>
                <Button asChild>
                  <a href={SIGNUP}>Get started</a>
                </Button>
                <Button asChild variant="secondary">
                  <a href="https://cal.com/agentcard">Book a call</a>
                </Button>
              </>
            }
            media={
              <InstallTabs
                className="w-full max-w-md"
                commands={[
                  { label: "npm", command: "npm install @agentcard/sdk" },
                  { label: "pnpm", command: "pnpm add @agentcard/sdk" },
                  { label: "yarn", command: "yarn add @agentcard/sdk" },
                  { label: "bun", command: "bun add @agentcard/sdk" },
                ]}
              />
            }
          />
        </SiteSection>
        <SiteSection id="faq" aria-label="FAQ" className="pb-18 md:pb-30">
          <Faq title="Questions" lead="What teams ask before their agent makes its first purchase. Still unsure? Book a call and we’ll walk you through it." items={FAQS} />
        </SiteSection>
      </main>
      <SiteFooter description="The open router for commerce. Buy from any online store from a single endpoint." legal={<span>© 2026 Agentcard, Inc.</span>} groups={FOOTER} />
    </div>
  );
}
