import { Separator } from "@/components/ui/separator";

export function Site() {
  return (
    <div className="grid max-w-2xl gap-8">
      <div className="grid gap-4">
        <p className="font-mono text-bar text-fg-muted">get-started.md</p>
        <h2 className="text-h2 leading-display tracking-tighter">Give your agent a checkout</h2>
        <p className="text-body leading-lead text-fg-muted">One endpoint, every online store.</p>
      </div>
      <Separator />
      <div className="flex h-5 items-center gap-4 font-sans text-body-sm text-fg-muted">
        <span>Search</span>
        <Separator orientation="vertical" />
        <span>Checkout</span>
        <Separator orientation="vertical" />
        <span>Tracking</span>
      </div>
    </div>
  );
}
