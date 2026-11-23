import type { Font } from 'opentype.js';
import type { DrawnLayer, LayerEdit } from '../design/types.js';
import { assertDrawable, blockHeight, cleanText, getFaces, joinLines, measure, ratios, textPath, wrapLines, type Line } from '../image/fonts.js';
import { drawMarkLockup, measureMarkLockup, trackingFor, type Paint } from '../image/paint.js';
import { bracketMark, grow, lockup, markWidth, r2, roundRect, text, union, windowSvg, WINDOW, type Doc, type Picture, type Rect } from './kit.js';

// The parts a layout stacks (text, the badge, the keys, the lockup, a window), and the fitting that sizes them. A part
// measures itself at a size and reports the layers it drew; the fitting finds the largest sizes at which everything fits
// with no word lost, and applies a design's layer edits inside that search, so text wraps again and the rest makes room.

export class FitError extends Error {}

export type Enter = (id: string) => { alpha: number; drop?: number; scale?: number } | undefined;

/** One drawn part: its layers, its SVG, and the rects the glyph field keeps clear of. */
export type Out = { id: string; svg: string; layers: DrawnLayer[] };

export type Align = 'left' | 'center' | 'right';

export type Ctx = {
	W: number;
	H: number;
	/** The unit: one pixel of the 1200x630 preview, grown with the area words may use. */
	k: number;
	/** The same for the whole canvas (art, the closing card's inset). */
	kc: number;
	/** Smallest text, in the image's pixels. */
	floor: number;
	c: Paint;
	doc: Doc;
	edits: Record<string, LayerEdit>;
	ground: string;
	enter?: Enter;
	/** Copy slots filled by --sample. */
	sample: Set<string>;
};

/** A measured part, ready to place. `rise`: it may leave the canvas at the bottom, fading. */
export type Made = { w: number; h: number; broken?: boolean; paint: (box: Rect, align: Align, can: DrawnLayer['can']) => Out };

export type Item = {
	id: string;
	start: number;
	min: number;
	/** Air above, when it is not first. */
	gap: number;
	/** Words move together with the headline; a window has its own place. */
	group: 'words' | 'window';
	can: DrawnLayer['can'];
	make: (size: number, maxW: number) => Made | null;
};

export const editOf = (ctx: Ctx, id: string): LayerEdit => ctx.edits[id] ?? {};
export const scaleOf = (ctx: Ctx, id: string) => ctx.edits[id]?.scale ?? 1;

/** Wraps a part in its entrance (video); a still has none. */
export function entered(ctx: Ctx, id: string, svg: string, box: Rect) {
	const e = ctx.enter?.(id);
	if (!e || (e.alpha >= 1 && (e.scale ?? 1) === 1)) return svg;
	if (e.alpha <= 0) return '';
	const dy = r2((1 - e.alpha) * (e.drop ?? 0));
	const scale = e.scale ?? 1;
	const cx = r2(box.x + box.w / 2);
	const cy = r2(box.y + box.h / 2);
	const transform = [dy ? `translate(0 ${dy})` : '', scale !== 1 ? `translate(${cx} ${cy}) scale(${scale.toFixed(4)}) translate(${-cx} ${-cy})` : ''].filter(Boolean).join(' ');
	return `<g opacity="${e.alpha.toFixed(3)}"${transform ? ` transform="${transform}"` : ''}>${svg}</g>`;
}

export type TextSpec = {
	id: string;
	value: string;
	face: 'display' | 'sans' | 'mono' | 'sansMedium';
	start: number;
	min: number;
	gap: number;
	leading: number;
	fill: string;
	ground: string[];
	over?: string[];
	/** Share of the flow's width this text takes (a line under a headline is narrower). */
	share?: number;
	even?: boolean;
	tracking?: (size: number) => number;
	hide?: boolean;
	anchors?: DrawnLayer['can']['anchors'];
};

