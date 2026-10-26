import { DocsRail } from "@www/components/rail";
import { BRAND_SITE, RAIL, REPO, registryName } from "@www/lib/registry";

// Every docs page sits beside the rail. Example previews (app/preview) render bare.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const groups = RAIL.map((g) => ({ id: g.id, label: g.label, items: g.items.map((i) => ({ name: i.name, title: i.title })) }));
  return (
    <div className="lg:flex">
      <DocsRail groups={groups} name={registryName} repo={REPO} site={BRAND_SITE} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
