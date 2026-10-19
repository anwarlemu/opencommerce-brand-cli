import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

/**
 * A docs page's opening, as the brand's site opens a section: the 48px display title, tracked tight, and a 16px lead
 * in muted ink under it, then whatever acts on it (the install command). Centered for the index pages.
 */
export function PageIntro({ eyebrow, title, lead, align = "center", children, className }: { eyebrow?: React.ReactNode; title: React.ReactNode; lead?: React.ReactNode; align?: "center" | "start"; children?: React.ReactNode; className?: string }) {
  const centered = align === "center";
  return (
    <div className={cn("flex flex-col", centered ? "items-center text-center" : "items-start", className)}>
      {eyebrow && <p className="mb-3 font-mono text-caption text-fg-brand">{eyebrow}</p>}
      <h1 className="font-display text-h1 leading-heading font-medium tracking-hero text-balance">{title}</h1>
      {lead && <p className={cn("mt-4 max-w-(--ds-layout-text) text-body leading-lead text-pretty text-fg-muted", centered && "mx-auto")}>{lead}</p>}
      {children && <div className={cn("mt-10 w-full", centered && "flex justify-center")}>{children}</div>}
    </div>
  );
}

/** A block of a docs page: its heading (centered, with its description under it, as the brand's sections), then its content. */
export function Block({ id, title, description, align = "center", children, className }: { id?: string; title: React.ReactNode; description?: React.ReactNode; align?: "center" | "start"; children: React.ReactNode; className?: string }) {
  const centered = align === "center";
  return (
    <section id={id} className={cn("scroll-mt-24", className)}>
      <div className={cn(centered ? "mx-auto max-w-(--ds-layout-heading) text-center" : "", "mb-12 md:mb-14")}>
        <h2 className={cn("font-display font-medium text-balance", centered ? "text-h2 leading-display tracking-tighter" : "text-h3 leading-display tracking-tight")}>{title}</h2>
        {description && <p className={cn("mt-4 text-pretty text-fg-muted", centered ? "mx-auto max-w-(--ds-layout-text) text-body leading-lead" : "text-body")}>{description}</p>}
      </div>
      {children}
    </section>
  );
}

/** A shell command on ink, as the brand sets its install line: a faint prompt, the command in mono, a copy key. */
export function Command({ command, wrap = false, className }: { command: string; wrap?: boolean; className?: string }) {
  return (
    <div className={cn("flex w-full max-w-2xl items-center gap-3 rounded-panel border border-line bg-code py-1.5 pr-1.5 pl-4 shadow-code", className)}>
      <span aria-hidden className="font-mono text-body-sm text-fg-code-dim">
        $
      </span>
      <code className={cn("min-w-0 flex-1 py-1.5 text-left font-mono text-body-sm text-fg-code", wrap ? "break-all whitespace-normal" : "truncate")}>{command}</code>
      <CopyButton value={command} label="Copy command" dark />
    </div>
  );
}

/** The docs' page column: the content column with air above and below, as the brand spaces its sections (120px). */
export function Page({ className, children }: { className?: string; children: React.ReactNode }) {
  return <main className={cn("mx-auto grid w-(--ds-frame-column) grid-cols-[minmax(0,1fr)] gap-24 pt-16 pb-30 md:gap-30 md:pt-20", className)}>{children}</main>;
}