/** Ink of wrapped lines placed in a box. */
function lineRects(font: Font, lines: Line[], size: number, tracking: number, leading: number, box: Rect, align: Align) {
	const { cap, desc } = ratios(font);
	return lines.map((l, i) => {
		const w = measure(font, l.text, size, tracking);
		const x = align === 'left' ? box.x : align === 'right' ? box.x + box.w - w : box.x + box.w / 2 - w / 2;
		const baseline = box.y + cap * size + i * size * leading;
		return { x, w, baseline, rect: { x, y: baseline - cap * size, w, h: (cap + desc) * size } };
	});
}

export function textItem(ctx: Ctx, spec: TextSpec): Item {
	const font = getFaces()[spec.face];
	const value = cleanText(spec.value).trim();
	assertDrawable(spec.id, value);
	const track = spec.tracking ?? (spec.face === 'display' ? (size: number) => trackingFor(size, ctx.c) : () => 0);
	return {
		id: spec.id,
		start: Math.max(spec.start, spec.min),
		min: spec.min,
		gap: spec.gap,
		group: 'words',
		can: { move: true, align: true, hide: spec.hide ?? true, ...(spec.anchors ? { anchors: spec.anchors } : {}) },
		make(size, maxW) {
			const max = maxW * (spec.share ?? 1);
			const tracking = track(size);
			const lines = wrapLines(font, value, size, max, tracking, spec.even ?? false);
			const w = Math.max(1, ...lines.map((l) => measure(font, l.text, size, tracking)));
			return {
				w,
				h: blockHeight(font, lines.length, size, spec.leading),
				broken: lines.some((l) => l.glued),
				paint(box, align, can) {
					const rows = lineRects(font, lines, size, tracking, spec.leading, box, align);
					const svg = rows.map((r, i) => textPath(font, lines[i].text, r2(r.x), r2(r.baseline), size, tracking, spec.fill)).join('');
					const ink = rows.map((r) => r.rect);
					return { id: spec.id, svg, layers: [{ id: spec.id, kind: 'text', box: union(ink), ink, ...(spec.over ? { over: spec.over } : {}), text: { asked: value, drawn: joinLines(lines), size: r2(size), color: spec.fill, ground: spec.ground, ...(ctx.sample.has(spec.id) ? { sample: true } : {}) }, can }] };
				},
			};
		},
	};
}

const ATTRIBUTION = /^product\s+by\s+(\S.*)$/i;

/** The badge above a headline: white, a hairline edge, 6px corners. An attribution ("Product by X") is typeset muted
 *  with the maker's name in the display face; any other line takes the blue [*] in front. */
export function badgeItem(ctx: Ctx, value: string, o: { start: number; gap: number; over?: string[] }): Item {
	const c = ctx.c;
	const shown = cleanText(value).replace(/\s+/g, ' ').trim();
	assertDrawable('badge', shown);
	const attribution = ATTRIBUTION.exec(shown);
	return {
		id: 'badge',
		start: Math.max(o.start, ctx.floor),
		min: ctx.floor,
		gap: o.gap,
		group: 'words',
		can: { move: true, hide: true, align: true },
		make(fs) {
			const unit = fs / 20;
			const h = 38 * unit;
			const { sans, display } = getFaces();
			const lead = attribution ? shown.slice(0, shown.length - attribution[1].length) : '';
			const leadW = attribution ? measure(display, lead, fs, 0) : 0;
			const mw = markWidth(fs);
			const w = attribution ? 34 * unit + leadW + measure(display, attribution[1], fs * 1.05, c.trackingTight) : 44 * unit + mw + measure(sans, shown, fs, 0);
			return {
				w,
				h,
				paint(box, align, can) {
					const x = align === 'left' ? box.x : align === 'right' ? box.x + box.w - w : box.x + box.w / 2 - w / 2;
					const y = box.y;
					const baseline = y + h / 2 + fs * 0.36;
					const tx = x + 16 * unit + (attribution ? 0 : mw + 10 * unit);
					const svg =
						roundRect({ x: x + 0.5 * unit, y: y + 0.5 * unit, w: w - unit, h: h - unit }, c.radiusChip * unit, `fill="${c.white}" stroke="${c.border}" stroke-width="${r2(unit)}"`) +
						(attribution ? text(display, lead, tx, baseline, fs, 0, c.secondary) + text(display, attribution[1], tx + leadW, baseline, fs * 1.05, c.trackingTight, c.secondary) : bracketMark(x + 16 * unit + mw / 2, y + h / 2, fs, c.brand).svg + text(sans, shown, tx, baseline, fs, 0, c.secondary));
					return { id: 'badge', svg, layers: [{ id: 'badge', kind: 'text', box: { x, y, w, h }, ...(o.over ? { over: o.over } : {}), text: { asked: shown, drawn: shown, size: r2(fs), color: c.secondary, ground: [c.white], ...(ctx.sample.has('badge') ? { sample: true } : {}) }, can }] };
				},
			};
		},
	};
}

