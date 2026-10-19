import Link from "next/link";

type Neighbor = { name: string; title: string };

/** The article's foot: the previous and next pages as white cards, the direction in the blue mono label. */
export function Pager({ prev, next }: { prev?: Neighbor; next?: Neighbor }) {
  if (!prev && !next) return null;
  const card = "group/pager grid gap-1 rounded-panel border border-line-window bg-surface px-5 py-4 shadow-card outline-none transition-[background-color] duration-150 ease-out hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none";
  return (
    <nav aria-label="More in the library" className="grid gap-4 border-t border-line pt-10 sm:grid-cols-2">
      {prev ? (
        <Link href={`/components/${prev.name}`} className={card}>
          <span className="font-mono text-caption text-fg-label">← Previous</span>
          <span className="font-display text-body font-medium">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={`/components/${next.name}`} className={`${card} text-right`}>
          <span className="font-mono text-caption text-fg-label">Next →</span>
          <span className="font-display text-body font-medium">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
