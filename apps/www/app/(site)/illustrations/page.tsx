import { readFileSync } from "node:fs";
import path from "node:path";

import { Command, PageBody, PageHead, Section } from "@www/components/chrome";
import { Shot } from "@www/components/gallery";
import { BIN } from "@www/lib/registry";

export const metadata = { title: "Illustrations" };

type Subject = { description: string; source: string; size: [number, number]; image: boolean };
const data = JSON.parse(readFileSync(path.join(process.cwd(), "../../brand/assets/illustrate.json"), "utf8")) as { subjects: Record<string, Subject> };
const rules = readFileSync(path.join(process.cwd(), "../../brand/illustration.md"), "utf8")
  .split("\n")
  .filter((l) => /^\d+\. /.test(l.trim()) || /^ {3,}\S/.test(l))
  .reduce<string[]>((acc, l) => (/^\d+\. /.test(l.trim()) ? [...acc, l.trim().replace(/^\d+\. /, "")] : [...acc.slice(0, -1), `${acc.at(-1)} ${l.trim()}`]), [])
  .map((r) => r.replace(/`/g, ""));

export default function IllustrationsPage() {
  const list = Object.entries(data.subjects);
  return (
    <>
      <PageHead eyebrow="Docs" title="Illustrations" description="The brand's own picture language as code: characters on a lattice in faint ink, blue only where the site puts it. SVG with real vector glyphs, and PNG." />
      <PageBody>
        <Command command={`npx ${BIN} illustrate field --size 1500x500 --seed 7`} />
        <Section title="Subjects" description="Each subject is drawn from the brand's site or its image tool. window and halftone take your --image.">
          <div className="grid gap-4 sm:grid-cols-2">
            {list.map(([id, s]) => (
              <div key={id} className="grid content-start gap-3">
                <Shot src={`/assets/illustrations/${id}.png`} name={`${id}.png`} alt={`${id} illustration`} width={id === "halftone" ? 800 : s.size[0]} height={id === "halftone" ? 800 : s.size[1]} />
                <p className="text-body-sm leading-lead text-fg-muted">{s.description}</p>
                <code className="font-mono text-caption text-fg-subtle">{`npx ${BIN} illustrate ${id}${s.image ? (id === "halftone" ? " --image photo.png" : " [--image shot.png]") : ""}`}</code>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Rules" description="From brand/illustration.md; each names its source in the brand's site or tool.">
          <ol className="grid list-decimal gap-3 pl-5 text-body-sm leading-lead text-fg-muted marker:font-mono marker:text-fg-label">
            {rules.map((r) => (
              <li key={r} className="pl-1">
                {r}
              </li>
            ))}
          </ol>
        </Section>
      </PageBody>
    </>
  );
}