/** Flat keys: 8px corners at the unit, Inter 500, the blue key then the white one. Side by side, or one under the other
 *  where they do not fit. */
export function keysItem(ctx: Ctx, primary: string, secondary: string, o: { start: number; gap: number; over?: string[] }): Item {
	const c = ctx.c;
	const list = [
		{ id: 'action', label: cleanText(primary).replace(/\s+/g, ' ').trim(), blue: true },
		{ id: 'secondary', label: cleanText(secondary).replace(/\s+/g, ' ').trim(), blue: false },
	].filter((b) => b.label);
	for (const b of list) assertDrawable(b.id, b.label);
	const font = getFaces().sansMedium;
	return {
		id: 'action',
		start: Math.max(o.start, ctx.floor),
		min: ctx.floor,
		gap: o.gap,
		group: 'words',
		can: { move: true, hide: true },
		make(fs, maxW) {
			const unit = fs / 17;
			const h = 46 * unit;
			const gap = 10 * unit;
			const widths = list.map((b) => measure(font, b.label, fs, 0) + 40 * unit);
			const row = widths.reduce((a, b) => a + b, 0) + gap * (list.length - 1);
			const stacked = row > maxW && list.length > 1;
			const w = stacked ? Math.max(...widths) : row;
			return {
				w,
				h: stacked ? h * 2 + gap : h,
				paint(box, align, can) {
					let x = align === 'left' ? box.x : align === 'right' ? box.x + box.w - w : box.x + box.w / 2 - w / 2;
					let y = box.y;
					const layers: DrawnLayer[] = [];
					const parts: string[] = [];
					list.forEach((b, i) => {
						const kw = stacked ? w : widths[i];
						const fill = b.blue ? c.brand : c.white;
						const color = b.blue ? c.onBrand : c.ink;
						parts.push(roundRect({ x: x + 0.5 * unit, y: y + 0.5 * unit, w: kw - unit, h: h - unit }, c.radiusControl * unit, `fill="${fill}" stroke="${b.blue ? c.blueEdge : c.border}" stroke-width="${r2(unit)}"`));
						parts.push(text(font, b.label, x + kw / 2, y + h / 2 + fs * 0.35, fs, 0, color, 'center'));
						layers.push({ id: b.id, kind: 'key', box: { x, y, w: kw, h }, ...(o.over ? { over: o.over } : {}), text: { asked: b.label, drawn: b.label, size: r2(fs), color, ground: [fill], ...(ctx.sample.has(b.id) ? { sample: true } : {}) }, can: i === 0 ? can : { hide: true } });
						if (stacked) y += h + gap;
						else x += kw + gap;
					});
					return { id: 'action', svg: parts.join(''), layers };
				},
			};
		},
	};
}

