"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// The questions (the opencommerce site, faq.tsx): the centered heading over the list, the list in the 800px column.
// Native <details>, so it opens without script and the browser handles the keyboard; a shared name makes them one at a
// time. A question is 16px ink beside a drawn +, which turns an eighth into an x (and blue) as it opens; the answer,
// 15px muted, rises 4px into place as it arrives (200ms ease-out; only the fade with reduced motion). Rows sit on hairlines;
// hovered and open rows take the pale blue as a card inset 3px top and bottom, and hide the rules on both their edges so
// the card never sits between lines. The list is pulled out by the rows' padding so its text lines up with the column.
// `minHeight` reserves room for the longest answer, so opening a question never pushes the page below it.

type FaqItem = { question: React.ReactNode; answer: React.ReactNode };

function Faq({
  title,
  lead,
  items,
  minHeight = true,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  title?: React.ReactNode;
  lead?: React.ReactNode;
  items: FaqItem[];
  /** Keep the list's height steady as answers open (on wide screens). */
  minHeight?: boolean;
}) {
  const name = React.useId();
  return (
    <div data-slot="faq" className={cn("mx-auto flex w-full max-w-(--ds-layout-medium) flex-col gap-10 lg:gap-12", className)} {...props}>
      {(title || lead) && (
        <div className="flex flex-col items-center text-center">
          {title && <h2 className="font-display text-h2 leading-display font-medium tracking-tighter text-balance">{title}</h2>}
          {lead && <p className="mt-4 max-w-md text-body leading-lead text-pretty text-fg-muted">{lead}</p>}
        </div>
      )}
      <div className={cn(minHeight && "lg:min-h-125")}>
        <div className="-mx-4 divide-y divide-line">
          {items.map((item, i) => (
            <details
              key={i}
              name={name}
              className="group relative isolate px-4 before:absolute before:inset-x-0 before:inset-y-0.75 before:-z-10 before:rounded-card before:transition-colors before:duration-(--ds-duration-base) before:ease-out open:border-b-transparent open:before:bg-tint hover:border-b-transparent hover:before:bg-tint motion-reduce:before:transition-none [&:has(+:hover)]:border-b-transparent [&:has(+[open])]:border-b-transparent"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-card py-5 text-body leading-body text-fg outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring [&::-webkit-details-marker]:hidden">
                {item.question}
                <span aria-hidden className="relative size-3.5 shrink-0 text-fg-muted transition-[rotate,color] duration-(--ds-duration-base) ease-out group-open:rotate-45 group-open:text-fg-brand motion-reduce:transition-none">
                  <span className="absolute top-1/2 left-0 h-px w-3.5 -translate-y-1/2 bg-current" />
                  <span className="absolute top-0 left-1/2 h-3.5 w-px -translate-x-1/2 bg-current" />
                </span>
              </summary>
              <div className="max-w-(--ds-layout-text) pb-6 text-button leading-relaxed text-fg-muted group-open:motion-safe:animate-content-in group-open:motion-reduce:animate-fade-in">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

export { Faq, type FaqItem };
