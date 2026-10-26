# Team directory
Responsive directory of people with photos, roles and optional links.

Install: npx opencommerce-ds add team-directory
Requires: theme, window, utils
Packages: none
Exports: TeamDirectory, TeamPerson, TeamFooterCell, TeamDirectoryProps
Client boundary: not required by this entry file
Reference: Extension in the opencommerce site's voice (its windows, hairlines and mono labels; opencommerce-agentcard-web src/components/window.tsx); the grid from agentcard.sh/about


## Usage
Use for teams, advisors, investors or partners. Provide current names and links.
- Avoid: Color photos
- Avoid: Round avatars
- Avoid: Bold names
- Avoid: A colored window bar
- Avoid: Cards with gaps between people instead of the ruled grid
`TeamDirectory` props: `name` (the bar label: `team.dir`), `columns` (1 | 2 | 3,
default 2; one column on phones; two columns use 64px photos and 96px cells, three use 40px photos and 84px cells),
`people` (`{ name, role?, photo?, photoAlt?, href? }`: `photo` is an image URL or any node, shown in grayscale; `href`
makes the cell a link with the arrow), `footer` (`{ logo?, label?, href?, ariaLabel? }[]`, two to a row).

A linked cell takes the mist under the pointer and its arrow turns blue (160ms, ease-out); nothing moves.

## Examples
Example components: npx opencommerce-ds add team-directory
[Site](https://opencommerce-ds.vercel.app/preview/team-directory/Site)

examples/team-directory.tsx

```tsx
import { TeamDirectory } from "@/components/site/team-directory";

// A neutral stand-in for a photo: initials on a pale block (the directory grays it as it does a photo).
function Initials({ name }: { name: string }) {
  const letters = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <span role="img" aria-label={`Photo of ${name}`} className="flex items-center justify-center bg-tint font-display text-body-sm text-fg-brand">
      {letters}
    </span>
  );
}

const TEAM = [
  { name: "Ada Okafor", role: "CEO & Co-Founder" },
  { name: "Luis Romero", role: "CTO & Co-Founder" },
  { name: "Mara Lindqvist", role: "Member of Technical Staff" },
  { name: "Noor Haddad", role: "Member of Marketing Staff" },
];

const INVESTORS = [
  ["Priya Raman", "Co-founder, a fund"],
  ["Tom Becker", "CEO, a commerce platform"],
  ["Elena Ruiz", "CTO, a CRM"],
  ["Sam Wu", "CEO, an auth company"],
  ["Jonas Berg", "CEO, a cloud"],
  ["Ines Duarte", "Board, an AI lab"],
  ["Kofi Mensah", "CEO, a delivery app"],
  ["Hana Sato", "Design, a device maker"],
  ["Ravi Patel", "Payments"],
];

function YMark() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden className="block size-10 flex-none">
      <rect width="40" height="40" className="fill-brand" />
      <path d="M13 11l7 11 7-11M20 22v8" className="fill-none stroke-white" strokeWidth="3" />
    </svg>
  );
}

export function Site() {
  return (
    <div className="mx-auto grid max-w-(--ds-layout-text) gap-16 px-5 py-16 sm:px-0">
      <section aria-labelledby="team">
        <h2 id="team" className="mb-3.5 font-display text-caption font-normal text-fg-brand">
          Team
        </h2>
        <TeamDirectory name="team.dir" columns={2} people={TEAM.map((p) => ({ ...p, photo: <Initials name={p.name} /> }))} />
        <p className="mt-4 text-body-sm text-fg-muted">
          We are not hiring, but you can always send us an{" "}
          <a href="mailto:support@agentcard.sh" className="text-fg-brand underline underline-offset-3">
            email
          </a>
          .
        </p>
      </section>
      <section aria-labelledby="investors">
        <h2 id="investors" className="mb-3.5 font-display text-caption font-normal text-fg-brand">
          Investors
        </h2>
        <TeamDirectory
          name="investors.dir"
          columns={3}
          people={INVESTORS.map(([name, role]) => ({ name, role, photo: <Initials name={name} /> }))}
          footer={[
            { logo: <YMark />, label: "Backed by an accelerator" },
            { logo: <span className="font-display text-h5 tracking-mark text-fg">NORTHFUND</span>, ariaLabel: "North Fund" },
          ]}
        />
      </section>
    </div>
  );
}

```

## Source

components/site/team-directory.tsx

```tsx
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

```
