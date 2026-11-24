import type { DrawnLayer, LayerEdit } from '../design/types.js';
import { assertDrawable, cleanText, getFaces, joinLines, measure, ratios, wrapLines } from '../image/fonts.js';
import { logoMark, paint } from '../image/paint.js';
import { illustrate } from '../illustrate/render.js';
import { at, badgeItem, cornerLogo, editOf, FitError, keysItem, solve, stackUp, textItem, windowItem, type Align, type Ctx, type Item } from './flow.js';
import { bracketMark, boxShadow, Doc, glyphField, grow, lockup, r2, roundRect, svgDocument, text, union, type Picture, type Rect } from './kit.js';
import { floorFor, imageData, parseCards, unitOf } from './layouts.js';
import { clamp01, smooth } from './noise.js';

// The brand's blocks for open composition: each draws itself inside the rect the grid gives it, fitted the way the
// layouts fit their parts (words whole, down to the floor, or refused), and reports its layers under its own id. Blocks
// are the layouts' own parts: the words, the badge, the keys, the lockup, the window, the cards, the field and the mark.
// The chart and the table follow the library's chart and status table (registry/components/ui/chart.tsx,
// site/status-table.tsx): hairlines at 9 percent ink, figures in the mono at 64 percent, the series blues.

export type BlockType = 'cards' | 'headline' | 'body' | 'badge' | 'logo' | 'button' | 'picture' | 'window' | 'art' | 'card' | 'stat' | 'quote' | 'list' | 'chart' | 'table' | 'divider' | 'icon' | 'panel';

export type BlockSpec = {
	type: BlockType;
	names: string[];
	kind: DrawnLayer['kind'];
	description: string;
	copy: { id: string; required?: boolean }[];
	image?: { required?: boolean };
	options?: { id: string; values?: string[]; range?: [number, number] }[];
	span: { cols: number; rows: number };
	place?: 'top-left' | 'top' | 'top-right' | 'left' | 'center' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right';
	under?: boolean;
};

export const BLOCKS: BlockSpec[] = [
	{ type: 'headline', names: ['title', 'heading'], kind: 'text', description: 'The headline in the display face, tracked tight, as large as its cells allow.', copy: [{ id: 'text', required: true }], span: { cols: 12, rows: 3 }, place: 'top' },
	{ type: 'body', names: ['text', 'line', 'paragraph'], kind: 'text', description: 'A line or paragraph in Inter at 64 percent ink.', copy: [{ id: 'text', required: true }], span: { cols: 10, rows: 2 }, place: 'center' },
	{ type: 'badge', names: ['eyebrow', 'chip', 'pill'], kind: 'text', description: 'The badge: white, a hairline edge, the blue [*] (or a "Product by" attribution).', copy: [{ id: 'text', required: true }], span: { cols: 5, rows: 1 }, place: 'top-left' },
	{ type: 'logo', names: ['lockup', 'mark', 'wordmark'], kind: 'logo', description: 'The lockup from brand/logo, the mark with the lockup, or the mark alone (the default in a square of cells).', copy: [], options: [{ id: 'variant', values: ['lockup', 'mark-lockup', 'mark'] }], span: { cols: 4, rows: 1 }, place: 'top-left' },
	{ type: 'button', names: ['key', 'cta', 'action'], kind: 'key', description: 'The flat keys: the blue key, and the white key beside it when there is a second label.', copy: [{ id: 'text', required: true }, { id: 'secondary' }], span: { cols: 5, rows: 1 }, place: 'bottom' },
	{ type: 'picture', names: ['image', 'screenshot', 'photo'], kind: 'picture', description: 'Your picture, whole: in the brand\'s window (the default) or on its own with the panel\'s corners.', copy: [{ id: 'label' }], image: { required: true }, options: [{ id: 'frame', values: ['window', 'plain'] }], span: { cols: 8, rows: 7 }, place: 'center' },
	{ type: 'window', names: ['code'], kind: 'panel', description: 'The window with code on its blue band (or the dark window).', copy: [{ id: 'code', required: true }, { id: 'label' }], options: [{ id: 'dark', values: ['false', 'true'] }, { id: 'highlight' }], span: { cols: 7, rows: 6 }, place: 'right' },
	{ type: 'art', names: ['field', 'glyphs', 'pattern', 'orbit'], kind: 'art', description: 'The brand\'s own art: the field of * and @, the [*] slab in characters, or the orbit; it keeps clear of every other block.', copy: [], options: [{ id: 'subject', values: ['field', 'mark', 'orbit'] }], span: { cols: 12, rows: 12 }, place: 'center', under: true },
	{ type: 'panel', names: ['backdrop', 'mist'], kind: 'panel', description: 'The closing card: mist with 16px corners and a hairline edge, for blocks to sit on.', copy: [], span: { cols: 12, rows: 12 }, place: 'center', under: true },
	{ type: 'card', names: ['feature'], kind: 'panel', description: 'A numbered card: window white, the blue number, a heading and a line.', copy: [{ id: 'title', required: true }, { id: 'text' }, { id: 'number' }], span: { cols: 4, rows: 4 }, place: 'center' },
	{ type: 'cards', names: ['features', 'card-grid'], kind: 'panel', description: 'Numbered cards in a grid, as the cards layout draws them: blank lines between cards, heading first.', copy: [{ id: 'cards', required: true }], span: { cols: 12, rows: 7 }, place: 'center' },
	{ type: 'stat', names: ['number', 'figure', 'metric'], kind: 'text', description: 'A figure set large in the display face, with its label under it.', copy: [{ id: 'value', required: true }, { id: 'label' }], span: { cols: 4, rows: 4 }, place: 'center' },
	{ type: 'quote', names: ['testimonial'], kind: 'text', description: 'A quotation in the display face with its attribution, as the quote layout sets it.', copy: [{ id: 'text', required: true }, { id: 'by' }], span: { cols: 10, rows: 5 }, place: 'center' },
	{ type: 'list', names: ['points', 'bullets', 'steps'], kind: 'text', description: 'Points, one per line, each after the blue number of the cards.', copy: [{ id: 'items', required: true }], span: { cols: 6, rows: 5 }, place: 'left' },
	{ type: 'chart', names: ['graph', 'bars'], kind: 'key', description: 'A bar, line or donut chart from its value, "Label 12, Label 30": hairlines, mono figures, the series blues.', copy: [{ id: 'value', required: true }], options: [{ id: 'type', values: ['bar', 'line', 'donut'] }], span: { cols: 6, rows: 6 }, place: 'right' },
	{ type: 'table', names: ['grid', 'rows'], kind: 'panel', description: 'A table in a window: rows of cells separated by |, the first row the head on mist.', copy: [{ id: 'rows', required: true }], span: { cols: 8, rows: 6 }, place: 'center' },
	{ type: 'divider', names: ['rule', 'line-rule'], kind: 'art', description: 'A hairline rule at 9 percent ink.', copy: [], span: { cols: 12, rows: 1 }, place: 'center' },
	{ type: 'icon', names: ['glyph'], kind: 'art', description: 'One of the brand\'s own marks: the blue [*] of the window bar, or the mark tile. The site uses no other icon set in its pictures.', copy: [], options: [{ id: 'name', values: ['bracket-mark', 'tile'] }], span: { cols: 2, rows: 2 }, place: 'top-right' },
];

