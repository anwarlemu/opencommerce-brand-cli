import { Faq } from "@/components/site/faq";
import { Pricing } from "@/components/site/pricing";
import { SiteSection } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

// A pricing page in the home page's voice: the glass header, the plans in windows with their compared rows, the
// questions about billing, and the footer with its outlined wordmark. Set the current plans, values and action URLs.

const SIGNUP = "https://app.agentcard.sh";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing", current: true },
  { label: "Docs", href: "https://docs.agentcard.sh" },
];

const FOOTER = [
  { title: "Product", links: [{ label: "Features", href: "/#features" }, { label: "Monitoring", href: "/#monitoring" }, { label: "Pricing", href: "/pricing" }] },
  { title: "Developers", links: [{ label: "Docs", href: "https://docs.agentcard.sh" }, { label: "SDK", href: "https://www.npmjs.com/package/@agentcard/sdk" }] },
  { title: "Company", links: [{ label: "Agentcard", href: "https://agentcard.sh" }, { label: "Contact", href: "mailto:hello@agentcard.sh" }] },
];

export function PricingPage() {
  return (
    <div className="bg-surface text-fg">
      <SiteHeader href="/" links={LINKS} spy={false} action={{ label: "Get started", href: SIGNUP }} />
      <main>
        <SiteSection aria-label="Pricing">
          <Pricing
            title="Pricing"
            description="Start free while you build. Move to Standard when your agent is buying for real."
            rows={["Platform fees", "Merchants", "PSPs", "Support"]}
            plans={[
              { name: "Free", price: "$0", unit: "while you build", blurb: "Everything you need to wire up your agent and make its first purchases.", values: ["N/A", "5 merchants", "2 PSPs", "Community"], action: { label: "Try free", href: SIGNUP } },
              { name: "Standard", badge: "Every merchant", price: "1%", unit: "of each completed order", blurb: "For agents buying for real, across every store and payment provider.", values: ["1%", "Every merchant", "Every PSP", "Shared channel"], featured: true, action: { label: "Get started", href: SIGNUP } },
            ]}
          />
        </SiteSection>
        <SiteSection aria-label="Billing questions" width="medium" className="pb-18 md:pb-30">
          <Faq
            title="Billing questions"
            minHeight={false}
            items={[
              { question: "When is the fee charged?", answer: "On each completed order. Failed and cancelled orders cost nothing." },
              { question: "Can I stay on Free?", answer: "Yes, for as long as you are building. Move to Standard when your agent buys for real." },
              { question: "Do you offer volume pricing?", answer: "Above a monthly volume we set a lower rate; book a call and we will work it out." },
            ]}
          />
        </SiteSection>
      </main>
      <SiteFooter description="The open router for commerce. Buy from any online store from a single endpoint." legal={<span>© 2026 Agentcard, Inc.</span>} groups={FOOTER} />
    </div>
  );
}
