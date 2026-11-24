import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { deckDoc, slideScene, slideTypes } from '../assets/deck.js';
import { imageData, sceneSvg, SLOTS, TEMPLATE_SLOTS, type Copy, type Scene, type Slot, type TemplateId } from '../assets/layouts.js';
import { findItem, itemSvg, merchDoc, merchItems, PX_PER_IN, renderItem, slotsOf } from '../assets/merch.js';
import { COPY_ALIASES, wordColors } from '../image/check.js';
import { picture as readPicture, rasterize } from '../image/load.js';
import { encodeScene, sceneFor, settleCopy, sizesFor, SOCIAL, THEMES, type Format as ImageFormat } from '../image/render.js';
import { illustrate, illustrateData, subjects } from '../illustrate/render.js';
import { brand } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';
import { encodeMp4 } from '../video/encode.js';
import { frameSvg, videoScene } from '../video/frames.js';
import { templateDef, VIDEO_SIZES, VIDEO_TEMPLATES, type VideoSize } from '../video/motion.js';
import { framesOf, renderFramePng, videoRequest } from '../video/render.js';
import { paint as colors } from '../image/paint.js';
import { composeAdapter, pageAdapter, renderCompose } from './blocks-adapter.js';
import { PLATFORMS } from './platforms.js';
import { sheetSvg, type Painter } from './sheet.js';
import type { Adapter, Anchor, DesignDoc, DrawnLayer, Format, TemplateInfo } from './types.js';

// This brand's side of the design core: what can be made, what each part of it can do, and how a document becomes the
// engine's own request. Layer edits are applied inside the layouts (src/assets/layouts.ts), never on top of a drawing.

type Can = DrawnLayer['can'];
type LayerInfo = { id: string; can: Can };

const CORNERS: Anchor[] = ['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'];
const ALL: Anchor[] = ['center', 'top-left', 'top', 'top-right', 'left', 'right', 'bottom-left', 'bottom', 'bottom-right'];
const COLUMN: Anchor[] = ['center', 'top', 'bottom', 'left', 'right'];
const SIDES: Anchor[] = ['left', 'top-left', 'bottom-left', 'right', 'top-right', 'bottom-right'];

const logo: LayerInfo = { id: 'logo', can: { move: true, hide: true, scale: [0.8, 1.8], anchors: CORNERS } };
const lead = (id: string, anchors: Anchor[]): LayerInfo => ({ id, can: { move: true, align: true, scale: [0.6, 1.5], anchors } });
const line = (id: string): LayerInfo => ({ id, can: { move: true, align: true, hide: true, scale: [1, 1.6] } });
const key: LayerInfo = { id: 'action', can: { move: true, hide: true, scale: [1, 1.8] } };
const second: LayerInfo = { id: 'secondary', can: { hide: true } };
const windowLayer = (anchors: Anchor[]): LayerInfo => ({ id: 'window', can: { move: true, hide: true, scale: [1, 1.6], anchors } });
const art: LayerInfo = { id: 'art', can: { hide: true } };
const fixed = (...ids: string[]): LayerInfo[] => ids.map((id) => ({ id, can: {} }));

type Kind = { template: TemplateId; layers: LayerInfo[]; copy: Slot[]; required: Slot[]; image: 'none' | 'maybe' | 'needed'; seeded: boolean; also?: string[]; options?: TemplateInfo['options']; note?: string };

const glyphSize = { id: 'glyph-size', range: [0.6, 1.8] as [number, number], description: 'Size of the field\'s * and @, against their usual size' };
const highlight = { id: 'highlight', description: 'Code lines on the blue band, such as 1-5 or 2,4 (none for no band)' };

const slots = (t: TemplateId) => TEMPLATE_SLOTS[t].takes.filter((s) => s !== 'highlight');

