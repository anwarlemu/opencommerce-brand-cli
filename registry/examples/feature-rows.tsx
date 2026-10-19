import { FeatureGrid, FeatureRows } from "@/components/site/feature-rows";

// Thirty days drawn in left to right when the card is first seen; the one rough day stays pale.
function Uptime() {
  return (
    <div aria-hidden className="w-full max-w-75 font-mono text-snippet">
      <div className="flex items-baseline justify-between text-fg-muted">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-brand" />
          Uptime
        </span>
        <span className="text-fg">99.9%</span>
      </div>
      <div className="mt-2.5 flex h-14 items-end gap-0.75">
        {Array.from({ length: 30 }, (_, i) => (
          <span
            key={i}
            style={{ animationDelay: `${i * 26}ms` }}
            className={`h-full flex-1 origin-bottom rounded-chip group-data-[state=idle]/feature:scale-y-0 group-data-[state=play]/feature:animate-chart-bar ${i === 19 ? "bg-brand/25" : "bg-brand"}`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-caption text-fg-faint">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function Race() {
  return (
    <div aria-hidden className="flex w-full max-w-75 flex-col gap-5 font-mono text-snippet">
      <div>
        <div className="flex justify-between text-fg-muted">
          <span>Cold route</span>
          <span>2m 40s</span>
        </div>
        <div className="mt-2 h-2.5 rounded-chip bg-line-strong" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-fg-brand">Warmed route</span>
            <span className="rounded-chip bg-brand px-1.5 py-0.5 text-micro leading-none text-on-brand">18× faster</span>
          </span>
          <span>9s</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-chip bg-line">
          <div className="h-full w-[6%] bg-brand" />
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  { title: "Every store, one endpoint", description: "Search the catalogue, check out and track the order at any store through the same call.", media: <Race /> },
  { title: "Uptime you can see", description: "Every route is exercised around the clock, so you know a store works before your agent tries it.", media: <Uptime /> },
  { title: "Warmed routes", description: "The stores your agents use most stay warm, so a purchase takes seconds, not minutes.", media: <Race /> },
  { title: "Checkout that finishes", description: "Payment, shipping and confirmation, with the order number back in your agent’s hands.", media: <Uptime /> },
];

export function Site() {
  return (
    <div className="py-16">
      <FeatureGrid features={FEATURES} />
    </div>
  );
}

export function Rows() {
  return (
    <div className="mx-auto w-(--ds-frame-column) py-16">
      <FeatureRows features={FEATURES.slice(0, 2).map((f, i) => ({ ...f, tags: [i ? "Monitoring" : "Routing"] }))} />
    </div>
  );
}
