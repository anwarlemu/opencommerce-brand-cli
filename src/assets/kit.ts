import type { Font } from 'opentype.js';
import { getFaces, measure, ratios, textPath } from '../image/fonts.js';
import { lockupByline, logoMark, type Paint } from '../image/paint.js';
import { brand, tokens } from '../lib/brand.js';
import { clamp01, fbm, hash, smooth } from './noise.js';

// The brand's parts as SVG: the window (mist bar, dimmed arrow, a file-like name, the blue [*]), flat keys, the chip,
// the typeset lockup, headline and line, and the field of * and @ that gathers round the windows and never sits under
// the words. Every color and radius comes from the tokens (Paint); sizes are in the image's own pixels, scaled by a
// unit `k` (one pixel of the 1200x630 link preview, grown with the area).

export type Rect = { x: number; y: number; w: number; h: number };

/** Ids for one SVG document, so filters and clips never collide, and the defs they need. */
export class Doc {
	private n = 0;
	defs: string[] = [];
	id(prefix: string) {
		this.n += 1;
		return `${prefix}${this.n}`;
	}
}

export const r2 = (n: number) => Math.round(n * 100) / 100;
export const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const grow = (r: Rect, p: number): Rect => ({ x: r.x - p, y: r.y - p, w: r.w + p * 2, h: r.h + p * 2 });
export const shift = (r: Rect, dx: number, dy: number): Rect => ({ ...r, x: r.x + dx, y: r.y + dy });
export function union(rs: Rect[]): Rect {
	if (!rs.length) return { x: 0, y: 0, w: 0, h: 0 };
	const x = Math.min(...rs.map((r) => r.x));
	const y = Math.min(...rs.map((r) => r.y));
	return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y };
}

export function roundRect(r: Rect, radius: number, attrs: string) {
	return `<rect x="${r2(r.x)}" y="${r2(r.y)}" width="${r2(Math.max(0, r.w))}" height="${r2(Math.max(0, r.h))}" rx="${r2(radius)}" ${attrs}/>`;
}

type ShadowLayer = { x: number; y: number; blur: number; spread: number; color: string; alpha: number };
const shadowCache = new Map<string, ShadowLayer[]>();
/** A box-shadow token as layers (offsets, blur, spread in px; the color and its alpha). */
export function shadowLayers(name: string): ShadowLayer[] {
	const hit = shadowCache.get(name);
	if (hit) return hit;
	const raw = tokens().site[name];
	if (!raw) throw new Error(`Missing shadow token ${name}.`);
	const layers = raw
		.split(/,(?![^()]*\))/)
		.map((part) => part.trim())
		.filter((part) => part && part !== 'none' && !part.startsWith('inset'))
		.map((part) => {
			const color = /rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\s*\)/.exec(part);
			if (!color) throw new Error(`Shadow ${name} has a color this renderer does not read: ${part}`);
			const nums = part.replace(color[0], '').trim().split(/\s+/).map((v) => Number.parseFloat(v));
			const hex = `#${[color[1], color[2], color[3]].map((v) => Number(v).toString(16).padStart(2, '0')).join('')}`;
			return { x: nums[0] ?? 0, y: nums[1] ?? 0, blur: nums[2] ?? 0, spread: nums[3] ?? 0, color: hex, alpha: Number(color[4]) };
		});
	shadowCache.set(name, layers);
	return layers;
}

/** A CSS box-shadow drawn as SVG: each layer is the box grown by its spread, offset and blurred (sigma = blur / 2). */
export function boxShadow(doc: Doc, r: Rect, radius: number, token: string, scale: number) {
	return shadowLayers(token)
		.map((l) => {
			const s = l.spread * scale;
			const box = { x: r.x + l.x * scale - s, y: r.y + l.y * scale - s, w: r.w + s * 2, h: r.h + s * 2 };
			const sigma = (l.blur * scale) / 2;
			if (sigma <= 0) return roundRect(box, Math.max(0, radius + s), `fill="${l.color}" fill-opacity="${l.alpha}"`);
			const id = doc.id('blur');
			const m = sigma * 3;
			doc.defs.push(`<filter id="${id}" filterUnits="userSpaceOnUse" x="${r2(box.x - m)}" y="${r2(box.y - m)}" width="${r2(box.w + m * 2)}" height="${r2(box.h + m * 2)}" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${r2(sigma)}"/></filter>`);
			return roundRect(box, Math.max(0, radius + s), `fill="${l.color}" fill-opacity="${l.alpha}" filter="url(#${id})"`);
		})
		.join('');
}

