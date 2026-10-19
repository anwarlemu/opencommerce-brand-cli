import { PageHeader } from "@/components/site/page-header";
import { SiteHeader } from "@/components/site/site-header";

const ACTION = { label: "Get started", href: "https://app.agentcard.sh" };

export function Site() {
  return (
    <div className="relative bg-surface pb-24">
      <SiteHeader fixed={false} action={ACTION} />
      <PageHeader
        eyebrow="Changelog"
        title="What’s new"
        lead="New stores, faster routes and the changes to the SDK, as they ship."
      />
    </div>
  );
}

export function Short() {
  return (
    <div className="relative bg-surface pb-24">
      <SiteHeader fixed={false} action={ACTION} />
      <PageHeader eyebrow="Get started" title="Let your agent buy">
        <p className="mt-3 text-body-sm text-fg-muted">A few answers, then a call</p>
      </PageHeader>
    </div>
  );
}
