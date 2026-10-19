"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// The header's links (the opencommerce site, nav-pills.tsx and .nav-tray): one tray of frosted glass, mostly white with
// a breath of ink over a heavy blur, a hairline and a lit top edge, flat on the page. Its links are 14px muted labels
// that wash on hover and give a little when pressed. A white pill marks where you are: a second copy of the links, lit
// (white ground, blue text), laid exactly over the real ones and clipped down to the current one. Only the clip moves
// (250ms, the in-out curve, since the pill travels and stays on screen), so the pill and its blue text travel as one
// piece and nothing is laid out again. The copy is decoration: hidden from readers, never focused or clicked.
//
// With `spy` (the default), the pill follows the section you are reading: the last linked section whose top has passed
// under the header. Links that leave the page never take the pill. Without `spy`, the link marked `current` takes it.
// The glass is its own layer behind the links: a backdrop blur that holds moving content rebuilds every frame.

type DockLink = { label: string; href: string; current?: boolean };

/** The frosted glass every tray of the header is made of, drawn on a layer behind the tray's contents. */
const TRAY =
  "relative isolate rounded-control border border-transparent before:pointer-events-none before:absolute before:-inset-px before:-z-10 before:rounded-[inherit] before:border before:border-line-glass before:bg-glass before:bg-(image:--ds-glass-sheen) before:shadow-glass before:[backdrop-filter:var(--ds-glass-blur)]";

const LINK =
  "relative flex items-center rounded-menu px-3.5 py-2.25 text-body-sm leading-none whitespace-nowrap text-fg-muted outline-none transition-[background-color,color,scale] duration-(--ds-duration-fast) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring active:scale-96 motion-reduce:transition-none motion-reduce:active:scale-100";

type NavDockProps = Omit<React.ComponentProps<"nav">, "children"> & {
  links: DockLink[];
  /** Follow the section in view (links to #ids). Off: the link marked current takes the pill. */
  spy?: boolean;
  /** Where the header's foot sits, in px from the top: a section counts as read once its top passes it. */
  spyLine?: number;
  /** The landmark's name. */
  label?: string;
};

function NavDock({ links, spy = true, spyLine = 120, label = "Main", className, ...props }: NavDockProps) {
  const initial = links.find((l) => l.current)?.href ?? links[0]?.href ?? "";
  const [active, setActive] = React.useState(initial);
  const [pill, setPill] = React.useState<{ x: number; w: number; tray: number } | null>(null);
  const tray = React.useRef<HTMLDivElement>(null);

  // Scroll spy, read once per frame at most: each read forces layout.
  React.useEffect(() => {
    if (!spy) return;
    const ids = links.map((l) => l.href).filter((h) => /^#.+/.test(h));
    if (!ids.length) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      let current = links[0]?.href ?? "";
      for (const id of ids) {
        const el = document.getElementById(id.slice(1));
        if (el && el.getBoundingClientRect().top <= spyLine) current = id;
      }
      setActive(current);
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
  }, [spy, spyLine, links]);

  // Measure the active link so the pill can slide to it.
  React.useLayoutEffect(() => {
    const measure = () => {
      const el = tray.current?.querySelector<HTMLElement>(`a[data-href="${CSS.escape(active)}"]`);
      if (el && tray.current) setPill({ x: el.offsetLeft, w: el.offsetWidth, tray: tray.current.clientWidth });
      else setPill(null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (tray.current) ro.observe(tray.current);
    return () => ro.disconnect();
  }, [active]);

  return (
    <nav data-slot="nav-dock" aria-label={label} className={className} {...props}>
      <div ref={tray} className={cn(TRAY, "flex items-center gap-0.5 p-0.75")}>
        {links.map((link) => (
          <a
            key={link.href + link.label}
            href={link.href}
            data-href={link.href}
            aria-current={link.href === active ? (spy && link.href.startsWith("#") ? "location" : "page") : undefined}
            className={cn(LINK, "hover:bg-wash-hover hover:text-fg aria-[current]:text-fg-brand aria-[current]:hover:bg-transparent")}
          >
            {link.label}
          </a>
        ))}
        {pill && (
          <div aria-hidden className="pointer-events-none absolute inset-0 [filter:drop-shadow(0_0_0.5px_color-mix(in_srgb,var(--ds-color-ink)_22%,transparent))_drop-shadow(0_1px_1.5px_color-mix(in_srgb,var(--ds-color-ink)_14%,transparent))]">
            <div
              className="absolute inset-0 flex items-center gap-0.5 bg-surface p-0.75 transition-[clip-path] duration-(--ds-duration-moderate) ease-in-out motion-reduce:transition-none"
              style={{ clipPath: `inset(3px ${pill.tray - pill.x - pill.w}px 3px ${pill.x}px round 5px)` }}
            >
              {links.map((link) => (
                <span key={link.href + link.label} className={cn(LINK, "text-fg-brand")}>
                  {link.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export { NavDock, TRAY };
export type { DockLink, NavDockProps };
