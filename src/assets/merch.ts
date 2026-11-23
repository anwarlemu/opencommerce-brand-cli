import { readFileSync } from 'node:fs';
import type { DrawnLayer } from '../design/types.js';
import { assertDrawable, cleanText, getFaces, joinLines, measure, ratios, wrapLines } from '../image/fonts.js';
import { paint } from '../image/paint.js';
import { rasterize } from '../image/load.js';
import { pkgPath } from '../lib/paths.js';
import { unknownName } from '../lib/names.js';
import { Doc, glyphField, lockup, grow, r2, squareMark, svgDocument, text, union, windowSvg, WINDOW, type Rect } from './kit.js';
import { drawScene, imageData, type Copy } from './layouts.js';
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
	| { type: 'window'; box: Box }
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

export const slotsOf = (item: MerchItem) => [...new Set(item.layers.flatMap((l) => (l.type === 'text' ? [l.slot] : l.type === 'window' ? ['code', 'label'] : l.type === 'hero' ? ['headline', 'body', 'badge', 'code', 'label'] : [])))];

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
			required: i.layers.some((l) => l.type === 'hero') ? ['headline'] : [],
			source: i.source,
		})),
		variants: Object.entries(merchDoc().variants).map(([id, v]) => ({ id, ...v })),
		lockups: ['brand/logo/lockup.svg', 'brand/logo/mark.svg'],
	};
}

export type MerchRequest = { variant?: string; slots?: Record<string, string>; guides?: boolean; sample?: boolean; seed?: number };

/** Where each drawn logo landed (px, bleed included), for the clear-space checks. */
export type Placed = { kind: 'lockup' | 'mark'; rect: Rect };

/** Smallest printed text, in inches. */
const MIN_TEXT = 0.11;

/** An item as an SVG document in its own pixels (300 per inch, bleed included). Only the copy it is given is drawn;
 *  `sample` fills the rest. */
