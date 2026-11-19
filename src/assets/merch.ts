import { readFileSync } from 'node:fs';
import { getFaces } from '../image/fonts.js';
import { paint } from '../image/paint.js';
import { rasterize } from '../image/render.js';
import { pkgPath } from '../lib/paths.js';
import { unknownName } from '../lib/names.js';
import { Doc, glyphField, lockup, r2, squareMark, svgDocument, text, windowSvg, wrapGreedy, type Rect } from './kit.js';
import { designFor, drawLayout, imageData } from './layouts.js';
import { clamp01, smooth } from './noise.js';

// Merch print files (brand/assets/merch.json): each item's trim, bleed and safe area in inches, and layers in inches
// from the trim. A file is the item at 300 px per inch with the bleed around it: SVG at physical size (inches on the
// root, with the die line for a sticker) and PNG at the asked dpi. Only the logo files as drawn, and brand colors.

export const PX_PER_IN = 300;

type Box = [number, number, number, number];
type Layer =
	| { type: 'lockup'; box: Box }
	| { type: 'mark'; box: Box; bleedFill?: boolean }
	| { type: 'field'; box: Box; seed: number; glyph: number; fade?: 'edges' }
	| { type: 'window'; box: Box; slot: string }
	| { type: 'text'; slot: string; box: Box; size: number; maxLines?: number }
	| { type: 'hero'; box: Box };
export type MerchItem = { id: string; name: string; size: [number, number]; bleed: number; safe: number; method: string; source: string; cut?: { radius: number }; variants: string[]; layers: Layer[] };
type MerchDoc = { dpi: number; slots: Record<string, string>; variants: Record<string, { ground: boolean; description: string }>; items: MerchItem[] };

let doc: MerchDoc | undefined;
export const merchDoc = (): MerchDoc => (doc ??= JSON.parse(readFileSync(pkgPath('brand', 'assets', 'merch.json'), 'utf8')) as MerchDoc);
export const merchItems = () => merchDoc().items;
export function findItem(id: string): MerchItem {
	const item = merchItems().find((i) => i.id === id);
	if (!item) throw unknownName('item', id, merchItems().map((i) => i.id));
	return item;
}

const slotsOf = (item: MerchItem) => [...new Set(item.layers.flatMap((l) => (l.type === 'text' || l.type === 'window' ? [l.slot] : l.type === 'hero' ? ['headline', 'body'] : [])))];

export function merchCatalog() {
	return {
		note: 'Sizes are common vendor print areas: confirm with the vendor template before ordering. Print on white or light blanks.',
		items: merchItems().map((i) => ({
			id: i.id,
			name: i.name,
			trim: { width: i.size[0], height: i.size[1], unit: 'in' },
			bleed: i.bleed,
			safe: i.safe,
			method: i.method,
			variants: i.variants,
			pixels: { width: Math.round((i.size[0] + 2 * i.bleed) * PX_PER_IN), height: Math.round((i.size[1] + 2 * i.bleed) * PX_PER_IN), dpi: PX_PER_IN },
			dieCut: Boolean(i.cut),
			slots: slotsOf(i),
			source: i.source,
		})),
		variants: Object.entries(merchDoc().variants).map(([id, v]) => ({ id, ...v })),
		lockups: ['brand/logo/lockup.svg', 'brand/logo/mark.svg'],
	};
}

export type MerchRequest = { variant?: string; slots?: Record<string, string>; guides?: boolean };

/** Where each drawn logo landed (px, bleed included), for the clear-space checks. */
export type Placed = { kind: 'lockup' | 'mark'; rect: Rect };

