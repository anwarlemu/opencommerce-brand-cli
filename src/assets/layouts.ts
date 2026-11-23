import { readFileSync } from 'node:fs';
import { SMALL_FLOOR } from '../design/check.js';
import { PLATFORMS, platformOf, zonePx } from '../design/platforms.js';
import type { DrawnLayer, LayerEdit } from '../design/types.js';
import { assertDrawable, cleanText, getFaces, joinLines, measure, ratios, wrapLines, type Line } from '../image/fonts.js';
import { logoMark, paint, type Paint } from '../image/paint.js';
import { brand } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';
import { ANCHORS, across, at, badgeItem, cornerLogo, down, editOf, entered, FitError, hits, keysItem, logoItem, scaleOf, solve, stackUp, textItem, windowItem, type Align, type Anchor9, type Ctx, type Enter, type Item, type Out, type Sizes, type Solved, type Stack, type WindowContent } from './flow.js';
import { boxShadow, Doc, grow, glyphField, lockup, r2, roundRect, svgDocument, text, union, type FieldOptions, type Picture, type Rect } from './kit.js';
import { clamp01, smooth } from './noise.js';

// Every image layout, drawn as SVG in the image's own pixels. Four are the brand image tool's (hero, window, closing,
// cards); headline, lead, frame, quote and announcement are the CLI's posters; avatar is the mark. Sizes, safe areas,
// sample copy and sources are in brand/assets/image.json.
//
// Only the copy a request holds is drawn: an unset slot is left out and the rest closes up. Copy is drawn whole: text
// steps down and wraps again to a readable floor, then the request fails saying what to shorten. Each layout reports the
// layers it drew, and takes a design's layer edits inside its own layout.

export const TEMPLATE_IDS = ['headline', 'lead', 'frame', 'quote', 'announcement', 'hero', 'window', 'closing', 'cards', 'avatar'] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

/** Copy slots, named as every brand's CLI names them. */
export const SLOTS = ['headline', 'body', 'badge', 'label', 'by', 'action', 'secondary', 'code', 'highlight', 'cards', 'footer'] as const;
export type Slot = (typeof SLOTS)[number];
export type Copy = Partial<Record<Slot, string>>;

export type SizeDef = { width: number; height: number; description: string };
type TemplateDef = { description: string; source: string; textSize?: number; textWidth?: { wide: number; tall: number }; sample: Copy; seed?: number; logo?: boolean; footer?: string };
export type ImageDoc = {
	unit: { width: number; height: number };
	custom: { min: number; max: number };
	aliases: Record<string, string>;
	templates: Record<TemplateId, TemplateDef>;
	logo: { min: number; clear: number; source: string };
	notes: string[];
};

let imageDoc: ImageDoc | undefined;
export const imageData = (): ImageDoc => (imageDoc ??= JSON.parse(readFileSync(pkgPath('brand', 'assets', 'image.json'), 'utf8')) as ImageDoc);

/** The sample code the brand's image tool opens with, for --sample. */
export const sampleCode = () => imageData().templates.hero.sample.code ?? '';

/** The slots a template draws, required ones first. `needs` is satisfied by any one of its slots (or a picture). */
export const TEMPLATE_SLOTS: Record<TemplateId, { takes: Slot[]; required: Slot[]; image: boolean; needs?: Slot[] }> = {
	headline: { takes: ['headline', 'badge'], required: ['headline'], image: false },
	lead: { takes: ['headline', 'body', 'badge'], required: ['headline', 'body'], image: false },
	frame: { takes: ['headline', 'body', 'code', 'highlight', 'label'], required: [], image: true, needs: ['body', 'code'] },
	quote: { takes: ['body', 'by', 'badge'], required: ['body'], image: false },
	announcement: { takes: ['headline', 'badge', 'action'], required: ['headline'], image: false },
	hero: { takes: ['headline', 'body', 'badge', 'action', 'secondary', 'label', 'code', 'highlight'], required: ['headline'], image: true },
	window: { takes: ['headline', 'body', 'badge', 'action', 'secondary', 'label', 'code', 'highlight'], required: ['headline'], image: true },
	closing: { takes: ['headline', 'body', 'badge', 'action', 'secondary'], required: ['headline'], image: false },
	cards: { takes: ['headline', 'cards', 'footer'], required: ['cards'], image: false },
	avatar: { takes: [], required: [], image: false },
};

export type Scene = {
	template: TemplateId;
	width: number;
	height: number;
	theme?: 'white' | 'mist';
	copy: Copy;
	picture?: Picture;
	seed?: number;
	/** Show or hide the lockup; each template has its own default. */
	logo?: boolean;
	glyphs?: boolean;
	/** The field's glyphs against their usual size, 0.6 to 1.8. */
	glyphSize?: number;
	window?: boolean;
	/** avatar: the whole mark on the ground instead of the mark carried to the edges. */
	inset?: boolean;
	/** "2/5", for a carousel. */
	page?: string;
	/** Slots filled by --sample. */
	sample?: Set<string>;
	edits?: Record<string, LayerEdit>;
	/** Headline size against the template's own (a deck's stat), and the width of the words as a share of the image. */
	textScale?: number;
	textWidth?: number;
	/** Cards: no footer. */
	bare?: boolean;
	/** Seconds into the field's drift (video); unset is still. */
	t?: number;
	enter?: Enter;
	lines?: (i: number) => number;
	/** Where words and logos may go, when it is not the platform's (a print item's safe area), and the smallest text. */
	safe?: Rect;
	floor?: number;
	/** The document the shapes go into, when the scene is part of another. */
	doc?: Doc;
	/** Measures only: the field is left out. */
	dry?: boolean;
};

export type Drawn = { svg: string; layers: DrawnLayer[]; held: Ctx['held']; ground: string; desc: string; doc: Doc };

export const unitOf = (w: number, h: number) => Math.sqrt((w * h) / (imageData().unit.width * imageData().unit.height));

const inter = (a: Rect, b: Rect): Rect => {
	const x = Math.max(a.x, b.x);
	const y = Math.max(a.y, b.y);
	return { x, y, w: Math.min(a.x + a.w, b.x + b.w) - x, h: Math.min(a.y + a.h, b.y + b.h) - y };
};
/** The platform size with these pixels, if there is one. */
const platformAt = (W: number, H: number) => PLATFORMS.find((p) => p.width === W && p.height === H);

export const sizes: Record<string, SizeDef> = Object.fromEntries(PLATFORMS.map((p) => [p.id, { width: p.width, height: p.height, description: `${p.label}, ${p.width}x${p.height}` }]));

/** The smallest text at a size: 8 px at the width the picture is usually shown at. */
export const floorFor = (W: number, H: number) => (SMALL_FLOOR * W) / (platformAt(W, H) ?? platformOf('custom', W, H)).shown;

type Place = { safe: Rect; avoid: Rect[] };
/** Where words may go: the platform's safe area less the strips it crops, and the corners it covers. */
export function placeFor(W: number, H: number): Place {
	const p = platformAt(W, H);
	let safe: Rect = { x: 0, y: 0, w: W, h: H };
	if (p?.safe) safe = zonePx(p.safe, W, H);
	const avoid: Rect[] = [];
	for (const z of p?.avoid ?? []) {
		const r = zonePx(z, W, H);
		if (r.w >= W - 1) safe = r.y < 1 ? inter(safe, { x: 0, y: r.h, w: W, h: H - r.h }) : inter(safe, { x: 0, y: 0, w: W, h: r.y });
		else if (r.h >= H - 1) safe = r.x < 1 ? inter(safe, { x: r.w, y: 0, w: W - r.w, h: H }) : inter(safe, { x: 0, y: 0, w: r.x, h: H });
		else avoid.push(r);
	}
	return { safe, avoid };
}

const inset = (r: Rect, px: number, py = px): Rect => ({ x: r.x + px, y: r.y + py, w: r.w - px * 2, h: r.h - py * 2 });

type Local = { req: Scene; ctx: Ctx; place: Place; def: TemplateDef; copy: Record<Slot, string>; outs: Out[]; wide: boolean; seed: number; art: Rect[] };

/** A way to lay the content out in one region; the one with the largest headline that keeps clear of the platform's own
 *  elements is drawn. */
