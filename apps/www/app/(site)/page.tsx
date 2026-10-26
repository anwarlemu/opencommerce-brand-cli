import Link from "next/link";

import { Command, PageBody, PageHead, Section } from "@www/components/chrome";
import { InstallBox } from "@www/components/install-box";
import { BIN, CLI_COMMAND, INSTALL_COMMAND, RAIL, items, registryName } from "@www/lib/registry";

const START = [
  { label: "apply", command: `${CLI_COMMAND} apply --dry-run`, note: "Restyle an existing project: styles, fonts, agent rules and review tasks." },
  { label: "install", command: INSTALL_COMMAND, note: `Add the CLI to a project, then run ${BIN} init and ${BIN} add.` },
];

// A link to an item: a white row with the hairline and 6px corners, the title in the display face; the pale blue wash
// under the pointer. Nothing moves.
const ROW =
  "flex h-11 items-center rounded-card border border-line bg-surface px-3.5 font-display text-body-sm font-medium tracking-tight text-fg outline-none transition-[background-color,border-color] duration-150 ease-out hover:border-line-brand hover:bg-blue-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none";

export default function Home() {
  return (
    <>
      <PageHead eyebrow="Introduction" title={`${registryName} design system`} description={`Components, tokens and a CLI that keeps agents on the ${registryName} look. ${items.length} components, sections and pages, each with previews, usage notes and source.`} />
      <PageBody>
        <Section title="Install the CLI" description="Run once from the project root. It adds the brand stylesheet, the fonts and the agent instructions, or restyles an existing project.">
          <InstallBox tabs={START} />
        </Section>
        <Section title="Add components" description="Components need React 19.2 or later, Tailwind CSS 4 and the @/* source alias. The CLI copies the source, installs what it needs and adds the theme.">
          <Command command={`${CLI_COMMAND} add button window field input`} />
        </Section>
        <Section title="CLI and agent workflow" description="Respect existing project paths and JavaScript or TypeScript conventions. Inspect APIs, preview changes, then install components with their theme and agent skills.">
          <div className="grid gap-2">
            <Command command="npx opencommerce-ds info --json" />
            <Command command="npx opencommerce-ds search button --json" />
            <Command command="npx opencommerce-ds view button --json" />
            <Command command="npx opencommerce-ds add button --diff" />
            <Command command="npx opencommerce-ds shadcn add @opencommerce-ds/theme @opencommerce-ds/button" />
            <Command command="npx opencommerce-ds mcp init --client claude" />
          </div>
        </Section>
        {RAIL.map((g) => (
          <Section key={g.id} id={g.id} title={g.label} description={g.blurb}>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-2">
              {g.items.map((i) => (
                <li key={i.name}>
                  <Link href={`/components/${i.name}`} className={ROW}>
                    {i.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        ))}
      </PageBody>
    </>
  );
}
