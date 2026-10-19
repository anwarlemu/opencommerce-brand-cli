"use client";

import * as React from "react";

import { Wordmark } from "@www/components/logo";

type Group = { title: string; links: { label: string; href: string; external?: boolean }[] };

/**
 * The name set large along the footer's foot: a faint outline, and, while the pointer is over it, a spotlight that
 * follows the pointer and draws the letters under it in blue. The pointer only writes two properties (--x, --y).
 */
function BigWordmark({ name }: { name: string }) {
  const ref = React.useRef<HTMLParagraphElement>(null);
  const track = (e: React.PointerEvent<HTMLParagraphElement>) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return (
    <p
      ref={ref}
      aria-hidden
      onPointerEnter={track}
      onPointerMove={track}
      className="docs-wordmark relative -mt-[0.04em] overflow-x-clip text-center font-display text-[clamp(56px,13.2vw,200px)] leading-[0.78] font-medium tracking-display whitespace-nowrap select-none"
    >
      <span className="docs-wordmark-outline block pb-[0.3em]">{name}</span>
      <span className="docs-wordmark-glow absolute inset-0">{name}</span>
    </p>
  );
}

/**
 * The docs' footer, as the brand's site closes: on the page's own white under a hairline, the wordmark and a line
 * about it, the link columns at the right, the small print, and the name set large along the bottom edge.
 */
export function Footer({ name, repo, site }: { name: string; repo: string; site: string }) {
  const groups: Group[] = [
    { title: "Library", links: [{ label: "Components", href: "/components#components" }, { label: "Sections", href: "/components#site" }, { label: "Pages", href: "/components#blocks" }, { label: "Visuals", href: "/components#visuals" }] },
    { title: "Reference", links: [{ label: "Theme", href: "/theme" }, { label: "Agent guide", href: "/agents.md" }, { label: "Text reference", href: "/llms.txt" }, { label: "Registry index", href: "/r/index.json" }] },
    { title: name, links: [{ label: "Website", href: site, external: true }, { label: "GitHub", href: repo, external: true }] },
  ];
  return (
    <footer id="docs-footer" className="border-t border-line">
      <div className="mx-auto w-(--ds-frame-column)">
        <div className="flex flex-col gap-10 py-14 md:flex-row md:justify-between">
          <div>
            <Wordmark name={name} />
            <p className="mt-4 max-w-xs text-body-sm leading-relaxed text-fg-muted">Components, tokens and guidance for building {name} pages.</p>
          </div>
          <div className="grid grid-cols-3 gap-x-6 md:gap-x-16 lg:gap-x-24">
            {groups.map((g) => (
              <nav key={g.title} aria-label={g.title === name ? `${name} links` : g.title}>
                <h2 className="font-display text-[13px] font-medium tracking-normal">{g.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {g.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})} className="rounded-sm text-body-sm text-fg-muted outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-focus-ring motion-reduce:transition-none">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-line py-5 text-caption text-fg-muted">
          <span>© {new Date().getFullYear()} Agentcard, Inc.</span>
        </div>
      </div>
      <BigWordmark name={name} />
    </footer>
  );
}