export const logoRule = (nameSize: number, rule: { min: number; clear: number }) => ({ clear: r2(rule.clear * nameSize), min: rule.min });

/** The lockup in a flow (the closing card): the name and its byline, centered above the words. */
export function logoItem(ctx: Ctx, size: number, rule: { min: number; clear: number }, o: { gap: number; over?: string[] }): Item {
	return {
		id: 'logo',
		start: Math.max(size, rule.min),
		min: rule.min,
		gap: o.gap,
		group: 'words',
		can: { move: true, hide: true, anchors: ['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'] },
		make(s) {
			const m = lockup(0, 0, s, ctx.c, 'measure');
			return {
				w: m.w,
				h: s,
				paint(box, align, can) {
					const x = align === 'left' ? box.x : align === 'right' ? box.x + box.w - m.w : box.x + box.w / 2 - m.w / 2;
					const drawn = lockup(x, box.y, s, ctx.c);
					return { id: 'logo', svg: drawn.svg, layers: [{ id: 'logo', kind: 'logo', box: { x, y: box.y, w: m.w, h: s }, ...(o.over ? { over: o.over } : {}), logo: logoRule(s, rule), can }] };
				},
			};
		},
	};
}

export type WindowContent = { kind: 'code'; code: string; highlight: string; dark: boolean; lineAlpha?: (i: number) => number } | { kind: 'picture'; picture: Picture; pad: number; rise: boolean } | { kind: 'prose'; text: string; lineAlpha?: (i: number) => number };

/** A window sized to what it holds. Its size is the code or copy size, or the width of a picture's window. Nothing in it
 *  is cut: code keeps every line, a picture is whole, or (`rise`) leaves the canvas at the bottom through a fade. */
