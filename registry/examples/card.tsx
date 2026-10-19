import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Site() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Every merchant</CardTitle>
          <CardDescription>One endpoint reaches any online store: catalog search, checkout and order tracking.</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Warmed routes</CardTitle>
          <CardDescription>The stores your agents buy from most are kept warm, so a purchase finishes in seconds.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

// The order card, set on a feature's picture.
export function Raised() {
  return (
    <div className="flex justify-center rounded-panel border border-line bg-surface px-6 py-10">
      <Card variant="raised" className="w-full max-w-75">
        <div className="flex items-center justify-between border-b border-line pb-2.5 font-mono text-bar text-fg-muted">
          <span>Order · Amazon</span>
          <Badge variant="brand">Confirmed</Badge>
        </div>
        <ol className="mt-1 grid gap-2 text-body-sm">
          {[
            ["Cart", "2 items · $48.20"],
            ["Payment", "Visa ···· 4832"],
            ["Confirmed", "#A-10293"],
          ].map(([step, detail]) => (
            <li key={step} className="flex items-baseline justify-between gap-3">
              <span>{step}</span>
              <span className="font-mono text-bar text-fg-muted">{detail}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
