import { readFileSync } from "node:fs";
import path from "node:path";

import { Command, PageBody, PageHead, Section } from "@www/components/chrome";
import { Rows, Shot } from "@www/components/gallery";
import { Window } from "@/components/ui/window";
import { BIN } from "@www/lib/registry";

export const metadata = { title: "Coverage" };

const dir = path.join(process.cwd(), "public/assets/coverage");
const size = (file: string) => {
  const png = readFileSync(path.join(dir, file));
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
};
const cmd = (rest: string) => `npx ${BIN} ${rest}`;

const NEED: [string, string][] = [
  ["Link previews, posts, stories, banners, ads", "image <template> --size <id>"],
  ["A set of posts", "image carousel slides.json"],
  ["Changing an image until it is right", "design new <template>, then design revise <file> \"...\""],
  ["A layout no template has, at any size", "design new compose --size <id>, then design compose add"],
  ["A profile picture", "image avatar"],
  ["Favicons, app icons, the default share image", "icons"],
  ["Slides", "deck --input deck.json"],
  ["One-pagers, report covers, letterheads, business cards, certificates, badges, name tags", "merch <item> --format pdf,png"],
  ["Merch", "merch <item>"],
  ["Clips, loops, GIFs, a logo reveal, a counting figure", "video <template> --size <id> [--format gif]"],
  ["Wallpapers, meeting backgrounds, the brand art", "illustrate <subject> --size meeting|desktop|phone-wallpaper|WxH"],
  ["Emails", "email announcement|newsletter|receipt|password-reset"],
  ["Components and sections", "component list, then add <names...>"],
  ["A whole page", "design page compose outline.json --flavor react,html"],
];

const SLIDES = ["agenda", "team", "timeline", "chart", "comparison", "qa"];
const PRINT = ["business-card-front", "business-card-back", "one-pager-letter", "report-cover", "certificate", "event-badge", "name-tag", "sticker-sheet", "mug-15oz", "lanyard"];
const ICONS = ["icon-icon-512.png", "icon-icon-maskable-512.png", "icon-apple-touch-icon.png", "icon-og-default.png"];

export default function CoveragePage() {
  return (
    <>
      <PageHead eyebrow="Docs" title="Coverage" description="Everything the CLI makes beyond the image templates, from the same tokens, faces and logo files. Every command draws only the words it is given." />
      <PageBody>
        <Section title="I need" description="What to run for what you need. manifest --json has the same table.">
          <Rows name="need.json" rows={NEED} />
        </Section>
        <Section title="Compose" description="The brand's blocks on a 12 by 12 grid at any size: a stat card with a chart, an IAB ad.">
          <Command command={cmd('design new compose --size og -o card && npx ' + BIN + ' design compose add card chart --set value="Mon 12, Tue 18"')} wrap />
          <div className="grid gap-4 sm:grid-cols-2">
            <Shot src="/assets/coverage/compose-og.png" name="compose-og.png" alt="A composed card: a headline, a figure and a bar chart" {...size("compose-og.png")} />
            <Shot src="/assets/coverage/compose-ad-300x250.png" name="compose-ad-300x250.png" alt="A composed 300 by 250 ad" {...size("compose-ad-300x250.png")} />
          </div>
        </Section>
        <Section title="Slides" description="Agenda, team (no photos), timeline, chart, comparison and questions, built from the same blocks.">
          <div className="grid gap-4 sm:grid-cols-2">
            {SLIDES.map((s) => (
              <Shot key={s} src={`/assets/coverage/slide-${s}.png`} name={`slide-${s}.png`} alt={`The ${s} slide`} width={1920} height={1080} />
            ))}
          </div>
        </Section>
        <Section title="Print and documents" description="Real sizes with bleed and safe area, as PNG, SVG at physical size and PDF. The brand never made most of these, so they are its own parts on its one white ground.">
          <Command command={cmd('merch one-pager-letter --headline "..." --body "..." --format pdf,png')} wrap />
          <div className="grid gap-4 sm:grid-cols-2">
            {PRINT.map((p) => (
              <Shot key={p} src={`/assets/coverage/${p}.png`} name={`${p}.png`} alt={`The ${p} print file`} {...size(`${p}.png`)} />
            ))}
          </div>
        </Section>
        <Section title="Icons" description="The favicon set, app icons (the maskable one with the blue carried to its edges) and the default share image, from the mark file.">
          <Command command={cmd("icons")} />
          <div className="grid gap-4 sm:grid-cols-2">
            {ICONS.map((f) => (
              <Shot key={f} src={`/assets/coverage/${f}`} name={f.replace(/^icon-(icon-)?/, (m, x) => (x ? "icon-" : ""))} alt={`The ${f} icon`} {...size(f)} />
            ))}
          </div>
        </Section>
        <Section title="Email" description="Plain HTML tables with inline styles, which survive mail clients, and a plain-text part.">
          <Command command={cmd('email announcement --headline "..." --action "Get started" --href https://example.com')} wrap />
          <div className="grid gap-4 sm:grid-cols-2">
            {["announcement", "receipt"].map((e) => (
              <Window key={e} name={`${e}.html`} bodyClassName="bg-subtle p-3">
                <iframe src={`/assets/coverage/email-${e}.html`} title={`The ${e} email`} className="block h-120 w-full rounded-chip border border-line-subtle bg-surface" />
              </Window>
            ))}
          </div>
        </Section>
      </PageBody>
    </>
  );
}
