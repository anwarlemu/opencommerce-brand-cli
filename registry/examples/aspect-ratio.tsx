import { AspectRatio } from "@/components/ui/aspect-ratio";

export function Site() {
  return (
    <div className="w-full max-w-110 overflow-hidden rounded-panel border border-line-window bg-surface shadow-card">
      <AspectRatio ratio={16 / 9}>
        <div className="flex size-full flex-col justify-end gap-1 bg-subtle p-4">
          <span className="font-mono text-caption text-fg-muted">order.preview</span>
          <span className="font-sans text-body-sm text-fg">Standing desk, oak, 48 in</span>
        </div>
      </AspectRatio>
    </div>
  );
}

export function Square() {
  return (
    <div className="grid w-full max-w-110 grid-cols-3 gap-3">
      {["Wayfair", "Staples", "Best Buy"].map((store) => (
        <AspectRatio key={store} ratio={1} className="grid place-items-center rounded-control border border-line bg-surface">
          <span className="font-sans text-body-sm text-fg-muted">{store}</span>
        </AspectRatio>
      ))}
    </div>
  );
}