type Plan = { score: number; inks: Rect[]; draw: () => void };

const PAD = 10;

function choose(l: Local, regions: Rect[], plan: (r: Rect, i: number) => Plan): Plan {
	const plans: { plan: Plan; i: number; clear: boolean }[] = [];
	let failure: unknown;
	for (const [i, r] of regions.entries()) {
		if (r.w < 80 || r.h < 20) continue;
		try {
			const p = plan(r, i);
			plans.push({ plan: p, i, clear: !p.inks.some((ink) => l.place.avoid.some((a) => hits(ink, a, PAD))) });
		} catch (error) {
			if (!(error instanceof FitError)) throw error;
			failure = error;
		}
	}
	const clear = plans.filter((p) => p.clear);
	// Content may sit where the platform covers it only when an edit moved it there; the check names that.
	const moved = Object.values(l.ctx.edits).some((e) => e.anchor || e.dx || e.dy);
	const pool = clear.length || !moved ? clear : plans;
	if (!pool.length) throw failure ?? new FitError('The copy does not fit.');
	const best = Math.max(...pool.map((p) => p.plan.score));
	return pool.find((p) => p.plan.score >= best * 0.9)!.plan;
}

/** The whole region first, then the parts of it beside and clear above what the platform covers. */
function regionsOf(l: Local, r: Rect): Rect[] {
	const out = [r];
	const met = l.place.avoid.filter((a) => hits(r, a, PAD));
	if (!met.length) return out;
	const lefts = met.filter((a) => a.x + a.w / 2 < r.x + r.w / 2);
	const rights = met.filter((a) => a.x + a.w / 2 >= r.x + r.w / 2);
	const x0 = Math.max(r.x, ...lefts.map((a) => a.x + a.w + PAD * 2));
	const x1 = Math.min(r.x + r.w, ...rights.map((a) => a.x - PAD * 2));
	const y1 = Math.min(...met.map((a) => a.y - PAD));
	out.push({ x: x0, y: r.y, w: x1 - x0, h: r.h });
	if (lefts.length && rights.length) {
		out.push({ x: x0, y: r.y, w: r.x + r.w - x0, h: Math.min(r.y + r.h, ...rights.map((a) => a.y - PAD)) - r.y });
		out.push({ x: r.x, y: r.y, w: x1 - r.x, h: Math.min(r.y + r.h, ...lefts.map((a) => a.y - PAD)) - r.y });
	}
	out.push({ ...r, h: y1 - r.y });
	return out;
}

/** Takes the lockup's band (top or bottom) out of a region. */
function below(l: Local, logo: ReturnType<typeof cornerLogo> | null, r: Rect, gap: number): Rect {
	if (!logo) return r;
	const ay = down(logo.anchor);
	if (logo.anchor === 'left') {
		const x = Math.max(r.x, logo.box.x + logo.box.w + Math.max(gap, logo.layers[0].logo?.clear ?? 0));
		return { ...r, x, w: r.x + r.w - x };
	}
	if (ay === 'middle') return r;
	const air = Math.max(gap, logo.layers[0].logo?.clear ?? 0);
	if (ay === 'top' && logo.box.y < l.ctx.H * 0.4) {
		const y = Math.max(r.y, logo.box.y + logo.box.h + air);
		return { ...r, y, h: r.y + r.h - y };
	}
	if (ay === 'bottom' && logo.box.y > l.ctx.H * 0.5) return { ...r, h: Math.min(r.y + r.h, logo.box.y - air) - r.y };
	return r;
}

function push(l: Local, out: Out, box?: Rect) {
	l.outs.push({ ...out, svg: entered(l.ctx, out.id, out.svg, box ?? out.layers[0]?.box ?? { x: 0, y: 0, w: 0, h: 0 }) });
}

/** The field of * and @, keeping clear of everything drawn so far. Goes under it all. */
function field(l: Local, o: Omit<FieldOptions, 'seed' | 't' | 'keep' | 'ink'>, keep: Rect[], clip?: string) {
	const e = editOf(l.ctx, 'art');
	if (l.req.glyphs === false || e.hidden || l.req.dry) return;
	const ink: Rect[] = [];
	const svg = glyphField(l.ctx.doc, { ...o, z: o.z * (l.req.glyphSize ?? 1), seed: l.seed, t: l.req.t, keep, ink }, l.ctx.c);
	if (!ink.length) return;
	l.outs.unshift({ id: 'art', svg: entered(l.ctx, 'art', clip ? `<g clip-path="url(#${clip})">${svg}</g>` : svg, o.box), layers: [{ id: 'art', kind: 'art', box: o.box, ink, bleeds: true, can: { hide: true } }] });
}

const keepOf = (l: Local, pad: number) => l.outs.flatMap((o) => o.layers.filter((y) => y.kind !== 'art' && !y.over?.some((id) => id === 'window' || id === 'cards')).flatMap((y) => (y.id === 'cards' ? (y.ink ?? [y.box]) : [y.box]).map((b) => grow(b, y.logo ? Math.max(pad, y.logo.clear) : pad))));

function canOf(item: Item, solved: { range: (id: string) => [number, number] } | null, extra: Partial<DrawnLayer['can']> = {}): DrawnLayer['can'] {
	// Read only when a design asks, so a plain render does not pay for the search.
	const can: DrawnLayer['can'] = { ...item.can, ...extra };
	if (solved) Object.defineProperty(can, 'scale', { enumerable: true, configurable: true, get: () => solved.range(item.id) });
	return can;
}

type FlowOpts = { anchor: Anchor9; bias?: number; anchors?: Anchor9[]; rise?: boolean; maxW?: number; windowAnchors?: Anchor9[]; align?: Align; /** Share of the height the column takes at most, before it has to shrink past its floor. */ fill?: number; /** What a window in its own column can be scaled to, when the columns share the room. */ windowRange?: [number, number] };

