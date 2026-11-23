import { readFileSync } from 'node:fs';
import type { DrawnLayer, LayerEdit } from '../design/types.js';
import { assertScene } from '../image/check.js';
import { rasterRgb } from '../image/load.js';
import { unknownName } from '../lib/names.js';
import { pkgPath } from '../lib/paths.js';
import type { Picture } from './kit.js';
import { sceneSvg, type Copy, type Scene, type TemplateId } from './layouts.js';

// Deck slides at 1920 by 1080 (brand/assets/deck.json): each slide type is one of the image layouts, or the quote, set at
// slide size with the slide's own copy. Only the copy a slide is given is drawn; `sample` fills the rest.

type SlideDef = { name: string; layout: TemplateId; description: string; slots: Record<string, string>; required: string[]; seed: number };
type DeckDoc = { width: number; height: number; slides: Record<string, SlideDef> };

let doc: DeckDoc | undefined;
export const deckDoc = (): DeckDoc => (doc ??= JSON.parse(readFileSync(pkgPath('brand', 'assets', 'deck.json'), 'utf8')) as DeckDoc);
export const slideTypes = () => Object.keys(deckDoc().slides);

/** The names every brand uses, beside this deck's own. */
export const DECK_ALIASES: Record<string, string> = { headline: 'title', badge: 'chip', text: 'body', by: 'attribution', action: 'primary' };

export type Slide = { type: string; picture?: Picture | null; seed?: number; sample?: boolean; theme?: 'white' | 'mist'; edits?: Record<string, LayerEdit> } & Record<string, unknown>;

export function deckCatalog() {
	const d = deckDoc();
	return { size: { width: d.width, height: d.height }, aliases: DECK_ALIASES, slides: slideTypes().map((id) => ({ id, ...d.slides[id] })) };
}

/** A slide type's slots as given; with `sample`, the unset ones filled. Unknown slots throw. */
export function slotsFor(type: string, given: Record<string, unknown>, sample = false): { slots: Record<string, string>; filled: Set<string> } {
	const def = deckDoc().slides[type].slots;
	const slots: Record<string, string> = Object.fromEntries(Object.keys(def).map((k) => [k, '']));
	const filled = new Set<string>();
	for (const [k, v] of Object.entries(given)) {
		if (['type', 'picture', 'seed', 'sample', 'theme', 'edits'].includes(k)) continue;
		const key = k in def ? k : DECK_ALIASES[k] && DECK_ALIASES[k] in def ? DECK_ALIASES[k] : undefined;
		if (!key) throw new Error(`A ${type} slide does not take "${k}". It takes ${Object.keys(def).map((s) => `"${s}"`).join(', ')}.`);
		if (Array.isArray(v) && v.every((x) => typeof x === 'string')) slots[key] = v.join(' | ');
		else if (typeof v === 'string') slots[key] = v.replace(/\\n/g, '\n').trim();
		else if (v !== undefined && v !== null) throw new Error(`A ${type} slide's "${k}" takes text.`);
	}
	if (sample)
		for (const [k, v] of Object.entries(def)) {
			if (slots[k] || !v || (k === 'code' && given.picture)) continue;
			slots[k] = v;
			filled.add(k);
		}
	return { slots, filled };
}

const SLOT_OF: Record<string, keyof Copy> = { title: 'headline', body: 'body', chip: 'badge', number: 'badge', url: 'badge', stat: 'headline', primary: 'action', secondary: 'secondary', label: 'label', code: 'code', quote: 'body', attribution: 'by', items: 'cards' };

/** One slide as a scene. */
export function slideScene(slide: Slide): Scene {
	const D = deckDoc();
	if (!(slide.type in D.slides)) throw unknownName('slide type', String(slide.type), slideTypes());
	const def = D.slides[slide.type];
	const { slots: s, filled } = slotsFor(slide.type, slide, slide.sample);
	for (const k of def.required) if (!s[k] && !(k === 'image' && slide.picture)) throw new Error(`A ${slide.type} slide needs ${k === 'image' ? 'an "image".' : `"${k}" (or "sample": true).`}`);
	const copy: Copy = {};
	const sample = new Set<string>();
	for (const [k, v] of Object.entries(s)) {
		const slot = SLOT_OF[k];
		if (!slot || !v) continue;
		copy[slot] = v;
		if (filled.has(k)) sample.add(slot);
	}
	if (copy.label && !copy.code && !slide.picture) {
		if (!filled.has('label')) throw new Error(`A ${slide.type} slide's "label" names the window, and there is no window without "code" or "image".`);
		delete copy.label;
	}
	if (copy.code && slide.picture) throw new Error(`A ${slide.type} slide's window holds "code" or "image", not both.`);
	const seed = typeof slide.seed === 'number' ? slide.seed : def.seed;
	if (!Number.isInteger(seed) || seed < 0 || seed > 100000) throw new Error('"seed" takes a whole number from 0 to 100000.');
	const scene: Scene = { template: def.layout, width: D.width, height: D.height, theme: slide.theme ?? 'white', copy, picture: slide.picture ?? undefined, seed, sample, edits: slide.edits };
	switch (slide.type) {
		case 'section':
			return { ...scene, window: false, logo: true, textScale: 1.3, textWidth: 0.6 };
		case 'statement':
			return { ...scene, window: false };
		case 'bullets': {
			const items = (s.items ?? '').split('|').map((x) => x.trim()).filter(Boolean);
			if (!items.length) throw new Error('A bullets slide needs "items" (points separated by |).');
			if (items.length > 6) throw new Error(`A bullets slide holds up to 6 points; it was given ${items.length}. Split it.`);
			copy.cards = items
				.map((it) => {
					// "Heading: line"; a colon inside a word or an address is not a split.
					const at = it.search(/:\s/);
					return at > 0 ? `${it.slice(0, at).trim()}\n${it.slice(at + 1).trim()}` : it;
				})
				.join('\n\n');
			return { ...scene, bare: true, textScale: 1.5 };
		}
		case 'stat':
			return { ...scene, logo: false, textScale: 2 };
		default:
			return scene;
	}
}

export function slideSvg(slide: Slide): string {
	return sceneSvg(slideScene(slide)).svg;
}

export function renderSlide(slide: Slide, opts: { png?: boolean; svg?: boolean }) {
	const scene = slideScene(slide);
	const { svg, layers } = sceneSvg(scene);
	assertScene({ template: slide.type, kind: 'slide', sizeId: 'slide', width: scene.width, height: scene.height, copy: scene.copy, edits: scene.edits }, layers);
	const out: { svg?: string; png?: Buffer; rgb?: Buffer; layers: DrawnLayer[]; width: number; height: number } = { width: deckDoc().width, height: deckDoc().height, layers };
	if (opts.svg) out.svg = svg;
	if (opts.png) {
		const r = rasterRgb(svg);
		out.png = r.png;
		out.rgb = r.rgb;
	}
	return out;
}