/** An item as an SVG document in its own pixels (300 per inch, bleed included). */
export function itemSvg(item: MerchItem, req: MerchRequest = {}) {
	const variant = req.variant ?? item.variants[0];
	if (!item.variants.includes(variant)) throw unknownName(`variant for ${item.id}`, variant, item.variants);
	const v = merchDoc().variants[variant];
	const c = paint();
	const takes = slotsOf(item);
	for (const k of Object.keys(req.slots ?? {})) if (!takes.includes(k)) throw new Error(`${item.id} does not draw --${k}.${takes.length ? ` It takes ${takes.map((s) => `--${s}`).join(', ')}.` : ' It takes no text.'}`);
	const slots = { ...merchDoc().slots, ...req.slots };
	const o = item.bleed * PX_PER_IN;
	const W = Math.round((item.size[0] + 2 * item.bleed) * PX_PER_IN);
	const H = Math.round((item.size[1] + 2 * item.bleed) * PX_PER_IN);
	const px = (b: Box): Rect => ({ x: b[0] * PX_PER_IN + o, y: b[1] * PX_PER_IN + o, w: b[2] * PX_PER_IN, h: b[3] * PX_PER_IN });
	const d = new Doc();
	const parts: string[] = [];
	const placed: Placed[] = [];
	const keep: Rect[] = [];
	// Logos, words and windows first, so the field keeps clear of them.
	const later: string[] = [];
	for (const l of item.layers) {
		if (l.type === 'lockup') {
			const b = px(l.box);
			const unitW = lockup(0, 0, 100, c, 'measure').w / 100;
			const size = Math.min(b.h, b.w / unitW);
			const w = unitW * size;
			const x = b.x + (b.w - w) / 2;
			const y = b.y + (b.h - size) / 2;
			later.push(lockup(x, y, size, c).svg);
			placed.push({ kind: 'lockup', rect: { x, y, w, h: size } });
			keep.push({ x, y, w, h: size });
		} else if (l.type === 'mark') {
			const b = px(l.box);
			const s = Math.min(b.w, b.h);
			const x = b.x + (b.w - s) / 2;
			const y = b.y + (b.h - s) / 2;
			if (l.bleedFill && item.cut) parts.push(`<rect x="0" y="0" width="${W}" height="${H}" rx="${r2(item.cut.radius * PX_PER_IN + o)}" fill="${c.brand}"/>`);
			later.push(squareMark(x, y, s));
			placed.push({ kind: 'mark', rect: { x, y, w: s, h: s } });
			keep.push({ x, y, w: s, h: s });
		} else if (l.type === 'window') {
			const b = px(l.box);
			const z = b.w / 640;
			later.push(windowSvg(d, b, slots[l.slot] ?? '', { kind: 'code', code: imageData().code, highlight: '1-5', scale: 1.1 }, z, c));
			keep.push(b);
		} else if (l.type === 'text') {
			const b = px(l.box);
			const value = slots[l.slot] ?? '';
			if (!value.trim()) continue;
			const display = getFaces().display;
			let size = l.size * PX_PER_IN;
			let lines = wrapGreedy(display, value, size, c.trackingHero, b.w);
			while (lines.length > (l.maxLines ?? 2) && size > l.size * PX_PER_IN * 0.5) {
				size *= 0.92;
				lines = wrapGreedy(display, value, size, c.trackingHero, b.w);
			}
			if (lines.length > (l.maxLines ?? 2)) throw new Error(`${item.id}: --${l.slot} is too long for ${l.maxLines ?? 2} lines. Shorten it.`);
			lines.forEach((line, i) => later.push(text(display, line, b.x + b.w / 2, b.y + size * 0.86 + i * size * c.leadingHeading, size, c.trackingHero, c.ink, 'center')));
			keep.push({ x: b.x, y: b.y, w: b.w, h: lines.length * size * c.leadingHeading });
		} else if (l.type === 'hero') {
			const design = designFor('hero', W, H);
			design.logo = true;
			if (req.slots?.headline || req.slots?.body) {
				design.title = slots.headline;
				design.text = req.slots?.body ?? '';
			}
			later.push(drawLayout(d, design, c).svg);
		}
	}
	for (const l of item.layers) {
		if (l.type !== 'field') continue;
		const b = px(l.box);
		const z = (l.glyph * PX_PER_IN) / 11;
		const fade = l.fade === 'edges' ? (nx: number, ny: number) => smooth(clamp01((Math.max(Math.abs(nx), Math.abs(ny) * 0.8) - 0.35) / 0.4)) : (nx: number, ny: number) => 1 - smooth(clamp01((Math.hypot(nx, ny) - 0.55) / 0.45));
		parts.push(glyphField(d, { box: b, z, seed: l.seed, fade, keep: keep.map((k) => ({ x: k.x - 0.15 * PX_PER_IN, y: k.y - 0.15 * PX_PER_IN, w: k.w + 0.3 * PX_PER_IN, h: k.h + 0.3 * PX_PER_IN })) }, c));
	}
	parts.push(...later);
	if (req.guides) {
		const s = item.safe * PX_PER_IN;
		if (item.bleed) parts.push(`<rect x="${o}" y="${o}" width="${item.size[0] * PX_PER_IN}" height="${item.size[1] * PX_PER_IN}" fill="none" stroke="${c.brand}" stroke-width="3"/>`);
		parts.push(`<rect x="${o + s}" y="${o + s}" width="${item.size[0] * PX_PER_IN - 2 * s}" height="${item.size[1] * PX_PER_IN - 2 * s}" fill="none" stroke="${c.brand}" stroke-width="3" stroke-dasharray="18 12"/>`);
	}
	let cut = '';
	if (item.cut) {
		const w = item.size[0] * PX_PER_IN;
		const h = item.size[1] * PX_PER_IN;
		const r = item.cut.radius * PX_PER_IN;
		const p = `M${o + r} ${o}H${o + w - r}A${r} ${r} 0 0 1 ${o + w} ${o + r}V${o + h - r}A${r} ${r} 0 0 1 ${o + w - r} ${o + h}H${o + r}A${r} ${r} 0 0 1 ${o} ${o + h - r}V${o + r}A${r} ${r} 0 0 1 ${o + r} ${o}Z`;
		// The die line: a spot color the cutter reads by name; it is not printed.
		cut = `<g id="CutContour"><path d="${p}" fill="none" stroke="#FF00FF" stroke-width="3"/></g>`;
	}
	const widthIn = item.size[0] + 2 * item.bleed;
	const heightIn = item.size[1] + 2 * item.bleed;
	const svg = svgDocument(d, W, H, v.ground ? c.white : null, parts.join(''), { title: `${item.name} (${variant})`, desc: `${item.method}. ${item.size[0]} by ${item.size[1]} in trim, ${item.bleed} in bleed, ${item.safe} in safe area.` }, { widthIn, heightIn });
	return { svg, cut, variant, width: W, height: H, widthIn, heightIn, placed };
}

