# Prose
Typography and layout for long-form content.

Install: npx opencommerce-ds add prose
Requires: theme, utils
Packages: none
Exports: Prose, ProseProps
Client boundary: not required by this entry file
Reference: Extension in the opencommerce site's voice (its type, hairlines, code and mono labels; opencommerce-agentcard-web src/app/globals.css); the structure from agentcard.sh/terms


## Usage
Use for documentation, guides, legal content and release notes. Pass semantic HTML or rendered Markdown. Use wide for a wider content column.
- Avoid: Bold headings or table headers
- Avoid: Body text wider than 576px
- Avoid: Links without the underline
- Avoid: Centered long text
`Prose` props: `eyebrow`, `title`, `meta` (the head; any of them renders it), `wide` (820px instead of 680px),
`bodyClassName`, and children (the HTML to style). It styles `p`, `h2` (24px), `h3` (16px), `h4`, `ul`, `ol`, `a`,
`strong`, `table` with `th` and `td`, inline `code`, `pre`, `blockquote`, `hr`, `img` and `figcaption`.

The brand's tables set headers and `strong` in 700 and its h3 in 600; here they are medium (500), as the brand's rules
say nothing is bold.

## Examples
Example components: npx opencommerce-ds add prose
[Site](https://opencommerce-ds.vercel.app/preview/prose/Site)

examples/prose.tsx

```tsx
import { Prose } from "@/components/site/prose";

export function Site() {
  return (
    <div className="px-5 py-16 sm:px-0">
      <Prose eyebrow="Compliance" title="Terms of Use" meta="Last updated July 10, 2026">
        <p>
          Welcome to the service (the “Service”). These terms govern your use of the website, the cards and the tools for agents. By using the Service you agree to them and to our{" "}
          <a href="https://legal.raincards.xyz/legal/privacy-policy">Privacy Policy</a>.
        </p>
        <h2>Eligibility</h2>
        <p>
          You must be at least 18 years old and able to form a binding contract. Cards are issued under the <a href="https://agentcard.sh/card-terms">Cardholder Agreement</a>.
        </p>
        <h2>Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the services for any unlawful purpose.</li>
          <li>Attempt unauthorized access to any account or system.</li>
          <li>Interfere with or disrupt the services.</li>
        </ul>
        <h3>Additional definitions</h3>
        <ol>
          <li>The issuing bank is an express third-party beneficiary of these terms.</li>
          <li>
            An API key such as <code>sk_live_…</code> is yours to keep secret.
          </li>
        </ol>
        <h2>Fees</h2>
        <table>
          <thead>
            <tr>
              <th colSpan={2}>Fees</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Annual fees</th>
              <td>None</td>
            </tr>
            <tr>
              <th>International transaction</th>
              <td>1% of each transaction in U.S. dollars</td>
            </tr>
            <tr>
              <th>Late payment</th>
              <td>
                <strong>None.</strong> Learn more at <a href="https://www.consumerfinance.gov">consumerfinance.gov</a>.
              </td>
            </tr>
          </tbody>
        </table>
        <pre>
          <code>{`npx agent-cards setup`}</code>
        </pre>
      </Prose>
    </div>
  );
}

```

## Source

components/site/prose.tsx

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

// Long-form text (legal pages, a changelog, a guide) in the home page's voice: a 576px reading column (800px wide); an
// optional head (a small mono label, the 48px display title and a mono line, over a hairline); then semantic HTML
// styled in place. Paragraphs and lists in 16px Inter at 26px in muted ink, headings in the display face (24px h2, 17px
// h3) in ink, links in blue with an underline, tables in 14px rows on hairlines with a mist head, inline code in the
// platform mono on the pale blue, blocks on ink. Pass markdown output or plain elements as children.

const BODY = [
  "text-body leading-relaxed text-fg",
  // Rhythm: 16px between blocks, more above a heading.
  "[&>*+*]:mt-4 [&>h2]:mt-11 [&>h3]:mt-7.5 [&>:first-child]:mt-0",
  // Paragraphs and lists read in muted ink.
  "[&_p]:text-fg-muted [&_li]:text-fg-muted",
  // Headings.
  "[&_h2]:font-display [&_h2]:text-h3 [&_h2]:[line-height:1.2] [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-fg",
  "[&_h3]:font-display [&_h3]:text-h5 [&_h3]:leading-display [&_h3]:font-medium [&_h3]:tracking-tight [&_h3]:text-fg",
  "[&_h4]:font-display [&_h4]:text-body-sm [&_h4]:font-medium [&_h4]:text-fg",
  // Lists.
  "[&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5.5 [&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-2 [&_ol]:pl-5.5 [&_li>ul]:mt-2 [&_li>ol]:mt-2 [&_li]:marker:text-fg-brand",
  // Links: blue with the underline, a touch thicker on hover.
  "[&_a]:text-fg-brand [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-3 [&_a]:rounded-chip [&_a]:outline-none [&_a:hover]:decoration-2 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-focus-ring",
  // Emphasis stays medium: the brand is never bold.
  "[&_strong]:font-medium [&_strong]:text-fg [&_b]:font-medium",
  // Tables: 14px on hairlines, header cells on mist.
  "[&_table]:my-4.5 [&_table]:w-full [&_table]:border-collapse [&_table]:text-body-sm [&_table]:leading-relaxed",
  "[&_th]:border-b [&_th]:border-line [&_th]:bg-subtle [&_th]:font-normal [&_th]:text-fg-muted [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-left [&_th]:align-top",
  "[&_td]:border-b [&_td]:border-line [&_td]:px-3 [&_td]:py-2.5 [&_td]:align-top",
  // Code: the pale blue chip inline, ink for blocks.
  "[&_:not(pre)>code]:rounded-chip [&_:not(pre)>code]:bg-tint [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-px [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-snippet [&_:not(pre)>code]:text-fg-brand [&_:not(pre)>code]:[overflow-wrap:anywhere]",
  "[&_pre]:overflow-x-auto [&_pre]:rounded-panel [&_pre]:bg-code [&_pre]:px-5 [&_pre]:py-4 [&_pre]:font-mono [&_pre]:text-snippet [&_pre]:leading-code [&_pre]:text-fg-code [&_pre]:shadow-code",
  // Quotes, rules and figures.
  "[&_blockquote]:border-l-2 [&_blockquote]:border-brand [&_blockquote]:pl-4 [&_blockquote]:text-fg-muted",
  "[&_hr]:my-11 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-line",
  "[&_img]:h-auto [&_img]:max-w-full [&_figcaption]:mt-2 [&_figcaption]:text-body-sm [&_figcaption]:text-fg-muted",
].join(" ");

type ProseProps = React.ComponentProps<"article"> & {
  /** The small label over the title (Legal, Changelog). */
  eyebrow?: React.ReactNode;
  /** The page title, 48px in the display face (36px on phones). */
  title?: React.ReactNode;
  /** The mono line under the title (Last updated July 10, 2026). */
  meta?: React.ReactNode;
  /** Wider column (800px) for a changelog. */
  wide?: boolean;
  /** Classes for the body (the styled HTML). */
  bodyClassName?: string;
};

function Prose({ eyebrow, title, meta, wide = false, className, bodyClassName, children, ...props }: ProseProps) {
  const head = eyebrow || title || meta;
  return (
    <article data-slot="prose" className={cn("mx-auto w-full", wide ? "max-w-(--ds-layout-medium)" : "max-w-(--ds-layout-text)", className)} {...props}>
      {head ? (
        <header className="border-b border-line pb-7">
          {eyebrow ? <p className="font-mono text-caption leading-body text-fg-label">{eyebrow}</p> : null}
          {title ? <h1 className="mt-3 font-display text-h1 leading-heading font-medium tracking-hero">{title}</h1> : null}
          {meta ? <p className="mt-3 font-mono text-caption leading-body text-fg-muted">{meta}</p> : null}
        </header>
      ) : null}
      <div className={cn(BODY, head && "mt-8.5", bodyClassName)}>{children}</div>
    </article>
  );
}

export { Prose };
export type { ProseProps };

```