/** A column of parts in a region: the plan that draws it. */
function flowPlan(l: Local, items: Item[], region: Rect, o: FlowOpts): Plan {
	const ctx = l.ctx;
	const shown = items.filter((i) => !editOf(ctx, i.id).hidden);
	const lead = shown.find((i) => i.id === 'headline') ?? shown.find((i) => i.id === 'body') ?? shown[0];
	if (!lead) return { score: 1, inks: [], draw: () => {} };
	const e = editOf(ctx, lead.group === 'words' ? lead.id : '');
	const anchor = e.anchor ?? o.anchor;
	const hasWindow = shown.some((i) => i.group === 'window') && shown.length > 1;
	// With a window in the column, up or down says which comes first.
	const order = hasWindow && down(anchor) === 'bottom' ? [...shown.filter((i) => i.group === 'window'), ...shown.filter((i) => i.group === 'words')] : shown;
	const gapFix = order === shown ? order : order.map((i, n) => (n === 1 ? { ...i, gap: shown.find((s) => s.group === 'window')!.gap } : i));
	const maxW = Math.min(region.w, o.maxW ?? region.w);
	const rise = o.rise && down(anchor) !== 'bottom' ? { to: ctx.H, top: region.y, min: Math.max(0.3 * ctx.H, 0) } : undefined;
	const lay = (share: number) => (sizes: Sizes, allowBreak: boolean) => {
		// A window may be as wide as the region; the words keep their measure.
		const wide = gapFix.map((i) => (i.group === 'window' ? { ...i, make: (s: number) => i.make(s, region.w) } : { ...i, make: (s: number, m: number) => i.make(s, Math.min(m, maxW)) }));
		return stackUp(wide, sizes, region.w, region.h * share, allowBreak, rise);
	};
	const parts = gapFix.map((i) => ({ id: i.id, start: i.start, min: i.min }));
	let solved: Solved<Stack>;
	try {
		// Long copy takes the whole height before it is refused; an edit may too.
		solved = solve<Stack>(ctx, parts, lay(o.fill ?? 1), lay(1));
	} catch (error) {
		if (!o.fill || !(error instanceof FitError)) throw error;
		solved = solve<Stack>(ctx, parts, lay(1));
	}
	const stack = solved.laid;
	const area = at(region, stack.w, stack.h, hasWindow ? (`${across(anchor) === 'center' ? '' : across(anchor)}` as Anchor9) || 'center' : anchor, stack.rising ? 0 : (o.bias ?? 0.5));
	const align: Align = e.align ?? (e.anchor ? across(e.anchor) : (o.align ?? across(o.anchor)));
	// A nudge keeps the words where they may be: inside the safe area, and beside what the platform covers.
	const whole = l.place.avoid.every((a) => hits(region, a));
	const room = whole ? l.place.safe : inter(grow(region, PAD), l.place.safe);
	const hold = (want: number, at: number, size: number, from: number, length: number) => (size >= length ? Math.max(Math.min(0, from + length - at - size), Math.min(Math.max(0, from - at), want)) : Math.max(Math.min(0, from - at), Math.min(Math.max(0, from + length - at - size), want)));
	const wordsH = order === shown ? stack.made.filter((x) => x.item.group === 'words').reduce((n, x) => Math.max(n, x.y + x.made.h), 0) : stack.h;
	const dx = hold((e.dx ?? 0) * ctx.W, area.x, stack.w, room.x, room.w);
	const dy = hold((e.dy ?? 0) * ctx.H, area.y, wordsH, room.y, room.h);
	if (Math.abs(dx - (e.dx ?? 0) * ctx.W) > 0.5 || Math.abs(dy - (e.dy ?? 0) * ctx.H) > 0.5) ctx.held[lead.id] = { dx: Math.trunc((dx / ctx.W) * 1000) / 1000, dy: Math.trunc((dy / ctx.H) * 1000) / 1000 };
	const painted = stack.made.map(({ item, made, y }) => {
		const own = item.id === lead.id && item.group === 'words' ? {} : editOf(ctx, item.id);
		const block = item.group === 'words';
		const box: Rect = { x: area.x + (block ? dx : 0) + (own.dx ?? 0) * ctx.W, y: area.y + y + (block ? dy : 0) + (own.dy ?? 0) * ctx.H, w: stack.w, h: made.h };
		const own9 = own.anchor && item.group === 'window' ? across(own.anchor) : undefined;
		if (own9 && own9 !== 'center') {
			// A window put to a side goes to the side of the picture, not of the column.
			box.x = region.x + (own.dx ?? 0) * ctx.W;
			box.w = region.w;
		}
		return { item, box, align: own.align ?? own9 ?? (item.group === 'window' ? (align === 'center' ? 'center' : align) : align), made };
	});
	const inks = () => painted.map((p) => p.made.paint(p.box, p.align, {})).flatMap((out) => out.layers.filter((y) => !y.over?.includes('window')).flatMap((y) => y.ink ?? [y.box]));
	// Measured without its shapes: ids taken for a trial are not used.
	const trial = () => {
		const keep = ctx.doc;
		ctx.doc = new Doc();
		try {
			return inks();
		} finally {
			ctx.doc = keep;
		}
	};
	return {
		score: (solved.sizes.headline ?? solved.sizes[lead.id]) * (stack.rising ? 0.95 : 1),
		inks: trial(),
		draw() {
			for (const p of painted) {
				const extra: Partial<DrawnLayer['can']> = p.item.id === lead.id ? { hide: false, anchors: o.anchors ?? ANCHORS } : p.item.group === 'window' ? { anchors: o.windowAnchors ?? ['left', 'center', 'right'] } : {};
				const out = p.made.paint(p.box, p.align, canOf(p.item, p.item.id === 'logo' ? { range: () => logoRange(p.item, solved.range('logo')) } : p.item.group === 'window' && o.windowRange ? { range: () => o.windowRange! } : solved, extra));
				push(l, out);
			}
		},
	};
}

const logoRange = (item: Item, r: [number, number]): [number, number] => [Math.max(r[0], Math.ceil((item.min / item.start) * 100) / 100), r[1]];

// ------------------------------------------------------------------------------------------------- the words

/** The badge, headline, line and keys, with the headline at `size`. */
function words(l: Local, o: { size: number; bodyRatio?: number; bodyShare?: number; over?: string[]; ground?: string; track?: boolean; gap?: number }): Item[] {
	const { ctx, copy } = l;
	const { c, k, floor, W, H } = ctx;
	const ground = [o.ground ?? ctx.ground];
	const key = (id: 'action' | 'secondary') => (editOf(ctx, id).hidden ? '' : copy[id]);
	const size = o.size;
	const items: Item[] = [];
	if (copy.badge) items.push(badgeItem(ctx, copy.badge, { start: H / W > 1.15 ? 0.03 * W : 20 * k, gap: 0, over: o.over }));
	if (copy.headline) items.push(textItem(ctx, { id: 'headline', value: copy.headline, face: 'display', start: size, min: Math.max(floor * 1.5, 24 * k * 0.8), gap: 28 * k, leading: c.leadingHeading, fill: c.ink, ground, over: o.over, even: true, ...(o.track === false ? {} : { tracking: () => c.trackingHero }), hide: false }));
	if (copy.body) items.push(textItem(ctx, { id: 'body', value: copy.body, face: 'sans', start: Math.max(floor, size * (o.bodyRatio ?? 0.33)), min: floor, gap: Math.max(12 * k, size * 0.34), leading: c.leadingLead, fill: c.secondary, ground, over: o.over, share: o.bodyShare ?? 0.9, even: true }));
	if (key('action') || key('secondary')) items.push(keysItem(ctx, key('action'), key('secondary'), { start: H / W > 1.15 ? 0.028 * W : 17 * k, gap: 34 * k, over: o.over }));
	return items;
}

/** The window's content, from the copy and the picture; null leaves the window out. */
function content(l: Local, o: { dark?: boolean; pad: number; rise?: boolean }): WindowContent | null {
	if (l.req.window === false || editOf(l.ctx, 'window').hidden) return null;
	if (l.req.picture) return { kind: 'picture', picture: l.req.picture, pad: o.pad, rise: o.rise ?? false };
	if (l.copy.code.trim()) return { kind: 'code', code: l.copy.code, highlight: l.copy.highlight === 'none' ? '' : l.copy.highlight, dark: o.dark ?? false, lineAlpha: l.req.lines };
	return null;
}

function windowOf(l: Local, what: WindowContent, region: Rect, o: { gap: number; minW: number; codeStart: number; z: number; pictureStart: number }): Item {
	const ctx = l.ctx;
	const picture = what.kind === 'picture';
	const tall = what.kind === 'picture' ? what.picture.height / what.picture.width : 0;
	return windowItem(ctx, what, l.copy.label, {
		gap: o.gap,
		start: picture ? Math.min(o.pictureStart, region.w) : what.kind === 'prose' ? ctx.k * 34 : o.codeStart,
		min: picture ? Math.max(90, Math.min(region.w * 0.16, (region.h * 0.5) / Math.max(0.2, tall))) : ctx.floor,
		minW: Math.min(region.w, o.minW * scaleOf(ctx, 'window')),
		z: o.z,
		frame: region,
	});
}

// ------------------------------------------------------------------------------------------------- layouts

/** The content frame: the canvas less a margin, inside the platform's safe area. */
const frameOf = (l: Local, mx: number, my: number) => inter(inset({ x: 0, y: 0, w: l.ctx.W, h: l.ctx.H }, mx, my), l.place.safe);

