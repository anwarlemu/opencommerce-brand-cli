import { Cta } from "@/components/site/cta";
import { FeatureGrid, FeatureRows } from "@/components/site/feature-rows";
import { Hero } from "@/components/site/hero";
import { LogoStrip } from "@/components/site/logo-strip";
import { SectionHeading, SiteSection } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Steps } from "@/components/site/steps";
import { Testimonials } from "@/components/site/testimonials";
import { Button } from "@/components/ui/button";
import { CodeWindow } from "@/components/ui/code-window";

// A product page in the home page's voice: the glass header, the hero (pill, title, two keys, the strip of stores, a
// code window over its field of glyphs), the three main features one to a row beside their windows, four smaller
// features two to a row, how it works (the steps and their code), three customer cases, the closing card and the
// footer. Sample content in its shape; replace it with your own and check every link.

const SIGNUP = "https://app.agentcard.sh";
const DOCS = "https://docs.agentcard.sh";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features", current: true },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Docs", href: DOCS },
];

const FOOTER = [
  { title: "Product", links: [{ label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }, { label: "Changelog", href: "/changelog" }] },
  { title: "Developers", links: [{ label: "Docs", href: DOCS }, { label: "SDK", href: "https://www.npmjs.com/package/@agentcard/sdk" }] },
  { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Blog", href: "/blog" }, { label: "Contact", href: "/contact" }] },
];

const STORES = ["Acme Supply", "Northwind", "Globex", "Initech", "Umbrella", "Hooli", "Vandelay", "Soylent"].map((name) => ({ name }));

const HERO_CODE = `const results = await agentcard.commerce.search({
  query: "standing desk, oak, under $400",
  stores: "any",
});

const order = await agentcard.commerce.checkout({
  item: results[0].id,
  card: customer.cardId,
});`;

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

// The order as the agent gets it back: a few rows on hairlines, the status in blue.
function Receipt() {
  const rows = [
    ["Store", "Acme Supply"],
    ["Item", "USB-C charger, 65W"],
    ["Total", "$34.90"],
    ["Status", "Shipped"],
  ];
  return (
    <dl aria-hidden className="m-0 w-full max-w-75 font-mono text-snippet">
      {rows.map(([label, value], i) => (
        <div key={label} className="flex justify-between border-b border-line py-2 last:border-b-0">
          <dt className="text-fg-muted">{label}</dt>
          <dd className={i === rows.length - 1 ? "m-0 text-fg-brand" : "m-0 text-fg"}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

const ROWS = [
  { title: "Every store, one endpoint", tags: ["Search", "Checkout", "Track"], description: "Search the catalogue, check out and follow the order at any store through the same call, with the same shape back every time.", media: <Race />, file: "merchants.feature" },
  { title: "Uptime you can see", tags: ["Monitoring"], description: "Every route is exercised around the clock, so you know a store works before your agent tries it.", media: <Uptime />, file: "uptime.feature" },
  { title: "Checkout that finishes", tags: ["Payments", "Shipping"], description: "Payment, shipping and confirmation, with the order number and its tracking back in your agent’s hands.", media: <Receipt />, file: "checkout.feature" },
];

const GRID = [
  { title: "Spending limits", description: "Your customers set a ceiling per order and per month; the agent never pays past it." },
  { title: "Stored cards", description: "Cards stay in the vault. The agent pays with a token, never the number." },
  { title: "Order webhooks", description: "Shipped, delivered or refunded: each change arrives as an event you can act on." },
  { title: "Any framework", description: "Tools for the common agent frameworks, and a plain HTTP API for the rest." },
];

const STEPS = [
  { title: "Add the commerce tool to your agent", code: `npm install @agentcard/sdk\n\nimport { Agentcard } from "@agentcard/sdk";\n\nconst agentcard = new Agentcard({\n  clientSecret: process.env.AGENTCARD_SECRET,\n});\n\nconst tools = [agentcard.tools.commerce()];` },
  { title: "Search catalogues and place orders conversationally", code: `const results = await agentcard.commerce.search({\n  query: "running shoes, size 10",\n  maxPrice: 120,\n});` },
  { title: "Pay with your customer’s stored card", code: `const order = await agentcard.commerce.checkout({\n  item: results[0].id,\n  card: customer.cardId,\n});` },
  { title: "Follow orders and report back to users", code: `const status = await agentcard.commerce.track(order.id);\n// "shipped", with the carrier and tracking number` },
];

const CASES = [
  { name: "Acme Travel", tag: "Consumer", context: "Trip planners like Acme Travel book gear for each trip:", quote: "Our agent buys what the itinerary needs from whichever store has it. One call, no new integration per store." },
  { name: "Globex Office", tag: "B2B", context: "Procurement teams like Globex Office restock on a schedule:", quote: "Reorders used to take a person an afternoon. Now the agent places them and posts the tracking numbers." },
  { name: "Initech Labs", tag: "Developer", context: "Builders like Initech Labs ship shopping assistants:", quote: "We had a working checkout in our assistant the same day we started. Monitoring tells us before a store breaks." },
];

export function FeaturesPage() {
  return (
    <div className="bg-surface text-fg">
      <SiteHeader href="/" links={LINKS} spy={false} action={{ label: "Get started", href: SIGNUP }} />
      <main className="overflow-x-clip">
        <Hero
          eyebrow="Features"
          title="Everything your agent needs to buy"
          subtitle="Search, checkout and tracking at any online store, through one endpoint."
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
          media={<CodeWindow title="checkout.ts" code={HERO_CODE} copy preClassName="text-caption leading-normal" />}
        />
        <SiteSection aria-label="Main features">
          <SectionHeading title="Built for agents that buy for real" description="The parts that matter once your agent is spending a customer’s money." />
          <FeatureRows features={ROWS} />
        </SiteSection>
        <SiteSection aria-label="More features" width="medium">
          <SectionHeading title="And the rest of the checklist" description="The details your team would otherwise build and keep up by hand." />
          <FeatureGrid features={GRID} />
        </SiteSection>
        <SiteSection aria-label="How it works">
          <SectionHeading title="How it works" description="From a single tool call to a delivered order. Pick a step to see the code behind it." />
          <Steps steps={STEPS} />
        </SiteSection>
        <SiteSection aria-label="Customers">
          <SectionHeading title="Agents already buying" description="Teams that gave their agent a checkout, and what changed." />
          <Testimonials cases={CASES} />
        </SiteSection>
        <SiteSection aria-label="Get started" className="pb-18 md:pb-30">
          <Cta
            title="Give your agent a checkout"
            description="One endpoint, every online store. Start free: your first purchase can go through today."
            actions={
              <>
                <Button asChild>
                  <a href={SIGNUP}>Get started</a>
                </Button>
                <Button asChild variant="secondary">
                  <a href="/contact">Talk to us</a>
                </Button>
              </>
            }
          />
        </SiteSection>
      </main>
      <SiteFooter description="The open router for commerce. Buy from any online store from a single endpoint." legal={<span>© 2026 Agentcard, Inc.</span>} groups={FOOTER} />
    </div>
  );
}
