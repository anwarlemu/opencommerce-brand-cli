# Feature rows
Features as windows two to a row (picture, title, line), or one to a row beside their window; pictures play when first seen.

Install: npx opencommerce-ds add feature-rows
Requires: theme, window, utils
Packages: none
Exports: FeatureGrid, FeatureRows, FeatureTag, Feature
Client boundary: yes
Reference: opencommerce-agentcard-web src/components/features.tsx, src/components/feature-play.tsx, src/app/globals.css (THE FEATURE PICTURES)


## Usage
Use FeatureGrid for the home page's four features in a medium SiteSection, FeatureRows for a product page that needs more room. Draw each picture from the page's own parts and key its motion off group-data-[state=…]/feature.
- Avoid: Icons in place of pictures
- Avoid: Stock photos
- Avoid: More than one blue voice in a picture
- Avoid: Pictures that loop
- Avoid: A move that does not end on the finished frame
- Avoid: More than six features in the grid
`FeatureGrid` and `FeatureRows` take `features` ({ title, description, media, file, tags }[]) plus list props.
`FeatureTag` is the small mono tag (FeatureRows shows `tags` with it).

A picture's motion: the card's `data-state` is absent (the finished frame: the server render and reduced motion),
`idle` (the opening frame) or `play` (the move). Write the finished frame as the default, the opening frame under
`group-data-[state=idle]/feature:` and the move under `group-data-[state=play]/feature:` with fill-mode backwards, so
each piece holds its opening frame through its delay. Keep moves at 300ms or less each, ease-out; a sequence may
stagger them (30 to 80ms apart).