/** What can be designed as an image. The frame comes three ways, since it needs something in it. */
const IMAGES: Record<string, Kind> = {
	hero: { template: 'hero', copy: slots('hero'), required: ['headline'], image: 'maybe', seeded: true, options: [glyphSize, highlight], layers: [lead('headline', COLUMN), line('body'), line('badge'), key, second, windowLayer(['center', 'left', 'right']), logo, art, ...fixed('label', 'code', 'picture')] },
	window: { template: 'window', copy: slots('window'), required: ['headline'], image: 'maybe', seeded: true, options: [glyphSize, highlight], layers: [lead('headline', SIDES), line('body'), line('badge'), key, second, windowLayer(['right', 'left']), logo, art, ...fixed('label', 'code', 'picture')] },
	closing: { template: 'closing', copy: slots('closing'), required: ['headline'], image: 'none', seeded: true, options: [glyphSize], layers: [lead('headline', ALL), line('body'), line('badge'), key, second, logo, art, ...fixed('panel')] },
	cards: { template: 'cards', copy: slots('cards'), required: ['cards'], image: 'none', seeded: true, options: [glyphSize], layers: [{ id: 'headline', can: { move: true, align: true, hide: true, scale: [0.7, 1.4] } }, { id: 'card-text', can: { scale: [1, 1.4] } }, { id: 'footer', can: { move: true, hide: true, scale: [1, 1.6] } }, logo, art, ...fixed('cards', 'card-headings')] },
	headline: { template: 'headline', copy: slots('headline'), required: ['headline'], image: 'none', seeded: false, layers: [lead('headline', ALL), line('badge'), logo] },
	lead: { template: 'lead', copy: slots('lead'), required: ['headline', 'body'], image: 'none', seeded: false, layers: [lead('headline', ALL), line('body'), line('badge'), logo] },
	quote: { template: 'quote', copy: slots('quote'), required: ['body'], image: 'none', seeded: false, layers: [lead('body', ALL), line('by'), line('badge'), logo] },
	announcement: { template: 'announcement', copy: slots('announcement'), required: ['headline'], image: 'none', seeded: false, layers: [lead('headline', ALL), line('badge'), key, logo] },
	frame: { template: 'frame', copy: ['headline', 'label'], required: [], image: 'needed', seeded: true, options: [glyphSize], layers: [{ id: 'headline', can: { move: true, align: true, hide: true, scale: [0.7, 1.5], anchors: COLUMN } }, windowLayer(['center', 'left', 'right']), logo, art, ...fixed('label', 'picture')], note: 'A screenshot, whole, in the brand\'s window, with an optional headline.' },
	'frame-code': { template: 'frame', copy: ['headline', 'code', 'label'], required: ['code'], image: 'none', seeded: true, options: [glyphSize, highlight], layers: [{ id: 'headline', can: { move: true, align: true, hide: true, scale: [0.7, 1.5], anchors: COLUMN } }, windowLayer(['center', 'left', 'right']), logo, art, ...fixed('label', 'code')], note: 'Code in the dark window, with an optional headline.' },
	'frame-note': { template: 'frame', copy: ['headline', 'body', 'label'], required: ['body'], image: 'none', seeded: true, options: [glyphSize], layers: [{ id: 'headline', can: { move: true, align: true, hide: true, scale: [0.7, 1.5], anchors: COLUMN } }, windowLayer(['center', 'left', 'right']), logo, art, ...fixed('label', 'body')], note: 'A short text in the window, with an optional headline.' },
	avatar: { template: 'avatar', copy: [], required: [], image: 'none', seeded: false, options: [{ id: 'inset', values: ['true', 'false'], description: 'The whole mark on the ground, instead of the mark carried to the edges' }], layers: fixed('logo') },
};

