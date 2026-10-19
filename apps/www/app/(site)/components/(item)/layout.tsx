import { LibraryNav } from "@www/components/sidebar";
import { GROUPS, items } from "@www/lib/registry";

// The item pages share this layout: the library's panel at the left from
// 1024px (above the article, closed to its bar, below), the article and its contents to the right. The panel stays
// mounted between items, so it keeps its scroll and filter.
export default function ItemLayout({ children }: { children: React.ReactNode }) {
  const groups = GROUPS.map((g) => ({ label: g.label, items: items.filter((i) => i.type === g.type).map((i) => ({ name: i.name, title: i.title })) })).filter((g) => g.items.length);
  return (
    <div className="mx-auto grid max-w-360 grid-cols-[minmax(0,1fr)] items-start gap-7 px-5 pt-10 pb-30 md:px-10 lg:grid-cols-[clamp(15.25rem,19vw,17.5rem)_minmax(0,1fr)] lg:gap-12">
      <div className="mx-auto w-full max-w-180 lg:sticky lg:top-24 lg:max-w-none">
        <LibraryNav groups={groups} />
      </div>
      {children}
    </div>
  );
}
