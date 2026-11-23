import { join, resolve } from 'node:path';
import type { Command } from 'commander';
import { display, num, pick, write, type OutFile } from '../assets/io.js';
import { findItem, merchCatalog, merchItems, PX_PER_IN, renderItem, slotsOf } from '../assets/merch.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';

// `merch`: print files only (never mockups). SVG at physical size and PNG at 300 dpi, bleed included.

type Opts = Record<string, string | boolean | undefined> & { json?: boolean };
const NOTE = 'Sizes are common vendor print areas, not a vendor\'s template: confirm with the vendor before ordering. Print on white or light blanks.';

export function merchCommand(program: Command) {
	program
		.command('merch [item]')
		.description('Merch print files (tee front and back, hoodie, cap, tote, mug wrap, die-cut sticker, poster): SVG at physical size and PNG with bleed')
		.option('--item <id>', 'tee-front, tee-back, hoodie-front, cap-front, tote, mug-wrap, sticker or poster')
		.option('-v, --variant <id>', 'color (transparent ground) or paper (white to the bleed); each item names its own')
		.option('--headline <text>', 'tee-back and poster: the line')
		.option('--body <text>', 'poster: the line under the headline')
		.option('--badge <text>', 'poster: the badge above the headline')
		.option('--code <text>', 'tee-back and poster: the code in the window (\\n for a line break); no window without it')
		.option('--label <text>', 'tee-back and poster: the name in the window bar')
		.option('--sample', 'fill the slots you leave out with sample copy')
		.option('--seed <n>', 'glyph field seed')
		.option('--dpi <n>', 'PNG resolution, 72 to 600', String(PX_PER_IN))
		.option('--guides', 'draw the trim and safe lines for proofing')
		.option('-f, --format <format>', 'svg, png, both, or several with commas', 'both')
		.option('-o, --out <dir>', 'output directory (default merch/)')
		.option('--all', 'every item in every variant')
		.option('--list', 'items with trim, bleed, safe area, variants and sources')
		.option('--json', 'JSON output')
		.action((item: string | undefined, _o, cmd: Command) => run(item, cmd.optsWithGlobals() as Opts))
		.addHelpText('after', () => ['', 'Examples:', `  ${cli()} merch tee-front`, `  ${cli()} merch sticker --guides`, `  ${cli()} merch poster --headline "Open router for commerce"`, `  ${cli()} merch --all --sample --dpi 150 --out merch`, '', NOTE, 'The sticker SVG holds a CutContour path (the die line), which is not printed.'].join('\n'));
}

function run(positional: string | undefined, o: Opts) {
	const cwd = process.cwd();
	if (o.list) {
		const cat = merchCatalog();
		emit(o, { ok: true, ...cat }, () => [...cat.items.map((i) => `${i.id.padEnd(13)} ${`${i.trim.width} x ${i.trim.height} in`.padEnd(13)} bleed ${String(i.bleed).padEnd(6)} safe ${String(i.safe).padEnd(6)} ${`${i.pixels.width}x${i.pixels.height}px`.padEnd(12)} ${i.variants.join(', ')}\n${' '.repeat(14)}${i.method}. ${i.source}`), '', NOTE].join('\n'));
		return;
	}
	const formats = new Set(String(o.format ?? 'both').split(',').flatMap((f) => (pick('format', f.trim(), ['svg', 'png', 'both'] as const) === 'both' ? ['svg', 'png'] : [f.trim()])));
	const seed = num('seed', o.seed, 0, 100000, { integer: true });
	const dpi = num('dpi', o.dpi, 72, 600, { integer: true }) ?? PX_PER_IN;
	const slots: Record<string, string> = {};
	for (const k of ['headline', 'body', 'badge', 'code', 'label']) if (typeof o[k] === 'string') slots[k] = o[k] as string;
	const named = positional ?? (typeof o.item === 'string' ? o.item : undefined);
	const jobs: { id: string; variant?: string }[] = [];
	if (o.all) {
		if (named) throw new Error('Pass an item or --all, not both.');
		if (!slots.headline && !o.sample) throw new Error('--all draws the poster too, which needs --headline (or --sample for sample copy).');
		for (const i of merchItems()) for (const v of i.variants) jobs.push({ id: i.id, variant: v });
	} else {
		if (!named) throw new Error(`Name an item: ${cli()} merch tee-front (--list shows them).`);
		jobs.push({ id: findItem(named).id, variant: typeof o.variant === 'string' ? o.variant : undefined });
	}
	const dir = resolve(cwd, typeof o.out === 'string' ? o.out : 'merch');
	const files: OutFile[] = [];
	for (const job of jobs) {
		const item = findItem(job.id);
		const r = renderItem(item, { variant: job.variant, slots: o.all ? Object.fromEntries(Object.entries(slots).filter(([k]) => slotsOf(item).includes(k))) : slots, sample: !!o.sample, seed, guides: !!o.guides, dpi, png: formats.has('png'), svg: formats.has('svg') });
		const base = join(dir, `${item.id}-${r.variant}`);
		const inches = `${r.widthIn} x ${r.heightIn} in`;
		if (r.svg) {
			write(`${base}.svg`, r.svg);
			files.push({ path: display(cwd, `${base}.svg`), format: 'svg', item: item.id, variant: r.variant, inches, width: Math.round(r.widthIn * PX_PER_IN), height: Math.round(r.heightIn * PX_PER_IN) });
		}
		if (r.png) {
			write(`${base}.png`, r.png);
			files.push({ path: display(cwd, `${base}.png`), format: 'png', item: item.id, variant: r.variant, inches, dpi, width: r.width, height: r.height });
		}
	}
	emit(o, { ok: true, files, dpi, note: NOTE }, () => [...files.map((f) => `${f.path}  ${f.inches}${f.format === 'png' ? `, ${f.width}x${f.height} px at ${f.dpi} dpi` : ''}`), NOTE].join('\n'));
}
