import Link from "next/link";
import { notFound } from "next/navigation";

import { Window } from "@/components/ui/window";
import { Command, PageBody, PageHead, Section } from "@www/components/chrome";
import { Pager } from "@www/components/pager";
import { Code } from "@www/components/code";
import { FramePreview } from "@www/components/frame-preview";
import { Preview } from "@www/components/preview";
import { InlineCode, Prose } from "@www/components/prose";
import { examples } from "@www/lib/examples.generated";
import { CLI_COMMAND, ORDER, type Item, exampleSource, findItem, groupOf, items, needsPreviewFrame, sourceOf } from "@www/lib/registry";

export function generateStaticParams() {
  return items.map((i) => ({ name: i.name }));
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const item = findItem((await params).name);
  return item ? { title: item.title, description: item.description, alternates: { canonical: `/components/${item.name}`, types: { "text/markdown": `/r/${item.name}.md`, "application/json": `/r/${item.name}.json` } } } : {};
}

function exampleLabel(name: string) {
  if (name === "Block") return "Page";
  if (name === "Site") return "Preview";
  const words = name.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export default async function ComponentPage({ params }: { params: Promise<{ name: string }> }) {
  const item = findItem((await params).name);
  if (!item) notFound();
  // The main example first (a page, then the preview), then its states in the order the file declares them.
  const MAIN = ["Block", "Site"];
  const all = examples[item.name] ?? {};
  const rank = (name: string) => (MAIN.includes(name) ? MAIN.indexOf(name) : MAIN.length);
  const demos = item.examples.filter((name) => all[name]).sort((a, b) => rank(a) - rank(b)).map((name) => [name, all[name]] as const);
  // Isolate demos that focus, lock scrolling, or open overlays from the surrounding docs.
  const framed = needsPreviewFrame(item);
  const surfaceFlag = item.surface === "site" || item.surface === "product" ? ` --surface ${item.surface}` : "";
  // The rail's order: by group, then A to Z.
  const at = ORDER.findIndex((i) => i.name === item.name);
  const prev = at > 0 ? ORDER[at - 1] : undefined;
  const next = at < ORDER.length - 1 ? ORDER[at + 1] : undefined;
  return (
    <>
      <PageHead eyebrow={groupOf(item)?.label} title={item.title} description={<Prose text={item.description} />}>
        <a href={`/r/${item.name}.md`} className="rounded-sm text-body-sm text-fg-brand underline underline-offset-4 outline-none focus-visible:outline-2 focus-visible:outline-focus-ring">Text reference</a>
      </PageHead>
      <PageBody>
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2">
          <Command command={`${CLI_COMMAND} add ${item.name}${surfaceFlag}`} />
          <p className="text-caption text-fg-muted">Run from the target React 19.2+ app root with Tailwind CSS 4 and the <code>@/*</code> source alias. <a href={`/r/${item.name}.json`} className="text-fg-brand underline underline-offset-4">Source and examples as JSON</a>.</p>
        </div>

        {demos.length > 0 && (
          <div id="preview" className="grid scroll-mt-6 gap-8">
            {demos.map(([name, Demo]) =>
              framed ? <FramePreview key={name} src={`/preview/${item.name}/${name}`} name={item.name} label={exampleLabel(name)} component={item.type === "ui"} /> : <Preview key={name} example={Demo} name={item.name} block={name === "Block"} label={exampleLabel(name)} />,
            )}
          </div>
        )}

        <Usage item={item} />

        {item.examples.length > 0 && (
          <Section id="example" title="Example">
            <Code title={`examples/${item.name}.tsx`} code={exampleSource(item.name)} />
          </Section>
        )}

        <Section id="source" title="Source">
          <div className="grid gap-5">
            {item.paths.map((p) => (
              <Code key={p} title={p} code={sourceOf(p)} tall />
            ))}
          </div>
          {item.source && <p className="text-caption text-fg-muted">Reference: {item.source}.</p>}
        </Section>

        <Pager prev={prev && { name: prev.name, title: prev.title }} next={next && { name: next.name, title: next.title }} />
      </PageBody>
    </>
  );
}

function Usage({ item }: { item: Item }) {
  const requires = item.dependencies.filter((d) => d !== "utils");
  return (
    <Section id="usage" title="Usage">
      <div className="grid gap-4">
        <Window name="use-it-for.md" bodyClassName="bg-blue-5 px-4.5 pt-3.5 pb-4">
          <p className="text-body-sm leading-relaxed text-fg">
            <Prose text={item.use_for} />
          </p>
        </Window>
        {item.never.length > 0 && (
          <Window name="avoid.md" bodyClassName="px-4.5 pt-3.5 pb-4">
            <ul className="grid gap-1.5 text-body-sm leading-relaxed text-fg">
              {item.never.map((n) => (
                <li key={n} className="flex gap-2.5">
                  <span aria-hidden className="mt-2.5 h-px w-2.5 shrink-0 bg-danger" />
                  <Prose text={n} />
                </li>
              ))}
            </ul>
          </Window>
        )}
      </div>
      <p className="text-body-sm text-fg-muted">Exports: <InlineCode>{item.exports.join(", ")}</InlineCode>. {item.client ? "This component includes a client boundary. Keep event handlers and state in a client component." : "Read the examples for composition and props."}</p>
      {item.body && <div className="text-body-sm leading-relaxed"><Prose text={item.body} /></div>}
      {(requires.length > 0 || item.npm.length > 0) && (
        <p className="text-body-sm text-fg-muted">
          Dependencies: {" "}
          {requires.map((d, i) => (
            <span key={d}>
              {findItem(d) ? (
                <Link href={`/components/${d}`} className="rounded-sm text-fg underline decoration-line-strong underline-offset-[0.2em] outline-none transition-colors duration-150 ease-out hover:text-fg-brand focus-visible:outline-2 focus-visible:outline-focus-ring">
                  {d}
                </Link>
              ) : <InlineCode>{d}</InlineCode>}
              {i < requires.length - 1 || item.npm.length ? ", " : ""}
            </span>
          ))}
          {item.npm.map((p, i) => (
            <span key={p}>
              <InlineCode>{p}</InlineCode>
              {i < item.npm.length - 1 ? ", " : ""}
            </span>
          ))}.
        </p>
      )}
    </Section>
  );
}
