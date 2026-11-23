import { readFileSync } from "node:fs";
import path from "node:path";

import { Command, PageBody, PageHead, Section } from "@www/components/chrome";
import { Rows, Shot } from "@www/components/gallery";
import { Window } from "@/components/ui/window";
import { BIN } from "@www/lib/registry";

export const metadata = { title: "Assets" };

const brandDir = path.join(process.cwd(), "../../brand/assets");
const read = <T,>(f: string) => JSON.parse(readFileSync(path.join(brandDir, f), "utf8")) as T;
type Sized = { id: string; description: string; zones?: string; limit?: string };
const sizes = JSON.parse(readFileSync(path.join(process.cwd(), "public/assets/sizes.json"), "utf8")) as Sized[];
const image = read<{ templates: Record<string, { description: string }> }>("image.json");
const deck = read<{ slides: Record<string, { name: string; description: string; slots: Record<string, string> }> }>("deck.json");
const merch = read<{ items: { id: string; name: string; size: [number, number]; bleed: number; safe: number; method: string; variants: string[] }[] }>("merch.json");
const cmd = (rest: string) => `npx ${BIN} ${rest}`;

const IMAGES: [string, string, number, number][] = [
  ["og-hero", "hero, og", 1200, 630],
  ["og-window", "window, og", 1200, 630],
  ["og-closing", "closing, og", 1200, 630],
  ["og-cards", "cards, og", 1200, 630],
  ["square-hero", "hero, square", 1080, 1080],
  ["portrait-window", "window with --image, portrait", 1080, 1350],
  ["story-closing", "closing, story", 1080, 1920],
  ["portrait-cards", "cards, portrait", 1080, 1350],
  ["x-banner-hero", "hero, x-banner", 1500, 500],
  ["linkedin-banner-closing", "closing, linkedin-banner", 1584, 396],
  ["landscape-lead", "lead, landscape", 1200, 675],
  ["square-announcement", "announcement, square", 1080, 1080],
  ["linkedin-frame", "frame, linkedin", 1200, 627],
  ["avatar-avatar", "avatar", 800, 800],
];

export default function AssetsPage() {
  const slides = Object.entries(deck.slides);
  return (
    <>
      <PageHead eyebrow="Docs" title="Assets" description="Share images, social posts, slides, short videos and print files, drawn from the brand's tokens, fonts and logo files. Same inputs, same bytes." />
      <PageBody>
        <Section title="Share images and social posts" description="Ten templates: hero, window, closing and cards follow the brand's image tool; headline, lead, frame, quote, announcement and avatar are the CLI's own. Only the copy you pass is drawn, whole: copy that does not fit is an error that says what to shorten. Words and the logo stay clear of what each platform covers or crops.">
          <Command command={cmd('image hero --size og --headline "Open router for commerce" --body "Buy from any online store from a single endpoint." --out og.png')} wrap />
          <div className="grid gap-4 sm:grid-cols-2">
            {IMAGES.map(([file, label, w, h]) => (
              <Shot key={file} src={`/assets/images/${file}.png`} name={`${file}.png`} alt={`Generated ${label} image`} width={w} height={h} />
            ))}
          </div>
          <Rows name="sizes.json" rows={[...sizes.map((s) => [s.id, [`${s.description}.`, s.zones, s.limit].filter(Boolean).join(" ")] as [string, string]), ["WIDTHxHEIGHT", "Any custom size from 200 to 4000 px a side."]]} />
          <Command command={cmd("image carousel slides.json --size portrait")} />
          <Rows name="templates.json" rows={Object.entries(image.templates).map(([id, t]) => [id, t.description])} />
        </Section>

        <Section title="Decks" description="Slides at 1920x1080 from a deck.json file or flags: a PNG (or SVG) per slide and one PDF.">
          <Command command={cmd("deck --input deck.json --out deck")} />
          <div className="grid gap-4 sm:grid-cols-2">
            {slides.map(([id, s], i) => (
              <Shot key={id} src={`/assets/deck/slide-${String(i + 1).padStart(2, "0")}-${id}.png`} name={`slide-${String(i + 1).padStart(2, "0")}-${id}.png`} alt={`${s.name} slide`} width={1920} height={1080} />
            ))}
          </div>
          <Rows name="slides.json" rows={slides.map(([id, s]) => [id, `${s.description} Slots: ${Object.keys(s.slots).join(", ")}.`])} />
        </Section>

        <Section title="Video" description="MP4 or WebM clips at square, vertical and landscape. Layouts play in once on the ease-out token and rest while the glyph field drifts, as the site's does; field, mark and orbit loop the site's own motion. --still writes one frame.">
          <Command command={cmd('video hero --size landscape --headline "Open router for commerce" --out hero.webm')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Window name="landscape-hero.webm" bodyClassName="bg-subtle p-3">
              <video src="/assets/video/landscape-hero.webm" muted loop playsInline controls preload="metadata" className="block h-auto w-full rounded-chip border border-line-subtle" aria-label="Hero clip" />
            </Window>
            <Window name="square-mark.webm" bodyClassName="bg-subtle p-3">
              <video src="/assets/video/square-mark.webm" muted loop playsInline controls preload="metadata" className="block h-auto w-full rounded-chip border border-line-subtle" aria-label="Mark clip" />
            </Window>
          </div>
        </Section>

        <Section title="Merch" description="Print files only, never mockups: SVG at physical size (the sticker with its die line) and PNG at any dpi, bleed and safe area included. Sizes are common vendor print areas, so confirm with your vendor's template. The brand has one ground, so every item prints on white or light blanks.">
          <Command command={cmd("merch --all --sample --out merch")} />
          <div className="grid gap-4 sm:grid-cols-2">
            {merch.items.map((m) => (
              <Shot key={m.id} src={`/assets/merch/${m.id}-${m.variants[0]}.png`} name={`${m.id}-${m.variants[0]}.png`} alt={`${m.name} print file with trim and safe guides`} width={Math.round((m.size[0] + 2 * m.bleed) * 72)} height={Math.round((m.size[1] + 2 * m.bleed) * 72)} />
            ))}
          </div>
          <Rows name="merch.json" rows={merch.items.map((m) => [m.id, `${m.name}: ${m.size[0]} by ${m.size[1]} in, ${m.bleed} in bleed, ${m.safe} in safe. ${m.method}.`])} />
        </Section>

        <Section title="For agents" description="Every command, template, size, slot, subject and rule is listed by manifest. An unknown name exits 1 with the nearest choices.">
          <Command command={cmd("manifest --json")} />
        </Section>
      </PageBody>
    </>
  );
}
