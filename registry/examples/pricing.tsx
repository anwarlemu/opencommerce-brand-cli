import { Pricing } from "@/components/site/pricing";

export function Site() {
  return (
    <section className="py-20">
      <Pricing
        title="Pricing"
        description="Start free while you build. Move to Standard when your agent is buying for real."
        rows={["Platform fees", "Merchants", "PSPs"]}
        plans={[
          { name: "Free", price: "$0", unit: "while you build", blurb: "Everything you need to wire up your agent and make its first purchases.", values: ["N/A", "5 merchants", "2 PSPs"], action: { label: "Try free", href: "https://app.agentcard.sh" } },
          { name: "Standard", badge: "Every merchant", price: "1%", unit: "of each completed order", blurb: "For agents buying for real, across every store and payment provider.", values: ["1%", "Every merchant", "Every PSP"], featured: true, action: { label: "Get started", href: "https://app.agentcard.sh" } },
        ]}
      />
    </section>
  );
}
