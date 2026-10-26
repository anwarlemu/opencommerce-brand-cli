import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

function Merchant() {
  return (
    <div className="grid gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-0.5">
          <p className="font-display text-h5 leading-display font-medium tracking-tight text-fg">Northwind Outfitters</p>
          <p className="font-mono text-bar text-fg-muted">northwind.example</p>
        </div>
        <Badge variant="success">Operational</Badge>
      </div>
      <p className="text-body-sm leading-relaxed text-fg-muted">Search, checkout and order tracking are live. Median checkout in the last hour: 3.4s.</p>
      <dl className="grid grid-cols-2 gap-2 border-t border-line pt-3 text-caption">
        <dt className="text-fg-muted">Checkouts today</dt>
        <dd className="text-right font-mono text-fg tabular-nums">1,284</dd>
        <dt className="text-fg-muted">Success rate</dt>
        <dd className="text-right font-mono text-fg tabular-nums">99.2%</dd>
      </dl>
    </div>
  );
}

export function Site() {
  return (
    <p className="max-w-120 text-body leading-relaxed text-fg-muted">
      Your agent's last order went to{" "}
      <HoverCard>
        <HoverCardTrigger href="#merchant" className="text-fg-brand underline decoration-line-brand underline-offset-4">
          Northwind Outfitters
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <Merchant />
        </HoverCardContent>
      </HoverCard>{" "}
      and shipped this morning.
    </p>
  );
}

export function Open() {
  return (
    <div className="h-64">
      <HoverCard defaultOpen>
        <HoverCardTrigger href="#merchant" className="text-body text-fg-brand underline decoration-line-brand underline-offset-4">
          Northwind Outfitters
        </HoverCardTrigger>
        <HoverCardContent align="start" className="w-80">
          <Merchant />
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