## Examples
Example components: npx opencommerce-ds add feature-rows
[Site](https://opencommerce-ds.vercel.app/preview/feature-rows/Site) | [Rows](https://opencommerce-ds.vercel.app/preview/feature-rows/Rows)

examples/feature-rows.tsx

```tsx
import { FeatureGrid, FeatureRows } from "@/components/site/feature-rows";

// Thirty days drawn in left to right when the card is first seen; the one rough day stays pale.
function Uptime() {
  return (
    <div aria-hidden className="w-full max-w-75 font-mono text-snippet">
      <div className="flex items-baseline justify-between text-fg-muted">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-brand" />
          Uptime
        </span>
        <span className="text-fg">99.9%</span>
      </div>
      <div className="mt-2.5 flex h-14 items-end gap-0.75">
        {Array.from({ length: 30 }, (_, i) => (
          <span
            key={i}
            style={{ animationDelay: `${i * 26}ms` }}
            className={`h-full flex-1 origin-bottom rounded-chip group-data-[state=idle]/feature:scale-y-0 group-data-[state=play]/feature:animate-chart-bar ${i === 19 ? "bg-brand/25" : "bg-brand"}`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-caption text-fg-faint">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function Race() {
  return (
    <div aria-hidden className="flex w-full max-w-75 flex-col gap-5 font-mono text-snippet">
      <div>
        <div className="flex justify-between text-fg-muted">
          <span>Cold route</span>
          <span>2m 40s</span>
        </div>
        <div className="mt-2 h-2.5 rounded-chip bg-line-strong" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-fg-brand">Warmed route</span>
            <span className="rounded-chip bg-brand px-1.5 py-0.5 text-micro leading-none text-on-brand">18× faster</span>
          </span>
          <span>9s</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-chip bg-line">
          <div className="h-full w-[6%] bg-brand" />
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  { title: "Every store, one endpoint", description: "Search the catalogue, check out and track the order at any store through the same call.", media: <Race /> },
  { title: "Uptime you can see", description: "Every route is exercised around the clock, so you know a store works before your agent tries it.", media: <Uptime /> },
  { title: "Warmed routes", description: "The stores your agents use most stay warm, so a purchase takes seconds, not minutes.", media: <Race /> },
  { title: "Checkout that finishes", description: "Payment, shipping and confirmation, with the order number back in your agent’s hands.", media: <Uptime /> },
];

export function Site() {
  return (
    <div className="py-16">
      <FeatureGrid features={FEATURES} />
    </div>
  );
}

export function Rows() {
  return (
    <div className="mx-auto w-(--ds-frame-column) py-16">
      <FeatureRows features={FEATURES.slice(0, 2).map((f, i) => ({ ...f, tags: [i ? "Monitoring" : "Routing"] }))} />
    </div>
  );
}

```

## Source

components/site/feature-rows.tsx

```tsx
"use client";

import * as React from "react";

import { Window } from "@/components/ui/window";
import { cn } from "@/lib/utils";

// What you get (the opencommerce site, features.tsx). FeatureGrid: the features two to a row in the 800px column, each
// a window named after it (merchants.feature). The window opens on its picture (224px tall, centered on white, a
// hairline under it), then the 20px title and a 16px muted line. Pictures are small and flat, drawn from the page's own
// parts: hairlines on white and blue as the only voice. FeatureRows: one feature to a row, the copy beside its window,
// alternating sides, for a product page that needs more room per feature.
//
// Each picture can tell its line in one short move: the card plays it once, the first time it is well into view, and
// again when the pointer comes onto it (never over a run still going). The card sets data-state on itself, so a picture
// keys its motion off its ancestor with group-data-[state=…]/feature: no state is the finished frame (the server render,
// no script, reduced motion), `idle` the opening frame, `play` the move, which must end on the finished frame. A replay
// fades the picture out and back in (150ms each) rather than cutting to the opening frame.

type Feature = {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** The picture: a small diagram, a chart, a card. */
  media?: React.ReactNode;
  /** The window's name; defaults to the title's slug with .feature. */
  file?: string;
  /** Small mono tags over the title (FeatureRows). */
  tags?: React.ReactNode[];
};

const RUN_MS = 3000;
const FADE_MS = 150;
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";

const slug = (s: React.ReactNode, i: number) => (typeof s === "string" ? s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : `feature-${i + 1}`);

/** Plays a card's picture once on first sight and again on hover. See the note above. */
function usePlay<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const busy = React.useRef(false);
  const seen = React.useRef(false);
  const timer = React.useRef<number | undefined>(undefined);

  const play = React.useCallback(() => {
    const el = ref.current;
    if (!el || busy.current || el.dataset.state === undefined) return;
    busy.current = true;
    const start = () => {
      el.dataset.state = "idle";
      void el.offsetWidth;
      el.dataset.state = "play";
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => (busy.current = false), RUN_MS);
    };
    const pic = el.querySelector<HTMLElement>("[data-feature-picture] > *");
    if (el.dataset.state !== "play" || !pic) return start();
    pic.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE_MS, easing: EASE_OUT }).finished.then(() => {
      start();
      pic.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_MS, easing: EASE_OUT });
    });
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.state = "idle";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        seen.current = true;
        play();
        io.disconnect();
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer.current);
    };
  }, [play]);

  return { ref, onPointerEnter: () => seen.current && play() };
}

/** A small mono tag over a feature's title. */
function FeatureTag({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-chip bg-tint px-2 py-1 font-mono text-caption leading-none text-fg-brand", className)}>{children}</span>;
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const play = usePlay<HTMLLIElement>();
  return (
    <li {...play} className="group/feature flex">
      <Window name={feature.file ?? `${slug(feature.title, index)}.feature`} className="w-full" bodyClassName="flex flex-col">
        {feature.media && (
          <div data-feature-picture="" className="flex h-56 items-center justify-center border-b border-line bg-surface px-6">
            {feature.media}
          </div>
        )}
        <div className="px-6 pt-6 pb-7 md:px-8 md:pt-7 md:pb-8">
          <h3 className="font-display text-h4 leading-snug font-medium tracking-tight">{feature.title}</h3>
          {feature.description && <p className="mt-2 max-w-md text-body leading-relaxed text-fg-muted">{feature.description}</p>}
        </div>
      </Window>
    </li>
  );
}

function FeatureGrid({ features, className, ...props }: Omit<React.ComponentProps<"ul">, "children"> & { features: Feature[] }) {
  return (
    <ul data-slot="feature-grid" className={cn("mx-auto grid w-full max-w-(--ds-layout-medium) list-none gap-5 p-0 sm:grid-cols-2", className)} {...props}>
      {features.map((feature, i) => (
        <FeatureCard key={i} feature={feature} index={i} />
      ))}
    </ul>
  );
}

function FeatureRow({ feature, index }: { feature: Feature; index: number }) {
  const play = usePlay<HTMLLIElement>();
  const flip = index % 2 === 1;
  return (
    <li {...play} className="group/feature grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14">
      <div className={cn(flip && "lg:order-2")}>
        {feature.tags && feature.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {feature.tags.map((tag, i) => (
              <FeatureTag key={i}>{tag}</FeatureTag>
            ))}
          </div>
        )}
        <h3 className="font-display text-h3 leading-snug font-medium tracking-tighter">{feature.title}</h3>
        {feature.description && <p className="mt-3 max-w-md text-body leading-relaxed text-fg-muted">{feature.description}</p>}
      </div>
      <Window name={feature.file ?? `${slug(feature.title, index)}.feature`} className={cn(flip && "lg:order-1")} bodyClassName="flex">
        <div data-feature-picture="" className="flex min-h-64 w-full items-center justify-center px-6 py-8">
          {feature.media}
        </div>
      </Window>
    </li>
  );
}

function FeatureRows({ features, className, ...props }: Omit<React.ComponentProps<"ol">, "children"> & { features: Feature[] }) {
  return (
    <ol data-slot="feature-rows" className={cn("mx-auto grid w-full max-w-(--ds-layout-column) list-none gap-16 p-0 md:gap-24", className)} {...props}>
      {features.map((feature, i) => (
        <FeatureRow key={i} feature={feature} index={i} />
      ))}
    </ol>
  );
}

export { FeatureGrid, FeatureRows, FeatureTag };
export type { Feature };

```
