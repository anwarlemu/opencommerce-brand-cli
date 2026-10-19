import { CopyButton } from "@/components/ui/copy-button";

/**
 * The aside's call to action, as the brand's closing card: mist under a hairline at 16px corners, a 16px display title,
 * a line in muted ink, and the command on ink with its copy key.
 */
export function CtaCard({ command }: { command: string }) {
  return (
    <aside className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2 rounded-shell border border-line bg-subtle px-4 pt-4.5 pb-4">
      <p className="font-display text-body leading-snug font-medium tracking-tight">Add this component</p>
      <p className="mb-1 text-caption leading-normal text-fg-muted">Run this in the project to copy the component, its dependencies and the theme.</p>
      <div className="flex items-center gap-2 rounded-control bg-code py-1 pr-1 pl-2.5 shadow-code">
        <code className="min-w-0 flex-1 truncate font-mono text-micro text-fg-code">{command}</code>
        <CopyButton value={command} label="Copy command" dark compact />
      </div>
    </aside>
  );
}
