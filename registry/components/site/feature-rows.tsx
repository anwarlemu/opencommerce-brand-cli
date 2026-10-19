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