export function windowItem(ctx: Ctx, content: WindowContent, label: string, o: { gap: number; start: number; min: number; minW: number; fillW?: boolean; z: number; frame: Rect }): Item {
	const c = ctx.c;
	const mono = getFaces().mono;
	const name = cleanText(label).replace(/\s+/g, ' ').trim();
	if (name) assertDrawable('label', name);
	const code = content.kind === 'code' ? cleanText(content.code).replace(/\t/g, '  ').replace(/\s+$/, '') : '';
	if (code) assertDrawable('code', code);
	const prose = content.kind === 'prose' ? cleanText(content.text).trim() : '';
	if (prose) assertDrawable('body', prose);
	const codeRows = code.split('\n');
	const unit = code ? Math.max(1, ...codeRows.map((l) => measure(mono, l, 1, 0))) : 1;
	return {
		id: 'window',
		start: Math.max(o.start, o.min),
		min: o.min,
		gap: o.gap,
		group: 'window',
		can: { move: true, hide: true },
		make(size, maxW) {
			// The window's own unit follows its content, so the bar stays in proportion.
			const least = name ? Math.max(0.6, ctx.floor / (WINDOW.bar * 0.6)) : 0.6;
			const z = content.kind === 'picture' ? Math.max(least, Math.min(o.z, size / 520)) : Math.max(least, Math.min(o.z * 1.4, size / 14));
			const labelSize = Math.max(ctx.floor, WINDOW.label * z);
			const bar = WINDOW.bar * z;
			const labelW = name ? measure(mono, name, labelSize, 0) : 0;
			const chrome = 2 * Math.max(40 * z, WINDOW.label * z + 20 * z);
			let w: number;
			let h: number;
			let rows: Line[] = [];
			let broken = false;
			if (content.kind === 'code') {
				w = Math.min(maxW, Math.max(unit * size + 2 * WINDOW.padX * z, labelW + chrome, o.minW));
				if (unit * size + 2 * WINDOW.padX * z > maxW + 0.5) return null;
				h = bar + 2 * WINDOW.padY * z + codeRows.length * size * c.leadingCode;
			} else if (content.kind === 'picture') {
				w = Math.min(maxW, size);
				h = bar + content.pad * 2 * z + ((w - content.pad * 2 * z) * content.picture.height) / content.picture.width;
			} else {
				w = Math.min(maxW, Math.max(o.minW, labelW + chrome));
				rows = wrapLines(getFaces().sans, prose, size, w - 2 * WINDOW.padX * z * 1.4, 0);
				broken = rows.some((l) => l.glued);
				h = bar + 4 * WINDOW.padY * z + blockHeight(getFaces().sans, rows.length, size, c.leadingLead);
			}
			if (labelW + chrome > w + 0.5) return null;
			return {
				w,
				h,
				broken,
				paint(box, align, can) {
					const x = align === 'left' ? box.x : align === 'right' ? box.x + box.w - w : box.x + box.w / 2 - w / 2;
					const r: Rect = { x, y: box.y, w, h };
					const leaves = r.y + r.h > ctx.H;
					const body = content.kind === 'code' ? ({ kind: 'code', code, highlight: content.highlight, size, dark: content.dark, lineAlpha: content.lineAlpha } as const) : content.kind === 'picture' ? ({ kind: 'picture', picture: content.picture, pad: content.pad * z } as const) : ({ kind: 'prose', lines: rows.map((l) => l.text), size, leading: c.leadingLead, lineAlpha: content.lineAlpha } as const);
					const svg = windowSvg(ctx.doc, r, name, body, z, c, { labelSize, ...(leaves && content.kind === 'picture' ? { fadeFrom: r.y + (ctx.H - r.y) * 0.55, fadeTo: ctx.H } : {}) });
					const layers: DrawnLayer[] = [{ id: 'window', kind: 'panel', box: r, ...(leaves && content.kind === 'picture' ? { bleeds: true } : {}), can }];
					const mark = (id: string) => (ctx.sample.has(id) ? { sample: true } : {});
					if (name) {
						const lw = measure(mono, name, labelSize, 0);
						layers.push({ id: 'label', kind: 'text', box: { x: r.x + r.w / 2 - lw / 2, y: r.y + bar / 2 - labelSize * 0.5, w: lw, h: labelSize }, over: ['window'], text: { asked: name, drawn: name, size: r2(labelSize), color: c.secondary, ground: [c.windowBar], ...mark('label') }, can: {} });
					}
					const inner: Rect = { x: r.x, y: r.y + bar, w: r.w, h: r.h - bar };
					if (content.kind === 'code') {
						const lh = size * c.leadingCode;
						const ink = codeRows.flatMap((l, i) => (l.trim() ? [{ x: inner.x + WINDOW.padX * z, y: inner.y + WINDOW.padY * z + i * lh + lh * 0.15, w: measure(mono, l, size, 0), h: lh * 0.7 }] : []));
						layers.push({ id: 'code', kind: 'text', box: union(ink), ink, over: ['window'], text: { asked: code, drawn: codeRows.join('\n'), size: r2(size), color: content.dark ? c.codeText : c.secondary, ground: content.dark ? [c.codeBg] : content.highlight ? [c.white, c.band] : [c.white], ...mark('code') }, can: {} });
					} else if (content.kind === 'prose') {
						const ink = lineRects(getFaces().sans, rows, size, 0, c.leadingLead, { x: inner.x + WINDOW.padX * z * 1.4, y: inner.y + WINDOW.padY * z * 2, w: w, h: 0 }, 'left').map((l) => l.rect);
						layers.push({ id: 'body', kind: 'text', box: union(ink), ink, over: ['window'], text: { asked: prose, drawn: joinLines(rows), size: r2(size), color: c.ink, ground: [c.white], ...mark('body') }, can: {} });
					} else {
						const pad = content.pad * z;
						layers.push({ id: 'picture', kind: 'picture', box: { x: inner.x + pad, y: inner.y + pad, w: inner.w - pad * 2, h: inner.h - pad * 2 }, over: ['window'], ...(leaves ? { bleeds: true } : {}), can: {} });
					}
					return { id: 'window', svg, layers };
				},
			};
		},
	};
}