/** Headline, lead, quote, announcement: the lockup in a corner and the words centered on the ground. */
function poster(l: Local) {
	const { ctx, req, copy } = l;
	const { c, k, floor, W, H } = ctx;
	const tall = H / W > 1.15;
	const wide = l.wide;
	const mx = wide ? 72 * k : (84 * W) / 1080;
	const my = wide ? 52 * k : (76 * W) / 1080;
	const frame = frameOf(l, mx, my);
	const logo = req.logo === false || editOf(ctx, 'logo').hidden ? null : cornerLogo(ctx, 'mark-lockup', wide ? 44 * k : (52 * W) / 1080, frame, imageData().logo, 'top-left');
	const region = below(l, logo, frame, wide ? 28 * k : 40 * k);
	const quote = req.template === 'quote';
	const items: Item[] = [];
	if (copy.badge) items.push(textItem(ctx, { id: 'badge', value: copy.badge, face: 'mono', start: Math.max(floor, tall ? 0.03 * W : 15 * k), min: floor, gap: 0, leading: 1.3, fill: req.template === 'announcement' ? c.label : c.secondary, ground: [ctx.ground], even: true }));
	const head = quote ? copy.body : copy.headline;
	const size = (tall ? 0.2 * W : wide ? (quote ? 56 : 68) * k : 0.115 * W) * (!wide && quote ? 0.62 : 1) * (req.textScale ?? 1);
	items.push(textItem(ctx, { id: quote ? 'body' : 'headline', value: head, face: 'display', start: size, min: Math.max(floor * 1.4, 22 * k * 0.8), gap: 22 * k, leading: c.leadingHeading, fill: c.ink, ground: [ctx.ground], even: true, hide: false }));
	if (quote && copy.by) items.push(textItem(ctx, { id: 'by', value: copy.by, face: 'sans', start: Math.max(floor, tall ? 0.034 * W : 20 * k), min: floor, gap: 28 * k, leading: 1.35, fill: c.secondary, ground: [ctx.ground], even: true }));
	if (!quote && copy.body) items.push(textItem(ctx, { id: 'body', value: copy.body, face: 'sans', start: Math.max(floor, tall ? 0.04 * W : (wide ? 22 : 24) * k), min: floor, gap: 24 * k, leading: c.leadingLead, fill: c.secondary, ground: [ctx.ground], share: wide ? 0.7 : 0.86, even: true }));
	if (copy.action && !editOf(ctx, 'action').hidden) items.push(keysItem(ctx, copy.action, '', { start: tall ? 0.03 * W : 17 * k, gap: 34 * k }));
	const maxW = wide ? Math.min(region.w, 1000 * k) : region.w;
	const plan = choose(l, regionsOf(l, region), (r) => flowPlan(l, items, r, { anchor: 'center', bias: 0.46, maxW, ...(tall ? { fill: 0.78 } : {}) }));
	plan.draw();
	if (logo) push(l, logo);
}

/** A column of words and a window in a frame, centered; used where they stack. */
function stacked(l: Local, frame: Rect, o: { size: number; gap: number; rise?: boolean; maxW?: number; what: WindowContent | null; z: number; pictureStart: number; codeStart: number; bodyShare?: number; minW: number }) {
	const items = words(l, { size: o.size, bodyShare: o.bodyShare });
	if (o.what) items.push(windowOf(l, o.what, frame, { gap: o.gap, minW: o.minW, codeStart: o.codeStart, z: o.z, pictureStart: o.pictureStart }));
	return (r: Rect) => flowPlan(l, items, r, { anchor: 'center', anchors: o.what ? ['top', 'bottom', 'left', 'center', 'right'] : ANCHORS, rise: o.rise, maxW: o.maxW });
}

/** Two columns: the words on one side, the window on the other. The window takes the width its content needs. */
function sides(l: Local, frame: Rect, o: { size: number; what: WindowContent; z: number; align: Align; gap: number; pictureStart: number }) {
	return (r: Rect): Plan => {
		const ctx = l.ctx;
		const e = editOf(ctx, 'headline');
		const own = editOf(ctx, 'window');
		const flip = across(e.anchor ?? 'left') === 'right' || across(own.anchor ?? 'right') === 'left';
		let best: (Plan & { winW: number; colW: number }) | null = null;
		let failure: unknown;
		const attempt = (share: number, grown: number | null) => {
			const winW = r.w * share - o.gap / 2;
			const wordW = r.w - winW - o.gap;
			const wordR: Rect = { x: flip ? r.x + winW + o.gap : r.x, y: r.y, w: wordW, h: r.h };
			const winR: Rect = { x: flip ? r.x : r.x + wordW + o.gap, y: r.y, w: winW, h: r.h };
			try {
				const wordItems = words(l, { size: o.size, bodyShare: 1 });
				const plans: Plan[] = [];
				const wordEdits = ctx.edits.headline?.anchor ? { ...ctx.edits, headline: { ...ctx.edits.headline, anchor: (`${down(ctx.edits.headline.anchor) === 'middle' ? '' : `${down(ctx.edits.headline.anchor)}-`}left` as Anchor9) } } : ctx.edits;
				const keep = ctx.edits;
				ctx.edits = wordEdits;
				try {
					plans.push(flowPlan(l, wordItems, wordR, { anchor: 'left', align: o.align, anchors: ['top-left', 'left', 'bottom-left', 'top-right', 'right', 'bottom-right'] }));
				} finally {
					ctx.edits = keep;
				}
				const win = windowOf(l, o.what, winR, { gap: 0, minW: winR.w * (grown ? 1 : 0.8), codeStart: 26 * ctx.k * Math.max(1, grown ?? 1), z: o.z, pictureStart: Math.min(grown ? winR.w : o.pictureStart, winR.w) });
				plans.push(flowPlan(l, [win], winR, { anchor: 'center', windowAnchors: ['left', 'right'], windowRange: range }));
				const score = plans[0].score * (0.75 + 0.25 * Math.min(1, share / 0.5)) * (0.9 + 0.1 * Math.min(1, plans[1].score / (o.what.kind === 'picture' ? winR.w : 20 * ctx.k)));
				if (!best || score > (best as Plan).score * 1.04)
					best = {
						score,
						winW: plans[1].inks[0]?.w ?? winW,
						colW: winW,
						inks: plans.flatMap((p) => p.inks),
						draw: () => {
							ctx.edits = wordEdits;
							try {
								plans[0].draw();
							} finally {
								ctx.edits = keep;
							}
							plans[1].draw();
						},
					};
			} catch (error) {
				if (!(error instanceof FitError)) throw error;
				failure = error;
			}
		};
		const scale = scaleOf(ctx, 'window');
		const most = r.w * 0.72 - o.gap / 2;
		const edits = ctx.edits;
		const range: [number, number] = [1, 1];
		const sweep = () => {
			for (const share of [0.53, 0.48, 0.58, 0.42, 0.63, 0.36]) attempt(share, null);
		};
		// A scaled window takes its size from the window as the layout would set it, and the words take what is left.
		if (edits.window) ctx.edits = { ...edits, window: { ...edits.window, scale: undefined } };
		try {
			sweep();
			const base = best as (Plan & { winW: number; colW: number }) | null;
			if (base) {
				// Filled in here, read when the layer is reported.
				range[0] = Math.max(0.6, Math.min(1, Math.ceil((100 * 0.3 * r.w) / base.winW) / 100));
				range[1] = Math.max(1, Math.floor((100 * most) / base.winW) / 100);
			}
			if (base && scale !== 1) {
				best = null;
				for (let pull = 0; pull <= 10 && !best; pull++) attempt((Math.min(most, base.winW * (1 + (scale - 1) * (1 - pull / 10))) + o.gap / 2) / r.w, scale);
				if (!best) best = base;
			}
		} finally {
			ctx.edits = edits;
		}
		if (!best) throw failure ?? new FitError('The copy does not fit.');
		return best;
	};
}

const marginFade = (nx: number) => smooth(clamp01((Math.abs(nx) - 0.42) / 0.4));
const roundFade = (nx: number, ny: number) => 1 - smooth(clamp01((Math.hypot(nx, ny) - 0.7) / 0.3));

/** The hero: the badge, the headline and its line centered, the keys, and a window under them; glyphs in the margins. */
function hero(l: Local) {
	const { ctx, req, def } = l;
	const { W, H, k, kc } = ctx;
	const tall = H / W > 1.15;
	const frame = frameOf(l, Math.max(44 * k, W * 0.05), l.wide ? 44 * k : 60 * k);
	const what = content(l, { pad: 22, rise: true });
	const logo = (req.logo ?? def.logo) || (editOf(ctx, 'logo').hidden === false && ctx.edits.logo) ? cornerLogo(ctx, 'lockup', 24 * k, frame, imageData().logo, 'top-left') : null;
	const region = below(l, logo, frame, 24 * k);
	const size = (tall ? (what ? 0.145 : 0.18) * W : (def.textSize ?? 90) * k) * (req.textScale ?? 1);
	const maxW = (req.textWidth ?? (l.wide ? def.textWidth!.wide : 0.94)) * W;
	const column = stacked(l, region, { size, gap: tall ? 60 * k : 44 * k, what, rise: what?.kind === 'picture' && H / W < 1.5, maxW, z: 1.45 * k, codeStart: (tall ? 24 : 21) * k, pictureStart: tall ? W * 0.84 : W * 0.68, minW: Math.min(region.w, tall ? region.w * 0.8 : W * 0.5) });
	const side = what && l.wide ? sides(l, region, { size: size * 0.8, what, z: 1.45 * k, align: 'left', gap: 48 * k, pictureStart: W * 0.5 }) : null;
	const plan = choose(l, regionsOf(l, region), (r) => {
		// On a banner the window sits beside the words; elsewhere under them, unless only beside fits.
		if (side && W / H >= 2.2) return side(r);
		try {
			return column(r);
		} catch (error) {
			if (!side || !(error instanceof FitError)) throw error;
			return side(r);
		}
	});
	plan.draw();
	if (logo) push(l, logo);
	field(l, { box: { x: 0, y: 0, w: W, h: H }, z: 1.45 * kc, fade: marginFade }, keepOf(l, 18 * k));
}