export type PlacedBlock = { id: string; type: BlockType; rect: Rect; copy: Record<string, string>; options: Record<string, string | number | boolean>; picture?: Picture };
export type BlockScene = { width: number; height: number; sizeId?: string; theme?: 'white' | 'mist'; seed?: number; blocks: PlacedBlock[]; edits?: Record<string, LayerEdit>; t?: number };

type Out = { id: string; svg: string; layers: DrawnLayer[]; under?: boolean };

const alignOf = (r: Rect, W: number): Align => {
	const left = r.x / W;
	const right = (W - r.x - r.w) / W;
	return Math.abs(left - right) < 0.06 ? 'center' : left < right ? 'left' : 'right';
};

/** Parts stacked in a rect: the largest sizes that fit, edits applied, placed by the block's alignment. */
function stackIn(ctx: Ctx, id: string, items: Item[], rect: Rect, align: Align): Out {
	const e = editOf(ctx, id);
	const s = e.scale ?? 1;
	const parts = items.map((i) => ({ id: i.id, start: Math.max(i.min, i.start * s), min: i.min }));
	const solved = solve(ctx, parts, (sizes, breaks) => stackUp(items, sizes, rect.w, rect.h, breaks));
	const stack = solved.laid;
	const a = e.align ?? align;
	const box = at(rect, stack.w, stack.h, a === 'left' ? 'left' : a === 'right' ? 'right' : 'center');
	const outs = stack.made.map(({ item, made, y }) => made.paint({ x: a === 'left' ? rect.x : a === 'right' ? rect.x + rect.w - stack.w : box.x, y: box.y + y, w: stack.w, h: made.h }, a, {}));
	const layers = outs.flatMap((o) => o.layers);
	// The block's layer carries its id; its other parts follow as <id>-<part>.
	const main = layers[0];
	const rest = layers.slice(1).map((y) => ({ ...y, id: `${id}-${y.id}` }));
	return { id, svg: outs.map((o) => o.svg).join(''), layers: main ? [{ ...main, id, can: { scale: [0.5, 1.6], hide: true, align: true } }, ...rest] : [] };
}

const parseData = (src: string) =>
	cleanText(src)
		.split(/[,\n]/)
		.map((p) => p.trim())
		.filter(Boolean)
		.map((p) => {
			const m = /^(.*?)[\s:]*(-?\d+(?:\.\d+)?)\s*%?$/.exec(p);
			if (!m) throw new FitError(`Chart values are "Label 12, Label 30"; "${p}" has no number, so it does not fit a chart.`);
			return { label: m[1].trim(), value: Number(m[2]) };
		});