// ---------------------------------------------------------------------------------------------------- fitting

export type Part = { id: string; start: number; min: number };
export type Sizes = Record<string, number>;
const STEPS = 28;

const sizesAt = (parts: Part[], t: number): Sizes => Object.fromEntries(parts.map((p) => [p.id, p.start * (p.min / p.start) ** t]));

export type Solved<T> = { sizes: Sizes; laid: T; range: (id: string) => [number, number] };

/** The largest sizes at which `lay` fits, all parts stepping down together to their floors; words break only at the end.
 *  Then the edits: a scaled part takes its size times the scale, and the rest step down to make room. A scale too big to
 *  fit is drawn at the largest that does; `range` says what that is, so the check can name it. `loose` is the room an
 *  edit may use, where a layout leaves some free. */
export function solve<T>(ctx: Ctx, parts: Part[], lay: (sizes: Sizes, allowBreak: boolean) => T | null, loose = lay): Solved<T> {
	let auto: { sizes: Sizes; laid: T; t: number; breaks: boolean } | undefined;
	for (const breaks of [false, true]) {
		for (let i = 0; i <= STEPS && !auto; i++) {
			const sizes = sizesAt(parts, i / STEPS);
			const laid = lay(sizes, breaks);
			if (laid) auto = { sizes, laid, t: i / STEPS, breaks };
		}
	}
	if (!auto) throw new FitError('The copy does not fit.');
	const base = auto;
	/** Fits the given fixed sizes, the rest flexing from their automatic size down to their floors. */
	const flex = (fixed: Sizes): { sizes: Sizes; laid: T } | null => {
		for (let i = 0; i <= STEPS; i += 2) {
			const t = base.t + (1 - base.t) * (i / STEPS);
			const sizes = { ...sizesAt(parts, t), ...fixed };
			const laid = loose(sizes, base.breaks);
			if (laid) return { sizes, laid };
		}
		return null;
	};
	const wanted = parts.filter((p) => scaleOf(ctx, p.id) !== 1);
	let final: { sizes: Sizes; laid: T } = base;
	if (wanted.length) {
		for (let pull = 0; pull <= 20; pull++) {
			const fixed: Sizes = {};
			for (const p of wanted) {
				const s = scaleOf(ctx, p.id);
				fixed[p.id] = Math.max(p.min, base.sizes[p.id] * (s > 1 ? 1 + (s - 1) * (1 - pull / 20) : s));
			}
			const hit = flex(fixed);
			if (hit) {
				final = hit;
				break;
			}
		}
	}
	const ranges = new Map<string, [number, number]>();
	return {
		...final,
		range(id) {
			const known = ranges.get(id);
			if (known) return known;
			const part = parts.find((p) => p.id === id);
			if (!part) return [1, 1];
			const others: Sizes = {};
			for (const p of wanted) if (p.id !== id) others[p.id] = final.sizes[p.id];
			let lo = 1;
			let hi = 2.5;
			if (flex({ ...others, [id]: base.sizes[id] * hi })) lo = hi;
			else
				for (let i = 0; i < 7; i++) {
					const mid = (lo + hi) / 2;
					if (flex({ ...others, [id]: base.sizes[id] * mid })) lo = mid;
					else hi = mid;
				}
			const range: [number, number] = [Math.max(0.4, Math.ceil((part.min / base.sizes[id]) * 100) / 100), Math.floor(lo * 100) / 100];
			ranges.set(id, range);
			return range;
		},
	};
}

/** Parts stacked in a column. */
export type Stack = { made: { item: Item; made: Made; y: number }[]; w: number; h: number; rising: boolean };

