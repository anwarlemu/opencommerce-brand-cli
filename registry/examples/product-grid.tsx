import { ArrowUpRight } from "lucide-react";

import { ProductGrid } from "@/components/site/product-grid";
import { CodeWindow } from "@/components/ui/code-window";
import { Window } from "@/components/ui/window";

// Stand-ins for a product's pictures, drawn from the page's own parts: windows, hairlines and the one blue.
function Screen({ name, rows }: { name: string; rows: [string, string][] }) {
  return (
    <Window name={name} className="w-full max-w-md">
      <ul className="m-0 grid list-none gap-2 p-4 text-body-sm">
        {rows.map(([row, status]) => (
          <li key={row} className="flex items-center justify-between rounded-control border border-line px-3 py-2">
            {row}
            <span className="rounded-chip bg-tint px-1.5 py-0.5 font-mono text-caption leading-none text-fg-brand">{status}</span>
          </li>
        ))}
      </ul>
    </Window>
  );
}

const CODE = `const order = await agentcard.commerce.buy({
  query: "Oat milk, 6 pack",
  store: "any",
});`;

export function Site() {
  return (
    <section className="mx-auto w-(--ds-frame-column) py-20">
      <div className="mx-auto max-w-(--ds-layout-heading) pb-12 text-center">
        <h2 className="font-display text-h2 leading-display font-medium tracking-tighter">One router, every way to buy</h2>
        <p className="mx-auto mt-4 max-w-(--ds-layout-text) text-body leading-lead text-fg-muted">Search, checkout and tracking, for any store your agent needs.</p>
      </div>
      <ProductGrid
        products={[
          { layout: "lead", title: "Checkout", description: "One call takes your agent from a request to a confirmed order.", action: { label: "Read the docs", href: "https://docs.agentcard.sh", icon: <ArrowUpRight /> }, media: <CodeWindow title="buy.ts" code={CODE} dark className="w-full max-w-md" /> },
          { layout: "half", title: "Search", description: "Catalogues from thousands of stores, searchable in plain words.", action: { label: "See stores", href: "#monitoring" }, media: <Screen name="search.product" rows={[["USB-C charger, 65W", "$32"], ["Running shoes, size 10", "$96"], ["Oat milk, 6 pack", "$18"]]} /> },
          { layout: "half", title: "Tracking", description: "Every order followed to the door, with updates your agent can relay.", action: { label: "See pricing", href: "#pricing" }, media: <Screen name="orders.product" rows={[["#A-10293", "Shipped"], ["#A-10294", "Confirmed"]]} /> },
        ]}
      />
    </section>
  );
}
