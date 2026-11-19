import { readFileSync } from 'node:fs';
import { getFaces, measure } from '../image/fonts.js';
import type { Paint } from '../image/paint.js';
import { pkgPath } from '../lib/paths.js';
import { clamp01, smooth } from './noise.js';
import { boxShadow, chip, Doc, drawWords, glyphField, grow, keys, lockup, measureWords, r2, roundRect, text, union, windowSvg, wrapGreedy, type Picture, type Rect, type WindowBody } from './kit.js';

// The four layouts of the brand's image tool, drawn as SVG in the image's own pixels: hero (a window rising from the
// bottom edge), window (words beside a window), closing (the mist card) and cards (numbered cards). Their sizes,
// opening copy and sources are in brand/assets/image.json.

export type LayoutId = 'hero' | 'window' | 'closing' | 'cards';
export const LAYOUTS: LayoutId[] = ['hero', 'window', 'closing', 'cards'];

type TemplateDoc = { description: string; source: string; textSize: number; textWidth: { wide: number; tall: number }; defaults: Record<string, string | number | boolean> };
export type ImageDoc = {
	unit: { width: number; height: number };
	custom: { min: number; max: number };
	sizes: Record<string, { width: number; height: number; description: string }>;
	aliases: Record<string, string>;
	templates: Record<LayoutId, TemplateDoc>;
	code: string;
	notes: string[];
};

let imageDoc: ImageDoc | undefined;
export const imageData = (): ImageDoc => (imageDoc ??= JSON.parse(readFileSync(pkgPath('brand', 'assets', 'image.json'), 'utf8')) as ImageDoc);

export type Design = {
	width: number;
	height: number;
	layout: LayoutId;
	chip: string;
	logo: boolean;
	title: string;
	text: string;
	primary: string;
	secondary: string;
	/** Headline size in the image's pixels; default from the layout and the unit. */
	textSize?: number;
	/** Line width as a share of the image width. */
	textWidth?: number;
	showWindow: boolean;
	windowName: string;
	inside: 'code' | 'picture';
	code: string;
	highlight: string;
	picture?: Picture;
	glyphs: boolean;
	seed: number;
	cards: string;
	footer: string;
	/** Seconds into the field's drift (video); 0 is still. */
	t?: number;
	/** Entrance amounts for video, 0 to 1 each. */
	enter?: { words?: number; window?: number; field?: number; codeLine?: (i: number) => number; item?: (i: number) => number };
};

export const unitOf = (w: number, h: number) => Math.sqrt((w * h) / (imageData().unit.width * imageData().unit.height));

/** The layout's opening values for a size, as the tool sets them when a template is picked. */
export function designFor(layout: LayoutId, width: number, height: number): Design {
	const t = imageData().templates[layout];
	const d = t.defaults;
	const k = unitOf(width, height);
	const wide = width / height >= 1.25;
	const str = (key: string, fallback = '') => (typeof d[key] === 'string' ? (d[key] as string) : fallback);
	return {
		width,
		height,
		layout,
		chip: str('chip'),
		logo: d.logo === true,
		title: str('title'),
		text: str('text'),
		primary: '',
		secondary: '',
		textSize: Math.round(t.textSize * k),
		textWidth: wide ? t.textWidth.wide : t.textWidth.tall,
		showWindow: true,
		windowName: str('label', 'agent.ts'),
		inside: 'code',
		code: imageData().code,
		highlight: str('highlight'),
		glyphs: true,
		seed: typeof d.seed === 'number' ? d.seed : 3,
		cards: str('cards'),
		footer: str('footer'),
	};
}

const fade = (svg: string, amount: number | undefined, drop = 0) => {
	if (amount === undefined || amount >= 1) return svg;
	if (amount <= 0) return '';
	const dy = r2((1 - amount) * drop);
	return `<g opacity="${amount.toFixed(3)}"${dy ? ` transform="translate(0 ${dy})"` : ''}>${svg}</g>`;
};

function windowBody(d: Design, scale: number): WindowBody {
	if (d.inside === 'picture' && d.picture) return { kind: 'picture', picture: d.picture };
	if (d.inside === 'picture') return { kind: 'empty' };
	return { kind: 'code', code: d.code, highlight: d.highlight, scale, lineAlpha: d.enter?.codeLine };
}