/** Slides: each type's own slots, under the shared names. */
const SLIDE_SLOT: Record<string, string> = { title: 'headline', chip: 'badge', primary: 'action', attribution: 'by', items: 'cards', quote: 'body' };
const slideOf = (id: string) => id.slice('slide-'.length);
const slideSlots = (type: string) => Object.keys(deckDoc().slides[type].slots).filter((s) => s !== 'image').map((s) => ({ own: s, id: SLIDE_SLOT[s] ?? s }));
const slideHolds = (type: string) => 'image' in deckDoc().slides[type].slots;
/** The layer a slide's slot is drawn as. */
const SLIDE_LAYERS: Record<string, LayerInfo[]> = {
	cover: IMAGES.hero.layers,
	section: [lead('headline', SIDES), line('body'), line('badge'), logo, art],
	statement: [lead('headline', ALL), line('body'), logo, art],
	bullets: IMAGES.cards.layers.filter((l) => l.id !== 'footer'),
	stat: [lead('headline', ALL), line('body'), logo, art, ...fixed('panel')],
	quote: IMAGES.quote.layers,
	image: IMAGES.window.layers,
	end: IMAGES.closing.layers,
};

/** The layouts are columns and grids that stay centered: when one part grows, hides or moves, the rest close up round it. */
const reflowsOf = (layers: LayerInfo[]): Record<string, string[]> => {
	const ids = [...layers.map((l) => l.id), 'cards', 'card-headings', 'card-text', 'footer', 'label', 'code', 'picture', 'window', 'number'];
	return Object.fromEntries(layers.map((l) => [l.id, [...new Set(ids.filter((x) => x !== l.id))]]));
};

const grounds = () => ({ white: colors().white, mist: colors().mist });

function infos(): TemplateInfo[] {
	const out: TemplateInfo[] = [];
	for (const [id, k] of Object.entries(IMAGES))
		out.push({
			id,
			kind: 'image',
			description: k.note ?? imageData().templates[k.template].description,
			sizes: [...sizesFor(k.template), 'custom'],
			themes: [...THEMES],
			grounds: grounds(),
			copy: k.copy.map((s) => ({ id: s, ...(k.required.includes(s) ? { required: true } : {}) })),
			images: k.image === 'none' ? [] : [{ id: 'picture', ...(k.image === 'needed' ? { required: true } : {}) }],
			options: k.options ?? [],
			layers: k.layers,
			reflows: reflowsOf(k.layers),
			formats: ['png', 'svg', 'jpg', 'webp', 'pdf'],
		});
	for (const type of slideTypes()) {
		const def = deckDoc().slides[type];
		const need = new Set(def.required.map((s) => SLIDE_SLOT[s] ?? s));
		out.push({
			id: `slide-${type}`,
			kind: 'slide',
			description: def.description,
			sizes: ['slide'],
			themes: [...THEMES],
			grounds: grounds(),
			copy: slideSlots(type).map((s) => ({ id: s.id, ...(need.has(s.id) ? { required: true } : {}) })),
			images: slideHolds(type) ? [{ id: 'picture', ...(need.has('image') ? { required: true } : {}) }] : [],
			options: [],
			layers: SLIDE_LAYERS[type] ?? [],
			reflows: reflowsOf(SLIDE_LAYERS[type] ?? []),
			formats: ['png', 'svg', 'jpg', 'webp', 'pdf'],
			layouts: [type],
		});
	}
	for (const item of merchItems())
		out.push({
			id: `merch-${item.id}`,
			kind: 'merch',
			description: `${item.name}: ${item.size[0]} by ${item.size[1]} in, ${item.method}. PNG at 100 px per inch (render --scale 3 for 300) and SVG at physical size, bleed included.`,
			sizes: ['print'],
			themes: item.variants,
			copy: slotsOf(item).map((s) => ({ id: s, ...(s === 'headline' && item.layers.some((l) => l.type === 'hero') ? { required: true } : {}) })),
			images: [],
			options: [],
			layers: [],
			formats: ['png', 'svg'],
			layouts: [item.id],
		});
	for (const s of subjects()) {
		const def = illustrateData().subjects[s];
		out.push({
			id: `illustration-${s}`,
			kind: 'illustration',
			description: def.description,
			sizes: ['default', ...SOCIAL, 'meeting', 'desktop', 'phone-wallpaper', 'custom'],
			themes: [...THEMES, 'none'],
			copy: s === 'window' ? [{ id: 'code' }, { id: 'label' }] : [],
			images: def.image ? [{ id: 'picture', ...(def.needsImage ? { required: true } : {}) }] : [],
			options: [],
			layers: [],
			formats: ['png', 'svg', 'jpg', 'webp', 'pdf'],
			layouts: [s],
		});
	}
	for (const t of VIDEO_TEMPLATES)
		out.push({
			id: `video-${t.id}`,
			kind: 'video',
			description: `${t.description} ${t.seconds} seconds at ${t.fps} fps. The PNG is the frame it rests on.`,
			sizes: Object.keys(VIDEO_SIZES),
			themes: [...THEMES],
			grounds: grounds(),
			copy: t.inputs.map((s) => ({ id: s, ...(t.required.includes(s) ? { required: true } : {}) })),
			images: [],
			options: [],
			layers: [],
			formats: ['png', 'mp4'],
			layouts: [t.id],
		});
	return out;
}

