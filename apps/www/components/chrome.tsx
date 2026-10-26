import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

/**
 * A page's head, as the brand opens a section: the blue mono label, the title in the display face at 500 and tracked
 * tight, a 16px line in muted ink under it, actions at the right, and a hairline under it all.
 */
export function PageHead({ eyebrow, title, description, children }: { eyebrow?: React.ReactNode; title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="border-b border-line px-5 pt-10 pb-8 md:px-10 md:pt-14">
      <div className="mx-auto flex max-w-200 flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          {eyebrow && <p className="mb-3 font-mono text-caption text-fg-label">{eyebrow}</p>}
          <h1 className="font-display text-h2 leading-display font-medium tracking-tighter text-pretty">{title}</h1>
          {description && <p className="mt-3 max-w-(--ds-layout-text) text-body leading-lead text-pretty text-fg-muted">{description}</p>}
        </div>
        {children && <div className="flex shrink-0 items-center gap-4 pt-1">{children}</div>}
      </div>
    </header>
  );
}

/** The page's body: one column with the brand's air between its blocks. */
export function PageBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className="px-5 pt-10 pb-24 md:px-10">
      <div className={cn("mx-auto grid max-w-200 grid-cols-[minmax(0,1fr)] gap-16", className)}>{children}</div>
    </div>
  );
}

/** A block of a page: a 24px display heading and a muted line under it, then its content. */
export function Section({ id, title, description, children }: { id?: string; title: string; description?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="grid min-w-0 scroll-mt-6 grid-cols-[minmax(0,1fr)] gap-5">
      <div>
        <h2 className="font-display text-h3 leading-display font-medium tracking-tight">{title}</h2>
        {description && <p className="mt-2 text-body leading-lead text-pretty text-fg-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/** A shell command on ink, as the brand sets its install line: a faint prompt, the command in mono, a copy key. */
export function Command({ command, wrap = false, className }: { command: string; wrap?: boolean; className?: string }) {
  return (
    <div className={cn("flex w-full items-center gap-3 rounded-panel border border-line bg-code py-1.5 pr-1.5 pl-4 shadow-code", className)}>
      <span aria-hidden className="font-mono text-body-sm text-fg-code-dim">
        $
      </span>
      <code className={cn("min-w-0 flex-1 py-1.5 text-left font-mono text-body-sm text-fg-code", wrap ? "break-all whitespace-normal" : "truncate")}>{command}</code>
      <CopyButton value={command} label="Copy command" dark />
    </div>
  );
}
