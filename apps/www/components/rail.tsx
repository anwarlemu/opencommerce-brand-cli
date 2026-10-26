"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DocsSearch } from "@www/components/docs-search";
import { Mark, Wordmark } from "@www/components/logo";

type Group = { id: string; label: string; items: { name: string; title: string }[] };

// A row of the rail: 14px Inter in muted ink in a 6px-cornered row, a 5 percent wash on hover; the current page is the
// pale blue row with blue text, as the brand highlights the step you are on. Nothing moves.
const ROW =
  "flex items-center rounded-card px-2.5 py-1.5 text-body-sm leading-snug text-fg-muted outline-none transition-[background-color,color] duration-150 ease-out hover:bg-wash-hover hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring aria-[current=page]:bg-blue-5 aria-[current=page]:text-fg-brand motion-reduce:transition-none";

// A group's label: the brand's blue mono label, as it marks a section.
const LABEL = "mb-1.5 px-2.5 font-mono text-caption text-fg-label";

const PAGES = [
  { href: "/", label: "Introduction" },
  { href: "/components", label: "All components" },
  { href: "/theme", label: "Theme" },
];

function List({ groups, query, onNavigate }: { groups: Group[]; query: string; onNavigate: () => void }) {
  const pathname = usePathname();
  const q = query.trim().toLowerCase();
  const shown = groups.map((g) => ({ ...g, items: q ? g.items.filter((i) => i.title.toLowerCase().includes(q) || i.name.includes(q)) : g.items })).filter((g) => g.items.length);
  return (
    <>
      {!q && (
        <div>
          <p className={LABEL}>Docs</p>
          <ul className="grid gap-0.5">
            {PAGES.map((p) => (
              <li key={p.href}>
                <Link href={p.href} onNavigate={onNavigate} aria-current={pathname === p.href ? "page" : undefined} className={ROW}>
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {shown.length ? (
        shown.map((g) => (
          <div key={g.id}>
            <p className={LABEL}>{g.label}</p>
            <ul className="grid gap-0.5">
              {g.items.map((i) => {
                const href = `/components/${i.name}`;
                return (
                  <li key={i.name}>
                    <Link href={href} scroll={false} onNavigate={onNavigate} data-item={i.name} aria-current={pathname === href ? "page" : undefined} className={ROW}>
                      {i.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      ) : (
        <p className="px-2.5 text-body-sm text-fg-muted">Nothing matches.</p>
      )}
    </>
  );
}

/**
 * The docs' rail, beside every page: the wordmark, the filter, the docs pages and every item grouped as the library
 * groups them, each group A to Z, then the search, the repository and the site at its foot. It stays mounted between
 * pages, so it keeps its scroll and filter. From 1024px it is a white column with a hairline at its edge, as tall as
 * the window; below that it folds into a bar at the top of the page whose menu key opens it over the page.
 */
export function DocsRail({ groups, name, repo, site }: { groups: Group[]; name: string; repo: string; site: string }) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);
  const entries = [
    ...groups.flatMap((g) => g.items.map((i) => ({ name: i.name, title: i.title, group: g.label, href: `/components/${i.name}` }))),
    { name: "theme", title: "Theme", group: "Docs", href: "/theme" },
  ];

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const home = (
    <Link href="/" onNavigate={close} aria-label={`${name} design system`} className="flex w-fit items-center gap-2 rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring">
      <Mark className="size-5.5" />
      <Wordmark name={name} />
    </Link>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
        {home}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="docs-rail"
          aria-label={open ? "Close the library" : "Open the library"}
          onClick={() => setOpen((o) => !o)}
          className="grid size-9.5 place-items-center rounded-control border border-line bg-surface text-fg outline-none transition-colors duration-150 ease-out hover:bg-wash-hover focus-visible:outline-2 focus-visible:outline-focus-ring motion-reduce:transition-none"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d={open ? "M4 4l10 10M14 4L4 14" : "M3 5.5h12M3 12.5h12"} className="stroke-current" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <nav
        id="docs-rail"
        aria-label="Library"
        className={cn(
          "z-20 flex-col border-r border-line bg-surface max-lg:fixed max-lg:inset-x-0 max-lg:top-14 max-lg:bottom-0 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-72 lg:shrink-0",
          open ? "flex" : "hidden",
        )}
      >
        <div className="hidden px-5 pt-5 pb-4 lg:block">{home}</div>
        <div className="px-3 pt-3 pb-3 lg:pt-0">
          <Input variant="search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter components" aria-label="Filter components" />
        </div>
        <div className="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto overscroll-contain px-3 pt-1 pb-6 [scrollbar-width:thin]">
          <List groups={groups} query={query} onNavigate={close} />
        </div>
        <div className="grid gap-1 border-t border-line px-3 py-3">
          <DocsSearch entries={entries} tone="tray" className="w-full" />
          <div className="flex flex-wrap items-center gap-x-1">
            <a href={repo} target="_blank" rel="noreferrer" className={cn(ROW, "whitespace-nowrap")}>
              GitHub
            </a>
            <a href={site} target="_blank" rel="noreferrer" className={cn(ROW, "whitespace-nowrap")}>
              Website
            </a>
            <a href="/agents.md" className={cn(ROW, "whitespace-nowrap")}>
              Agent guide
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
