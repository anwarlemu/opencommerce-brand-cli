import { join, resolve } from 'node:path';
import type { Command } from 'commander';
import { display, num, pick, write, type OutFile } from '../assets/io.js';
import { loadImage, rasterize } from '../image/render.js';
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
		.option('--size <WxH>', 'size in px (default: the subject\'s; halftone keeps the picture\'s shape)')
		.option('--seed <n>', 'field seed (field and window)')
		.option('--image <file>', 'window: the picture inside it; halftone: the picture to draw')
		.option('--label <text>', 'window: the name in the bar')
		.option('--code <text>', 'window: the code inside it (\\n for a line break)')
		.option('--ground <ground>', 'white (default), mist or none (transparent)')
		.option('-f, --format <format>', 'both, svg or png', 'both')
		.option('-o, --out <path>', 'a directory (default illustrations/) or one .svg or .png file')
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
	let width: number | undefined;
	let height: number | undefined;
	if (typeof o.size === 'string') {
		const m = /^(\d+)x(\d+)$/i.exec(o.size);
		if (!m) throw new Error('--size takes WIDTHxHEIGHT, such as 1200x630.');
		width = Number(m[1]);
		height = Number(m[2]);
	}
	const ground = typeof o.ground === 'string' ? pick('ground', o.ground, ['white', 'mist', 'none'] as const) : 'white';
	let format = pick('format', String(o.format ?? 'both'), ['both', 'svg', 'png'] as const);
	const out = typeof o.out === 'string' ? resolve(cwd, o.out) : undefined;
	const ext = out && /\.(svg|png)$/i.exec(out)?.[1]?.toLowerCase();
	if (ext) format = ext as 'svg' | 'png';
	const picture = typeof o.image === 'string' ? loadImage(resolve(cwd, o.image)) : undefined;
	const r = illustrate({ subject, width, height, seed: num('seed', o.seed, 0, 100000, { integer: true }), picture, label: typeof o.label === 'string' ? o.label : undefined, code: typeof o.code === 'string' ? o.code.replace(/\\n/g, '\n') : undefined, ground });
	const base = ext ? out!.replace(/\.(svg|png)$/i, '') : join(out ?? resolve(cwd, 'illustrations'), `${subject}-${r.width}x${r.height}`);
	const files: OutFile[] = [];
	if (format !== 'png') {
		write(`${base}.svg`, r.svg);
		files.push({ path: display(cwd, `${base}.svg`), format: 'svg', width: r.width, height: r.height });
	}
	if (format !== 'svg') {
		write(`${base}.png`, rasterize(r.svg));
		files.push({ path: display(cwd, `${base}.png`), format: 'png', width: r.width, height: r.height });
	}
	emit(o, { ok: true, subject, glyphs: r.glyphs, files }, () => files.map((f) => `${f.path}  ${f.width}x${f.height}`).join('\n'));
}
