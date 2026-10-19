import { Footer } from "@www/components/footer";
import { Header } from "@www/components/header";
import { BRAND_SITE, GROUPS, REPO, items, registryName } from "@www/lib/registry";

// The docs pages: the brand's glass header and its footer around them. Example previews (app/preview) render bare.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const label = Object.fromEntries(GROUPS.map((g) => [g.type, g.label]));
  const entries = [
    ...items.map((i) => ({ name: i.name, title: i.title, group: label[i.type] ?? "Library", href: `/components/${i.name}` })),
    { name: "theme", title: "Theme", group: "Docs", href: "/theme" },
  ];
  return (
    <>
      <Header name={registryName} repo={REPO} entries={entries} />
      {children}
      <Footer name={registryName} repo={REPO} site={BRAND_SITE} />
    </>
  );
}
