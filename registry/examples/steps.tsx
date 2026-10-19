import { Steps } from "@/components/site/steps";

const STEPS = [
  { title: "Add the commerce tool to your agent", code: `npm install @agentcard/sdk\n\nimport { Agentcard } from "@agentcard/sdk";\n\nconst agentcard = new Agentcard({\n  clientSecret: process.env.AGENTCARD_SECRET,\n});\n\nconst tools = [agentcard.tools.commerce()];` },
  { title: "Search catalogues and place orders conversationally", code: `const results = await agentcard.commerce.search({\n  query: "running shoes, size 10",\n  maxPrice: 120,\n});` },
  { title: "Pay with your customer’s stored card", code: `const order = await agentcard.commerce.checkout({\n  item: results[0].id,\n  card: customer.cardId,\n});` },
  { title: "Follow orders and report back", code: `const status = await agentcard.commerce.track(order.id);\n// "shipped", with the carrier and tracking number` },
];

export function Site() {
  return (
    <div className="mx-auto w-(--ds-frame-column) py-16">
      <Steps steps={STEPS} />
    </div>
  );
}
