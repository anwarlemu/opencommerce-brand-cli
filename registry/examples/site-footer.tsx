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
