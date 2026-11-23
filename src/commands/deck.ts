import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import type { Command } from 'commander';
import { DECK_ALIASES, deckCatalog, deckDoc, renderSlide, slideTypes, type Slide } from '../assets/deck.js';
import { display, num, pick, write, type OutFile } from '../assets/io.js';
import { imagesToPdf } from '../assets/pdf.js';
import { picture as readPicture } from '../image/load.js';
import { parseTheme } from '../image/render.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';

// `deck`: slides at 1920 by 1080 from a JSON file or flags, a PNG (or SVG) per slide and one PDF.

type Opts = Record<string, string | boolean | undefined> & { json?: boolean };
const SLOT_FLAGS = ['chip', 'title', 'body', 'number', 'items', 'stat', 'quote', 'attribution', 'label', 'code', 'primary', 'secondary', 'url'];

export function deckCommand(program: Command) {
	program
		.command('deck [slide]')
		.description('Slides at 1920x1080 (cover, section, statement, bullets, stat, quote, image, end): a PNG per slide and one PDF')
		.option('-i, --input <file>', 'deck.json: { "slides": [ { "type": "cover", "title": "..." }, ... ] }')
		.option('--slide <type>', 'one slide of this type, from flags')
		.option('--chip <text>', 'cover: the chip above the title')
		.option('--title <text>', 'the title (every type but quote and stat)')
		.option('--body <text>', 'the line under the title')
		.option('--number <text>', 'section: the number in the chip')
		.option('--items <text>', 'bullets: points separated by |; "Heading: line" for a card with a line')
		.option('--stat <text>', 'stat: the figure')
		.option('--quote <text>', 'quote: the quotation')
		.option('--attribution <text>', 'quote: who said it')
		.option('--label <text>', 'cover and image: the name in the window bar')
		.option('--code <text>', 'cover: the code in the window')
		.option('--primary <text>', 'end: the blue key')
		.option('--secondary <text>', 'end: the white key')
		.option('--url <text>', 'end: the address')
		.option('--image <file>', 'cover and image: a PNG, JPEG or SVG in the window')
		.option('--headline <text>', 'the same as --title')
		.option('--badge <text>', 'the same as --chip')
		.option('--theme <theme>', 'white (default) or mist, for every slide')
		.option('--sample', 'fill the slots you leave out with sample copy')
		.option('--seed <n>', 'glyph field seed')
		.option('-f, --format <format>', 'both (PNG and PDF), png, pdf, svg, or several with commas', 'both')
		.option('-o, --out <dir>', 'output directory (default deck/)')
		.option('--list', 'slide types with their slots')
		.option('--json', 'JSON output')
		.action((slide: string | undefined, _o, cmd: Command) => runDeck(slide, cmd.optsWithGlobals() as Opts))
		.addHelpText('after', () =>
			[
				'',
				'Examples:',
				`  ${cli()} deck --input deck.json --out deck`,
				`  ${cli()} deck cover --title "Open router for commerce" --body "Buy from any online store from a single endpoint."`,
				`  ${cli()} deck bullets --title "What it does" --items "Search: any store | Check out: end to end | Track: every order"`,
				`  ${cli()} deck --list`,
				'',
				'deck.json slides take their type\'s slots by name, "seed", "theme", "sample", and "image" (a path relative to the file).',
			].join('\n'),
		);
}

