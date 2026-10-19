import { Badge } from "@/components/ui/badge";

export function Site() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="chip">Every merchant</Badge>
        <Badge variant="chip">4000+ stores</Badge>
        <Badge variant="chip">POST /buy</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Processing</Badge>
        <Badge variant="brand">Confirmed</Badge>
        <Badge variant="success">Operational</Badge>
        <Badge variant="warning">Degraded</Badge>
        <Badge variant="destructive">Down</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="tag">Added</Badge>
        <Badge variant="tag-ink">Improved</Badge>
        <Badge variant="tag-heart">Fixed</Badge>
      </div>
    </div>
  );
}