/** Sets the PNG's pixels per inch (a pHYs chunk after IHDR), so print software reads the size. */
function withDpi(png: Buffer, dpi: number) {
	const ppm = Math.round(dpi / 0.0254);
	const data = Buffer.alloc(9);
	data.writeUInt32BE(ppm, 0);
	data.writeUInt32BE(ppm, 4);
	data[8] = 1;
	const type = Buffer.from('pHYs', 'ascii');
	const len = Buffer.alloc(4);
	len.writeUInt32BE(9, 0);
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(Buffer.concat([type, data])) >>> 0, 0);
	const chunk = Buffer.concat([len, type, data, crc]);
	return Buffer.concat([png.subarray(0, 33), chunk, png.subarray(33)]);
}

let table: Uint32Array | undefined;
function crc32(buf: Buffer) {
	table ??= Uint32Array.from({ length: 256 }, (_, n) => {
		let c = n;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		return c >>> 0;
	});
	let c = 0xffffffff;
	for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8);
	return (c ^ 0xffffffff) >>> 0;
}

export function renderItem(item: MerchItem, req: MerchRequest & { png?: boolean; svg?: boolean; dpi?: number } = {}) {
	const r = itemSvg(item, req);
	const dpi = req.dpi ?? PX_PER_IN;
	const out: { svg?: string; png?: Buffer; variant: string; width: number; height: number; widthIn: number; heightIn: number; dpi: number; placed: Placed[] } = { variant: r.variant, width: Math.round(r.widthIn * dpi), height: Math.round(r.heightIn * dpi), widthIn: r.widthIn, heightIn: r.heightIn, dpi, placed: r.placed };
	if (req.svg !== false) out.svg = r.svg.replace(/\n<\/svg>\n$/, `${r.cut}\n</svg>\n`);
	if (req.png !== false) out.png = withDpi(rasterize(r.svg, { width: out.width }), dpi);
	return out;
}
