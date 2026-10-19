import { cn } from "@/lib/utils";

/**
 * The brand's wordmark, typeset as the site sets it: the name in the display face at 17px and 500, tracked tight, with
 * "by Agentcard" beside it at 12px in muted ink. `compact` folds the byline away (the header does once the page
 * scrolls): its width and opacity close together, 250ms ease-out.
 */
export function Wordmark({ name, byline = "by Agentcard", compact = false, className }: { name: string; byline?: string | null; compact?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-baseline font-display leading-none", className)}>
      <span className="text-[17px] font-medium tracking-tight text-fg">{name}</span>
      {byline && (
        <span
          className={cn(
            "overflow-x-clip text-caption whitespace-nowrap text-fg-muted transition-[max-width,opacity,margin] duration-250 ease-out motion-reduce:transition-none max-sm:hidden",
            compact ? "ml-0 max-w-0 opacity-0" : "ml-1.5 max-w-25 opacity-100",
          )}
        >
          {byline}
        </span>
      )}
    </span>
  );
}

/** The mark: Agentcard's [*] drawn in white on a blue tile, as the site's icon. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-6", className)}>
      <rect width="32" height="32" rx="7" className="fill-brand" />
      <g fill="none" className="stroke-white" strokeWidth="2.4" strokeLinecap="square">
        <path d="M9.5 8.5H7.25v15H9.5M22.5 8.5h2.25v15H22.5" />
        <path d="M16 11v10M11.67 13.5l8.66 5M11.67 18.5l8.66-5" />
      </g>
    </svg>
  );
}
