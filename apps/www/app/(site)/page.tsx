import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Window } from "@/components/ui/window";
import { Block, Page } from "@www/components/chrome";
import { InstallBox } from "@www/components/install-box";
import { Prose } from "@www/components/prose";
import { Thumb } from "@www/components/thumb";
import { examples } from "@www/lib/examples.generated";
import { BIN, CLI_COMMAND, INSTALL_COMMAND, findItem, items, registryName } from "@www/lib/registry";

// A few pieces that carry the look, each drawn live; the first six the library has are shown.
const SHOWCASE: { item: string; example: string; scale: number; align?: "start" }[] = [
  { item: "pricing", example: "Site", scale: 0.34, align: "start" },
  { item: "status-table", example: "Site", scale: 0.34, align: "start" },
  { item: "faq", example: "Site", scale: 0.34, align: "start" },
  { item: "steps", example: "Site", scale: 0.34, align: "start" },
  { item: "button", example: "Site", scale: 0.62 },
  { item: "window", example: "Site", scale: 0.48 },
  { item: "tabs", example: "Site", scale: 0.62 },
  { item: "code-window", example: "Site", scale: 0.48 },
];

const START = [
  { label: "apply", command: CLI_COMMAND, note: "Restyle an existing project: styles, fonts, agent rules and review tasks." },
  { label: "install", command: INSTALL_COMMAND, note: `Add the CLI to a project, then run ${BIN} init and ${BIN} add.` },
  { label: "add", command: `${CLI_COMMAND} add button window`, note: "Copy components, their dependencies and the theme into a React app." },
];

export default function Home() {
  const shown = SHOWCASE.filter((s) => findItem(s.item) && examples[s.item]?.[s.example]).slice(0, 6);
  return (
    <>
      <section aria-label="Introduction" className="mx-auto flex w-(--ds-frame-column) flex-col items-center pt-14 pb-6 text-center md:pt-12">
        <Link
          href="/components"
          className="inline-flex items-center rounded-card border border-line-strong bg-surface px-3.5 py-1.5 text-body-sm font-medium tracking-snug text-fg-muted outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none"
        >
          {items.length} components, sections and pages
        </Link>
        <h1 className="mt-4 font-display text-hero leading-heading font-medium tracking-hero text-balance">{registryName} design system</h1>
        <p className="mt-3 max-w-md text-body leading-lead text-fg-muted">Components, tokens and a CLI that keeps agents on the {registryName} look.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/components">Browse components</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/theme">Design tokens</Link>
          </Button>
        </div>
        <div className="mt-14 flex w-full justify-center">
          <InstallBox tabs={START} />
        </div>
      </section>
      <Page className="pt-24 md:pt-30">
        <Block title="Components and page sections" description="Preview the components, read the usage notes and copy the source into the project.">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((s) => {
              const item = findItem(s.item)!;
              const Example = examples[s.item][s.example];
              return (
                <li key={s.item} className="group/card relative">
                  <Window name={`${s.item}.tsx`} className="h-full transition-[border-color] duration-150 ease-out group-hover/card:border-line-brand motion-reduce:transition-none">
                    <Thumb example={Example} scale={s.scale} align={s.align} />
                    <div className="grid gap-1.5 border-t border-line px-5 pt-4.5 pb-5">
                      <Link
                        href={`/components/${s.item}`}
                        className="rounded-sm font-display text-h5 leading-snug font-medium tracking-tight outline-none after:absolute after:inset-0 after:rounded-panel focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-focus-ring"
                      >
                        {item.title}
                      </Link>
                      <span className="line-clamp-2 text-body-sm text-fg-muted">
                        <Prose text={item.description} />
                      </span>
                    </div>
                  </Window>
                </li>
              );
            })}
          </ul>
          <div className="mt-12 flex justify-center">
            <Button asChild variant="secondary">
              <Link href="/components">
                View all components <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </Block>
      </Page>
    </>
  );
}