let cached: TemplateInfo[] | undefined;
const templates = () => (cached ??= infos());

const seeded = (id: string) => (id in IMAGES ? IMAGES[id].seeded : id.startsWith('slide-') ? (SLIDE_LAYERS[slideOf(id)] ?? []).some((l) => l.id === 'art') : id.startsWith('merch-') ? findItem(id.slice(6)).layers.some((l) => l.type === 'field' || l.type === 'hero') : id.startsWith('illustration-') ? ['field', 'window'].includes(id.slice(13)) : ['hero', 'window', 'closing', 'cards', 'field'].includes(id.slice(6)));

function defaults(id: string, size: string): Pick<DesignDoc, 'size' | 'theme' | 'seed' | 'options'> {
	if (id === 'compose') {
		const p = PLATFORMS.find((x) => x.id === size);
		return { size: { id: size, width: p?.width ?? 1200, height: p?.height ?? 800 }, theme: 'white', seed: imageData().templates.hero.seed ?? 3, options: {} };
	}
	const info = templates().find((t) => t.id === id)!;
	const p = PLATFORMS.find((x) => x.id === size);
	let box = p ? { width: p.width, height: p.height } : { width: 1200, height: 800 };
	let seed: number | undefined;
	if (id in IMAGES) seed = imageData().templates[IMAGES[id].template].seed ?? 3;
	else if (info.kind === 'slide') {
		box = { width: deckDoc().width, height: deckDoc().height };
		seed = deckDoc().slides[slideOf(id)].seed;
	} else if (info.kind === 'merch') {
		const item = findItem(id.slice(6));
		box = { width: Math.round((item.size[0] + 2 * item.bleed) * PX_PER_IN), height: Math.round((item.size[1] + 2 * item.bleed) * PX_PER_IN) };
		const field = item.layers.find((l) => l.type === 'field');
		seed = field?.type === 'field' ? field.seed : imageData().templates.hero.seed;
	} else if (info.kind === 'illustration') {
		const def = illustrateData().subjects[id.slice(13)];
		if (size === 'default') box = { width: def.size[0], height: def.size[1] || Math.round(def.size[0] * 0.625) };
		seed = def.seed;
	} else {
		const v = VIDEO_SIZES[size as VideoSize];
		if (v) box = { width: v.width, height: v.height };
		seed = id === 'video-field' ? illustrateData().subjects.field.seed : (imageData().templates[id.slice(6) as TemplateId]?.seed ?? 3);
	}
	return { size: { id: size, ...box }, theme: info.themes[0], seed: seeded(id) ? seed : undefined, options: (IMAGES[id]?.options ?? []).some((o) => o.id === 'glyph-size') ? { 'glyph-size': 1 } : {} };
}

/** A layer scaled past what fits here: the last change asked for more than the layout can give. A scale carried from
 *  another size or other words is drawn at the most that fits instead. */
