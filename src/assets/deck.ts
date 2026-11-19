import { readFileSync } from 'node:fs';
import { layoutSvg, rasterRgb } from '../image/render.js';
import { paint } from '../image/paint.js';
import { renderSvg, type SceneImage } from '../image/scene.js';
import { unknownName } from '../lib/names.js';
import { pkgPath } from '../lib/paths.js';
import { designFor, type LayoutId } from './layouts.js';

// Deck slides at 1920 by 1080 (brand/assets/deck.json): each slide type is one of the image tool's layouts, or the
// quote, set at slide size with the slide's own copy.

type SlideDef = { name: string; layout: LayoutId | 'quote'; description: string; slots: Record<string, string>; seed: number };
type DeckDoc = { width: number; height: number; slides: Record<string, SlideDef> };

let doc: DeckDoc | undefined;
export const deckDoc = (): DeckDoc => (doc ??= JSON.parse(readFileSync(pkgPath('brand', 'assets', 'deck.json'), 'utf8')) as DeckDoc);
export const slideTypes = () => Object.keys(deckDoc().slides);

export type Slide = { type: string; picture?: SceneImage | null } & Record<string, unknown>;

export function deckCatalog() {
	const d = deckDoc();
	return { size: { width: d.width, height: d.height }, slides: slideTypes().map((id) => ({ id, ...d.slides[id] })) };
}

/** A slide type's slots, with what it was given over its opening copy. Unknown slots throw. */
export function slotsFor(type: string, given: Record<string, unknown>): Record<string, string> {
	const def = deckDoc().slides[type].slots;
	const anyGiven = Object.keys(given).some((k) => k in def && k !== 'image' && k !== 'label' && k !== 'code');
	// Opening copy fills a slide only when no copy was passed, so a new title never sits over old lines.
	const out: Record<string, string> = anyGiven ? Object.fromEntries(Object.keys(def).map((k) => [k, ''])) : { ...def };
	if (anyGiven) for (const k of ['label', 'code', 'url', 'chip']) if (k in def) out[k] = def[k];
	for (const [k, v] of Object.entries(given)) {
		if (['type', 'picture', 'seed'].includes(k)) continue;
		if (!(k in def)) throw new Error(`A ${type} slide does not take "${k}". It takes ${Object.keys(def).map((s) => `"${s}"`).join(', ')}.`);
		if (Array.isArray(v) && v.every((x) => typeof x === 'string')) out[k] = v.join(' | ');
		else if (typeof v === 'string') out[k] = v.replace(/\\n/g, '\n');
		else throw new Error(`A ${type} slide's "${k}" takes text.`);
	}
	return out;
}

/** One slide as an SVG document. */
export function slideSvg(slide: Slide): string {
	const D = deckDoc();
	if (!(slide.type in D.slides)) throw unknownName('slide type', String(slide.type), slideTypes());
	const def = D.slides[slide.type];
	const s = slotsFor(slide.type, slide);
	const W = D.width;
	const H = D.height;
	const seed = typeof slide.seed === 'number' ? slide.seed : def.seed;
	if (def.layout === 'quote') {
		if (!s.quote) throw new Error('A quote slide needs "quote".');
		// The quote is laid out at 1200x675 (the size its type steps are set for) and scaled to the slide.
		const small = renderSvg({ width: 1200, height: 675, template: 'quote', ground: 'white', title: '', text: s.quote, label: '', by: s.attribution ?? '', action: '' }, paint());
		return small.replace('width="1200" height="675"', `width="${W}" height="${H}"`);
	}
	const d = designFor(def.layout, W, H);
	d.seed = seed;
	d.title = s.title ?? '';
	d.text = s.body ?? '';
	d.chip = s.chip ?? '';
	d.primary = s.primary ?? '';
	d.secondary = s.secondary ?? '';
	if (s.label) d.windowName = s.label;
	if (s.code) d.code = s.code;
	if (slide.picture) {
		d.inside = 'picture';
		d.picture = slide.picture;
	}
	switch (slide.type) {
		case 'section':
			d.chip = s.number ?? '';
			d.showWindow = false;
			d.logo = true;
			d.textSize = Math.round(d.textSize! * 1.3);
			d.textWidth = 0.6;
			break;
		case 'statement':
			d.showWindow = false;
			d.chip = '';
			break;
		case 'bullets': {
			const items = (s.items ?? '').split('|').map((x) => x.trim()).filter(Boolean);
			if (!items.length) throw new Error('A bullets slide needs "items" (points separated by |).');
			if (items.length > 6) throw new Error(`A bullets slide holds up to 6 points; it was given ${items.length}. Split it.`);
			d.cards = items.map((it) => {
				const at = it.indexOf(':');
				return at > 0 ? `${it.slice(0, at).trim()}\n${it.slice(at + 1).trim()}` : it;
			}).join('\n\n');
			d.footer = '';
			d.textSize = Math.round(d.textSize! * 1.5);
			break;
		}
		case 'stat':
			if (!s.stat) throw new Error('A stat slide needs "stat".');
			d.title = s.stat;
			d.logo = false;
			d.textSize = Math.round(d.textSize! * 2);
			break;
		case 'image':
			if (!slide.picture) d.inside = 'code';
			break;
		case 'end':
			d.chip = s.url ?? '';
			break;
	}
	if (!d.title && slide.type !== 'image') throw new Error(`A ${slide.type} slide needs "title".`);
	return layoutSvg(d);
}

export function renderSlide(slide: Slide, opts: { png?: boolean; svg?: boolean }) {
	const svg = slideSvg(slide);
	const out: { svg?: string; png?: Buffer; rgb?: Buffer; width: number; height: number } = { width: deckDoc().width, height: deckDoc().height };
	if (opts.svg) out.svg = svg;
	if (opts.png) {
		const r = rasterRgb(svg);
		out.png = r.png;
		out.rgb = r.rgb;
	}
	return out;
}
