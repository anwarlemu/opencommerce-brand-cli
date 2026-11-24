import { join, resolve } from 'node:path';
import type { Command } from 'commander';
import { blocksSvg } from '../assets/blocks.js';
import { display, write, type OutFile } from '../assets/io.js';
import { logoMark, paint } from '../image/paint.js';
import { rasterize } from '../image/load.js';
import { brand, cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';

// `icons`: the favicon set, app icons and the default share image, all from brand/logo/mark.svg as drawn. The tile is
// the mark itself; where a platform crops to a circle or a rounded shape (maskable, Apple), the mark's blue is carried
// to the edges, as the sticker carries it past its cut (brand/assets/merch.json).

const tile = (size: number, inset = 0) => {
	const c = paint();
	const s = size * (1 - inset * 2);
	const o = (size - s) / 2;
	const ground = inset ? `<rect width="${size}" height="${size}" fill="${c.brand}"/>` : '';
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${ground}${logoMark(o, o, s)}</svg>`;
};

/** An ICO holding PNGs (every current browser reads PNG entries). */
export function ico(pngs: { size: number; data: Buffer }[]): Buffer {
	const head = Buffer.alloc(6 + pngs.length * 16);
	head.writeUInt16LE(0, 0);
	head.writeUInt16LE(1, 2);
	head.writeUInt16LE(pngs.length, 4);
	let offset = head.length;
	pngs.forEach((p, i) => {
		const at = 6 + i * 16;
		head.writeUInt8(p.size >= 256 ? 0 : p.size, at);
		head.writeUInt8(p.size >= 256 ? 0 : p.size, at + 1);
		head.writeUInt16LE(1, at + 4);
		head.writeUInt16LE(32, at + 6);
		head.writeUInt32LE(p.data.length, at + 8);
		head.writeUInt32LE(offset, at + 12);
		offset += p.data.length;
	});
	return Buffer.concat([head, ...pngs.map((p) => p.data)]);
}

export function iconSet() {
	const files: Record<string, Buffer | string> = {};
	const png = (svg: string) => rasterize(svg);
	files['favicon.svg'] = tile(32);
	files['favicon.ico'] = ico([16, 32, 48].map((size) => ({ size, data: png(tile(size)) })));
	for (const size of [16, 32]) files[`favicon-${size}.png`] = png(tile(size));
	// Apple rounds the corners itself and iOS fills transparency with black, so the tile goes edge to edge.
	files['apple-touch-icon.png'] = png(tile(180, 0.12));
	files['icon-192.png'] = png(tile(192));
	files['icon-512.png'] = png(tile(512));
	// Maskable: everything that matters inside the middle 80 percent, the blue carried to the edges.
	files['icon-maskable-512.png'] = png(tile(512, 0.14));
	const b = brand();
	files['site.webmanifest'] = `${JSON.stringify({ name: b.name, short_name: b.name, icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }], theme_color: paint().white, background_color: paint().white, display: 'standalone' }, null, '\t')}\n`;
	// The default share image: the lockup on the ground with the field gathering at the edges; no words but the name.
	const og = blocksSvg({ width: 1200, height: 630, blocks: [{ id: 'logo', type: 'logo', rect: { x: 300, y: 255, w: 600, h: 120 }, copy: {}, options: { variant: 'lockup' } }, { id: 'art', type: 'art', rect: { x: 0, y: 0, w: 1200, h: 630 }, copy: {}, options: { subject: 'field' } }] }, b.name);
	files['og-default.png'] = png(og.svg);
	return files;
}

export function iconsCommand(program: Command) {
	program
		.command('icons')
		.description('The favicon set (ico, svg, 16 and 32), app icons (180, 192, 512, maskable), the web manifest and the default share image, from the mark file')
		.option('-o, --out <dir>', 'output directory (default icons/)')
		.option('--json', 'JSON output')
		.action((o: { out?: string; json?: boolean }) => {
			const cwd = process.cwd();
			const dir = resolve(cwd, o.out ?? 'icons');
			const files: OutFile[] = [];
			for (const [name, data] of Object.entries(iconSet())) {
				write(join(dir, name), data);
				files.push({ path: display(cwd, join(dir, name)), format: name.split('.').pop()! });
			}
			emit(o, { ok: true, files }, () => [...files.map((f) => f.path), `Link them: <link rel="icon" href="/favicon.ico" sizes="32x32"> <link rel="icon" href="/favicon.svg" type="image/svg+xml"> <link rel="apple-touch-icon" href="/apple-touch-icon.png"> <link rel="manifest" href="/site.webmanifest">`, `(${cli()} icons)`].join('\n'));
		});
}
