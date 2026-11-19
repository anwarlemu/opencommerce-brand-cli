import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import type { Command } from 'commander';
import { deckCatalog, deckDoc, renderSlide, slideTypes, type Slide } from '../assets/deck.js';
import { display, pick, write, type OutFile } from '../assets/io.js';
import { imagesToPdf } from '../assets/pdf.js';
import { loadImage, resolveImage } from '../image/render.js';
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
		.option('--seed <n>', 'glyph field seed')
		.option('-f, --format <format>', 'both (PNG and PDF), png, pdf or svg', 'both')
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
				'deck.json slides take their type\'s slots by name, "seed", and "image" (a path relative to the file).',
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
	const format = pick('format', String(o.format ?? 'both'), ['both', 'png', 'pdf', 'svg'] as const);
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
		for (const flag of [...SLOT_FLAGS, 'image', 'seed']) if (o[flag] !== undefined) throw new Error(`--${flag} goes with one slide; with --input, put it in the file.`);
	} else {
		if (!type) throw new Error(`Pass --input deck.json or a slide type: ${cli()} deck cover (one of ${slideTypes().join(', ')}).`);
		const one: Slide = { type: pick('slide type', type, slideTypes()) };
		for (const k of SLOT_FLAGS) if (typeof o[k] === 'string') one[k] = o[k] as string;
		if (typeof o.image === 'string') one.image = o.image;
		if (typeof o.seed === 'string') one.seed = Number(o.seed);
		slides = [one];
	}
	const dir = resolve(cwd, typeof o.out === 'string' ? o.out : 'deck');
	const files: OutFile[] = [];
	const pages: { rgb: Buffer; width: number; height: number }[] = [];
	for (const [i, s] of slides.entries()) {
		if (!s || typeof s.type !== 'string') throw new Error(`Slide ${i + 1} needs a "type" (${slideTypes().join(', ')}).`);
		const id = pick('slide type', s.type, slideTypes());
		const { image, ...rest } = s as Slide & { image?: unknown };
		if (image !== undefined && typeof image !== 'string') throw new Error(`Slide ${i + 1}: "image" takes a file path.`);
		if (image && !('image' in deckDoc().slides[id].slots)) throw new Error(`Slide ${i + 1} (${id}) holds no picture; "image" goes with cover and image.`);
		const picture = image ? loadImage(resolveImage(image, join(base, 'deck.json'))) : null;
		let r;
		try {
			r = renderSlide({ ...rest, type: id, picture }, { png: format !== 'svg', svg: format === 'svg' });
		} catch (err) {
			throw new Error(`Slide ${i + 1} (${id}): ${(err as Error).message}`);
		}
		const name = join(dir, `slide-${String(i + 1).padStart(2, '0')}-${id}`);
		if (r.svg) {
			write(`${name}.svg`, r.svg);
			files.push({ path: display(cwd, `${name}.svg`), format: 'svg', slide: id, width: r.width, height: r.height });
		}
		if (r.png && format !== 'pdf') {
			write(`${name}.png`, r.png);
			files.push({ path: display(cwd, `${name}.png`), format: 'png', slide: id, width: r.width, height: r.height });
		}
		if (r.rgb) pages.push({ rgb: r.rgb, width: r.width, height: r.height });
	}
	if (format === 'both' || format === 'pdf') {
		const pdf = join(dir, 'deck.pdf');
		// 16:9 pages, 13.33 by 7.5 in.
		write(pdf, imagesToPdf(pages, 960));
		files.push({ path: display(cwd, pdf), format: 'pdf', pages: pages.length, width: 1920, height: 1080 });
	}
	emit(o, { ok: true, files }, () => files.map((f) => `${f.path}  ${f.format === 'pdf' ? `${f.pages} page${f.pages === 1 ? '' : 's'}` : `${f.width}x${f.height}`}`).join('\n'));
}
