import { Window } from "@/components/ui/window";

export function Site() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
      <Window name="free.plan" bodyClassName="grid gap-3 p-6">
        <h3 className="font-display text-h4 leading-snug font-medium tracking-tight">Free</h3>
        <p className="flex items-baseline gap-2">
          <span className="font-display text-h2 leading-tight font-medium tracking-hero">$0</span>
          <span className="text-body-sm text-fg-muted">while you build</span>
        </p>
        <p className="text-body-sm leading-relaxed text-fg-muted">Everything you need to wire up your agent and make its first purchases.</p>
      </Window>
      <Window name="monitoring.live" bodyClassName="grid gap-2 p-6">
        <p className="flex items-center gap-2 text-body-sm text-fg-muted">
          <span aria-hidden className="size-2 rounded-pill bg-brand" />
          Live
        </p>
        <p className="text-body-sm leading-relaxed text-fg-muted">Every route is exercised around the clock.</p>
      </Window>
      <Window name="step-1.ts" dark className="sm:col-span-2" bodyClassName="px-6 py-4 font-mono text-snippet leading-code">
        <span className="text-fg-code-key">npm install</span> <span className="text-fg-code-string">@agentcard/sdk</span>
      </Window>
    </div>
  );
}
