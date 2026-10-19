import { SectionHeading, SiteSection } from "@/components/site/section";
import { Window } from "@/components/ui/window";

function Placeholder({ name }: { name: string }) {
  return (
    <Window name={name} className="h-48" bodyClassName="flex items-center justify-center font-mono text-caption text-fg-muted">
      Content
    </Window>
  );
}

export function Site() {
  return (
    <>
      <SiteSection width="medium">
        <SectionHeading title="Everything your agent needs to buy" description="One endpoint for every store: search the catalogue, check out and track the order, with the uptime to rely on." />
        <div className="grid gap-5 sm:grid-cols-2">
          <Placeholder name="merchants.feature" />
          <Placeholder name="checkout.feature" />
        </div>
      </SiteSection>
      <SiteSection className="pb-18 md:pb-30">
        <SectionHeading eyebrow="Monitoring" title="Merchant monitoring" description="Every route is exercised around the clock." />
        <Placeholder name="monitoring.live" />
      </SiteSection>
    </>
  );
}