/** The window layout: the words on one side, the window on the other with the glyph field round it; stacked when tall. */
function split(l: Local) {
	const { ctx, req, def } = l;
	const { W, H, k, kc } = ctx;
	const tall = H / W > 1.15;
	const frame = frameOf(l, 48 * k, 48 * k);
	const logo = (req.logo ?? def.logo) && !editOf(ctx, 'logo').hidden ? cornerLogo(ctx, 'lockup', 24 * k, frame, imageData().logo, 'top-left') : null;
	const region = below(l, logo, frame, l.wide ? 26 * k : 36 * k);
	const what = content(l, { pad: 22 });
	const size = (l.wide ? (def.textSize ?? 54) * k : (what ? 0.115 : 0.15) * W) * (req.textScale ?? 1);
	let box: Rect = { x: 0, y: 0, w: W, h: H };
	if (what && l.wide) choose(l, regionsOf(l, region), sides(l, region, { size, what, z: 1.3 * k, align: 'left', gap: 44 * k, pictureStart: W * 0.5 })).draw();
	else if (what) choose(l, regionsOf(l, region), stacked(l, region, { size, gap: 46 * k, what, z: 1.3 * k, codeStart: 24 * k, pictureStart: region.w, minW: region.w * 0.86 })).draw();
	else {
		// No window: the words on the left, the field gathering on the right.
		const items = words(l, { size: size * (tall ? 1.15 : 1.1), bodyShare: 1 });
		const maxW = (req.textWidth ?? (l.wide ? 0.55 : 0.94)) * W;
		choose(l, regionsOf(l, region), (r) => flowPlan(l, items, r, { anchor: l.wide ? 'left' : 'center', maxW })).draw();
		if (l.wide) box = { x: W * 0.47, y: 0, w: W * 0.53, h: H };
	}
	if (logo) push(l, logo);
	const win = l.outs.flatMap((o) => o.layers).find((y) => y.id === 'window');
	if (win) box = inter({ x: win.box.x - 90 * kc, y: win.box.y - 130 * kc, w: win.box.w + 180 * kc, h: win.box.h + 260 * kc }, { x: 0, y: 0, w: W, h: H });
	field(l, { box, z: 1.3 * kc, fade: win ? (nx, ny) => 1 - smooth(clamp01((Math.hypot(nx, ny) - 0.8) / 0.4)) : roundFade }, keepOf(l, 18 * k));
}

/** The closing card: a card with 16px corners and a hairline edge, the field gathering at its edges, the words centered. */
function closing(l: Local) {
	const { ctx, req, def } = l;
	const { c, W, H, k, kc } = ctx;
	const m = 36 * Math.min(kc, Math.max(k, 0.6));
	const card: Rect = inset({ x: 0, y: 0, w: W, h: H }, m);
	const cardGround = ctx.ground === c.mist ? c.white : c.mist;
	const pad = Math.min(56 * k, card.h * 0.12);
	const inner = inter(inset(card, Math.max(44 * k, pad), pad), l.place.safe);
	const show = (req.logo ?? def.logo ?? true) && !editOf(ctx, 'logo').hidden;
	const rule = imageData().logo;
	const tall = H / W > 1.15;
	const size = (tall ? 0.15 * W : (def.textSize ?? 64) * k) * (req.textScale ?? 1);
	const maxW = (req.textWidth ?? (l.wide ? def.textWidth!.wide : 1)) * W;
	const arrange = (corner: ReturnType<typeof cornerLogo> | null) => {
		const region = below(l, corner, inner, 32 * k);
		const items = words(l, { size, over: ['panel'], ground: cardGround, bodyShare: 0.86 });
		if (show && !corner) {
			items.unshift(logoItem(ctx, 26 * k, rule, { gap: 0, over: ['panel'] }));
			if (items.length > 1) items[1] = { ...items[1], gap: Math.max(34 * k, 26 * k * rule.clear) };
		}
		return choose(l, regionsOf(l, region), (r) => flowPlan(l, items, r, { anchor: 'center', maxW }));
	};
	const place = (anchor: Anchor9) => cornerLogo(ctx, 'lockup', 26 * k, inter(inset(card, 40 * k), l.place.safe), rule, anchor, ['panel']);
	let corner = show && editOf(ctx, 'logo').anchor ? place('top-left') : null;
	let plan: Plan;
	try {
		plan = arrange(corner);
	} catch (error) {
		// A banner too short to stack the lockup over the words sets it beside them.
		if (!(error instanceof FitError) || !show || corner || W / H < 2.6) throw error;
		corner = place('left');
		const at = corner.box;
		if (l.place.avoid.some((a) => hits(at, a, PAD))) throw error;
		plan = arrange(corner);
	}
	const radius = c.radiusShell * kc;
	plan.draw();
	if (corner) push(l, corner);
	const clip = ctx.doc.id('card');
	ctx.doc.defs.push(`<clipPath id="${clip}"><rect x="${r2(card.x)}" y="${r2(card.y)}" width="${r2(card.w)}" height="${r2(card.h)}" rx="${r2(radius)}"/></clipPath>`);
	field(l, { box: card, z: 1.3 * kc, fade: (nx, ny) => clamp01((Math.hypot(nx / 1.44, ny / 1.7) - 0.48) / 0.52) }, keepOf(l, 24 * k), clip);
	const edge = roundRect({ x: card.x + kc / 2, y: card.y + kc / 2, w: card.w - kc, h: card.h - kc }, radius, `fill="none" stroke="${c.rule}" stroke-width="${r2(kc)}"`);
	l.outs.unshift({ id: 'panel', svg: roundRect(card, radius, `fill="${cardGround}"`) + edge, layers: [{ id: 'panel', kind: 'panel', box: card, can: {} }] });
	for (const o of l.outs) for (const y of o.layers) if (y.id === 'art') y.over = ['panel'];
}

/** Blank lines separate cards; each card's first line is its heading. */
export function parseCards(src: string) {
	return cleanText(src)
		.split(/\n\s*\n/)
		.map((block) => block.trim())
		.filter(Boolean)
		.map((block) => {
			const [title, ...rest] = block.split('\n');
			return { title: title.replace(/\s+/g, ' ').trim(), body: rest.join(' ').replace(/\s+/g, ' ').trim() };
		});
}

const CARD = { pad: 26, badge: 13, heading: 25, body: 17, gapX: 30, gapY: 18, gap: 12 };

type CardsLaid = { title: Line[]; cards: { rect: Rect; title: Line[]; body: Line[] }[]; top: number; cols: number };

/** Numbered cards: the title across the top, a grid of window-white cards (the blue number, a heading, a few lines), and
 *  a footer with the lockup and an address. Everything shrinks together to fit, down to the text floor. */
