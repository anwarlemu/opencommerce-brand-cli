import { Lockup, LogoMark } from "@/components/ui/logo";

export function Site() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="flex min-h-40 flex-col items-start justify-center gap-6 rounded-panel border border-line bg-surface p-8">
        <Lockup />
        <Lockup byline={false} />
        <Lockup className="[&>[data-logo-name]]:text-h3" />
      </div>
      <div className="flex min-h-40 items-center gap-4 rounded-panel border border-line bg-subtle p-8">
        <LogoMark />
        <LogoMark className="w-6" />
        <LogoMark tone="ink" />
      </div>
    </div>
  );
}