function assertReach(doc: DesignDoc, layers: DrawnLayer[], held: Record<string, { dx: number; dy: number }>) {
	const last = doc.history.at(-1)?.before as { layers?: Record<string, { scale?: number; dx?: number; dy?: number }> | null } | undefined;
	if (!last || !('layers' in last)) return;
	for (const [id, h] of Object.entries(held)) {
		const e = doc.layers[id] ?? {};
		const was = last.layers?.[id] ?? {};
		if ((e.dx ?? 0) === (was.dx ?? 0) && (e.dy ?? 0) === (was.dy ?? 0)) continue;
		throw new Error(`The ${id} has no room to go that far here: it would leave the picture, or go under what ${doc.size.id} covers. The furthest is ${id}.dx ${h.dx} and ${id}.dy ${h.dy}.`);
	}
	for (const [id, e] of Object.entries(doc.layers)) {
		if (e.scale === undefined || e.scale === last.layers?.[id]?.scale) continue;
		const range = layers.find((l) => l.id === id)?.can.scale;
		if (!range) continue;
		if (e.scale > range[1] + 0.015) throw new Error(`The ${id} is too long to be ${e.scale} times its size here: it fits at ${range[0]} to ${range[1]}. Shorten the words, hide something, or ask for ${range[1]} (--layer ${id}.scale=${range[1]}).`);
		if (e.scale < range[0] - 0.015) throw new Error(`The ${id} would be too small to read at ${e.scale} times its size: here it goes from ${range[0]} to ${range[1]}. It does not fit smaller.`);
	}
}

function imageScene(doc: DesignDoc, dir: string): Scene {
	const k = IMAGES[doc.template];
	const pic = doc.images.picture ? readPicture(resolve(dir, doc.images.picture)) : undefined;
	const given: Copy = { ...doc.copy };
	if (given.code && doc.options.highlight !== undefined) given.highlight = String(doc.options.highlight);
	const { copy } = settleCopy(k.template, given, !!pic, false);
	return sceneFor(k.template, doc.size, copy, new Set(), { theme: doc.theme, seed: doc.seed, glyphSize: doc.options['glyph-size'] as number | undefined, inset: String(doc.options.inset) === 'true', edits: doc.layers }, pic);
}

function slideSceneOf(doc: DesignDoc, dir: string): Scene {
	const type = slideOf(doc.template);
	const pic = doc.images.picture ? readPicture(resolve(dir, doc.images.picture)) : undefined;
	const given: Record<string, string> = {};
	for (const s of slideSlots(type)) if (doc.copy[s.id]) given[s.own] = s.own === 'items' ? 'x' : doc.copy[s.id];
	const scene = slideScene({ type, ...given, picture: pic, seed: doc.seed, theme: doc.theme as 'white' | 'mist', edits: doc.layers });
	return type === 'bullets' ? { ...scene, copy: { ...scene.copy, cards: doc.copy.cards } } : scene;
}

const imageFormats = (formats: Format[]) => formats.filter((f): f is ImageFormat => f !== 'mp4' && f !== 'gif');

