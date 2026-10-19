import * as React from "react";

import { Window } from "@/components/ui/window";
import { cn } from "@/lib/utils";

// Customer quotes, in the home page's windows: one window per case (orchid.case), three to a row on wide screens and
// stacked on a phone. The body is white: a blue opening quote mark in the display face, the context in small muted text,
// the quote at 20px in the display face, then on a hairline the company's mark and name and a small mono tag at the
// right. Flat on the page, as every window on the site; nothing tilts or hangs.

type Case = {
  name: string;
  /** The company's mark, about 20px (an svg or img, decorative: the name is beside it). */
  logo?: React.ReactNode;
  /** The quote itself, set large. The closing mark is part of your text. */
  quote: React.ReactNode;
  /** The sentence before the quote, in small muted text ("Consumer apps like Orchid buy on Amazon:"). */
  context?: React.ReactNode;
  /** The kind of company, a small tag at the right (Consumer, B2B, Crypto). */
  tag?: React.ReactNode;
  /** The bar's name; defaults to the company's slug with .case. */
  file?: string;
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function CaseWindow({ item }: { item: Case }) {
  return (
    <li className="flex">
      <Window name={item.file ?? `${slug(item.name)}.case`} className="w-full" bodyClassName="flex flex-col">
        <figure className="m-0 flex flex-1 flex-col px-6 pt-6 pb-6">
          <span aria-hidden className="block h-6 font-display text-h1 leading-none text-fg-brand">
            “
          </span>
          <blockquote className="m-0 mt-3 flex-1">
            {item.context && <p className="text-body-sm leading-relaxed text-pretty text-fg-muted">{item.context}</p>}
            <p className={cn("font-display text-h4 leading-snug font-medium tracking-tight text-balance", item.context && "mt-2")}>{item.quote}</p>
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-2 border-t border-line pt-4 text-body-sm">
            {item.logo && (
              <span aria-hidden className="flex size-5 flex-none items-center justify-center [&>img]:size-full [&>svg]:size-full">
                {item.logo}
              </span>
            )}
            <span className="font-medium">{item.name}</span>
            {item.tag && <span className="ml-auto rounded-chip bg-tint px-2 py-1 font-mono text-caption leading-none text-fg-brand">{item.tag}</span>}
          </figcaption>
        </figure>
      </Window>
    </li>
  );
}

/** The customer cases: three to a row on wide screens, stacked on a phone. */
function Testimonials({ cases, className, ...props }: React.ComponentProps<"ul"> & { cases: Case[] }) {
  return (
    <ul data-slot="testimonials" className={cn("m-0 grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-2 lg:grid-cols-3", className)} {...props}>
      {cases.map((item) => (
        <CaseWindow key={item.name} item={item} />
      ))}
    </ul>
  );
}

export { Testimonials, type Case };