function runDeck(positional: string | undefined, o: Opts) {
	const cwd = process.cwd();
	if (o.list) {
		const cat = deckCatalog();
		emit(o, { ok: true, ...cat }, () => cat.slides.map((s) => `${s.id.padEnd(10)} ${s.description}\n${' '.repeat(11)}Slots: ${Object.keys(s.slots).join(', ')}.`).join('\n'));
		return;
	}
	const formats = new Set(String(o.format ?? 'both').split(',').flatMap((f) => (pick('format', f.trim(), ['both', 'png', 'pdf', 'svg'] as const) === 'both' ? ['png', 'pdf'] : [f.trim()])));
	const theme = o.theme === undefined ? undefined : parseTheme(String(o.theme));
	const type = positional ?? (typeof o.slide === 'string' ? o.slide : undefined);
	if (type && o.input) throw new Error('Pass --input or one slide type, not both.');
	let slides: Slide[];
	let base = cwd;
	if (typeof o.input === 'string') {
		const path = isAbsolute(o.input) ? o.input : resolve(cwd, o.input);
		let parsed: { slides?: unknown };
		try {
			parsed = JSON.parse(readFileSync(path, 'utf8'));
		} catch (err) {
			throw new Error(`Could not read ${o.input} as JSON (${(err as Error).message}).`);
		}
		if (!Array.isArray(parsed.slides) || !parsed.slides.length) throw new Error(`${o.input} needs a "slides" list.`);
		slides = parsed.slides as Slide[];
		base = dirname(path);
		for (const flag of [...SLOT_FLAGS, 'headline', 'badge', 'image', 'seed']) if (o[flag] !== undefined) throw new Error(`--${flag} goes with one slide; with --input, put it in the file.`);
	} else {
		if (!type) throw new Error(`Pass --input deck.json or a slide type: ${cli()} deck cover (one of ${slideTypes().join(', ')}).`);
		const one: Slide = { type: pick('slide type', type, slideTypes()) };
		for (const k of SLOT_FLAGS) if (typeof o[k] === 'string') one[k] = o[k] as string;
		for (const k of ['headline', 'badge']) if (typeof o[k] === 'string') one[DECK_ALIASES[k]] = o[k] as string;
		if (typeof o.image === 'string') one.image = o.image;
		if (typeof o.seed === 'string') one.seed = num('seed', o.seed, 0, 100000, { integer: true });
		slides = [one];
	}
	const dir = resolve(cwd, typeof o.out === 'string' ? o.out : 'deck');
	const files: OutFile[] = [];
	const pages: { rgb: Buffer; width: number; height: number }[] = [];
	// Every slide is drawn before any file is written.
	const drawn = slides.map((s, i) => {
		if (!s || typeof s.type !== 'string') throw new Error(`Slide ${i + 1} needs a "type" (${slideTypes().join(', ')}).`);
		const id = pick('slide type', s.type, slideTypes());
		const { image, ...rest } = s as Slide & { image?: unknown };
		if (image !== undefined && typeof image !== 'string') throw new Error(`Slide ${i + 1}: "image" takes a file path.`);
		if (image && !('image' in deckDoc().slides[id].slots)) throw new Error(`Slide ${i + 1} (${id}) holds no picture; "image" goes with cover and image.`);
		try {
			const picture = image ? readPicture(image, join(base, 'deck.json')) : null;
			return { id, r: renderSlide({ ...rest, type: id, picture, sample: !!o.sample || rest.sample === true, ...(theme ? { theme } : rest.theme ? { theme: parseTheme(String(rest.theme)) } : {}) }, { png: formats.has('png') || formats.has('pdf'), svg: formats.has('svg') }) };
		} catch (err) {
			throw new Error(`Slide ${i + 1} (${id}): ${(err as Error).message}`);
		}
	});
	for (const [i, { id, r }] of drawn.entries()) {
		const name = join(dir, `slide-${String(i + 1).padStart(2, '0')}-${id}`);
		if (r.svg) {
			write(`${name}.svg`, r.svg);
			files.push({ path: display(cwd, `${name}.svg`), format: 'svg', slide: id, width: r.width, height: r.height });
		}
		if (r.png && formats.has('png')) {
			write(`${name}.png`, r.png);
			files.push({ path: display(cwd, `${name}.png`), format: 'png', slide: id, width: r.width, height: r.height });
		}
		if (r.rgb && formats.has('pdf')) pages.push({ rgb: r.rgb, width: r.width, height: r.height });
	}
	if (formats.has('pdf')) {
		const pdf = join(dir, 'deck.pdf');
		// 16:9 pages, 13.33 by 7.5 in.
		write(pdf, imagesToPdf(pages, 960));
		files.push({ path: display(cwd, pdf), format: 'pdf', pages: pages.length, width: 1920, height: 1080 });
	}
	emit(o, { ok: true, files }, () => files.map((f) => `${f.path}  ${f.format === 'pdf' ? `${f.pages} page${f.pages === 1 ? '' : 's'}` : `${f.width}x${f.height}`}`).join('\n'));
}
