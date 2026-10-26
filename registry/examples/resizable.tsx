import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const REQUEST = `POST /v1/checkouts
{
  "merchant": "northwind.example",
  "items": [{ "sku": "trail-runner-10", "qty": 1 }],
  "card": "card_7Hk2"
}`;

const RESPONSE = `201 Created
{
  "order": "ord_8KQ2",
  "status": "placed",
  "total": 12800
}`;

export function Site() {
  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-60 overflow-hidden rounded-panel border border-line-window bg-surface shadow-card">
      <ResizablePanel defaultSize={55} minSize={30}>
        <div className="grid h-full content-start gap-2 p-4">
          <p className="font-mono text-bar text-fg-muted">request</p>
          <pre className="overflow-auto font-mono text-snippet leading-code text-fg">{REQUEST}</pre>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={45} minSize={25}>
        <div className="grid h-full content-start gap-2 bg-subtle p-4">
          <p className="font-mono text-bar text-fg-muted">response</p>
          <pre className="overflow-auto font-mono text-snippet leading-code text-fg">{RESPONSE}</pre>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export function Vertical() {
  return (
    <ResizablePanelGroup direction="vertical" className="min-h-72 overflow-hidden rounded-panel border border-line-window bg-surface shadow-card">
      <ResizablePanel defaultSize={60} minSize={25}>
        <div className="grid h-full place-items-center p-4 text-body-sm text-fg-muted">Orders</div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={40} minSize={20}>
        <div className="grid h-full place-items-center p-4 text-body-sm text-fg-muted">Order detail</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
