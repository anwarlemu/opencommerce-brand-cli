# Testimonials
Customer quotes with names, logos and optional context.

Install: npx opencommerce-ds add testimonials
Requires: theme, window, utils
Packages: none
Exports: Testimonials, Case
Client boundary: not required by this entry file
Reference: Extension in the opencommerce site's voice (its windows and mono tags; opencommerce-agentcard-web src/components/window.tsx, pricing.tsx)


## Usage
Pass cases with name, logo, quote, context and tag. Use approved customer quotes and attribution.
- Avoid: More than one quote per window
- Avoid: Bold or italic quotes
- Avoid: Tilted or hung windows
- Avoid: Photos in place of the company's mark


## Examples
Example components: npx opencommerce-ds add testimonials
[Site](https://opencommerce-ds.vercel.app/preview/testimonials/Site)

examples/testimonials.tsx

```tsx
import { Testimonials } from "@/components/site/testimonials";

const Mark = ({ d }: { d: string }) => (
  <svg viewBox="0 0 20 20" className="fill-current">
    <path d={d} />
  </svg>
);

export function Site() {
  return (
    <section className="mx-auto w-full max-w-(--ds-frame-column) py-20">
      <div className="mx-auto max-w-(--ds-layout-heading) pb-12 text-center">
        <h2 className="font-display text-h2 leading-display font-medium tracking-tighter">Agents that already buy</h2>
        <p className="mx-auto mt-4 max-w-(--ds-layout-text) text-body leading-lead text-fg-muted">Consumer apps, B2B companies and crypto teams run their agents’ purchases through opencommerce.</p>
      </div>
      <Testimonials
        cases={[
          {
            name: "Orchid",
            logo: <Mark d="M10 2a3 3 0 0 1 3 3 3 3 0 1 1 2 5 3 3 0 1 1-3 5 3 3 0 1 1-4 0 3 3 0 1 1-3-5 3 3 0 1 1 2-5 3 3 0 0 1 3-3Z" />,
            context: "Consumer apps like Orchid buy on Amazon for customers using Agentcard:",
            quote: "Orchid uses Agentcard to store customers’ cards safely and buy things on their behalf.”",
            tag: "Consumer",
          },
          {
            name: "Almanac",
            logo: <Mark d="M10 1a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" />,
            context: "B2B companies like Almanac use Agentcard to give cards to company agents:",
            quote: "Almanac stores corporate cards using Agentcard and automates company purchases with their Slack agent.”",
            tag: "B2B",
          },
          {
            name: "Laso Finance",
            file: "laso.case",
            logo: <Mark d="M3 5l7-3 7 3v10l-7 3-7-3Z" />,
            context: "Crypto companies like Laso use Agentcard as their payment infrastructure:",
            quote: "When users have funds in crypto and their agent wants to make purchases using them, they can use Laso (powered by Agentcard) and create cards their agent can use.”",
            tag: "Crypto",
          },
        ]}
      />
    </section>
  );
}

```

## Source

components/site/testimonials.tsx

```tsx
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

```
