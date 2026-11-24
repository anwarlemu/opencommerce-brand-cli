import { extname, join, resolve } from 'node:path';
import type { Command } from 'commander';
import { display, num, write, type OutFile } from '../assets/io.js';
import { picture as readPicture } from '../image/load.js';
import { PLATFORMS, zonePx } from '../design/platforms.js';
import { encodeScene, parseFormats, parseSize, parseTheme, type Format } from '../image/render.js';
import { illustrate, illustrateData, subjects } from '../illustrate/render.js';
import { cli } from '../lib/brand.js';
import { unknownName } from '../lib/names.js';
import { emit } from '../lib/output.js';

// `illustrate`: the brand's own illustration style as SVG (real vector glyph outlines) and PNG.

type Opts = Record<string, string | boolean | undefined> & { json?: boolean };

export function illustrateCommand(program: Command) {
	program
		.command('illustrate [subject]')
		.description('Illustrations in the brand style (field, window, mark, orbit, halftone of your --image): SVG and PNG')
		.option('--size <size>', 'WIDTHxHEIGHT or a size name such as og or square (default: the subject\'s; halftone keeps the picture\'s shape)')
		.option('--seed <n>', 'field seed (field and window)')
		.option('--image <file>', 'window: the picture inside it; halftone: the picture to draw')
		.option('--label <text>', 'window: the name in the bar')
		.option('--code <text>', 'window: the code inside it (\\n for a line break)')
		.option('--sample', 'window: draw the sample code')
		.option('--theme <theme>', 'the ground: white (default), mist or none (transparent)')
		.option('--ground <ground>', 'the same as --theme')
		.option('-f, --format <formats>', 'both (svg and png), svg, png, jpg, webp, pdf, or several with commas')
		.option('-o, --out <path>', 'a directory (default illustrations/) or one file')
		.option('--list', 'subjects with their sources')
		.option('--json', 'JSON output')
		.action((subject: string | undefined, _o, cmd: Command) => run(subject, cmd.optsWithGlobals() as Opts))
		.addHelpText('after', () => ['', 'Examples:', `  ${cli()} illustrate field --size 1500x500 --seed 7`, `  ${cli()} illustrate window --image shot.png --label shot.png`, `  ${cli()} illustrate mark --format svg --out mark.svg`, `  ${cli()} illustrate halftone --image photo.jpg`, `  ${cli()} illustrate --list`, '', 'Rules: brand/illustration.md. Glyphs are vector outlines placed with <use>.'].join('\n'));
}

function run(subject: string | undefined, o: Opts) {
	const cwd = process.cwd();
	const D = illustrateData();
	if (o.list) {
		const list = subjects().map((id) => ({ id, ...D.subjects[id] }));
		emit(o, { ok: true, subjects: list }, () => list.map((s) => `${s.id.padEnd(10)} ${s.description}\n${' '.repeat(11)}source: ${s.source}${s.image ? '\n           takes --image' : ''}`).join('\n'));
		return;
	}
	if (!subject) throw new Error(`Name a subject: ${subjects().join(', ')} (${cli()} illustrate --list).`);
	if (!subjects().includes(subject)) throw unknownName('subject', subject, subjects());
	let avoid: { x: number; y: number; w: number; h: number }[] | undefined;
	let width: number | undefined;
	let height: number | undefined;
	if (typeof o.size === 'string') {
		const size = parseSize(o.size);
		width = size.width;
		height = size.height;
		// A meeting background keeps clear where the person sits; a wallpaper, the clock and the home bar.
		const p = PLATFORMS.find((x) => x.id === size.id);
		if (p) avoid = p.avoid.map((z) => zonePx(z, size.width, size.height));
	}
	const asked = (o.theme ?? o.ground) as string | undefined;
	const ground = asked === 'none' ? ('none' as const) : parseTheme(asked);
	const out = typeof o.out === 'string' ? resolve(cwd, o.out) : undefined;
	const ext = out ? extname(out) : '';
	const formats: Format[] = typeof o.format === 'string' || ext ? parseFormats(o.format as string | undefined, out) : ['svg', 'png'];
	if (ext && (formats.length !== 1 || ext.slice(1).toLowerCase().replace('jpeg', 'jpg') !== formats[0])) throw new Error(`--out names one ${ext} file, but --format is ${formats.join(', ')}. Pass a directory for several.`);
	const picture = typeof o.image === 'string' ? readPicture(o.image) : undefined;
	const r = illustrate({ subject, width, height, seed: num('seed', o.seed, 0, 100000, { integer: true }), picture, label: typeof o.label === 'string' ? o.label : undefined, code: typeof o.code === 'string' ? o.code.replace(/\\n/g, '\n') : undefined, sample: !!o.sample, ground, ...(avoid?.length ? { avoid } : {}) });
	const base = ext ? out!.slice(0, -ext.length) : join(out ?? resolve(cwd, 'illustrations'), `${subject}-${r.width}x${r.height}`);
	const files: OutFile[] = [];
	const data = encodeScene(r.svg, r.width, r.height, formats);
	for (const f of formats) {
		write(`${base}.${f}`, data[f]!);
		files.push({ path: display(cwd, `${base}.${f}`), format: f, width: r.width, height: r.height });
	}
	emit(o, { ok: true, subject, glyphs: r.glyphs, files }, () => files.map((f) => `${f.path}  ${f.width}x${f.height}`).join('\n'));
}