function cards(l: Local) {
	const { ctx, req, copy, def } = l;
	const { c, W, H, k, kc, floor } = ctx;
	const { display, sans, sansMedium } = getFaces();
	const list = parseCards(copy.cards);
	if (!list.length) throw new Error('The cards template needs --cards (cards separated by a blank line, heading first).');
	for (const [i, card] of list.entries()) {
		assertDrawable(`card ${i + 1}`, card.title);
		assertDrawable(`card ${i + 1}`, card.body);
	}
	const title = cleanText(copy.headline).trim();
	assertDrawable('headline', title);
	const address = req.bare || editOf(ctx, 'footer').hidden ? '' : cleanText(copy.footer || def.footer || '').trim();
	assertDrawable('footer', address);
	const rule = imageData().logo;
	const mx = Math.max(W * 0.071 * Math.min(1, k * 1.4), 32 * k);
	const frame = frameOf(l, mx, l.wide ? 40 * k : 64 * k);
	const showLogo = (req.logo ?? def.logo ?? true) && !editOf(ctx, 'logo').hidden;

	const plan = (R: Rect): Plan => {
		const logo = showLogo ? cornerLogo(ctx, 'lockup', 24 * k, R, rule, 'bottom-left') : null;
		const footSize = Math.max(floor, 20 * k);
		const footW = address ? measure(display, address, footSize, 0) : 0;
		const footEdit = editOf(ctx, 'footer');
		const footScale = Math.max(floor / footSize, footEdit.scale ?? 1);
		// The address sits across from the lockup; with no room there, it is left for the lockup alone to carry.
		const logoRight = logo && down(logo.anchor) === 'bottom' && across(logo.anchor) === 'right';
		const fh = Math.max(logo && down(logo.anchor) === 'bottom' ? logo.box.h : 0, footW ? footSize * footScale : 0);
		const footer = footW && (!logo || down(logo.anchor) !== 'bottom' || across(logo.anchor) !== 'center');
		const room = R.w - (logo && down(logo.anchor) === 'bottom' ? logo.box.w + 40 * k : 0);
		if (copy.footer && footW * footScale > room) throw new FitError('The footer does not fit.');
		const drawFooter = footer && footW * footScale <= room;
		const region0 = below(l, logo, drawFooter && (!logo || down(logo.anchor) !== 'bottom') ? { ...R, h: R.h - fh - 26 * k } : R, 26 * k);
		const region = drawFooter ? { ...region0, h: Math.min(region0.y + region0.h, R.y + R.h - fh - 26 * k) - region0.y } : region0;
		const footBox = (() => {
			if (!drawFooter) return null;
			const fs = footSize * footScale;
			const mid = Math.min(logo && down(logo.anchor) === 'bottom' ? logo.box.y + logo.box.h / 2 : R.y + R.h, R.y + R.h - fs * 0.62);
			return { x: (logoRight ? R.x : R.x + R.w - footW * footScale) + (footEdit.dx ?? 0) * W, y: mid - fs * 0.39 + (footEdit.dy ?? 0) * H, w: footW * footScale, h: fs };
		})();
		const gapX = CARD.gapX * k;
		const gapY = CARD.gapY * k;
		const headEdit = editOf(ctx, 'headline');
		const lay = (sizes: Sizes, breaks: boolean, cols: number): (CardsLaid & { s: number; h: number }) | null => {
			const s = sizes['card-text'] / CARD.body;
			const ts = sizes.headline ?? 0;
			const tl = title && !headEdit.hidden ? wrapLines(display, title, ts, region.w, c.trackingHero, true) : [];
			if (tl.some((x) => x.glued) && !breaks) return null;
			if (tl.length > 3) return null;
			const { cap, desc } = ratios(display);
			const titleH = tl.length ? (cap + desc) * ts + (tl.length - 1) * ts * 1.15 : 0;
			const gapT = titleH ? Math.max(20 * k, H * 0.03) : 0;
			const rows = Math.ceil(list.length / cols);
			const cw = (region.w - gapX * (cols - 1)) / cols;
			const pad = CARD.pad * k * s * 0.9;
			const badge = Math.max(CARD.badge * s * k, (floor * 0.95) / 1.1);
			const hs = Math.max(floor, CARD.heading * k * s);
			const bs = Math.max(floor, CARD.body * k * s);
			const inner = cw - pad * 2;
			const headW = inner - badge * 2 - 14 * k * s;
			if (inner < bs * 6 || headW < hs * 3) return null;
			let tall = 0;
			const laid = list.map((card) => {
				const t = wrapLines(display, card.title, hs, headW, c.trackingTight);
				const b = card.body ? wrapLines(sans, card.body, bs, inner, 0) : [];
				tall = Math.max(tall, pad * 2 + Math.max(badge * 2, t.length * hs * 1.2) + (b.length ? CARD.gap * k * s + b.length * bs * 1.45 : 0));
				return { title: t, body: b, rect: { x: 0, y: 0, w: cw, h: 0 } };
			});
			if (!breaks && laid.some((x) => [...x.title, ...x.body].some((y) => y.glued))) return null;
			const gridH = rows * tall + (rows - 1) * gapY;
			const need = titleH + gapT + gridH;
			if (need > region.h + 0.5) return null;
			// Room left over is shared: taller cards (up to a third), then the block is centered.
			const grown = Math.min(tall * 1.2, (region.h - titleH - gapT - (rows - 1) * gapY) / rows);
			const total = titleH + gapT + rows * grown + (rows - 1) * gapY;
			const top = region.y + (region.h - total) / 2;
			laid.forEach((x, i) => {
				const r = Math.floor(i / cols);
				const inRow = Math.min(cols, list.length - r * cols);
				const rowW = inRow * cw + (inRow - 1) * gapX;
				x.rect = { x: region.x + (region.w - rowW) / 2 + (i % cols) * (cw + gapX), y: top + titleH + gapT + r * (grown + gapY), w: cw, h: grown };
			});
			return { title: tl, cards: laid, top, cols, s, h: total };
		};
		const parts = [{ id: 'card-text', start: CARD.body * (l.wide ? 1 : 1.12), min: Math.min(CARD.body, floor / k) }, ...(title && !headEdit.hidden ? [{ id: 'headline', start: (l.wide ? def.textSize! : 0.062 * W / k) * k * (req.textScale ?? 1), min: Math.max(floor * 1.15, 18 * k) }] : [])];
		let best: ReturnType<typeof solve<CardsLaid & { s: number; h: number }>> | null = null;
		const options = W / H < 0.65 ? [1, 2] : [2, 1, 3, 4];
		for (const cols of options) {
			if (cols > list.length) continue;
			try {
				const solved = solve(ctx, parts, (sizes, breaks) => lay(sizes, breaks, cols));
				if (!best || solved.sizes['card-text'] > best.sizes['card-text'] * 1.06) best = solved;
			} catch (error) {
				if (!(error instanceof FitError)) throw error;
			}
		}
		if (!best) throw new FitError('The cards do not fit.');
		const done = best;
		const b = done.laid;
		const { cap, desc } = ratios(display);
		const ts = done.sizes.headline ?? 0;
		const align: Align = headEdit.align ?? (headEdit.anchor ? across(headEdit.anchor) : 'center');
		const dx = (headEdit.dx ?? 0) * W;
		const dy = (headEdit.dy ?? 0) * H;
		const titleRows = b.title.map((line, i) => {
			const w = measure(display, line.text, ts, c.trackingHero);
			const x = align === 'left' ? region.x : align === 'right' ? region.x + region.w - w : region.x + (region.w - w) / 2;
			const baseline = b.top + cap * ts + i * ts * 1.15 + dy;
			return { line, x: x + dx, baseline, rect: { x: x + dx, y: baseline - cap * ts, w, h: (cap + desc) * ts } };
		});
		return {
			score: done.sizes['card-text'],
			inks: [...titleRows.map((r) => r.rect), ...b.cards.map((x) => x.rect), ...(logo ? [logo.box] : []), ...(footBox ? [footBox] : [])],
			draw() {
				const scale = (id: string) => ({ get scale() { return done.range(id); } });
				const s = b.s;
				const pad = CARD.pad * k * s * 0.9;
				const badge = Math.max(CARD.badge * s * k, (floor * 0.95) / 1.1);
				const hs = Math.max(floor, CARD.heading * k * s);
				const bs = Math.max(floor, CARD.body * k * s);
				const mark = (id: string) => (ctx.sample.has(id) ? { sample: true } : {});
				if (titleRows.length) {
					const ink = titleRows.map((r) => r.rect);
					push(l, { id: 'headline', svg: titleRows.map((r) => text(display, r.line.text, r.x, r.baseline, ts, c.trackingHero, c.ink)).join(''), layers: [{ id: 'headline', kind: 'text', box: union(ink), ink, text: { asked: title, drawn: joinLines(b.title), size: r2(ts), color: c.ink, ground: [ctx.ground], ...mark('headline') }, can: Object.defineProperties({ move: true, align: true, hide: true }, Object.getOwnPropertyDescriptors(scale('headline'))) }] });
				}
				const headInk: Rect[] = [];
				const bodyInk: Rect[] = [];
				for (const [i, cd] of b.cards.entries()) {
					const id = `card-${i + 1}`;
					const r = cd.rect;
					const rad = c.radiusPanel * k;
					const p: string[] = [boxShadow(ctx.doc, r, rad, '--ds-shadow-card', k), roundRect(r, rad, `fill="${c.white}"`), roundRect({ x: r.x + k / 2, y: r.y + k / 2, w: r.w - k, h: r.h - k }, rad, `fill="none" stroke="${c.border}" stroke-width="${r2(k)}"`)];
					const content = Math.max(badge * 2, cd.title.length * hs * 1.2) + (cd.body.length ? CARD.gap * k * s + cd.body.length * bs * 1.45 : 0);
					const hTop = r.y + Math.max(pad, Math.min(pad * 1.15, (r.h - content) / 2));
					const headH = Math.max(badge * 2, cd.title.length * hs * 1.2);
					const bcx = r.x + pad + badge;
					const bcy = hTop + (cd.title.length > 1 ? badge : headH / 2);
					p.push(`<circle cx="${r2(bcx)}" cy="${r2(bcy)}" r="${r2(badge)}" fill="${c.brand}"/>`);
					p.push(text(sansMedium, String(i + 1), bcx, bcy + badge * 0.38, badge * 1.1, 0, c.onBrand, 'center'));
					const hx = r.x + pad + badge * 2 + 14 * k * s;
					const first = cd.title.length > 1 ? hTop + hs * 0.95 : bcy + hs * 0.35;
					cd.title.forEach((x, n) => p.push(text(display, x.text, hx, first + n * hs * 1.2, hs, c.trackingTight, c.ink)));
					const bTop = hTop + headH + CARD.gap * k * s;
					cd.body.forEach((x, n) => p.push(text(sans, x.text, r.x + pad, bTop + bs * 1.05 + n * bs * 1.45, bs, 0, c.secondary)));
					const tInk = cd.title.map((x, n) => ({ x: hx, y: first + n * hs * 1.2 - hs * 0.72, w: measure(display, x.text, hs, c.trackingTight), h: hs * 0.93 }));
					const bInk = cd.body.map((x, n) => ({ x: r.x + pad, y: bTop + bs * 1.05 + n * bs * 1.45 - bs * 0.75, w: measure(sans, x.text, bs, 0), h: bs }));
					headInk.push(...tInk);
					bodyInk.push(...bInk);
					push(l, { id, svg: p.join(''), layers: [] }, r);
				}
				const faces = b.cards.map((x) => x.rect);
				const grid: DrawnLayer[] = [{ id: 'cards', kind: 'panel', box: union(faces), ink: faces, can: {} }];
				grid.push({ id: 'card-headings', kind: 'text', box: union(headInk), ink: headInk, over: ['cards'], text: { asked: list.map((x) => x.title).join('\n'), drawn: b.cards.map((x) => joinLines(x.title)).join('\n'), size: r2(hs), color: c.ink, ground: [c.white], ...mark('cards') }, can: {} });
				if (bodyInk.length) grid.push({ id: 'card-text', kind: 'text', box: union(bodyInk), ink: bodyInk, over: ['cards'], text: { asked: list.map((x) => x.body).filter(Boolean).join('\n'), drawn: b.cards.map((x) => joinLines(x.body)).filter(Boolean).join('\n'), size: r2(bs), color: c.secondary, ground: [c.white], ...mark('cards') }, can: Object.defineProperties({}, Object.getOwnPropertyDescriptors(scale('card-text'))) });
				l.outs.push({ id: 'grid', svg: '', layers: grid });
				if (logo) push(l, logo);
				if (drawFooter) {
					const fs = footSize * footScale;
					const box = footBox!;
					const x = box.x;
					const baseline = box.y + fs * 0.75;
					push(l, { id: 'footer', svg: text(display, address, x, baseline, fs, 0, c.secondary), layers: [{ id: 'footer', kind: 'text', box, text: { asked: address, drawn: address, size: r2(fs), color: c.secondary, ground: [ctx.ground], ...(copy.footer ? mark('footer') : { own: true }) }, can: { move: true, hide: true, scale: [Math.ceil((floor / footSize) * 100) / 100, Math.max(1, Math.floor(Math.min(2, room / footW) * 100) / 100)] } }] });
				}
			},
		};
	};
	choose(l, regionsOf(l, frame), plan).draw();
	field(l, { box: { x: 0, y: 0, w: W, h: H }, z: 1.3 * kc, fade: (nx, ny) => clamp01((Math.hypot(nx / 1.2, ny / 1.3) - 0.45) / 0.5) }, keepOf(l, 14 * k));
}