/** Text at a left x on an alphabetic baseline; `align` center or right measures it first. */
export function text(font: Font, value: string, x: number, baseline: number, size: number, tracking: number, fill: string, align: 'left' | 'center' | 'right' = 'left', opacity = 1) {
	const w = measure(font, value, size, tracking);
	const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
	return textPath(font, value, r2(left), r2(baseline), size, tracking, fill, opacity);
}

/** The [*]: an asterisk in three strokes between typed brackets, centered at (cx, cy). Returns its width and SVG. */
export function bracketMark(cx: number, cy: number, fs: number, color: string) {
	const mono = getFaces().mono;
	const bw = measure(mono, '[', fs, 0);
	const a = fs * 0.8;
	const gap = fs * 0.08;
	const w = bw * 2 + a + gap * 2;
	const left = cx - w / 2;
	const svg = [
		textPath(mono, '[', r2(left), r2(cy + fs * 0.35), fs, 0, color),
		textPath(mono, ']', r2(left + bw + gap * 2 + a), r2(cy + fs * 0.35), fs, 0, color),
		`<g transform="translate(${r2(left + bw + gap)} ${r2(cy - a / 2)}) scale(${r2(a / 12)})" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="square"><path d="M6 .5v11M1.24 3.25l9.52 5.5M1.24 8.75l9.52-5.5"/></g>`,
	].join('');
	return { w, svg };
}

export const markWidth = (fs: number) => measure(getFaces().mono, '[', fs, 0) * 2 + fs * 0.8 + fs * 0.16;

/** The typeset lockup: the name in the display face, tracked tight, then the byline from the logo file, muted. */
export function lockup(x: number, y: number, size: number, c: Paint, mode: 'draw' | 'measure' = 'draw') {
	const display = getFaces().display;
	const name = brand().name;
	const tracking = c.trackingTight;
	const nameW = measure(display, name, size, tracking);
	const by = lockupByline();
	const bySize = size * 0.7;
	const byW = by ? measure(display, by, bySize, 0) : 0;
	const w = nameW + (by ? size * 0.5 + byW : 0);
	if (mode === 'measure') return { x, y, w, h: size, svg: '' };
	const baseline = y + size * 0.82;
	const svg = text(display, name, x, baseline, size, tracking, c.ink) + (by ? text(display, by, x + nameW + size * 0.5, baseline, bySize, 0, c.secondary) : '');
	return { x, y, w, h: size, svg };
}

/** The square mark from the logo file, as drawn (never recolored). */
export const squareMark = (x: number, y: number, size: number) => logoMark(x, y, size);

/** Lines that wear the blue band: "1-4", "2,5", or empty. */
export function bandLines(spec: string) {
	const out = new Set<number>();
	for (const part of spec.split(',')) {
		const [a, b] = part.split('-').map((n) => Number.parseInt(n.trim(), 10));
		if (!Number.isFinite(a)) continue;
		for (let i = a; i <= (Number.isFinite(b) ? b : a); i++) out.add(i);
	}
	return out;
}

const KEYWORDS = new Set(['const', 'let', 'var', 'async', 'await', 'return', 'import', 'from', 'export', 'function', 'new', 'if', 'else', 'for', 'of', 'true', 'false']);

export type CodeColors = { word: string; string: string; comment: string; text: string; ground: string; band: string };

/** Code colors on the white window and on the dark one. Comments take the nearest ink that passes 4.5:1 at code size. */
export const codeColors = (c: Paint, dark: boolean): CodeColors =>
	dark ? { word: c.codeKey, string: c.codeString, comment: c.faint, text: c.codeText, ground: c.codeBg, band: c.codeBand } : { word: c.brand, string: c.string, comment: c.secondary, text: c.ink, ground: c.white, band: c.band };