export function drawBlocks(req: BlockScene): { svg: string; layers: DrawnLayer[]; doc: Doc; ground: string } {
	const c = paint();
	const W = req.width;
	const H = req.height;
	const kc = unitOf(W, H);
	const ctx: Ctx = { W, H, k: kc, kc, floor: floorFor(W, H), c, doc: new Doc(), edits: req.edits ?? {}, ground: req.theme === 'mist' ? c.mist : c.white, sample: new Set(), held: {} };
	const outs: Out[] = [];
	const late: (() => void)[] = [];
	const ground = (r: Rect) => {
		// What a block sits on: a panel block under it, or the ground.
		const p = req.blocks.find((b) => b.type === 'panel' && b.rect.x <= r.x && b.rect.y <= r.y && b.rect.x + b.rect.w >= r.x + r.w && b.rect.y + b.rect.h >= r.y + r.h && !editOf(ctx, b.id).hidden);
		return p ? { color: ctx.ground === c.mist ? c.white : c.mist, over: [p.id] } : { color: ctx.ground, over: undefined };
	};
	const drawCard = (id: string, r: Rect, title: string, body: string, num: string, scale: number, own = false): Out => {
				const { display, sans, sansMedium } = getFaces();
				assertDrawable(`${id} title`, title);
				assertDrawable(`${id} text`, body);
				const rad = c.radiusPanel * kc;
				let s = Math.min(1.6, (r.h / 200) * scale);
				for (let i = 0; i < 40; i++) {
					const pad = 26 * kc * s;
					const hs = Math.max(ctx.floor, 25 * kc * s);
					const bs = Math.max(ctx.floor, 17 * kc * s);
					const badge = num ? Math.max(13 * kc * s, ctx.floor / 1.1 + 0.05) : 0;
					const tl = wrapLines(display, title, hs, r.w - pad * 2 - badge * 2 - (badge ? 14 * kc * s : 0), c.trackingTight);
					const bl = body ? wrapLines(sans, body, bs, r.w - pad * 2, 0) : [];
					const need = pad * 2 + Math.max(badge * 2, tl.length * hs * 1.2) + (bl.length ? 12 * kc * s + bl.length * bs * 1.45 : 0);
					const broken = [...tl, ...bl].some((x) => x.glued);
					if ((need <= r.h && !broken) || (hs <= ctx.floor && bs <= ctx.floor && need <= r.h)) {
						const card = { x: r.x, y: r.y, w: r.w, h: r.h };
						const p: string[] = [boxShadow(ctx.doc, card, rad, '--ds-shadow-card', kc), roundRect(card, rad, `fill="${c.white}"`), roundRect({ x: card.x + kc / 2, y: card.y + kc / 2, w: card.w - kc, h: card.h - kc }, rad, `fill="none" stroke="${c.border}" stroke-width="${r2(kc)}"`)];
						const top = card.y + pad;
						const hx = card.x + pad + (badge ? badge * 2 + 14 * kc * s : 0);
						if (badge) {
							p.push(`<circle cx="${r2(card.x + pad + badge)}" cy="${r2(top + badge)}" r="${r2(badge)}" fill="${c.brand}"/>`);
							p.push(text(sansMedium, num, card.x + pad + badge, top + badge + badge * 0.38, badge * 1.1, 0, c.onBrand, 'center'));
						}
						const first = top + Math.max(hs * 0.95, badge ? badge + hs * 0.35 : 0);
						tl.forEach((x, n) => p.push(text(display, x.text, hx, first + n * hs * 1.2, hs, c.trackingTight, c.ink)));
						const bTop = top + Math.max(badge * 2, tl.length * hs * 1.2) + 12 * kc * s;
						bl.forEach((x, n) => p.push(text(sans, x.text, card.x + pad, bTop + bs * 1.05 + n * bs * 1.45, bs, 0, c.secondary)));
						const tInk = tl.map((x, n) => ({ x: hx, y: first + n * hs * 1.2 - hs * 0.72, w: measure(display, x.text, hs, c.trackingTight), h: hs * 0.93 }));
						const bInk = bl.map((x, n) => ({ x: card.x + pad, y: bTop + bs * 1.05 + n * bs * 1.45 - bs * 0.75, w: measure(sans, x.text, bs, 0), h: bs }));
						const layers: DrawnLayer[] = [{ id: id, kind: 'panel', box: card, can: { scale: [0.5, 1.6], hide: true } }, { id: `${id}-title`, kind: 'text', box: union(tInk), ink: tInk, over: [id], text: { asked: title, drawn: joinLines(tl), size: r2(hs), color: c.ink, ground: [c.white] }, can: {} }];
						if (bInk.length) layers.push({ id: `${id}-text`, kind: 'text', box: union(bInk), ink: bInk, over: [id], text: { asked: body, drawn: joinLines(bl), size: r2(bs), color: c.secondary, ground: [c.white] }, can: {} });
						if (num) layers.push({ id: `${id}-number`, kind: 'text', box: { x: card.x + pad, y: top, w: badge * 2, h: badge * 2 }, over: [id], text: { asked: num, drawn: num, size: r2(badge * 1.1), color: c.onBrand, ground: [c.brand], ...(own ? { own: true } : {}) }, can: {} });
						return { id, svg: p.join(''), layers };
					}
					if (hs <= ctx.floor && bs <= ctx.floor) throw new FitError('The card does not fit.');
					s *= 0.94;
				}
				throw new FitError('The card does not fit.');
				
	};
	for (const b of req.blocks) {
		if (editOf(ctx, b.id).hidden) continue;
		const r = b.rect;
		const g = ground(r);
		const align = alignOf(r, W);
		const words = (slot: string) => cleanText(b.copy[slot] ?? '').trim();
		const k = Math.max(0.5, Math.min(r.h / 120, unitOf(W, H) * 1.6));
		const scale = editOf(ctx, b.id).scale ?? 1;
		try {
		switch (b.type) {
			case 'headline':
				outs.push(stackIn(ctx, b.id, [textItem(ctx, { id: 'headline', value: words('text'), face: 'display', start: Math.min(r.h * 0.9, 0.16 * Math.min(W, H) * 1.6), min: ctx.floor * 1.4, gap: 0, leading: c.leadingHeading, fill: c.ink, ground: [g.color], over: g.over, even: true, tracking: () => c.trackingHero })], r, align));
				break;
			case 'body':
				outs.push(stackIn(ctx, b.id, [textItem(ctx, { id: 'body', value: words('text'), face: 'sans', start: Math.max(ctx.floor, Math.min(r.h * 0.6, 34 * kc)), min: ctx.floor, gap: 0, leading: c.leadingLead, fill: c.secondary, ground: [g.color], over: g.over, even: true })], r, align));
				break;
			case 'badge':
				outs.push(stackIn(ctx, b.id, [badgeItem(ctx, words('text'), { start: Math.min(r.h * 0.5, 26 * kc), gap: 0, over: g.over })], r, align));
				break;
			case 'button':
				outs.push(stackIn(ctx, b.id, [keysItem(ctx, words('text'), words('secondary'), { start: Math.min((r.h * 17) / 46, 24 * kc), gap: 0, over: g.over })], r, align));
				break;
			case 'stat': {
				const items = [textItem(ctx, { id: 'value', value: words('value'), face: 'display', start: r.h * 0.62, min: ctx.floor * 1.6, gap: 0, leading: c.leadingHeading, fill: c.ink, ground: [g.color], over: g.over, tracking: () => c.trackingHero })];
				if (words('label')) items.push(textItem(ctx, { id: 'label', value: words('label'), face: 'sans', start: Math.max(ctx.floor, r.h * 0.12), min: ctx.floor, gap: r.h * 0.06, leading: c.leadingLead, fill: c.secondary, ground: [g.color], over: g.over, even: true }));
				outs.push(stackIn(ctx, b.id, items, r, align));
				break;
			}
			case 'quote': {
				const items = [textItem(ctx, { id: 'quote', value: words('text'), face: 'display', start: Math.min(r.h * 0.3, 72 * kc), min: ctx.floor * 1.4, gap: 0, leading: c.leadingHeading, fill: c.ink, ground: [g.color], over: g.over, even: true })];
				if (words('by')) items.push(textItem(ctx, { id: 'by', value: words('by'), face: 'sans', start: Math.max(ctx.floor, 22 * kc), min: ctx.floor, gap: 24 * kc, leading: 1.35, fill: c.secondary, ground: [g.color], over: g.over }));
				outs.push(stackIn(ctx, b.id, items, r, align));
				break;
			}
			case 'logo': {
				// A square of cells holds the mark; a strip holds the lockup.
				const variant = String(b.options.variant ?? (r.w / r.h < 2 ? 'mark' : 'lockup'));
				const rule = imageData().logo;
				if (variant === 'mark') {
					const s = Math.max(32, Math.min(r.w, r.h) * scale);
					if (s > Math.min(r.w, r.h) + 0.5) throw new FitError('The mark does not fit.');
					const p = at(r, s, s, align === 'left' ? 'left' : align === 'right' ? 'right' : 'center');
					outs.push({ id: b.id, svg: logoMark(p.x, p.y, s), layers: [{ id: b.id, kind: 'logo', box: p, logo: { clear: r2(s * 0.1), min: 32 }, can: { scale: [0.5, 1.6], hide: true } }] });
					break;
				}
				const unitW = variant === 'lockup' ? lockup(0, 0, 100, c, 'measure').w / 100 : 0;
				const size = variant === 'lockup' ? Math.min(r.h * 0.7, r.w / unitW) * scale : Math.min(r.h, r.w / 4.6) * scale;
				const logo = cornerLogo({ ...ctx, edits: {} }, variant === 'lockup' ? 'lockup' : 'mark-lockup', size, r, rule, align === 'left' ? 'left' : align === 'right' ? 'right' : 'center', g.over);
				if (logo.box.w > r.w + 0.5 || logo.box.h > r.h + 0.5) throw new FitError('The lockup does not fit.');
				outs.push({ id: b.id, svg: logo.svg, layers: logo.layers.map((y) => ({ ...y, id: b.id, can: { scale: [0.5, 1.6], hide: true } })) });
				break;
			}
			case 'picture':
			case 'window': {
				const pic = b.type === 'picture';
				if (pic && !b.picture) throw new Error(`The ${b.id} block needs a picture.`);
				if (pic && String(b.options.frame ?? 'window') === 'plain') {
					const im = b.picture!;
					const sc = Math.min(r.w / im.width, r.h / im.height) * Math.min(1, scale);
					const box = at(r, im.width * sc, im.height * sc, 'center');
					const clip = ctx.doc.id('pic');
					const rad = c.radiusPanel * kc;
					ctx.doc.defs.push(`<clipPath id="${clip}"><rect x="${r2(box.x)}" y="${r2(box.y)}" width="${r2(box.w)}" height="${r2(box.h)}" rx="${r2(rad)}"/></clipPath>`);
					outs.push({ id: b.id, svg: `<g clip-path="url(#${clip})"><image href="data:${im.mime};base64,${im.data.toString('base64')}" x="${r2(box.x)}" y="${r2(box.y)}" width="${r2(box.w)}" height="${r2(box.h)}" preserveAspectRatio="none"/></g>${roundRect({ x: box.x + kc / 2, y: box.y + kc / 2, w: box.w - kc, h: box.h - kc }, rad, `fill="none" stroke="${c.border}" stroke-width="${r2(kc)}"`)}`, layers: [{ id: b.id, kind: 'picture', box, can: { scale: [0.5, 1], hide: true } }] });
					break;
				}
				const content = pic ? ({ kind: 'picture', picture: b.picture!, pad: 0, rise: false } as const) : ({ kind: 'code', code: b.copy.code ?? '', highlight: String(b.options.highlight ?? ''), dark: String(b.options.dark) === 'true' } as const);
				const item = windowItem(ctx, content, words('label'), { gap: 0, start: pic ? r.w * scale : 22 * kc * scale, min: pic ? Math.min(r.w, 120) : ctx.floor, minW: pic ? 0 : r.w * 0.9, z: 1.3 * kc, frame: r });
				const solved = solve(ctx, [{ id: item.id, start: item.start, min: item.min }], (sizes, breaks) => stackUp([{ ...item, make: (sz) => item.make(sz, r.w) }], sizes, r.w, r.h, breaks));
				const m = solved.laid.made[0];
				const box = at(r, m.made.w, m.made.h, 'center');
				const o = m.made.paint({ x: box.x, y: box.y, w: m.made.w, h: m.made.h }, 'left', {});
				outs.push({ id: b.id, svg: o.svg, layers: o.layers.map((y, i) => ({ ...y, id: i === 0 ? b.id : `${b.id}-${y.id}`, over: y.over?.map((x) => (x === 'window' ? b.id : x)), ...(i === 0 ? { can: { scale: [0.5, 1.6], hide: true } } : {}) })) });
				break;
			}
			case 'panel': {
				const rad = c.radiusShell * kc;
				const fill = ctx.ground === c.mist ? c.white : c.mist;
				outs.push({ id: b.id, under: true, svg: roundRect(r, rad, `fill="${fill}"`) + roundRect({ x: r.x + kc / 2, y: r.y + kc / 2, w: r.w - kc, h: r.h - kc }, rad, `fill="none" stroke="${c.rule}" stroke-width="${r2(kc)}"`), layers: [{ id: b.id, kind: 'panel', box: r, can: { hide: true } }] });
				break;
			}
			case 'card':
				outs.push(drawCard(b.id, r, words('title'), words('text'), words('number'), scale));
				break;
			case 'cards': {
				const list = parseCards(b.copy.cards ?? '');
				if (!list.length) throw new Error(`The ${b.id} block needs cards: blank lines between them, heading first.`);
				const cols = list.length === 1 ? 1 : r.w / r.h > 1.6 ? Math.min(list.length, 4) : r.w / r.h > 0.75 ? 2 : 1;
				const rows = Math.ceil(list.length / cols);
				const gap = Math.max(12 * kc, Math.min(r.w, r.h) * 0.03);
				const cw = (r.w - gap * (cols - 1)) / cols;
				const ch = (r.h - gap * (rows - 1)) / rows;
				const made = list.map((card, i) => drawCard(`${b.id}-${i + 1}`, { x: r.x + (i % cols) * (cw + gap), y: r.y + Math.floor(i / cols) * (ch + gap), w: cw, h: ch }, card.title, card.body, String(i + 1), scale, true));
				const faces = made.map((m) => m.layers[0].box);
				outs.push({ id: b.id, svg: made.map((m) => m.svg).join(''), layers: [{ id: b.id, kind: 'panel', box: union(faces), ink: faces, can: { scale: [0.5, 1.6], hide: true } }, ...made.flatMap((m) => m.layers.map((y, n) => (n === 0 ? { ...y, id: `${y.id}-face`, kind: 'panel' as const, over: [b.id] } : { ...y, over: [b.id, `${m.id}-face`] })))] });
				break;
			}
			case 'list': {
				const rows = cleanText(b.copy.items ?? '').split('\n').map((x) => x.replace(/^\s*[-*\d.)]+\s+/, '').trim()).filter(Boolean);
				if (!rows.length) throw new Error(`The ${b.id} block needs items, one per line.`);
				const { sans, sansMedium } = getFaces();
				for (const x of rows) assertDrawable(b.id, x);
				let size = Math.min(r.h / (rows.length * 1.9), 30 * kc) * scale;
				for (;;) {
					const badge = size * 0.62;
					const max = r.w - badge * 2 - size * 0.7;
					const wrapped = rows.map((x) => wrapLines(sans, x, size, max, 0));
					const lh = size * c.leadingLead;
					const heights = wrapped.map((w) => Math.max(badge * 2, w.length * lh));
					const total = heights.reduce((a, h) => a + h, 0) + (rows.length - 1) * size * 0.7;
					const broken = wrapped.some((w) => w.some((x) => x.glued));
					if ((total <= r.h && !broken) || size <= ctx.floor) {
						if (total > r.h) throw new FitError('The list does not fit.');
						let y = r.y + (r.h - total) / 2;
						const p: string[] = [];
						const ink: Rect[] = [];
						const { cap } = ratios(sans);
						wrapped.forEach((w, i) => {
							p.push(`<circle cx="${r2(r.x + badge)}" cy="${r2(y + badge)}" r="${r2(badge)}" fill="${c.brand}"/>`);
							p.push(text(sansMedium, String(i + 1), r.x + badge, y + badge + badge * 0.38, badge * 1.1, 0, c.onBrand, 'center'));
							const tx = r.x + badge * 2 + size * 0.7;
							const t0 = y + Math.max(0, (badge * 2 - lh) / 2);
							w.forEach((x, n) => {
								p.push(text(sans, x.text, tx, t0 + cap * size + (lh - size) / 2 + n * lh, size, 0, c.ink));
								ink.push({ x: tx, y: t0 + (lh - size) / 2 + n * lh, w: measure(sans, x.text, size, 0), h: size * 1.05 });
							});
							y += heights[i] + size * 0.7;
						});
						outs.push({ id: b.id, svg: p.join(''), layers: [{ id: b.id, kind: 'text', box: union(ink), ink, over: g.over, text: { asked: rows.join('\n'), drawn: wrapped.map((w) => joinLines(w)).join('\n'), size: r2(size), color: c.ink, ground: [g.color] }, can: { scale: [0.5, 1.6], hide: true } }] });
						break;
					}
					size = Math.max(ctx.floor, size * 0.94);
				}
				break;
			}
			case 'chart': {
				const data = parseData(b.copy.value ?? '');
				if (data.length < 1 || data.length > 12) throw new Error(`The ${b.id} chart takes 1 to 12 values.`);
				const type = String(b.options.type ?? 'bar');
				const mono = getFaces().mono;
				const fs = Math.max(ctx.floor, 11.5 * kc * 1.2);
				for (const d of data) assertDrawable(b.id, d.label);
				const p: string[] = [];
				const ink: Rect[] = [];
				const words: DrawnLayer[] = [];
				const label = (s: string, x: number, y: number, al: 'left' | 'center' | 'right') => {
					const w = measure(mono, s, fs, 0);
					const lx = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x;
					p.push(text(mono, s, lx, y, fs, 0, c.secondary));
					ink.push({ x: lx, y: y - fs * 0.75, w, h: fs });
				};
				if (type === 'donut') {
					const total = data.reduce((a, d) => a + Math.max(0, d.value), 0) || 1;
					const keyW = Math.max(...data.map((d) => measure(mono, `${d.label} ${d.value}`, fs, 0))) + fs * 1.6;
					const R = Math.min(r.h, r.w - keyW - fs) / 2;
					if (R < 40) throw new FitError('The chart does not fit.');
					const cx = r.x + R;
					const cy = r.y + r.h / 2;
					let a0 = -Math.PI / 2;
					data.forEach((d, i) => {
						const a1 = a0 + (Math.max(0, d.value) / total) * Math.PI * 2;
						const large = a1 - a0 > Math.PI ? 1 : 0;
						const pt = (a: number, rr: number) => `${r2(cx + Math.cos(a) * rr)} ${r2(cy + Math.sin(a) * rr)}`;
						const ri = R * 0.62;
						p.push(`<path d="M${pt(a0, R)}A${r2(R)} ${r2(R)} 0 ${large} 1 ${pt(a1 - 0.0001, R)}L${pt(a1 - 0.0001, ri)}A${r2(ri)} ${r2(ri)} 0 ${large} 0 ${pt(a0, ri)}Z" fill="${c.series[i % 4]}" stroke="${ctx.ground}" stroke-width="${r2(2 * kc)}"/>`);
						a0 = a1;
						const ky = cy - (data.length * fs * 1.6) / 2 + i * fs * 1.6 + fs;
						p.push(`<rect x="${r2(cx + R + fs)}" y="${r2(ky - fs * 0.7)}" width="${r2(fs * 0.7)}" height="${r2(fs * 0.7)}" rx="${r2(fs * 0.15)}" fill="${c.series[i % 4]}"/>`);
						label(`${d.label} ${d.value}`, cx + R + fs * 2, ky, 'left');
					});
				} else {
					const max = Math.max(...data.map((d) => d.value), 0) || 1;
					const plot = { x: r.x, y: r.y + fs * 1.6, w: r.w, h: r.h - fs * 3.6 };
					if (plot.h < 40) throw new FitError('The chart does not fit.');
					for (let i = 0; i <= 3; i++) p.push(`<rect x="${r2(plot.x)}" y="${r2(plot.y + (plot.h * i) / 3)}" width="${r2(plot.w)}" height="${r2(kc)}" fill="${c.rule}"/>`);
					const step = plot.w / data.length;
					const pts = data.map((d, i) => ({ x: plot.x + step * (i + 0.5), y: plot.y + plot.h - (Math.max(0, d.value) / max) * plot.h }));
					if (step < fs * 2.2) throw new FitError('The chart does not fit.');
					data.forEach((d, i) => {
						if (type === 'bar') {
							const bw = step * 0.56;
							p.push(roundRect({ x: pts[i].x - bw / 2, y: pts[i].y, w: bw, h: plot.y + plot.h - pts[i].y }, Math.min(4 * kc, bw / 4), `fill="${c.series[0]}"`));
						}
						label(d.label, pts[i].x, plot.y + plot.h + fs * 1.5, 'center');
						label(String(d.value), pts[i].x, pts[i].y - fs * 0.5, 'center');
					});
					if (type === 'line') {
						p.push(`<polyline points="${pts.map((q) => `${r2(q.x)},${r2(q.y)}`).join(' ')}" fill="none" stroke="${c.series[0]}" stroke-width="${r2(2.5 * kc)}" stroke-linejoin="round" stroke-linecap="round"/>`);
						for (const q of pts) p.push(`<circle cx="${r2(q.x)}" cy="${r2(q.y)}" r="${r2(3.5 * kc)}" fill="${c.white}" stroke="${c.series[0]}" stroke-width="${r2(2 * kc)}"/>`);
					}
					const wide = Math.max(...data.map((d) => Math.max(measure(mono, d.label, fs, 0), measure(mono, String(d.value), fs, 0))));
					if (wide > step * 0.96) throw new FitError('The chart labels do not fit.');
				}
				words.push({ id: `${b.id}-labels`, kind: 'text', box: union(ink), ink, over: [b.id], text: { asked: cleanText(b.copy.value ?? '').trim(), drawn: cleanText(b.copy.value ?? '').trim(), size: r2(fs), color: c.secondary, ground: [g.color] }, can: {} });
				outs.push({ id: b.id, svg: p.join(''), layers: [{ id: b.id, kind: 'key', box: r, can: { hide: true } }, ...words] });
				break;
			}
			case 'table': {
				const rows = cleanText(b.copy.rows ?? '').split('\n').map((x) => x.split('|').map((y) => y.trim())).filter((x) => x.some(Boolean));
				if (!rows.length) throw new Error(`The ${b.id} table needs rows, cells separated by |, the first row the head.`);
				const cols = Math.max(...rows.map((x) => x.length));
				const { sans, mono } = getFaces();
				for (const x of rows.flat()) assertDrawable(b.id, x);
				let fs = Math.max(ctx.floor / 0.85, Math.min(r.h / (rows.length * 2.6), 20 * kc) * scale);
				for (;;) {
					const pad = fs * 0.9;
					const widths = Array.from({ length: cols }, (_, i) => Math.max(...rows.map((x, n) => measure(n === 0 ? mono : sans, x[i] ?? '', n === 0 ? fs * 0.85 : fs, 0))) + pad * 2);
					const tw = widths.reduce((a, w) => a + w, 0);
					const rh = fs * 2.4;
					const th = rh * rows.length;
					if ((tw <= r.w && th <= r.h) || fs <= ctx.floor) {
						if (tw > r.w || th > r.h) throw new FitError('The table does not fit.');
						const sc = r.w / tw;
						const box = { x: r.x, y: r.y + (r.h - th) / 2, w: r.w, h: th };
						const rad = c.radiusPanel * kc;
						const clip = ctx.doc.id('table');
						ctx.doc.defs.push(`<clipPath id="${clip}"><rect x="${r2(box.x)}" y="${r2(box.y)}" width="${r2(box.w)}" height="${r2(box.h)}" rx="${r2(rad)}"/></clipPath>`);
						const p: string[] = [roundRect(box, rad, `fill="${c.white}"`), `<g clip-path="url(#${clip})"><rect x="${r2(box.x)}" y="${r2(box.y)}" width="${r2(box.w)}" height="${r2(rh)}" fill="${c.windowBar}"/>`];
						const ink: Rect[] = [];
						rows.forEach((row, n) => {
							if (n) p.push(`<rect x="${r2(box.x)}" y="${r2(box.y + n * rh)}" width="${r2(box.w)}" height="${r2(kc)}" fill="${c.rule}"/>`);
							let x = box.x;
							row.forEach((cell, i) => {
								const face = n === 0 ? mono : sans;
								const s = n === 0 ? fs * 0.85 : fs;
								const y = box.y + n * rh + rh / 2 + s * 0.36;
								if (cell) {
									p.push(text(face, cell, x + pad, y, s, 0, n === 0 ? c.secondary : c.ink));
									ink.push({ x: x + pad, y: y - s * 0.75, w: measure(face, cell, s, 0), h: s });
								}
								x += widths[i] * sc;
							});
						});
						p.push('</g>', roundRect({ x: box.x + kc / 2, y: box.y + kc / 2, w: box.w - kc, h: box.h - kc }, rad, `fill="none" stroke="${c.border}" stroke-width="${r2(kc)}"`));
						const all = rows.flat().filter(Boolean).join(' ');
						outs.push({ id: b.id, svg: p.join(''), layers: [{ id: b.id, kind: 'panel', box, can: { scale: [0.5, 1.6], hide: true } }, { id: `${b.id}-cells`, kind: 'text', box: union(ink), ink, over: [b.id], text: { asked: all, drawn: all, size: r2(Math.min(fs, fs * 0.85)), color: c.ink, ground: [c.white, c.windowBar] }, can: {} }] });
						break;
					}
					fs = Math.max(ctx.floor / 0.85, fs * 0.94);
					if (fs <= ctx.floor / 0.85 + 0.01 && (tableWidth(rows, cols, mono, sans, fs) > r.w || fs * 2.4 * rows.length > r.h)) throw new FitError('The table does not fit.');
				}
				break;
			}
			case 'divider': {
				const y = r.y + r.h / 2;
				const box = { x: r.x, y: y - kc / 2, w: r.w, h: kc };
				outs.push({ id: b.id, svg: `<rect x="${r2(box.x)}" y="${r2(box.y)}" width="${r2(box.w)}" height="${r2(box.h)}" fill="${c.rule}"/>`, layers: [{ id: b.id, kind: 'art', box, can: { hide: true } }] });
				break;
			}
			case 'icon': {
				const s = Math.min(r.w, r.h) * Math.min(1, scale);
				const box = at(r, s, s, align === 'left' ? 'left' : align === 'right' ? 'right' : 'center');
				const svg = String(b.options.name ?? 'bracket-mark') === 'tile' ? logoMark(box.x, box.y, s) : bracketMark(box.x + s / 2, box.y + s / 2, s * 0.62, c.brand).svg;
				outs.push({ id: b.id, svg, layers: [{ id: b.id, kind: 'art', box, can: { scale: [0.5, 1], hide: true } }] });
				break;
			}
			case 'art':
				late.push(() => {
					const subject = String(b.options.subject ?? 'field');
					const keep = outs.flatMap((o) => (o.under ? [] : o.layers.flatMap((y) => (y.ink ?? [y.box]).map((x) => grow(x, (y.logo?.clear ?? 0) + 14 * kc)))));
					if (subject === 'field') {
						const ink: Rect[] = [];
						const svg = glyphField(ctx.doc, { box: r, z: 1.3 * kc * (Number(b.options['glyph-size'] ?? 1) || 1), seed: req.seed ?? 3, t: req.t, keep, ink, fade: (nx, ny) => clamp01((Math.hypot(nx / 1.2, ny / 1.3) - 0.3) / 0.5) }, c);
						outs.unshift({ id: b.id, under: true, svg, layers: [{ id: b.id, kind: 'art', box: r, ink, can: { hide: true } }] });
						return;
					}
					// The mark and the orbit, drawn at the block's size and placed in it; the words keep clear of them.
					const ill = illustrate({ subject, width: Math.max(200, Math.round(r.w)), height: Math.max(200, Math.round(r.h)), ground: 'none', t: req.t });
					const body = ill.svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<title>[\s\S]*?<\/title>/, '').replace(/<desc>[\s\S]*?<\/desc>/, '').replace(/<\/svg>\s*$/, '');
					const sx = r.w / ill.width;
					const sy = r.h / ill.height;
					const ns = ctx.doc.id('art');
					outs.unshift({ id: b.id, under: true, svg: `<g transform="translate(${r2(r.x)} ${r2(r.y)}) scale(${r2(sx)} ${r2(sy)})">${body.replace(/id="([^"]+)"/g, `id="${ns}$1"`).replace(/#(g[0-9a-f]+-[\d_]+)/g, `#${ns}$1`)}</g>`, layers: [{ id: b.id, kind: 'art', box: r, ink: [grow({ x: r.x + r.w * 0.25, y: r.y + r.h * 0.25, w: r.w * 0.5, h: r.h * 0.5 }, 0)], can: { hide: true } }] });
				});
				break;
		}
		} catch (error) {
			if (error instanceof FitError) throw new Error(`The ${b.id} does not fit its cells (${Math.round(r.w)}x${Math.round(r.h)} px) at a readable size: shorten it, or give it more cells (design compose span).`);
			throw error;
		}
	}
	for (const f of late) f();
	const svg = outs.map((o) => o.svg).join('');
	return { svg, layers: outs.flatMap((o) => o.layers), doc: ctx.doc, ground: ctx.ground };
}

function tableWidth(rows: string[][], cols: number, mono: ReturnType<typeof getFaces>['mono'], sans: ReturnType<typeof getFaces>['sans'], fs: number) {
	return Array.from({ length: cols }, (_, i) => Math.max(...rows.map((x, n) => measure(n === 0 ? mono : sans, x[i] ?? '', n === 0 ? fs * 0.85 : fs, 0))) + fs * 1.8).reduce((a, w) => a + w, 0);
}

export function blocksSvg(req: BlockScene, title: string) {
	const d = drawBlocks(req);
	return { svg: svgDocument(d.doc, req.width, req.height, d.ground, d.svg, { title }), layers: d.layers };
}

export { smooth };
