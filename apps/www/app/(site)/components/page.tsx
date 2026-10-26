import Link from "next/link";

import { Window } from "@/components/ui/window";
import { PageBody, PageHead, Section } from "@www/components/chrome";
import { InlineCode, Prose } from "@www/components/prose";
import { Thumb } from "@www/components/thumb";
import { examples } from "@www/lib/examples.generated";
import { CLI_COMMAND, RAIL, items, registryName } from "@www/lib/registry";

export const metadata = { title: "Library" };

// How small each kind of item draws in its card: a section or a page is a whole band, so it is shown from its top.
const THUMB: Record<string, { scale: number; align?: "start" }> = {
  ui: { scale: 0.6 },
  visual: { scale: 0.4, align: "start" },
  site: { scale: 0.3, align: "start" },
  block: { scale: 0.22, align: "start" },
};

// Examples that move the page when they mount draw in a frame (see Thumb).
const FRAMED = new Set(["command"]);

export default function Library() {
  return (
    <>
      <PageHead eyebrow="Library" title="All components" description={`${items.length} React components, sections and page templates for ${registryName}. Each has previews, usage notes, source and an install command.`} />
      <PageBody>
        <p className="text-body-sm text-fg-muted">
          Requires React and Tailwind 4. Use <InlineCode>{`${CLI_COMMAND} add <item>`}</InlineCode> to add an item.
        </p>
        {RAIL.map((g) => (
          <Section key={g.type} id={g.id} title={g.label} description={g.blurb}>
            <ul className="grid gap-4 sm:grid-cols-2">
              {g.items.map((i) => {
                const main = examples[i.name]?.Block ?? examples[i.name]?.Site ?? Object.values(examples[i.name] ?? {})[0];
                const thumb = THUMB[i.type] ?? THUMB.ui;
                return (
                  <li key={i.name} className="group/card relative">
                    <Window name={i.name} className="h-full transition-[border-color] duration-150 ease-out group-hover/card:border-line-brand motion-reduce:transition-none">
                      {main && <Thumb example={main} scale={thumb.scale} align={thumb.align} className="h-44" src={FRAMED.has(i.name) ? `/still/${i.name}/Site` : undefined} />}
                      <div className="grid gap-1.5 border-t border-line px-5 pt-4.5 pb-5">
                        <Link
                          href={`/components/${i.name}`}
                          className="rounded-sm font-display text-h5 leading-snug font-medium tracking-tight outline-none after:absolute after:inset-0 after:rounded-panel focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-focus-ring"
                        >
                          {i.title}
                        </Link>
                        <span className="line-clamp-2 text-body-sm text-fg-muted">
                          <Prose text={i.description} />
                        </span>
                      </div>
                    </Window>
                  </li>
                );
              })}
            </ul>
          </Section>
        ))}
      </PageBody>
    </>
  );
}