/** One line of code, colored as the site colors it: keywords, strings, comments, and the rest. */
export function codeLine(line: string, x: number, baseline: number, size: number, colors: CodeColors, opacity = 1) {
	const mono = getFaces().mono;
	const parts = line.match(/\/\/.*$|"[^"]*"?|'[^']*'?|`[^`]*`?|[A-Za-z_$][\w$]*|\s+|./gu) ?? [];
	let cx = x;
	const out: string[] = [];
	for (const p of parts) {
		const fill = p.startsWith('//') ? colors.comment : /^["'`]/.test(p) ? colors.string : KEYWORDS.has(p) ? colors.word : colors.text;
		if (p.trim()) out.push(textPath(mono, p, r2(cx), r2(baseline), size, 0, fill, opacity));
		cx += measure(mono, p, size, 0);
	}
	return out.join('');
}

export type Picture = { data: Buffer; width: number; height: number; mime: string };

export type WindowBody =
	| { kind: 'code'; code: string; highlight: string; size: number; dark?: boolean; lineAlpha?: (i: number) => number }
	| { kind: 'picture'; picture: Picture; pad: number }
	| { kind: 'prose'; lines: string[]; size: number; leading: number; lineAlpha?: (i: number) => number };

export const WINDOW = { bar: 36, label: 11.5, padX: 22, padY: 14, mark: 13 };

/** The window: white with a hairline edge and 12px corners, the card's soft drop, a mist bar with the dimmed arrow, the
 *  name it was given and the blue [*], and code with its blue band, a picture or copy. `z` is the window's own unit;
 *  `fadeFrom` fades the window into the ground from that y to `fadeTo` (a window that leaves the canvas). */
export function windowSvg(doc: Doc, r: Rect, name: string, body: WindowBody, z: number, c: Paint, opts: { labelSize?: number; fadeFrom?: number; fadeTo?: number } = {}) {
	const rad = c.radiusPanel * z;
	const clip = doc.id('win');
	doc.defs.push(`<clipPath id="${clip}"><rect x="${r2(r.x)}" y="${r2(r.y)}" width="${r2(r.w)}" height="${r2(r.h)}" rx="${r2(rad)}"/></clipPath>`);
	const bar = WINDOW.bar * z;
	const fs = opts.labelSize ?? WINDOW.label * z;
	const mono = getFaces().mono;
	const parts: string[] = [boxShadow(doc, r, rad, '--ds-shadow-card', z), roundRect(r, rad, `fill="${c.white}"`), `<g clip-path="url(#${clip})">`];
	parts.push(`<rect x="${r2(r.x)}" y="${r2(r.y)}" width="${r2(r.w)}" height="${r2(bar)}" fill="${c.windowBar}"/>`);
	parts.push(`<rect x="${r2(r.x)}" y="${r2(r.y + bar - z)}" width="${r2(r.w)}" height="${r2(z)}" fill="${c.rule}"/>`);
	// The arrow is typed in the platform mono; the bundled mono has no such glyph, so it is drawn from the text face.
	parts.push(text(getFaces().sans, '↳', r.x + 14 * z, r.y + bar / 2 + WINDOW.label * z * 0.35, WINDOW.label * z, 0, c.secondary, 'left', 0.6));
	if (name) parts.push(text(mono, name, r.x + r.w / 2, r.y + bar / 2 + fs * 0.35, fs, 0, c.secondary, 'center'));
	parts.push(bracketMark(r.x + r.w - 26 * z, r.y + bar / 2, WINDOW.mark * z, c.brand).svg);
	const inner: Rect = { x: r.x, y: r.y + bar, w: r.w, h: r.h - bar };
	if (body.kind === 'code') {
		const colors = codeColors(c, !!body.dark);
		if (body.dark) parts.push(`<rect x="${r2(inner.x)}" y="${r2(inner.y)}" width="${r2(inner.w)}" height="${r2(inner.h)}" fill="${colors.ground}"/>`);
		const lh = body.size * c.leadingCode;
		const band = bandLines(body.highlight);
		body.code.split('\n').forEach((line, i) => {
			const top = inner.y + WINDOW.padY * z + i * lh;
			const alpha = body.lineAlpha ? body.lineAlpha(i) : 1;
			if (alpha <= 0) return;
			if (band.has(i + 1)) parts.push(`<rect x="${r2(inner.x)}" y="${r2(top)}" width="${r2(inner.w)}" height="${r2(lh)}" fill="${colors.band}"${alpha < 1 ? ` fill-opacity="${alpha.toFixed(3)}"` : ''}/>`);
			parts.push(codeLine(line, inner.x + WINDOW.padX * z, top + lh / 2 + body.size * 0.35, body.size, colors, alpha));
		});
	} else if (body.kind === 'picture') {
		const im = body.picture;
		const w = inner.w - body.pad * 2;
		const h = (w * im.height) / im.width;
		parts.push(`<image href="data:${im.mime};base64,${im.data.toString('base64')}" x="${r2(inner.x + body.pad)}" y="${r2(inner.y + body.pad)}" width="${r2(w)}" height="${r2(h)}" preserveAspectRatio="none"/>`);
	} else {
		const sans = getFaces().sans;
		const { cap } = ratios(sans);
		body.lines.forEach((line, i) => {
			const alpha = body.lineAlpha ? body.lineAlpha(i) : 1;
			if (alpha > 0) parts.push(text(sans, line, inner.x + WINDOW.padX * z * 1.4, inner.y + WINDOW.padY * z * 2 + cap * body.size + i * body.size * body.leading, body.size, 0, c.ink, 'left', alpha));
		});
	}
	parts.push('</g>');
	parts.push(roundRect({ x: r.x + z / 2, y: r.y + z / 2, w: r.w - z, h: r.h - z }, rad, `fill="none" stroke="${c.border}" stroke-width="${r2(z)}"`));
	if (opts.fadeFrom === undefined) return parts.join('');
	const grad = doc.id('fade');
	const mask = doc.id('mask');
	const to = opts.fadeTo ?? r.y + r.h;
	doc.defs.push(`<linearGradient id="${grad}" gradientUnits="userSpaceOnUse" x1="0" y1="${r2(opts.fadeFrom)}" x2="0" y2="${r2(to)}"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>`);
	doc.defs.push(`<mask id="${mask}" maskUnits="userSpaceOnUse" x="${r2(r.x - r.w)}" y="${r2(r.y - r.h)}" width="${r2(r.w * 3)}" height="${r2(r.h * 3)}"><rect x="${r2(r.x - r.w)}" y="${r2(r.y - r.h)}" width="${r2(r.w * 3)}" height="${r2(r.h * 3)}" fill="url(#${grad})"/></mask>`);
	return `<g mask="url(#${mask})">${parts.join('')}</g>`;
}

/** Glyph outlines for the field, defined once per size and color-free, placed with <use>. */
function glyphDefs(doc: Doc, size: number) {
	const mono = getFaces().mono;
	const key = `glyph-${r2(size)}`;
	const star = `${key}-s`.replace('.', '_');
	const at = `${key}-a`.replace('.', '_');
	if (!doc.defs.some((d) => d.includes(`id="${star}"`))) {
		const asc = (mono.ascender / mono.unitsPerEm) * size;
		for (const [id, ch] of [[star, '*'], [at, '@']] as const) {
			const w = mono.getAdvanceWidth(ch, size);
			const d = mono.getPath(ch, -w / 2, asc, size).toPathData(2);
			doc.defs.push(`<path id="${id}" d="${d}"/>`);
		}
	}
	return { star, at };
}

export type FieldOptions = {
	box: Rect;
	/** Collects where glyphs were drawn (one rect per run of neighboring cells), for the overlap check. */
	ink?: Rect[];
	z: number;
	seed: number;
	/** A cell's strength from its place in the box (nx, ny from -1 to 1). */
	fade: (nx: number, ny: number) => number;
	keep: Rect[];
	/** Seconds into the site's drift: the noise read through a slow sideways slide and a gentle warp. Unset is the still field. */
	t?: number;
	/** Widens the clumps (0 is the usual coastline). */
	density?: number;
	/** Fades the whole field (an entrance). */
	alpha?: number;
};

/** The field of * and @: solid clumps from the noise map that crumble at their coasts, faint ink with short blue runs
 *  deep inside. A 9 by 13 cell lattice with 11px glyphs at the unit; cells under `keep` are skipped. */
export function glyphField(doc: Doc, o: FieldOptions, c: Paint) {
	const { box, z, seed } = o;
	const cw = 9 * z;
	const ch = 13 * z;
	const size = 11 * z;
	const ids = glyphDefs(doc, size);
	const cols = Math.ceil(box.w / cw);
	const rows = Math.ceil(box.h / ch);
	const moving = o.t !== undefined;
	const t = o.t ?? 0;
	const density = o.density ?? 0;
	const dx = t * 0.032;
	const dy = t * 0.009;
	const parts: string[] = [];
	for (let r = 0; r < rows; r++) {
		const wy = moving ? Math.sin(r / 9 + t * 0.21) * 0.35 : 0;
		let run: Rect | undefined;
		for (let col = 0; col < cols; col++) {
			const nx = col / 16 + dx + wy;
			const ny = r / 11 + dy + (moving ? Math.sin(col / 13 - t * 0.17) * 0.25 : 0);
			const land = fbm(nx, ny, seed);
			const odds = smooth(clamp01((land - 0.4 + density) / 0.16));
			const coast = hash(col * 7 + 11, r * 13 + 5);
			// Still: a cell shows when the coast hash is under the odds. Moving: it fades across the coast instead.
			const show = moving ? clamp01((odds - coast) / 0.18) : coast > odds ? 0 : 1;
			if (show < 0.02) continue;
			const x = box.x + col * cw;
			const y = box.y + r * ch;
			const f = o.fade(((col + 0.5) * cw * 2) / box.w - 1, ((r + 0.5) * ch * 2) / box.h - 1);
			if (f < 0.03) continue;
			if (o.keep.some((k) => x + cw > k.x && x < k.x + k.w && y + ch > k.y && y < k.y + k.h)) continue;
			const blue = land > 0.56 && fbm(nx * 2.3 + 40, ny * 3.1, seed + 6) > 0.64;
			const alpha = (blue ? 0.6 : 0.12 + odds * 0.08) * f * show * (o.alpha ?? 1);
			if (alpha < 0.004) continue;
			const id = hash(col * 3 + 1, r * 5 + 2) > 0.45 ? ids.star : ids.at;
			if (o.ink) {
				if (run && run.x + run.w > x - cw * 0.5) run.w = x + cw - run.x;
				else o.ink.push((run = { x, y, w: cw, h: ch }));
			}
			parts.push(`<use href="#${id}" x="${r2(x + cw / 2)}" y="${r2(y)}" fill="${blue ? c.brand : c.ink}" fill-opacity="${alpha.toFixed(3)}"/>`);
		}
	}
	const clip = doc.id('field');
	doc.defs.push(`<clipPath id="${clip}"><rect x="${r2(box.x)}" y="${r2(box.y)}" width="${r2(box.w)}" height="${r2(box.h)}"/></clipPath>`);
	return `<g clip-path="url(#${clip})">${parts.join('')}</g>`;
}

/** A document: the ground, the defs the parts asked for, and the body. */
export function svgDocument(doc: Doc, width: number, height: number, ground: string | null, body: string, meta: { title: string; desc?: string }, physical?: { widthIn: number; heightIn: number }) {
	const size = physical ? `width="${physical.widthIn}in" height="${physical.heightIn}in"` : `width="${width}" height="${height}"`;
	return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${size} viewBox="0 0 ${width} ${height}" role="img">\n<title>${esc(meta.title)}</title>\n${meta.desc ? `<desc>${esc(meta.desc)}</desc>\n` : ''}${doc.defs.length ? `<defs>${doc.defs.join('')}</defs>\n` : ''}${ground ? `<rect width="${width}" height="${height}" fill="${ground}"/>\n` : ''}${body}\n</svg>\n`;
}

export const capRatio = (font: Font) => ratios(font).cap;