export function stackUp(items: Item[], sizes: Sizes, maxW: number, maxH: number, allowBreak: boolean, rise?: { to: number; top: number; min: number }): Stack | null {
	let y = 0;
	let w = 0;
	let rising = false;
	const made: Stack['made'] = [];
	for (const [i, item] of items.entries()) {
		const m = item.make(sizes[item.id], maxW);
		if (!m || m.w > maxW + 0.5 || (m.broken && !allowBreak)) return null;
		if (i) y += item.gap;
		made.push({ item, made: m, y });
		if (rise && item.id === 'window' && i === items.length - 1 && y + m.h > maxH && y + m.h + rise.top > rise.to) {
			// Enough of it has to show to be worth showing.
			if (rise.to - (rise.top + y) < rise.min) return null;
			rising = true;
			y = maxH;
		} else y += m.h;
		w = Math.max(w, m.w);
	}
	if (y > maxH + 0.5) return null;
	return { made, w, h: y, rising };
}

export type Anchor9 = NonNullable<LayerEdit['anchor']>;
export const ANCHORS: Anchor9[] = ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];
export const across = (a: Anchor9): Align => (a.includes('left') ? 'left' : a.includes('right') ? 'right' : 'center');
export const down = (a: Anchor9): 'top' | 'middle' | 'bottom' => (a.startsWith('top') ? 'top' : a.startsWith('bottom') ? 'bottom' : 'middle');

/** A box of a size placed at an anchor of a region. `bias` is where the middle sits (0.5 centers). */
export function at(region: Rect, w: number, h: number, anchor: Anchor9, bias = 0.5): Rect {
	const ax = across(anchor);
	const ay = down(anchor);
	return { x: ax === 'left' ? region.x : ax === 'right' ? region.x + region.w - w : region.x + (region.w - w) / 2, y: ay === 'top' ? region.y : ay === 'bottom' ? region.y + region.h - h : region.y + (region.h - h) * bias, w, h };
}

export const hits = (a: Rect, b: Rect, pad = 0) => a.x < b.x + b.w + pad && a.x + a.w > b.x - pad && a.y < b.y + b.h + pad && a.y + a.h > b.y - pad;

/** The corner lockup (with or without the square mark), placed at an anchor of a frame. */
export function cornerLogo(ctx: Ctx, kind: 'lockup' | 'mark-lockup', size: number, frame: Rect, rule: { min: number; clear: number }, anchor: Anchor9, over?: string[]): Out & { box: Rect; anchor: Anchor9 } {
	const e = editOf(ctx, 'logo');
	const min = kind === 'lockup' ? rule.min : Math.ceil((rule.min * 32) / 17);
	const s0 = Math.max(size, min);
	const s = Math.max(min, s0 * (e.scale ?? 1));
	const w = kind === 'lockup' ? lockup(0, 0, s, ctx.c, 'measure').w : measureMarkLockup(s, ctx.c);
	if (w > frame.w + 0.5 && s <= s0) throw new FitError('The lockup does not fit.');
	const place = e.anchor ?? anchor;
	const p = at(frame, w, s, place);
	const box: Rect = { x: p.x + (e.dx ?? 0) * ctx.W, y: p.y + (e.dy ?? 0) * ctx.H, w, h: s };
	const svg = kind === 'lockup' ? lockup(box.x, box.y, s, ctx.c).svg : drawMarkLockup(box.x, box.y, s, ctx.c);
	const nameSize = kind === 'lockup' ? s : (s * 17) / 32;
	const most = Math.min(frame.w / (w / s), frame.h / 3) / s0;
	return {
		id: 'logo',
		svg,
		box,
		anchor: place,
		layers: [{ id: 'logo', kind: 'logo', box, ...(over ? { over } : {}), logo: { clear: r2(rule.clear * nameSize), min }, can: { move: true, hide: true, scale: [Math.ceil((min / s0) * 100) / 100, Math.max(1, Math.floor(Math.min(2.5, most) * 100) / 100)], anchors: ['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'] } }],
	};
}

export { grow };

