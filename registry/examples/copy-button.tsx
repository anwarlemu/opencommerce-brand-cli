import { CopyButton } from "@/components/ui/copy-button";

export function Site() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <div className="flex items-center gap-3 rounded-control border border-hairline bg-surface py-2 pr-2 pl-4">
        <code className="min-w-0 flex-1 truncate font-mono text-snippet text-fg">npm install @agentcard/sdk</code>
        <CopyButton value="npm install @agentcard/sdk" label="Copy command" />
      </div>
      <div className="flex items-center gap-3 rounded-panel bg-code py-2 pr-2 pl-4">
        <code className="min-w-0 flex-1 truncate font-mono text-snippet text-fg-code">pnpm add @agentcard/sdk</code>
        <CopyButton value="pnpm add @agentcard/sdk" label="Copy command" dark />
        <CopyButton value="pnpm add @agentcard/sdk" label="Copy command" dark compact />
      </div>
    </div>
  );
}