/** The hero: the chip, the headline and its line centered, the keys, and a window rising from the bottom edge;
 *  glyphs in the margins either side. */
function hero(doc: Doc, d: Design, c: Paint, k: number) {
	const W = d.width;
	const H = d.height;
	const keep: Rect[] = [];
	let y = H * 0.11;
	const logoH = d.logo ? 36 * k + 24 * k : 0;
	const logo = d.logo ? lockup(40 * k, 36 * k, 24 * k, c) : null;
	if (logo) keep.push(logo);
	const ch = d.chip.trim() ? chip(d.chip, k, c) : null;
	const m = measureWords(d.title, d.text, d.textSize ?? 90 * k, (d.textWidth ?? 0.86) * W, c);
	const keysH = d.primary.trim() || d.secondary.trim() ? 46 * k : 0;
	const blockH = (ch ? ch.h + 30 * k : 0) + m.h + (keysH ? 32 * k + keysH : 0);
	const win: Rect = { x: W * 0.16, y: y + blockH + 64 * k, w: W * 0.68, h: Math.max(H * 0.5, H - (y + blockH + 64 * k) + 24 * k) };
	const fits = d.showWindow && win.y <= H * 0.82;
	if (!fits) {
		win.y = H + 1;
		y = Math.max(logoH + 24 * k, (H - blockH) / 2);
	}
	const rects: Rect[] = [];
	if (ch) rects.push({ x: W / 2 - ch.w / 2, y, w: ch.w, h: ch.h });
	const wordsTop = y + (ch ? ch.h + 30 * k : 0);
	rects.push({ x: W / 2 - m.w / 2, y: wordsTop, w: m.w, h: m.h });
	if (keysH) rects.push({ x: W * 0.3, y: wordsTop + m.h + 32 * k, w: W * 0.4, h: keysH });
	const parts: string[] = [];
	if (d.glyphs)
		parts.push(
			fade(
				glyphField(doc, { box: { x: 0, y: 0, w: W, h: H }, z: 1.45 * k, seed: d.seed, t: d.t, fade: (nx) => smooth(clamp01((Math.abs(nx) - 0.42) / 0.4)), keep: [...keep, ...rects, ...(fits ? [win] : [])].map((r) => grow(r, 18 * k)) }, c),
				d.enter?.field,
			),
		);
	if (fits) parts.push(fade(windowSvg(doc, win, d.windowName, windowBody(d, 1.1), 1.45 * k, c), d.enter?.window, 24 * k));
	if (logo) parts.push(logo.svg);
	const words: string[] = [];
	if (ch) words.push(ch.draw(W / 2 - ch.w / 2, y));
	words.push(drawWords(m, W / 2, wordsTop, 'center', c));
	if (keysH) words.push(keys({ primary: d.primary, secondary: d.secondary }, W / 2, wordsTop + m.h + 32 * k, k, 'center', c)?.svg ?? '');
	parts.push(fade(words.join(''), d.enter?.words, 12 * k));
	return { svg: parts.join(''), text: union(rects), window: fits ? win : null };
}

/** The window layout: the words on one side, the window on the other with the glyph field round it; stacked when the
 *  image is tall. */