async function render(doc: DesignDoc, dir: string, out: { formats: Format[]; scale: number }): Promise<{ files: Record<string, Uint8Array>; layers: DrawnLayer[] }> {
	if (doc.template === 'compose') return renderCompose(doc, dir, out);
	if (doc.kind === 'image' || doc.kind === 'slide') {
		const scene = doc.kind === 'image' ? imageScene(doc, dir) : slideSceneOf(doc, dir);
		const { svg, layers, held } = sceneSvg(scene);
		assertReach(doc, layers, held);
		return { files: encodeScene(svg, doc.size.width, doc.size.height, imageFormats(out.formats), out.scale) as Record<string, Uint8Array>, layers };
	}
	if (doc.kind === 'merch') {
		const item = findItem(doc.template.slice(6));
		const req = { variant: doc.theme, slots: doc.copy, seed: doc.seed };
		const { layers } = itemSvg(item, req);
		const files: Record<string, Uint8Array> = {};
		if (out.formats.includes('png') || out.formats.includes('svg')) {
			const r = renderItem(item, { ...req, dpi: Math.round(100 * out.scale), png: out.formats.includes('png'), svg: out.formats.includes('svg') });
			if (r.png) files.png = r.png;
			if (r.svg) files.svg = Buffer.from(r.svg);
		}
		return { files, layers };
	}
	if (doc.kind === 'illustration') {
		const pic = doc.images.picture ? readPicture(resolve(dir, doc.images.picture)) : undefined;
		const subject = doc.template.slice(13);
		// At its own size a halftone keeps its picture's shape.
		const own = doc.size.id === 'default' && !illustrateData().subjects[subject].size[1];
		const r = illustrate({ subject, width: doc.size.width, ...(own ? {} : { height: doc.size.height }), seed: doc.seed, picture: pic, code: doc.copy.code, label: doc.copy.label, ground: doc.theme as 'white' });
		return { files: encodeScene(r.svg, r.width, r.height, imageFormats(out.formats), out.scale) as Record<string, Uint8Array>, layers: r.layers };
	}
	const req = videoRequest({ template: doc.template.slice(6), size: doc.size.id, theme: doc.theme, seed: doc.seed, ...doc.copy });
	const n = framesOf(req.template);
	const layers = templateDef(req.template).kind === 'art' ? [] : sceneSvg({ ...videoScene(req), dry: true }).layers;
	const files: Record<string, Uint8Array> = {};
	if (out.formats.includes('png')) files.png = rasterize(frameSvg(req, n - 1, templateDef(req.template).fps), out.scale === 1 ? {} : { width: Math.round(doc.size.width * out.scale) });
	if (out.formats.includes('mp4')) files.mp4 = encodeMp4(Array.from({ length: n }, (_, i) => renderFramePng(req, i, n)), templateDef(req.template).fps);
	return { files, layers };
}

function sample(id: string): Record<string, string> {
	const info = templates().find((t) => t.id === id);
	if (!info) return {};
	const takes = new Set(info.copy.map((c) => c.id));
	let from: Record<string, string | undefined> = {};
	if (id in IMAGES) from = { ...imageData().templates[IMAGES[id].template].sample, ...(id === 'frame-note' ? { body: imageData().templates.lead.sample.body } : {}) };
	else if (info.kind === 'slide') for (const s of slideSlots(slideOf(id))) from[s.id] = s.own === 'items' ? deckDoc().slides.bullets.slots.items.split('|').map((x) => x.trim().replace(/:\s+/, '\n')).join('\n\n') : deckDoc().slides[slideOf(id)].slots[s.own];
	else if (info.kind === 'merch') from = merchDoc().slots;
	else if (info.kind === 'illustration') from = { code: imageData().templates.hero.sample.code, label: imageData().templates.hero.sample.label };
	else from = templateDef(id.slice(6)).sample ?? imageData().templates[(id === 'video-product' ? 'frame' : id.slice(6)) as TemplateId]?.sample ?? {};
	return Object.fromEntries(Object.entries(from).filter(([k, v]) => takes.has(k) && v)) as Record<string, string>;
}

export function adapter(): Adapter {
	return {
		brand: brand().bin,
		templates,
		defaults,
		render,
		sample,
		colors: wordColors,
		compose: composeAdapter(),
		page: pageAdapter,
		aliases: { sizes: imageData().aliases, copy: COPY_ALIASES, layers: { text: 'body', button: 'action', key: 'action', glyphs: 'art', field: 'art', quote: 'body', stat: 'headline', screenshot: 'window' } },
	};
}

/** Contact sheets, with the brand's text face. */
export const paint: Painter = async (spec) => {
	const face = pkgPath('brand', 'fonts', 'Inter-Regular.ttf');
	readFileSync(face);
	return new Resvg(sheetSvg(spec, 'Inter'), { fitTo: { mode: 'original' }, font: { loadSystemFonts: false, fontFiles: [face], defaultFontFamily: 'Inter' } }).render().asPng();
};

export { SLOTS };
