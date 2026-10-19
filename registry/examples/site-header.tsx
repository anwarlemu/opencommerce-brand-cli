import { SiteHeader } from "@/components/site/site-header";

const LINKS = [
  { label: "Home", href: "#top" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Docs", href: "https://docs.agentcard.sh" },
];

export function Site() {
  return (
    <div className="min-h-40 bg-surface pt-4">
      <SiteHeader fixed={false} links={LINKS} action={{ label: "Get started", href: "https://app.agentcard.sh" }} />
    </div>
  );
}
