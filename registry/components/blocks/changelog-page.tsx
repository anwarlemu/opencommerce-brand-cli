import { PageHeader } from "@/components/site/page-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { UpdatesFeed, type UpdateDay } from "@/components/site/updates-feed";
import { Button } from "@/components/ui/button";

// A changelog in the home page's voice: the glass header, the page's opening on the 800px column, one row per day on
// hairlines (the date in the platform mono at the left, the day's changes grouped under Added, Improved and Fixed at
// the right), a key to the older entries, and the footer. Sample entries; replace them with your own.

const SIGNUP = "https://app.agentcard.sh";
const DOCS = "https://docs.agentcard.sh";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Changelog", href: "/changelog", current: true },
  { label: "Docs", href: DOCS },
];

const FOOTER = [
  { title: "Product", links: [{ label: "Features", href: "/features" }, { label: "Pricing", href: "/pricing" }, { label: "Changelog", href: "/changelog" }] },
  { title: "Developers", links: [{ label: "Docs", href: DOCS }, { label: "SDK", href: "https://www.npmjs.com/package/@agentcard/sdk" }] },
  { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Blog", href: "/blog" }, { label: "Contact", href: "/contact" }] },
];

const DAYS: UpdateDay[] = [
  {
    date: "Thu Nov 12",
    dateTime: "2026-11-12",
    entries: [
      { tag: "Added", title: "Spending limits", body: "Customers set a ceiling per order and per month; the agent never pays past it.", items: ["commerce.checkout returns limit_reached when an order would pass a ceiling.", "Limits show on each customer in the dashboard."] },
      { tag: "Improved", items: ["Warmed routes now cover the stores your customers search most, even before a first purchase."] },
    ],
  },
  {
    date: "Tue Nov 3",
    dateTime: "2026-11-03",
    entries: [
      { tag: "Added", items: ["Order webhooks for shipped, delivered and refunded.", "A track call that returns the carrier and tracking number."] },
      { tag: "Fixed", items: ["Search no longer returns items that are out of stock at checkout."] },
    ],
  },
  {
    date: "Wed Oct 21",
    dateTime: "2026-10-21",
    entries: [
      { tag: "Improved", items: ["Routes re-learn within minutes when a store changes its checkout.", "The status table filters as you type."] },
      { tag: "Fixed", items: ["Shipping addresses with a second line are passed through in full."] },
    ],
  },
  {
    date: "Mon Oct 5",
    dateTime: "2026-10-05",
    entries: [{ tag: "Added", items: ["SDK tools for the common agent frameworks.", "A plain HTTP API for everything else."] }],
  },
];

export function ChangelogPage() {
  return (
    <div className="bg-surface text-fg">
      <SiteHeader href="/" links={LINKS} spy={false} action={{ label: "Get started", href: SIGNUP }} />
      <main>
        <PageHeader eyebrow="Changelog" title="What’s new" lead="New stores, new calls and fixes, as they ship." rule={false} />
        <div className="mx-auto w-(--ds-frame-column) max-w-(--ds-layout-medium) pt-8 pb-18 md:pb-30">
          <UpdatesFeed days={DAYS} className="border-t border-line" />
          <div className="mt-10 flex justify-center">
            <Button asChild variant="secondary">
              <a href="/changelog/page/2">Older updates</a>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter description="The open router for commerce. Buy from any online store from a single endpoint." legal={<span>© 2026 Agentcard, Inc.</span>} groups={FOOTER} />
    </div>
  );
}