function split(doc: Doc, d: Design, c: Paint, k: number) {
	const W = d.width;
	const H = d.height;
	const across = W / H >= 1.25;
	const m0 = 48 * k;
	const top0 = d.logo ? m0 + 24 * k + 40 * k : m0;
	const ch = d.chip.trim() ? chip(d.chip, k, c) : null;
	const colW = across ? W * 0.42 - m0 : W - m0 * 2;
	const m = measureWords(d.title, d.text, d.textSize ?? 54 * k, Math.min((d.textWidth ?? 0.4) * W, colW), c);
	const keysH = d.primary.trim() || d.secondary.trim() ? 46 * k : 0;
	const blockH = (ch ? ch.h + 26 * k : 0) + m.h + (keysH ? 30 * k + keysH : 0);
	const area: Rect = across ? { x: W * 0.47, y: 0, w: W * 0.53, h: H } : { x: 0, y: top0 + blockH + 30 * k, w: W, h: H - (top0 + blockH + 30 * k) };
	const win: Rect = across ? { x: area.x + 28 * k, y: H * 0.14, w: area.w - 28 * k - m0, h: H * 0.72 } : { x: m0, y: area.y + 30 * k, w: W - m0 * 2, h: area.h - 30 * k - m0 };
	const tx = across ? m0 : W / 2;
	const align = across ? 'left' : 'center';
	const top = across || !d.showWindow ? Math.max(top0, (H - blockH) / 2) : top0;
	const blockW = Math.max(m.w, ch?.w ?? 0, keysH ? W * 0.3 : 0);
	const textBox: Rect = { x: across ? tx : W / 2 - blockW / 2, y: top, w: blockW, h: blockH };
	const parts: string[] = [];
	if (d.glyphs)
		parts.push(
			fade(
				glyphField(
					doc,
					{
						box: d.showWindow ? area : { x: 0, y: 0, w: W, h: H },
						z: 1.3 * k,
						seed: d.seed,
						t: d.t,
						fade: (nx, ny) => 1 - smooth(clamp01((Math.hypot(nx, ny) - 0.7) / 0.3)),
						keep: d.showWindow ? [grow(win, 4 * k), grow(textBox, 24 * k)] : [grow(textBox, 24 * k)],
					},
					c,
				),
				d.enter?.field,
			),
		);
	if (d.showWindow) parts.push(fade(windowSvg(doc, win, d.windowName, windowBody(d, 1), 1.3 * k, c), d.enter?.window, 24 * k));
	if (d.logo) parts.push(lockup(m0, m0, 24 * k, c).svg);
	const words: string[] = [];
	let y = top;
	if (ch) {
		words.push(ch.draw(across ? tx : W / 2 - ch.w / 2, y));
		y += ch.h + 26 * k;
	}
	words.push(drawWords(m, tx, y, align, c));
	y += m.h;
	if (keysH) words.push(keys({ primary: d.primary, secondary: d.secondary }, tx, y + 30 * k, k, align, c)?.svg ?? '');
	parts.push(fade(words.join(''), d.enter?.words, 12 * k));
	return { svg: parts.join(''), text: textBox, window: d.showWindow ? win : null };
}

/** The closing card: a mist card with 16px corners and a hairline edge, the glyph field gathering at its edges, the
 *  words and keys centered. */
function closing(doc: Doc, d: Design, c: Paint, k: number) {
	const W = d.width;
	const H = d.height;
	const m0 = 36 * k;
	const card: Rect = { x: m0, y: m0, w: W - m0 * 2, h: H - m0 * 2 };
	const ch = d.chip.trim() ? chip(d.chip, k, c) : null;
	const m = measureWords(d.title, d.text, d.textSize ?? 64 * k, (d.textWidth ?? 0.86) * W, c);
	const keysH = d.primary.trim() || d.secondary.trim() ? 46 * k : 0;
	const logoH = d.logo ? 26 * k : 0;
	const blockH = (logoH ? logoH + 34 * k : 0) + (ch ? ch.h + 26 * k : 0) + m.h + (keysH ? 34 * k + keysH : 0);
	let y = card.y + (card.h - blockH) / 2;
	const textBox: Rect = { x: W / 2 - Math.max(m.w, W * 0.3) / 2, y, w: Math.max(m.w, W * 0.3), h: blockH };
	const parts: string[] = [roundRect(card, c.radiusShell * k, `fill="${c.mist}"`)];
	if (d.glyphs)
		parts.push(
			fade(
				glyphField(doc, { box: card, z: 1.3 * k, seed: d.seed, t: d.t, fade: (nx, ny) => clamp01((Math.hypot(nx / 1.44, ny / 1.7) - 0.48) / 0.52), keep: [grow(textBox, 24 * k)] }, c),
				d.enter?.field,
			),
		);
	parts.push(roundRect({ x: card.x + k / 2, y: card.y + k / 2, w: card.w - k, h: card.h - k }, c.radiusShell * k, `fill="none" stroke="${c.rule}" stroke-width="${r2(k)}"`));
	const words: string[] = [];
	if (logoH) {
		const w = lockup(0, 0, logoH, c, 'measure').w;
		words.push(lockup(W / 2 - w / 2, y, logoH, c).svg);
		y += logoH + 34 * k;
	}
	if (ch) {
		words.push(ch.draw(W / 2 - ch.w / 2, y));
		y += ch.h + 26 * k;
	}
	words.push(drawWords(m, W / 2, y, 'center', c));
	if (keysH) words.push(keys({ primary: d.primary, secondary: d.secondary }, W / 2, y + m.h + 34 * k, k, 'center', c)?.svg ?? '');
	parts.push(fade(words.join(''), d.enter?.words, 12 * k));
	return { svg: parts.join(''), text: textBox, window: null };
}