/** A product window with a screenshot, code or copy in it, a headline above, the lockup in a corner, the field round it. */
function frameLayout(l: Local) {
	const { ctx, req, copy } = l;
	const { c, W, H, k, kc, floor } = ctx;
	const wide = l.wide;
	const tall = H / W > 1.15;
	const mx = wide ? 72 * k : (84 * W) / 1080;
	const my = wide ? 52 * k : (76 * W) / 1080;
	const frame = frameOf(l, mx, my);
	const logo = req.logo === false || editOf(ctx, 'logo').hidden ? null : cornerLogo(ctx, 'mark-lockup', wide ? 44 * k : (52 * W) / 1080, frame, imageData().logo, 'top-left');
	const what: WindowContent = req.picture ? { kind: 'picture', picture: req.picture, pad: 0, rise: false } : copy.code.trim() ? { kind: 'code', code: copy.code, highlight: copy.highlight === 'none' ? '' : copy.highlight, dark: true, lineAlpha: req.lines } : { kind: 'prose', text: copy.body, lineAlpha: req.lines };
	const region = below(l, logo, frame, wide ? 24 * k : 40 * k);
	const head = copy.headline ? [textItem(ctx, { id: 'headline', value: copy.headline, face: 'display', start: tall ? 0.085 * W : (wide ? 40 : 46) * k, min: Math.max(floor * 1.3, 20 * k), gap: 0, leading: c.leadingHeading, fill: c.ink, ground: [ctx.ground], even: true })] : [];
	const make = (r: Rect) => windowOf(l, what, r, { gap: 24 * k, minW: wide ? Math.min(r.w, 0.5 * W) : r.w * 0.9, codeStart: (tall ? 24 : 20) * k, z: 1.2 * k, pictureStart: wide ? Math.min(r.w, 1100 * k) : r.w });
	const beside = (r: Rect): Plan => {
		// A banner has no height to stack in: the window sits beside the headline.
		return sides({ ...l, copy: { ...copy, body: '', badge: '', action: '', secondary: '' } }, r, { size: 56 * k, what, z: 1.2 * k, align: 'left', gap: 44 * k, pictureStart: W * 0.5 })(r);
	};
	choose(l, regionsOf(l, region), (r) => {
		if (W / H >= 2.2 && head.length) return beside(r);
		return flowPlan(l, [...head, make(r)], r, { anchor: 'center', anchors: ['top', 'bottom', 'left', 'center', 'right'], windowAnchors: ['left', 'center', 'right'] });
	}).draw();
	if (logo) push(l, logo);
	const win = l.outs.flatMap((o) => o.layers).find((y) => y.id === 'window');
	if (win) field(l, { box: inter({ x: win.box.x - 100 * kc, y: win.box.y - 110 * kc, w: win.box.w + 200 * kc, h: win.box.h + 220 * kc }, { x: 0, y: 0, w: W, h: H }), z: 1.3 * kc, fade: (nx, ny) => 0.8 * (1 - smooth(clamp01((Math.hypot(nx, ny) - 0.8) / 0.4))) }, keepOf(l, 18 * k));
}

