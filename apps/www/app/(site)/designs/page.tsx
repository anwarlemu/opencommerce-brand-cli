import { readFileSync } from "node:fs";
import path from "node:path";

import { Command, PageBody, PageHead, Section } from "@www/components/chrome";
import { Rows, Shot } from "@www/components/gallery";
import { Window } from "@/components/ui/window";
import { BIN } from "@www/lib/registry";

export const metadata = { title: "Designs" };

type Step = { command: string; answer: string; picture?: string; ok: boolean };
const dir = path.join(process.cwd(), "public/assets/designs");
const session = JSON.parse(readFileSync(path.join(dir, "session.json"), "utf8")) as { steps: Step[]; file: string; templates: { id: string; kind: string; description: string }[] };
const size = (file: string) => {
  const png = readFileSync(path.join(dir, file));
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
};

const KINDS: [string, string][] = [
  ["image", "Share images, social posts, banners and profile pictures. Copy, pictures, theme, size, seed and layer edits."],
  ["slide", "Slides at 1920x1080. The same edits as an image."],
  ["merch", "Print files. Copy, variant and seed. render --scale 3 gives 300 px per inch."],
  ["illustration", "The glyph language. Copy, picture, ground, size and seed."],
  ["video", "Short clips. Copy, theme, size and seed; render --format mp4."],
];

const RULES: [string, string][] = [
  ["Always", "Whole words, nothing invented, brand colors, contrast, the logo's smallest size and its clear space. These can never be allowed."],
  ["Unless you accept it", "Overlaps, what a platform covers or crops, hard cuts and small text. --allow <rule> accepts one for this design."],
];

function StepCard({ step, n }: { step: Step; n: number }) {
  return (
    <li className="grid gap-3">
      <p className="font-mono text-caption text-fg-label">{`${n}${step.ok ? "" : ", refused"}`}</p>
      <Command command={`npx ${BIN} ${step.command}`} wrap />
      <Window name={step.ok ? "answer" : "refused, nothing changed"} bodyClassName="p-4">
        <pre className="font-mono text-caption leading-code whitespace-pre-wrap text-fg-muted [overflow-wrap:anywhere]">{step.answer}</pre>
      </Window>
      {step.picture ? <Shot src={`/assets/designs/${step.picture}`} name={step.picture} alt={`The banner after step ${n}`} {...size(step.picture)} /> : null}
    </li>
  );
}

export default function DesignsPage() {
  return (
    <>
      <PageHead eyebrow="Docs" title="Designs" description="Make something, look at it, and change it until it is right. A design is a small JSON file; every change is drawn inside the layout, checked against the brand, and can be undone." />
      <PageBody>
        <Section title="One session" description="A banner for an X profile, from the first draft on. This is real output, in order: the command, what the CLI answered, and the picture it left. Two requests are off brand or out of room, and change nothing.">
          <ol className="grid gap-10">
            {session.steps.map((s, i) => (
              <StepCard key={s.command} step={s} n={i + 1} />
            ))}
          </ol>
        </Section>

        <Section title="Plain words, or exact edits" description="revise reads plain words by rules, with no model and no API key. Every part has to be understood, or nothing changes and it lists the nearest things you can say. Copy goes in quotes. edit is exact, for agents that reason about the change themselves.">
          <Command command={`npx ${BIN} design revise banner 'headline "One request, any store", a bit smaller body, move the logo left'`} wrap />
          <Command command={`npx ${BIN} design edit banner --set headline="One request, any store" --layer body.scale=1.1 --hide badge --theme mist --seed 5`} wrap />
          <Command command={`npx ${BIN} design show banner`} />
        </Section>

        <Section title="What is checked" description="Every write runs the check and prints it. Errors block the write and leave the file as it was.">
          <Rows name="rules" rows={RULES} />
        </Section>

        <Section title="What you can design" description="One command for everything the CLI draws.">
          <Rows name="kinds" rows={KINDS} />
          <Rows name="templates" rows={session.templates.map((t) => [t.id, t.description])} />
        </Section>

        <Section title="The file" description="No timestamps and a fixed key order: the same edits write the same bytes.">
          <Window name="banner.design.json" bodyClassName="p-4">
            <pre className="font-mono text-caption leading-code whitespace-pre-wrap text-fg-muted [overflow-wrap:anywhere]">{session.file}</pre>
          </Window>
        </Section>
      </PageBody>
    </>
  );
}