/** Blank lines separate cards; each card's first line is its heading. */
export function parseCards(src: string) {
	return src
		.split(/\n\s*\n/)
		.map((block) => block.trim())
		.filter(Boolean)
		.map((block) => {
			const [title, ...rest] = block.split('\n');
			return { title: title.trim(), body: rest.join(' ').replace(/\s+/g, ' ').trim() };
		});
}

const CARD = { pad: 30, badge: 13, heading: 25, body: 17, gapX: 30, gapY: 18 };

/** Numbered cards: the title across the top, a grid of window-white cards (the blue number, a heading, a few lines),
 *  and a footer with the lockup on the left and an address on the right. Everything shrinks together to fit. */
function cards(doc: Doc, d: Design, c: Paint, k: number) {
	const W = d.width;
	const H = d.height;
	const display = getFaces().display;
	const sans = getFaces().sans;
	const medium = getFaces().sansMedium;
	const mx = Math.max(W * 0.071, 32 * k);
	const top = H * 0.07;
	let size = d.textSize ?? 38 * k;
	let lines: string[] = [];
	for (let i = 0; i < 12; i++) {
		lines = d.title.trim() ? wrapGreedy(display, d.title, size, c.trackingHero, W - mx * 2) : [];
		if (lines.length <= 3) break;
		size *= 0.9;
	}
	const titleW = Math.max(0, ...lines.map((l) => measure(display, l, size, c.trackingHero)));
	const titleH = lines.length * size * 1.15;
	const footerH = d.logo || d.footer.trim() ? 30 * k : 0;
	const footer: Rect = { x: mx, y: H - H * 0.055 - footerH, w: W - mx * 2, h: footerH };
	const areaTop = top + titleH + (titleH ? H * 0.065 : 0);
	const areaBottom = footerH ? footer.y - H * 0.065 : H - H * 0.07;
	const list = parseCards(d.cards);
	const n = list.length;
	const cols = n <= 1 ? 1 : W / H < 0.65 ? 1 : 2;
	const rows = Math.max(1, Math.ceil(n / cols));
	const gapX = CARD.gapX * k;
	const gapY = CARD.gapY * k;
	const cw = (W - mx * 2 - gapX * (cols - 1)) / cols;
	const chH = Math.max(40 * k, (areaBottom - areaTop - gapY * (rows - 1)) / rows);
	let s = 1;
	let tallest = 0;
	let laid: { rect: Rect; n: number; heading: string[]; body: string[] }[] = [];
	for (let attempt = 0; attempt < 14; attempt++) {
		const pad = CARD.pad * k * s;
		const badge = CARD.badge * k * s;
		const hs = CARD.heading * k * s;
		const bs = CARD.body * k * s;
		tallest = 0;
		laid = list.map((card, i) => {
			const r = Math.floor(i / cols);
			const inRow = Math.min(cols, n - r * cols);
			const rowW = inRow * cw + (inRow - 1) * gapX;
			const x = (W - rowW) / 2 + (i % cols) * (cw + gapX);
			const y = areaTop + r * (chH + gapY);
			const heading = wrapGreedy(display, card.title, hs, c.trackingTight, cw - pad * 2 - badge * 2 - 14 * k * s);
			const body = card.body ? wrapGreedy(sans, card.body, bs, 0, cw - pad * 2) : [];
			const need = pad * 2 + Math.max(badge * 2, heading.length * hs * 1.2) + (body.length ? 14 * k * s + body.length * bs * 1.45 : 0);
			tallest = Math.max(tallest, need);
			return { rect: { x, y, w: cw, h: chH }, n: i + 1, heading, body };
		});
		if (tallest <= chH || s < 0.45) break;
		s *= Math.max(0.8, Math.min(0.97, chH / tallest));
	}
	const need = Math.min(chH, tallest * 1.18);
	const lift = ((chH - need) * rows) / 2;
	laid = laid.map((cd, i) => ({ ...cd, rect: { ...cd.rect, y: areaTop + lift + Math.floor(i / cols) * (need + gapY), h: need } }));
	const ink: Rect[] = [{ x: W / 2 - titleW / 2, y: top, w: titleW, h: titleH }];
	const footSize = 21 * k;
	const footW = d.footer.trim() ? measure(display, d.footer.trim(), footSize, 0) : 0;
	if (footerH) {
		if (d.logo) ink.push({ x: footer.x, y: footer.y, w: lockup(0, 0, footerH * 0.8, c, 'measure').w, h: footerH });
		if (footW) ink.push({ x: footer.x + footer.w - footW, y: footer.y, w: footW, h: footerH });
	}
	const parts: string[] = [];
	if (d.glyphs)
		parts.push(
			fade(
				glyphField(doc, { box: { x: 0, y: 0, w: W, h: H }, z: 1.3 * k, seed: d.seed, t: d.t, fade: (nx, ny) => clamp01((Math.hypot(nx / 1.2, ny / 1.3) - 0.45) / 0.5), keep: [...ink, ...laid.map((cd) => cd.rect)].map((r) => grow(r, 14 * k)) }, c),
				d.enter?.field,
			),
		);
	const words: string[] = [];
	lines.forEach((l, i) => words.push(text(display, l, W / 2, top + size * 0.9 + i * size * 1.15, size, c.trackingHero, c.ink, 'center')));
	const pad = CARD.pad * k * s;
	const badge = CARD.badge * k * s;
	const hs = CARD.heading * k * s;
	const bs = CARD.body * k * s;
	const rad = c.radiusPanel * k;
	const cardParts: string[] = [];
	for (const [index, cd] of laid.entries()) {
		const r = cd.rect;
		const at = cardParts.length;
		cardParts.push(boxShadow(doc, r, rad, '--ds-shadow-card', k));
		cardParts.push(roundRect(r, rad, `fill="${c.white}"`));
		cardParts.push(roundRect({ x: r.x + k / 2, y: r.y + k / 2, w: r.w - k, h: r.h - k }, rad, `fill="none" stroke="${c.border}" stroke-width="${r2(k)}"`));
		const hTop = r.y + pad;
		const headH = Math.max(badge * 2, cd.heading.length * hs * 1.2);
		const bcx = r.x + pad + badge;
		const bcy = hTop + (cd.heading.length > 1 ? badge : headH / 2);
		cardParts.push(`<circle cx="${r2(bcx)}" cy="${r2(bcy)}" r="${r2(badge)}" fill="${c.brand}"/>`);
		cardParts.push(text(medium, String(cd.n), bcx, bcy + badge * 0.38, badge * 1.1, 0, c.onBrand, 'center'));
		const hx = r.x + pad + badge * 2 + 14 * k * s;
		const firstBase = cd.heading.length > 1 ? hTop + hs * 0.95 : bcy + hs * 0.35;
		cd.heading.forEach((l, i) => cardParts.push(text(display, l, hx, firstBase + i * hs * 1.2, hs, c.trackingTight, c.ink)));
		const bTop = hTop + headH + 14 * k * s;
		cd.body.forEach((l, i) => cardParts.push(text(sans, l, r.x + pad, bTop + bs * 1.05 + i * bs * 1.45, bs, 0, c.secondary)));
		// Each card is one group, so a video can bring them in one after another.
		cardParts.splice(at, cardParts.length - at, fade(cardParts.slice(at).join(''), d.enter?.item?.(index), 24 * k));
	}
	parts.push(fade(cardParts.join(''), d.enter?.window, 24 * k));
	if (footerH) {
		const cy = footer.y + footerH / 2;
		const h = footerH * 0.8;
		if (d.logo) words.push(lockup(footer.x, cy - h * 0.5, h, c).svg);
		if (footW) words.push(text(display, d.footer.trim(), footer.x + footer.w, cy + footSize * 0.36, footSize, 0, c.secondary, 'right'));
	}
	parts.push(fade(words.join(''), d.enter?.words, 12 * k));
	return { svg: parts.join(''), text: ink[0], window: null };
}

/** Draws a design; returns the SVG body and where the words and the window landed. */
export function drawLayout(doc: Doc, d: Design, c: Paint) {
	const k = unitOf(d.width, d.height);
	if (d.layout === 'hero') return hero(doc, d, c, k);
	if (d.layout === 'window') return split(doc, d, c, k);
	if (d.layout === 'closing') return closing(doc, d, c, k);
	return cards(doc, d, c, k);
}
