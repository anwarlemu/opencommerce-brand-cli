import { Hero } from "@/components/site/hero";
import { LogoStrip } from "@/components/site/logo-strip";
import { Button } from "@/components/ui/button";
import { CodeWindow } from "@/components/ui/code-window";

const CODE = `import { Agentcard } from "@agentcard/sdk";

const agentcard = new Agentcard({
  clientSecret: process.env.AGENTCARD_SECRET,
});

// One call: find the item, check out, track the order.
const order = await agentcard.commerce.buy({
  query: "USB-C charger, 65W",
  maxPrice: 40,
});`;

const STORES = ["Northwind", "Acme Supply", "Globex", "Initech", "Umbrella", "Hooli", "Vandelay", "Soylent"].map((name) => ({ name }));

export function Site() {
  return (
    <Hero
      eyebrow="Buy from 4000+ stores"
      eyebrowHref="#monitoring"
      title="Open router for commerce"
      subtitle="Let your agent buy from any online store through one endpoint."
      actions={
        <>
          <Button asChild>
            <a href="https://app.agentcard.sh">Get started</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="https://docs.agentcard.sh">Read the docs</a>
          </Button>
        </>
      }
      strip={<LogoStrip brands={STORES} />}
      media={<CodeWindow title="agent.ts" code={CODE} copy highlight={[7, 8, 9, 10]} preClassName="text-caption leading-normal" />}
    />
  );
}
