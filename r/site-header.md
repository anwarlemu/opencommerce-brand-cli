# Site header
Fixed header of three glass trays: the wordmark, the links with their pill, and one blue key.

Install: npx opencommerce-ds add site-header
Requires: theme, nav-dock, utils
Packages: none
Exports: SiteHeader, HeaderLink
Client boundary: yes
Reference: opencommerce-agentcard-web src/components/site-header.tsx, src/components/logo.tsx, src/components/mobile-nav.tsx, src/app/globals.css (.nav-tray, .nav-cta, .mobile-sheet)


## Usage
Use once at the top of every page with the page's sections as links (#features) and the main action. Set fixed={false} inside a frame or preview.
- Avoid: A filled header bar
- Avoid: More than one key
- Avoid: A white key in the header
- Avoid: A sticky header (fixed with a spacer instead)
- Avoid: Many links in the header
`SiteHeader` props: `name` (default "opencommerce"), `byline` (default "by Agentcard"), `logo` (your own, in place
of the wordmark), `href` (default "#top"), `logoLabel`, `links` ({ label, href, current }[]), `action` ({ label,
href }), `spy` (default true), `fixed` (default true), plus header props.

Motion: once the page scrolls the trays drop 12px and slide together (250ms, in-out) and the byline folds (250ms
ease-out); the phone sheet drops 6px in as it opens (200ms ease-out) and closes at once. Reduced motion keeps only the
fades.