/** A profile picture: the mark, its blue carried past a circle crop; or (`inset`) the whole mark on the ground. */
function avatar(l: Local) {
	const { ctx, req } = l;
	const { W, H, c } = ctx;
	const side = Math.min(W, H);
	const e = editOf(ctx, 'logo');
	if (!req.inset) {
		// The tile is the mark itself, centered; its blue fills what a circle crop would show past its corners.
		const svg = `<rect width="${W}" height="${H}" fill="${c.brand}"/>${logoMark((W - side) / 2, (H - side) / 2, side)}`;
		push(l, { id: 'logo', svg, layers: [{ id: 'logo', kind: 'logo', box: { x: 0, y: 0, w: W, h: H }, ink: [{ x: (W - side) / 2 + side * 0.19, y: (H - side) / 2 + side * 0.226, w: side * 0.62, h: side * 0.548 }], bleeds: true, logo: { clear: 0, min: 32 }, can: {} }] });
		return;
	}
	const s = Math.min(side * 0.69, Math.max(32, side * 0.6 * (e.scale ?? 1)));
	const box = { x: (W - s) / 2, y: (H - s) / 2, w: s, h: s };
	push(l, { id: 'logo', svg: logoMark(box.x, box.y, s), layers: [{ id: 'logo', kind: 'logo', box, logo: { clear: r2(s * 0.1), min: 32 }, can: { scale: [0.5, 1.15] } }] });
}

// ------------------------------------------------------------------------------------------------- drawing

function local(req: Scene): Local {
	const c = paint();
	const W = req.width;
	const H = req.height;
	const place = req.safe ? { safe: req.safe, avoid: [] } : placeFor(W, H);
	const kc = unitOf(W, H);
	const k = Math.min(kc, unitOf(place.safe.w, place.safe.h), place.safe.h / 330, place.safe.w / 480);
	const def = imageData().templates[req.template];
	const ctx: Ctx = { W, H, k, kc, floor: req.floor ?? floorFor(W, H), c, doc: req.doc ?? new Doc(), edits: { ...req.edits, ...(req.edits?.action ? { keys: { ...req.edits.action, hidden: undefined } } : {}) }, ground: req.theme === 'mist' ? c.mist : c.white, enter: req.enter, sample: req.sample ?? new Set(), held: {} };
	const copy = Object.fromEntries(SLOTS.map((s) => [s, req.copy[s] ?? ''])) as Record<Slot, string>;
	return { req, ctx, place, def, copy, outs: [], wide: W / H >= 1.25, seed: req.seed ?? def.seed ?? 3, art: [] };
}

function layOut(req: Scene): Local {
	const l = local(req);
	if (req.page) {
		// A carousel's place in its set, in mono, in the corner across from the lockup. Where a layout has no lockup up
		// there, its content starts under the number.
		const { ctx } = l;
		const mono = getFaces().mono;
		const size = Math.max(ctx.floor, 16 * ctx.k);
		const w = measure(mono, req.page, size, 0);
		const f = frameOf(l, l.wide ? 60 * ctx.k : 72 * ctx.k, l.wide ? 52 * ctx.k : 72 * ctx.k);
		const box = { x: f.x + f.w - w, y: f.y, w, h: size };
		const panel = req.template === 'closing';
		const ground = panel && ctx.ground !== ctx.c.mist ? ctx.c.mist : panel ? ctx.c.white : ctx.ground;
		if (!editOf(ctx, 'number').hidden) {
			push(l, { id: 'number', svg: text(mono, req.page, box.x, box.y + size * 0.8, size, 0, ctx.c.secondary), layers: [{ id: 'number', kind: 'text', box, ...(panel ? { over: ['panel'] } : {}), text: { asked: req.page, drawn: req.page, size: r2(size), color: ctx.c.secondary, ground: [ground], own: true }, can: { hide: true } }] });
			if (['hero', 'cards', 'closing'].includes(req.template)) {
				const y = Math.max(l.place.safe.y, box.y + box.h + 12 * ctx.k);
				l.place = { ...l.place, safe: { ...l.place.safe, y, h: l.place.safe.y + l.place.safe.h - y } };
			}
		}
	}
	switch (req.template) {
		case 'hero':
			hero(l);
			break;
		case 'window':
			split(l);
			break;
		case 'closing':
			closing(l);
			break;
		case 'cards':
			cards(l);
			break;
		case 'frame':
			frameLayout(l);
			break;
		case 'avatar':
			avatar(l);
			break;
		default:
			poster(l);
	}
	return l;
}

/** What to shorten when copy does not fit: the longest slot, and about how long it may be. */
function fitMessage(req: Scene): string {
	const where = `${req.template} at ${platformAt(req.width, req.height)?.id ?? `${req.width}x${req.height}`}`;
	const slots = (['headline', 'body', 'cards', 'code', 'badge', 'label', 'by', 'action', 'secondary', 'footer'] as Slot[]).filter((s) => req.copy[s]?.trim());
	const fits = (copy: Copy) => {
		try {
			layOut({ ...req, copy, edits: {}, dry: true, doc: undefined });
			return true;
		} catch (error) {
			if (error instanceof FitError) return false;
			throw error;
		}
	};
	if (req.picture) {
		try {
			layOut({ ...req, copy: { ...req.copy, label: '' }, picture: undefined, edits: {}, dry: true, doc: undefined });
			return `The picture (${req.picture.width}x${req.picture.height}) does not fit ${where} whole beside this copy. Crop it wider, shorten the copy, or use a ${req.width > req.height ? 'taller' : 'larger'} size.`;
		} catch {}
	}
	const bySize = [...slots].sort((a, b) => req.copy[b]!.length - req.copy[a]!.length);
	for (const slot of bySize) {
		const full = req.copy[slot]!.trim();
		const cut = (n: number) => (slot === 'code' ? full.split('\n').slice(0, Math.max(1, Math.round(n * full.split('\n').length))).join('\n') : full.slice(0, Math.max(1, Math.round(n * full.length))));
		if (!fits({ ...req.copy, [slot]: cut(0) })) continue;
		let lo = 0;
		let hi = 1;
		for (let i = 0; i < 7; i++) {
			const mid = (lo + hi) / 2;
			if (fits({ ...req.copy, [slot]: cut(mid) })) lo = mid;
			else hi = mid;
		}
		if (slot === 'code') return `The copy does not fit ${where} at a readable size. Shorten the code: about ${Math.max(1, Math.round(lo * full.split('\n').length))} lines fit, and it has ${full.split('\n').length}; long lines count too. Or use a larger size.`;
		return `The copy does not fit ${where} at a readable size. Shorten the ${slot} to about ${Math.max(1, Math.floor((lo * full.length) / 5) * 5)} characters (it has ${full.length}), or use a larger size.`;
	}
	try {
		layOut({ ...req, logo: false, edits: {}, dry: true, doc: undefined });
		return `The lockup and this copy do not fit ${where} together. Use a larger size, or --no-logo.`;
	} catch {}
	return `The copy does not fit ${where} at a readable size. Shorten ${slots.length ? `the ${slots.join(', ')}` : 'it'}, leave a slot out, or use a larger size.`;
}

/** Lays a scene out: its SVG body, the layers it drew, and the defs they need. Throws when copy cannot be drawn whole. */
export function drawScene(req: Scene): Drawn {
	let l: Local;
	try {
		l = layOut(req);
	} catch (error) {
		if (error instanceof FitError) throw Object.assign(new Error(fitMessage(req)), { fit: true });
		throw error;
	}
	const copy = l.copy;
	const desc = [copy.badge, copy.headline, copy.body, copy.by, copy.action, copy.secondary, copy.cards.replace(/\s+/g, ' ')].map((s) => s.trim()).filter(Boolean).join(' ');
	return { svg: l.outs.map((o) => o.svg).join(''), layers: l.outs.flatMap((o) => o.layers), held: l.ctx.held, ground: l.ctx.ground, desc: cleanText(desc), doc: l.ctx.doc };
}

/** A scene as a whole SVG document. */
export function sceneSvg(req: Scene): { svg: string; layers: DrawnLayer[]; held: Ctx['held'] } {
	const d = drawScene(req);
	const copy = req.copy;
	const title = cleanText((copy.headline || copy.body || brand().name).replace(/\s+/g, ' ').trim());
	return { svg: svgDocument(d.doc, req.width, req.height, d.ground, d.svg, { title, desc: d.desc }), layers: d.layers, held: d.held };
}

export type { Paint };
export { lockup, scaleOf };