export function itemSvg(item: MerchItem, req: MerchRequest = {}) {
	const variant = req.variant ?? item.variants[0];
	if (!item.variants.includes(variant)) throw unknownName(`variant for ${item.id}`, variant, item.variants);
	const v = merchDoc().variants[variant];
	const c = paint();
	const takes = slotsOf(item);
	const slots: Record<string, string> = {};
	for (const [k, value] of Object.entries(req.slots ?? {})) {
		if (!value.trim()) continue;
		if (!takes.includes(k)) throw new Error(`${item.id} does not draw --${k}.${takes.length ? ` It takes ${takes.map((s) => `--${s}`).join(', ')}.` : ' It takes no text.'}`);
		slots[k] = cleanText(value.replace(/\\n/g, '\n'));
		assertDrawable(k, slots[k]);
	}
	const sampled = new Set<string>();
	if (req.sample)
		for (const k of takes) {
			const value = merchDoc().slots[k];
			if (slots[k] || !value) continue;
			slots[k] = value;
			sampled.add(k);
		}
	if (slots.label && !slots.code) throw new Error(`${item.id}: --label names the window, and there is no window without --code.`);
	const o = item.bleed * PX_PER_IN;
	const W = Math.round((item.size[0] + 2 * item.bleed) * PX_PER_IN);
	const H = Math.round((item.size[1] + 2 * item.bleed) * PX_PER_IN);
	const px = (b: Box): Rect => ({ x: b[0] * PX_PER_IN + o, y: b[1] * PX_PER_IN + o, w: b[2] * PX_PER_IN, h: b[3] * PX_PER_IN });
	const safe: Rect = { x: o + item.safe * PX_PER_IN, y: o + item.safe * PX_PER_IN, w: (item.size[0] - 2 * item.safe) * PX_PER_IN, h: (item.size[1] - 2 * item.safe) * PX_PER_IN };
	const rule = imageData().logo;
	// A transparent ground is printed on a white or light blank.
	const ground = c.white;
	const d = new Doc();
	const parts: string[] = [];
	const placed: Placed[] = [];
	const layers: DrawnLayer[] = [];
	const keep: Rect[] = [];
	const mark = (k: string) => (sampled.has(k) ? { sample: true } : {});
	// Logos, words and windows first, so the field keeps clear of them.
	const later: string[] = [];
	let logos = 0;
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
			keep.push(grow({ x, y, w, h: size }, size * rule.clear));
			logos += 1;
			layers.push({ id: logos > 1 ? `logo-${logos}` : 'logo', kind: 'logo', box: { x, y, w, h: size }, logo: { clear: r2(rule.clear * size), min: rule.min }, can: {} });
		} else if (l.type === 'mark') {
			const b = px(l.box);
			const s = Math.min(b.w, b.h);
			const x = b.x + (b.w - s) / 2;
			const y = b.y + (b.h - s) / 2;
			if (l.bleedFill && item.cut) parts.push(`<rect x="0" y="0" width="${W}" height="${H}" rx="${r2(item.cut.radius * PX_PER_IN + o)}" fill="${c.brand}"/>`);
			later.push(squareMark(x, y, s));
			placed.push({ kind: 'mark', rect: { x, y, w: s, h: s } });
			keep.push({ x, y, w: s, h: s });
			logos += 1;
			layers.push({ id: logos > 1 ? `logo-${logos}` : 'logo', kind: 'logo', box: { x, y, w: s, h: s }, ...(l.bleedFill ? { bleeds: true } : {}), logo: { clear: 0, min: 32 }, can: {} });
		} else if (l.type === 'window') {
			if (!slots.code) continue;
			const b = px(l.box);
			const mono = getFaces().mono;
			const code = slots.code.replace(/\t/g, '  ').replace(/\s+$/, '');
			const rows = code.split('\n');
			const z = b.w / 640;
			const unit = Math.max(1, ...rows.map((row) => measure(mono, row, 1, 0)));
			const chrome = (WINDOW.bar + WINDOW.padY * 2) * z;
			const size = Math.min(13 * z * 1.1, (b.w - WINDOW.padX * 2 * z) / unit, (b.h - chrome) / (rows.length * c.leadingCode));
			if (size < MIN_TEXT * PX_PER_IN) throw new Error(`${item.id}: the code does not fit its window at a readable size (${MIN_TEXT} in). Shorten it or break its lines.`);
			const h = chrome + rows.length * size * c.leadingCode;
			const r: Rect = { x: b.x, y: b.y + (b.h - h) / 2, w: b.w, h };
			const label = slots.label ?? '';
			const ls = WINDOW.label * z;
			if (label && measure(mono, label, ls, 0) > b.w * 0.7) throw new Error(`${item.id}: --label is too long for the window bar. Shorten it.`);
			later.push(windowSvg(d, r, label, { kind: 'code', code, highlight: sampled.has('code') ? imageData().templates.hero.sample.highlight ?? '' : '', size }, z, c));
			keep.push(r);
			layers.push({ id: 'window', kind: 'panel', box: r, can: {} });
			if (label) {
				const lw = measure(mono, label, ls, 0);
				layers.push({ id: 'label', kind: 'text', box: { x: r.x + r.w / 2 - lw / 2, y: r.y + (WINDOW.bar * z - ls) / 2, w: lw, h: ls }, over: ['window'], text: { asked: label, drawn: label, size: r2(ls), color: c.secondary, ground: [c.windowBar], ...mark('label') }, can: {} });
			}
			const lh = size * c.leadingCode;
			const ink = rows.flatMap((row, i) => (row.trim() ? [{ x: r.x + WINDOW.padX * z, y: r.y + (WINDOW.bar + WINDOW.padY) * z + i * lh + lh * 0.15, w: measure(mono, row, size, 0), h: lh * 0.7 }] : []));
			layers.push({ id: 'code', kind: 'text', box: union(ink), ink, over: ['window'], text: { asked: code, drawn: rows.join('\n'), size: r2(size), color: c.secondary, ground: [c.white, c.band], ...mark('code') }, can: {} });
		} else if (l.type === 'text') {
			const b = px(l.box);
			const value = (slots[l.slot] ?? '').trim();
			if (!value) continue;
			const display = getFaces().display;
			const { cap, desc } = ratios(display);
			const min = Math.max(MIN_TEXT * 2, l.size * 0.3) * PX_PER_IN;
			let size = l.size * PX_PER_IN;
			const fit = () => wrapLines(display, value, size, b.w, c.trackingHero, true);
			let lines = fit();
			const heightOf = () => (cap + desc) * size + (lines.length - 1) * size * c.leadingHeading;
			while ((heightOf() > b.h || lines.some((x) => x.glued)) && size > min) {
				size = Math.max(min, size * 0.95);
				lines = fit();
			}
			if (heightOf() > b.h + 0.5) throw new Error(`${item.id}: --${l.slot} does not fit at a readable size (${value.length} characters). Shorten it.`);
			const top = b.y + (b.h - heightOf()) / 2;
			const ink = lines.map((line, i) => {
				const w = measure(display, line.text, size, c.trackingHero);
				return { x: b.x + b.w / 2 - w / 2, y: top + i * size * c.leadingHeading, w, h: (cap + desc) * size };
			});
			lines.forEach((line, i) => later.push(text(display, line.text, b.x + b.w / 2, top + cap * size + i * size * c.leadingHeading, size, c.trackingHero, c.ink, 'center')));
			keep.push(union(ink));
			layers.push({ id: l.slot, kind: 'text', box: union(ink), ink, text: { asked: value, drawn: joinLines(lines), size: r2(size), color: c.ink, ground: [ground], ...mark(l.slot) }, can: {} });
		} else if (l.type === 'hero') {
			if (!slots.headline) throw new Error(`${item.id} needs --headline (or --sample for sample copy).`);
			const copy: Copy = { headline: slots.headline, body: slots.body, badge: slots.badge, code: slots.code, label: slots.label, ...(sampled.has('code') ? { highlight: imageData().templates.hero.sample.highlight } : {}) };
			const scene = drawScene({ template: 'hero', width: W, height: H, copy, sample: sampled, logo: true, seed: req.seed, safe, floor: MIN_TEXT * 1.6 * PX_PER_IN, doc: d });
			later.push(scene.svg);
			layers.push(...scene.layers);
			for (const y of scene.layers) if (y.kind === 'logo') placed.push({ kind: 'lockup', rect: y.box });
		}
	}
	for (const l of item.layers) {
		if (l.type !== 'field') continue;
		const b = px(l.box);
		const z = (l.glyph * PX_PER_IN) / 11;
		const ink: Rect[] = [];
		const fade = l.fade === 'edges' ? (nx: number, ny: number) => smooth(clamp01((Math.max(Math.abs(nx), Math.abs(ny) * 0.8) - 0.35) / 0.4)) : (nx: number, ny: number) => 1 - smooth(clamp01((Math.hypot(nx, ny) - 0.55) / 0.45));
		parts.push(glyphField(d, { box: b, z, seed: req.seed ?? l.seed, ink, fade, keep: keep.map((k) => grow(k, 0.15 * PX_PER_IN)) }, c));
		layers.unshift({ id: 'art', kind: 'art', box: b, ink, bleeds: true, can: {} });
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
	return { svg, cut, variant, width: W, height: H, widthIn, heightIn, placed, layers, safe };
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
	const out: { svg?: string; png?: Buffer; variant: string; width: number; height: number; widthIn: number; heightIn: number; dpi: number; placed: Placed[]; layers: DrawnLayer[] } = { variant: r.variant, width: Math.round(r.widthIn * dpi), height: Math.round(r.heightIn * dpi), widthIn: r.widthIn, heightIn: r.heightIn, dpi, placed: r.placed, layers: r.layers };
	if (req.svg !== false) out.svg = r.svg.replace(/\n<\/svg>\n$/, `${r.cut}\n</svg>\n`);
	if (req.png !== false) out.png = withDpi(rasterize(r.svg, { width: out.width }), dpi);
	return out;
}