## Examples
Example components: npx opencommerce-ds add site-header
[Site](https://opencommerce-ds.vercel.app/preview/site-header/Site)

examples/site-header.tsx

```tsx
import { SiteHeader } from "@/components/site/site-header";

const LINKS = [
  { label: "Home", href: "#top" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Docs", href: "https://docs.agentcard.sh" },
];

export function Site() {
  return (
    <div className="min-h-40 bg-surface pt-4">
      <SiteHeader fixed={false} links={LINKS} action={{ label: "Get started", href: "https://app.agentcard.sh" }} />
    </div>
  );
}

```

## Source

components/site/site-header.tsx

```tsx
"use client";

import * as React from "react";

import { NavDock, TRAY, type DockLink } from "@/components/site/nav-dock";
import { cn } from "@/lib/utils";

// The header (the opencommerce site, site-header.tsx): no bar behind it, three trays of frosted glass, each its own
// pane: the wordmark, the links (NavDock, with its lit pill) and the one blue key. At the top of the page the links sit
// dead center and the wordmark and the key hold the ends of the column. Once the page scrolls, the trays drop 12px, the
// byline folds away, and the wordmark and the key slide in to sit 6px from the links. The slide is a transform measured
// off the layout, so nothing reflows, and it takes the in-out curve (250ms) because the trays travel and stay on screen.
// Fixed, with a spacer holding its place: a sticky header makes the browser redo the glass's blur on every scroll frame.
// On a phone the links leave for a menu button beside the key, which drops a sheet of links under the header.

type HeaderLink = DockLink;

const GAP = 6;
const SLIDE = "transition-transform duration-(--ds-duration-moderate) ease-in-out motion-reduce:transition-none";

function Wordmark({ name, byline, compact }: { name: React.ReactNode; byline?: React.ReactNode; compact: boolean }) {
  return (
    <span className="flex items-baseline font-display leading-none">
      <span data-wordmark-name="" className="text-h5 font-medium tracking-tight">
        {name}
      </span>
      {byline && (
        <span
          className={cn(
            "overflow-x-clip text-caption whitespace-nowrap text-fg-muted transition-[max-width,opacity,margin] duration-(--ds-duration-moderate) ease-out motion-reduce:transition-none max-sm:hidden",
            compact ? "ml-0 max-w-0 opacity-0" : "ml-1.5 max-w-25 opacity-100",
          )}
        >
          {byline}
        </span>
      )}
    </span>
  );
}

function SiteHeader({
  name = "opencommerce",
  byline = "by Agentcard",
  logo,
  href = "#top",
  logoLabel,
  links = [],
  action,
  spy = true,
  fixed = true,
  className,
  ...props
}: Omit<React.ComponentProps<"header">, "children"> & {
  /** The wordmark's name and the byline beside it (folds away once the page scrolls). */
  name?: React.ReactNode;
  byline?: React.ReactNode;
  /** Your own logo in place of the wordmark. */
  logo?: React.ReactNode;
  /** Where the logo leads. */
  href?: string;
  /** The logo link's accessible name. */
  logoLabel?: string;
  /** The links in the middle tray. */
  links?: HeaderLink[];
  /** The one key at the right. */
  action?: { label: React.ReactNode; href: string };
  /** The links' pill follows the section in view. */
  spy?: boolean;
  /** Fixed to the top of the screen, with a spacer in the flow. Off: in the flow (previews, a page in a frame). */
  fixed?: boolean;
}) {
  const [scrolled, setScrolled] = React.useState(false);
  const [shift, setShift] = React.useState({ logo: 0, go: 0 });
  const [open, setOpen] = React.useState(false);
  const logoCell = React.useRef<HTMLDivElement>(null);
  const navCell = React.useRef<HTMLDivElement>(null);
  const goCell = React.useRef<HTMLDivElement>(null);
  const sheetId = React.useId();

  // Read the scroll once per frame, not on every event.
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

  // The cells are never transformed (their trays are), so the shift is read straight off them. The wordmark is aimed
  // at the width it will settle at (its name plus the tray's padding and border), not its live width, which shrinks
  // every frame while the byline folds.
  React.useLayoutEffect(() => {
    const measure = () => {
      const nav = navCell.current?.getBoundingClientRect();
      const logoBox = logoCell.current?.getBoundingClientRect();
      const go = goCell.current?.getBoundingClientRect();
      const trayEl = logoCell.current?.firstElementChild as HTMLElement | null;
      const nameEl = trayEl?.querySelector<HTMLElement>("[data-wordmark-name]") ?? trayEl?.firstElementChild?.firstElementChild as HTMLElement | null;
      let next = { logo: 0, go: 0 };
      if (scrolled && nav?.width && logoBox && go && trayEl && nameEl) {
        const cs = getComputedStyle(trayEl);
        const edges = ["paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth"] as const;
        const right = logoBox.left + nameEl.offsetWidth + edges.reduce((sum, k) => sum + parseFloat(cs[k]), 0);
        next = { logo: Math.round(nav.left - GAP - right), go: Math.round(nav.right + GAP - go.left) };
      }
      setShift((prev) => (prev.logo === next.logo && prev.go === next.go ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    [logoCell, navCell, goCell].forEach((r) => r.current && ro.observe(r.current));
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [scrolled]);

  // The phone sheet closes on Escape and when the screen grows past the breakpoint.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const wide = window.matchMedia("(min-width: 48rem)");
    const onWide = () => wide.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const bar = (
    <header
      data-slot="site-header"
      className={cn("pointer-events-none z-40", fixed ? "fixed inset-x-0 top-0" : "relative", className)}
      {...props}
    >
      <div
        className={cn(
          "relative mx-auto grid h-(--ds-layout-header) w-(--ds-frame-column) grid-cols-[1fr_auto_1fr] items-center max-md:grid-cols-[1fr_auto]",
          SLIDE,
          scrolled && "translate-y-3",
        )}
      >
        <div ref={logoCell} className="pointer-events-auto w-max justify-self-start">
          <div className={cn(TRAY, "px-3 pt-2.25 pb-2.75", SLIDE)} style={{ transform: `translateX(${shift.logo}px)` }}>
            <a href={href} aria-label={logoLabel} className="block rounded-chip outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-solid focus-visible:outline-focus-ring">
              {logo ?? <Wordmark name={name} byline={byline} compact={scrolled} />}
            </a>
          </div>
        </div>
        <div ref={navCell} className="pointer-events-auto max-md:hidden">
          {links.length > 0 && <NavDock links={links} spy={spy} />}
        </div>
        <div ref={goCell} className="pointer-events-auto w-max justify-self-end">
          {/* No transform at rest: any transform makes this the box the phone sheet is laid out in. */}
          <div className={cn("flex items-center gap-1.5", SLIDE)} style={shift.go ? { transform: `translateX(${shift.go}px)` } : undefined}>
            {action && (
              <div className={cn(TRAY, "p-0.75")}>
                <a
                  href={action.href}
                  className="inline-flex items-center rounded-sm border border-line-brand-edge bg-primary px-3.5 py-2 text-body-sm leading-none whitespace-nowrap text-on-primary outline-none transition-[background-color,scale] duration-(--ds-duration-fast) ease-out hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring active:scale-97 motion-reduce:transition-none motion-reduce:active:scale-100"
                >
                  {action.label}
                </a>
              </div>
            )}
            {links.length > 0 && (
              <button
                type="button"
                aria-expanded={open}
                aria-controls={sheetId}
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((o) => !o)}
                className={cn(TRAY, "flex size-9.5 items-center justify-center text-fg outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring md:hidden")}
              >
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden className="stroke-current [stroke-linecap:round] [stroke-width:1.5]">
                  {open ? <path d="M4 4l10 10M14 4L4 14" /> : <path d="M3 5.5h12M3 12.5h12" />}
                </svg>
              </button>
            )}
          </div>
        </div>
        {links.length > 0 && (
          <nav
            id={sheetId}
            aria-label="Main"
            hidden={!open}
            className="pointer-events-auto absolute inset-x-0 top-full flex-col border-b border-line bg-surface p-2 transition-[opacity,translate] duration-(--ds-duration-base) ease-out [&:not([hidden])]:flex starting:-translate-y-1.5 starting:opacity-0 motion-reduce:transition-opacity md:hidden"
          >
            {links.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-control px-3 py-3 text-button text-fg outline-none transition-colors duration-(--ds-duration-fast) ease-out hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-solid focus-visible:outline-focus-ring"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );

  return fixed ? (
    <>
      <div aria-hidden className="h-(--ds-layout-header)" />
      {bar}
    </>
  ) : (
    bar
  );
}

export { SiteHeader };
export type { HeaderLink };

```
