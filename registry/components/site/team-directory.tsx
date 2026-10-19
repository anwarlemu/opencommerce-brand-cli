import * as React from "react";

import { Window } from "@/components/ui/window";
import { cn } from "@/lib/utils";

// A team or investors directory, in the home page's windows: a window holding a grid of people ruled by hairlines.
// Each cell is a gray photo, the name in the display face and the role in the small muted mono; a cell that links out
// carries a blue arrow in its top right corner (it never moves) and takes the mist under the pointer. Two to a row with
// larger photos, three with smaller; the backers can close it as a two-column row of logos. One column on phones.

type Person = {
  name: React.ReactNode;
  role?: React.ReactNode;
  /** A photo: an image URL, or any node (an <img>, a Next Image). Shown in grayscale. */
  photo?: React.ReactNode | string;
  /** Alt text when `photo` is a URL; defaults to "Photo of <name>" when the name is a string. */
  photoAlt?: string;
  /** Makes the cell a link (opens in a new tab) with the arrow. */
  href?: string;
};

type FooterCell = {
  /** A logo or mark (an <img>, an inline SVG), shown as given. */
  logo?: React.ReactNode;
  /** Text beside the logo (Backed by Y Combinator), in muted body type. */
  label?: React.ReactNode;
  href?: string;
  /** The link's accessible name when the cell has only a logo. */
  ariaLabel?: string;
};

const COLUMNS = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" } as const;

/** White cells that finish a short last row, so the ruled grid never shows its line color as a gray block. */
function Fill({ count, columns }: { count: number; columns: number }) {
  const left = (columns - (count % columns)) % columns;
  return Array.from({ length: left }, (_, i) => <li key={`fill-${i}`} aria-hidden className="hidden bg-surface sm:block" />);
}

/** The outbound arrow in a link cell's corner. */
function Go() {
  return (
    <span
      aria-hidden
      className="absolute top-3 right-3.5 font-sans text-body-sm leading-none text-fg-faint transition-colors duration-(--ds-duration-fast) ease-out group-hover/cell:text-fg-brand motion-reduce:transition-none"
    >
      ↗
    </span>
  );
}

function Cell({ href, ariaLabel, large, className, children }: { href?: string; ariaLabel?: string; large?: boolean; className?: string; children: React.ReactNode }) {
  const box = cn("relative flex flex-1 items-center gap-3.5 p-4 text-inherit no-underline", large ? "min-h-18 sm:min-h-24" : "min-h-18 sm:min-h-21", className);
  return (
    <li className="flex bg-surface">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={ariaLabel}
          className={cn(
            box,
            "group/cell pr-9 outline-none transition-[background-color] duration-150 ease-out hover:bg-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring motion-reduce:transition-none",
          )}
        >
          {children}
          <Go />
        </a>
      ) : (
        <div className={box}>{children}</div>
      )}
    </li>
  );
}

function Photo({ photo, alt, large }: { photo: Person["photo"]; alt: string; large?: boolean }) {
  const size = large ? "size-16" : "size-10";
  if (typeof photo === "string") return <img src={photo} alt={alt} width={large ? 64 : 40} height={large ? 64 : 40} className={cn("block flex-none object-cover grayscale", size)} />;
  return <span className={cn("block flex-none overflow-hidden grayscale [&>*]:size-full [&_img]:object-cover", size)}>{photo}</span>;
}

type TeamDirectoryProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** The window bar's label (team.dir, investors.dir). */
  name: React.ReactNode;
  /** People per row from the small breakpoint up; one on phones. Two cells larger photos (64px), three smaller (40px). */
  columns?: 1 | 2 | 3;
  people: Person[];
  /** The last row: backers' logos and names, two to a row. */
  footer?: FooterCell[];
};

function TeamDirectory({ name, columns = 2, people, footer, className, ...props }: TeamDirectoryProps) {
  const large = columns <= 2;
  return (
    <Window name={name} className={className} bodyClassName="overflow-hidden" {...props}>
      <ul className={cn("m-0 grid list-none grid-cols-1 gap-px bg-line p-0", COLUMNS[columns])}>
        {people.map((p, i) => {
          const alt = p.photoAlt ?? (typeof p.name === "string" ? `Photo of ${p.name}` : "");
          return (
            <Cell key={i} href={p.href} large={large}>
              {p.photo ? <Photo photo={p.photo} alt={alt} large={large} /> : null}
              <span className="grid min-w-0 gap-1">
                <b className="font-display text-body leading-snug font-medium">{p.name}</b>
                {p.role ? <span className="font-mono text-caption leading-4 text-fg-muted">{p.role}</span> : null}
              </span>
            </Cell>
          );
        })}
        <Fill count={people.length} columns={columns} />
      </ul>
      {footer?.length ? (
        <ul className="m-0 grid list-none grid-cols-1 gap-px border-t border-line bg-line p-0 sm:grid-cols-2">
          {footer.map((f, i) => (
            <Cell key={i} href={f.href} ariaLabel={f.ariaLabel} className="[&_img]:block [&_img]:h-auto [&_img]:max-h-10 [&_img]:w-auto">
              {f.logo}
              {f.label ? <span className="text-body text-fg-muted">{f.label}</span> : null}
            </Cell>
          ))}
          <Fill count={footer.length} columns={2} />
        </ul>
      ) : null}
    </Window>
  );
}

export { TeamDirectory };
export type { Person as TeamPerson, FooterCell as TeamFooterCell, TeamDirectoryProps };
