"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { DocsSearch, type SearchEntry } from "@www/components/docs-search";
import { Wordmark } from "@www/components/logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Overview", href: "/", current: (p: string) => p === "/" },
  { label: "Library", href: "/components", current: (p: string) => p.startsWith("/components") },
  { label: "Theme", href: "/theme", current: (p: string) => p.startsWith("/theme") },
];

// A link in the tray: 14px Inter in muted ink, a 5 percent wash on hover, blue where you are.
const LINK =
  "flex items-center rounded-menu px-3.5 py-2.25 text-body-sm leading-none whitespace-nowrap text-fg-muted outline-none transition-[background-color,color,scale] duration-150 ease-out hover:bg-wash-hover hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring active:scale-96 aria-[current=page]:text-fg-brand aria-[current=page]:hover:bg-transparent motion-reduce:transition-none";

// The blue key in its tray, sized to sit in the dock.
const KEY =
  "inline-flex items-center rounded-sm border border-line-brand-edge bg-primary px-3.5 py-2 text-body-sm leading-none whitespace-nowrap text-on-primary outline-none transition-[background-color,scale] duration-150 ease-out hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring active:scale-97 motion-reduce:transition-none";

/** The links as one segmented tray, with a white pill behind the current one that slides to the next (see .docs-lit). */
function NavPills({ pathname }: { pathname: string }) {
  const tray = React.useRef<HTMLDivElement>(null);
  const [pill, setPill] = React.useState<{ x: number; w: number; tray: number } | null>(null);
  const active = LINKS.findIndex((l) => l.current(pathname));

  React.useLayoutEffect(() => {
    const measure = () => {
      const el = tray.current?.querySelectorAll<HTMLElement>("a[data-link]")[active];
      setPill(el && tray.current ? { x: el.offsetLeft, w: el.offsetWidth, tray: tray.current.clientWidth } : null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (tray.current) ro.observe(tray.current);
    return () => ro.disconnect();
  }, [active]);

  return (
    <div ref={tray} className="docs-tray flex items-center gap-0.5">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} data-link aria-current={l.current(pathname) ? "page" : undefined} className={LINK}>
          {l.label}
        </Link>
      ))}
      {pill && (
        <div aria-hidden className="docs-lit-shadow">
          <div className="docs-lit" style={{ clipPath: `inset(3px ${pill.tray - pill.x - pill.w}px 3px ${pill.x}px round 5px)` }}>
            {LINKS.map((l) => (
              <span key={l.href} className={cn(LINK, "text-fg-brand")}>
                {l.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Phones: a menu key beside the action that drops a sheet of links under the header. Closes on a link or Escape. */
function MobileMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <div className="md:hidden">
      <button type="button" aria-expanded={open} aria-controls="docs-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)} className="docs-tray grid size-9.5 place-items-center text-fg outline-none focus-visible:outline-2 focus-visible:outline-focus-ring">
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path d={open ? "M4 4l10 10M14 4L4 14" : "M3 5.5h12M3 12.5h12"} className="stroke-current" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <nav id="docs-menu" aria-label="Main" hidden={!open} className="docs-sheet absolute inset-x-0 top-full flex-col border-b border-line bg-surface p-2 [&:not([hidden])]:flex">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)} aria-current={l.current(pathname) ? "page" : undefined} className="rounded-control px-3 py-3 text-body text-fg transition-[background-color] duration-150 ease-out hover:bg-blue-5 aria-[current=page]:text-fg-brand motion-reduce:transition-none">
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

/**
 * The docs' header, as the brand's site draws its own: no bar, three glass trays (the wordmark, the links, the
 * actions), fixed over the page. Once the page scrolls the trays drop 12px and the byline folds away; the trays travel
 * and stay on screen, so they take the in-out curve (250ms).
 */
export function Header({ name, repo, entries }: { name: string; repo: string; entries: SearchEntry[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setScrolled(window.scrollY > 8);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <div aria-hidden className="h-16" />
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
        <div className={cn("relative mx-auto grid h-16 w-(--ds-frame-column) grid-cols-[1fr_auto_1fr] items-center transition-transform duration-250 ease-in-out motion-reduce:transition-none max-md:grid-cols-[1fr_auto]", scrolled && "translate-y-3")}>
          <div className="pointer-events-auto w-max justify-self-start">
            <Link href="/" aria-label={`${name} design system, home`} className="docs-tray block px-3 pt-2.25 pb-2.75 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring">
              <Wordmark name={name} compact={scrolled} />
            </Link>
          </div>
          <nav aria-label="Main" className="pointer-events-auto max-md:hidden">
            <NavPills pathname={pathname} />
          </nav>
          <div className="pointer-events-auto flex w-max items-center gap-1.5 justify-self-end">
            <div className="docs-tray max-md:hidden">
              <DocsSearch entries={entries} tone="tray" />
            </div>
            <div className="docs-tray">
              <a href={repo} className={KEY}>
                GitHub
              </a>
            </div>
            <MobileMenu pathname={pathname} />
          </div>
        </div>
      </header>
    </>
  );
}
