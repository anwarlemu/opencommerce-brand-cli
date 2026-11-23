import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import type { Picture } from '../assets/kit.js';
import { imageData, sizes, SLOTS, sceneSvg, TEMPLATE_IDS, TEMPLATE_SLOTS, type Copy, type Scene, type SizeDef, type Slot, type TemplateId } from '../assets/layouts.js';
import { imagesToPdf } from '../assets/pdf.js';
import { SMALL_FLOOR } from '../design/check.js';
import { PLATFORMS, sizeAlias } from '../design/platforms.js';
import type { DrawnLayer, LayerEdit } from '../design/types.js';
import { assertScene } from './check.js';
import { unknownName } from '../lib/names.js';
import { mergeCopy, readContent, type CopyInput, type ReadCopy } from './content.js';
import { toJpg, toWebp } from './encode.js';
import { picture, pngSize, rasterize, rasterRgb } from './load.js';

export { loadImage, pngSize, rasterize, rasterRgb, resolveImage } from './load.js';
export type { TemplateId } from '../assets/layouts.js';

/** Named sizes: the shared ones, with their pixels (src/design/platforms.ts). */
export const PRESETS: Record<string, SizeDef> = sizes;

export type PresetId = string;

export const sizeIds = () => Object.keys(sizes);
/** The sizes a template draws: a profile picture is the mark alone, and the mark fills only a square. */
export const sizesFor = (template: TemplateId) => (template === 'avatar' ? ['avatar', 'square'] : sizeIds().filter((id) => id !== 'avatar'));

export const templateInputs = (id: TemplateId): string[] => [...TEMPLATE_SLOTS[id].takes, ...(TEMPLATE_SLOTS[id].image ? ['image'] : [])];

export const TEMPLATES = TEMPLATE_IDS.map((id) => ({ id, description: imageData().templates[id].description, inputs: templateInputs(id), required: TEMPLATE_SLOTS[id].required as string[], sizes: sizesFor(id), source: imageData().templates[id].source }));

export const THEMES = ['white', 'mist'] as const;
export type Theme = (typeof THEMES)[number];
export const FORMATS = ['png', 'svg', 'jpg', 'webp', 'pdf'] as const;
export type Format = (typeof FORMATS)[number];

export type ImageInput = CopyInput & {
	preset?: string;
	size?: string;
	width?: string | number;
	height?: string | number;
	template?: string;
	ground?: string;
	theme?: string;
	format?: string;
	scale?: string | number;
	out?: string;
	seed?: string | number;
	logo?: boolean;
	glyphs?: boolean;
	window?: boolean;
	inset?: boolean;
	glyphSize?: number;
	sample?: boolean;
	page?: string;
	edits?: Record<string, LayerEdit>;
};

export type Written = { path: string; format: Format; preset: PresetId; template: TemplateId; width: number; height: number; bytes: number };

export function chooseTemplate(copy: Copy, image: boolean): TemplateId {
	if (copy.cards) return 'cards';
	if (copy.code) return copy.headline ? 'window' : 'frame';
	if (image) return 'frame';
	if (copy.by) return 'quote';
	if (copy.action) return 'announcement';
	if (copy.body && copy.headline) return 'lead';
	if (copy.body) return 'quote';
	return 'headline';
}

export type Target = { id: string; width: number; height: number };

/** One size by id, alias or WIDTHxHEIGHT. */
export function parseSize(id: string): Target {
	const alias = resolveAlias(id);
	if (alias in sizes) return { id: alias, width: sizes[alias].width, height: sizes[alias].height };
	const custom = /^(\d+)x(\d+)$/i.exec(id);
	if (custom) return customSize(Number(custom[1]), Number(custom[2]));
	const err = unknownName('preset', id, [...sizeIds(), ...Object.keys(imageData().aliases), 'all']);
	throw Object.assign(new Error(`${err.message} Or pass a size such as 1600x900.`), { suggestions: (err as Error & { suggestions?: string[] }).suggestions });
}

/** A size's other names: the brand's older ones, then the shared ones ("twitter header"). */
const resolveAlias = (id: string) => (id in sizes ? id : (imageData().aliases[id] ?? sizeAlias(id) ?? id));

export function customSize(width: number, height: number): Target {
	const { min, max } = imageData().custom;
	if (!Number.isInteger(width) || !Number.isInteger(height) || width < min || height < min || width > max || height > max) throw new Error(`A custom size takes whole numbers from ${min} to ${max} px on each side; ${width}x${height} is outside that.`);
	const named = Object.entries(sizes).find(([, s]) => s.width === width && s.height === height);
	return { id: named ? named[0] : `${width}x${height}`, width, height };
}

function parseSizes(input: ImageInput, template: TemplateId): Target[] {
	const w = input.width === undefined || input.width === '' ? undefined : Number(input.width);
	const h = input.height === undefined || input.height === '' ? undefined : Number(input.height);
	const value = input.size || input.preset || '';
	if (w !== undefined || h !== undefined) {
		if (w === undefined || h === undefined) throw new Error('Pass both --width and --height.');
		if (value && value !== 'custom' && !(input.preset === 'og' && !input.size)) throw new Error('Pass --size or --width and --height, not both.');
		return [customSize(w, h)];
	}
	if (value === 'custom') throw new Error('The custom size takes --width and --height (200 to 4000 px each).');
	const fallback = template === 'avatar' ? 'avatar' : 'og';
	if (value === 'all') return sizesFor(template).map(parseSize);
	const ids = (value || fallback).split(',').map((part) => part.trim()).filter(Boolean);
	if (!ids.length) throw new Error(`Pass a size: ${sizeIds().join(', ')}, a size such as 1600x900, or all.`);
	const targets = ids.map(parseSize);
	for (const t of targets) assertSize(template, t);
	return targets.filter((t, i) => targets.findIndex((o) => o.id === t.id) === i);
}

/** Throws when a template does not draw a size. */
export function assertSize(template: TemplateId, t: Target) {
	if (t.id === 'avatar' && template !== 'avatar') throw new Error(`A profile picture holds no words: the avatar size takes the avatar template, not ${template}.`);
	if (template === 'avatar' && t.width !== t.height) throw new Error(`The avatar template draws a square (avatar, square, or a custom size with equal sides), not ${t.id}.`);
}

function parseTemplate(value: string | undefined, copy: Copy, image: boolean, size?: string): TemplateId {
	if (!value) return !Object.keys(copy).length && !image && size && resolveAlias(size) === 'avatar' ? 'avatar' : chooseTemplate(copy, image);
	if (!(TEMPLATE_IDS as readonly string[]).includes(value)) throw unknownName('template', value, [...TEMPLATE_IDS]);
	return value as TemplateId;
}

export function parseTheme(theme: string | undefined, ground?: string): Theme {
	const value = theme || ground || 'white';
	if (!(THEMES as readonly string[]).includes(value)) throw unknownName(theme ? 'theme' : 'ground', value, [...THEMES]);
	return value as Theme;
}

/** A list of formats; when --out names one file, its extension decides. */
export function parseFormats(value: string | undefined, out?: string, fallback: Format = 'png'): Format[] {
	const fix = (v: string) => (v === 'jpeg' ? 'jpg' : v);
	const ext = out ? fix(extname(out).slice(1).toLowerCase()) : '';
	if (!value) return (FORMATS as readonly string[]).includes(ext) ? [ext as Format] : [fallback];
	const list = value === 'both' ? ['svg', 'png'] : value === 'all' ? [...FORMATS] : value.split(',').map((v) => fix(v.trim())).filter(Boolean);
	for (const v of list) if (!(FORMATS as readonly string[]).includes(v)) throw unknownName('format', v, [...FORMATS, 'both']);
	return [...new Set(list)] as Format[];
}

export function parseSeed(value: string | number | undefined): number | undefined {
	if (value === undefined || value === '') return undefined;
	const seed = Number(value);
	if (!Number.isInteger(seed) || seed < 0 || seed > 100000) throw new Error('--seed takes a whole number from 0 to 100000.');
	return seed;
}

export function parseScale(value: string | number | undefined): number {
	if (value === undefined || value === '') return 1;
	const n = Number(value);
	if (!Number.isFinite(n) || n < 0.25 || n > 4) throw new Error('--scale takes a number from 0.25 to 4.');
	return n;
}

/** Copy as a template takes it: aliases folded, sample copy filled on request, and an error for a slot it cannot draw. */
export function settleCopy(template: TemplateId, given: Copy, image: boolean, sample: boolean): { copy: Copy; sample: Set<string> } {
	const spec = TEMPLATE_SLOTS[template];
	const copy: Copy = { ...given };
	// A label on a poster is the line above its headline.
	if (copy.label && spec.takes.includes('badge') && !spec.takes.includes('label') && !copy.badge) {
		copy.badge = copy.label;
		delete copy.label;
	}
	if (template === 'quote' && copy.headline) {
		if (!copy.body) copy.body = copy.headline;
		else if (copy.body !== copy.headline && !copy.badge) copy.badge = copy.headline;
		else if (copy.body !== copy.headline) throw new Error('The quote template does not take --headline beside --body and --badge.');
		delete copy.headline;
	}
	const filled = new Set<string>();
	if (sample) {
		for (const [slot, value] of Object.entries(imageData().templates[template].sample) as [Slot, string][]) {
			if (copy[slot]) continue;
			if ((slot === 'code' || slot === 'highlight') && (image || given.code || (template === 'frame' && given.body))) continue;
			copy[slot] = value;
			filled.add(slot);
		}
	}
	for (const slot of SLOTS) {
		if (copy[slot] && !spec.takes.includes(slot)) throw new Error(`The ${template} template does not take --${slot}.${spec.takes.length ? ` It takes ${templateInputs(template).map((t) => `--${t}`).join(', ')}.` : ' It draws the mark alone.'}`);
	}
	if (image && !spec.image) throw new Error(`The ${template} template does not take --image. Use ${TEMPLATE_IDS.filter((id) => TEMPLATE_SLOTS[id].image).join(', ')}.`);
	for (const slot of spec.required) if (!copy[slot]) throw new Error(template === 'lead' && slot === 'body' ? 'The lead template needs --body. Use headline when there is no supporting line.' : `The ${template} template needs --${slot} (or --sample for sample copy).`);
	if (spec.needs && !image && !spec.needs.some((s) => copy[s])) throw new Error(`The ${template} template needs --image, ${spec.needs.map((s) => `--${s}`).join(' or ')}: an empty window says nothing (--sample draws sample code).`);
	if (copy.highlight && !copy.code) throw new Error('--highlight marks lines of --code; pass --code too.');
	if (copy.label && !copy.code && !image && !(template === 'frame' && copy.body)) throw new Error('--label names the window, and there is no window without --code or --image.');
	if (template === 'frame' && copy.code && copy.body) throw new Error('A frame holds --code or --body, not both.');
	if (image && copy.code) throw new Error('A window holds --code or --image, not both.');
	return { copy, sample: filled };
}

/** The scene a request draws at a size. */
export function sceneFor(template: TemplateId, target: Target, copy: Copy, sample: Set<string>, input: ImageInput, pic?: Picture): Scene {
	if (input.window === false && (copy.code || pic)) throw new Error('--no-window leaves out the window; drop --code and --image with it.');
	return {
		template,
		width: target.width,
		height: target.height,
		theme: parseTheme(input.theme, input.ground),
		copy,
		picture: pic,
		seed: parseSeed(input.seed),
		...(typeof input.logo === 'boolean' ? { logo: input.logo } : {}),
		...(input.glyphs === false ? { glyphs: false } : {}),
		...(input.window === false ? { window: false } : {}),
		...(input.inset ? { inset: true } : {}),
		...(input.glyphSize !== undefined && input.glyphSize !== 1 ? { glyphSize: input.glyphSize } : {}),
		...(input.page ? { page: input.page } : {}),
		...(input.edits ? { edits: input.edits } : {}),
		sample,
	};
}

/** One drawing in each format asked for. */
export function encodeScene(svg: string, width: number, height: number, formats: Format[], scale = 1): Partial<Record<Format, Buffer>> {
	const out: Partial<Record<Format, Buffer>> = {};
	const px = Math.round(width * scale);
	let png: Buffer | undefined;
	const raster = () => {
		if (png) return png;
		png = rasterize(svg, scale === 1 ? {} : { width: px });
		const size = pngSize(png);
		if (scale === 1 && (size.width !== width || size.height !== height)) throw new Error(`Rendered ${size.width}x${size.height}, expected ${width}x${height}.`);
		return png;
	};
	for (const f of formats) {
		if (f === 'svg') out.svg = Buffer.from(svg);
		else if (f === 'png') out.png = raster();
		else if (f === 'jpg') out.jpg = toJpg(raster());
		else if (f === 'webp') out.webp = toWebp(raster());
		else {
			const r = rasterRgb(svg, { width: Math.round(px * 2) });
			// A CSS pixel is 1/96 in, so a page is three quarters of the image's pixels in points.
			out.pdf = imagesToPdf([{ rgb: r.rgb, width: r.width, height: r.height }], Math.round(width * 0.75 * 100) / 100);
		}
	}
	return out;
}

/** A warning for a raster over its platform's upload limit. */
export function overLimit(id: string, format: string, bytes: number): string | undefined {
	const p = PLATFORMS.find((x) => x.id === id);
	if (!p?.limit || format === 'svg' || format === 'pdf' || bytes <= p.limit.bytes) return undefined;
	return `${id}.${format} is ${(bytes / 1048576).toFixed(1)} MB, over the ${(p.limit.bytes / 1048576).toFixed(0)} MB ${p.label} takes${p.limit.official ? '' : ' (approximate)'}. Use --format jpg.`;
}

function destinations(targets: Target[], formats: Format[], template: TemplateId, out?: string) {
	const single = targets.length === 1 && formats.length === 1;
	if (out) {
		const ext = extname(out).slice(1).toLowerCase().replace('jpeg', 'jpg');
		if (ext) {
			if (!(FORMATS as readonly string[]).includes(ext)) throw new Error(`--out must be a .png or .svg file (or ${FORMATS.slice(2).map((f) => `.${f}`).join(', ')}), or a directory.`);
			if (!single) throw new Error('Pass a directory to --out when rendering more than one file.');
			if (ext !== formats[0]) throw new Error(`--out is a .${ext} file, but --format is ${formats[0]}.`);
			return [{ target: targets[0], format: formats[0], path: resolve(out) }];
		}
	}
	const dir = resolve(out || join('.ds', 'images'));
	return targets.flatMap((target) => formats.map((format) => ({ target, format, path: join(dir, `${target.id}-${template}.${format}`) })));
}

export function imageSpec() {
	const d = imageData();
	return {
		presets: PLATFORMS.map((p) => ({ id: p.id, width: p.width, height: p.height, description: sizes[p.id].description, aliases: p.aliases, shownAt: p.shown, ...(p.avoid.length || p.safe ? { zones: [...p.avoid, ...(p.safe ? [p.safe] : [])].map((z) => ({ name: z.name, official: z.official, rect: z.rect })) } : {}), ...(p.limit ? { limitBytes: p.limit.bytes, limitOfficial: p.limit.official } : {}), ...(p.source ? { source: p.source } : {}), ...(p.note ? { note: p.note } : {}) })),
		aliases: d.aliases,
		custom: { ...d.custom, usage: 'Pass --size WIDTHxHEIGHT, such as 1600x900, or --width and --height.' },
		templates: TEMPLATES.map((item) => ({ ...item })),
		slots: [...SLOTS, 'image'],
		slotAliases: { title: 'headline', text: 'body', chip: 'badge' },
		options: { seed: 'glyph field seed (integer); each layout has its own default', logo: 'show or hide the lockup (--logo, --no-logo)', glyphs: 'show or hide the glyph field (--no-glyphs)', window: 'hero and window: hide the window (--no-window)', inset: 'avatar: the whole mark on the ground', sample: 'fill unset slots with sample copy (--sample); nothing is filled without it' },
		formats: [...FORMATS, 'both'],
		grounds: [...THEMES],
		themes: [...THEMES],
		floor: { shownPx: SMALL_FLOOR, note: 'Small text is at least this many px at the width a picture is usually shown at (shownAt).' },
		logo: d.logo,
		defaults: { preset: 'og', size: 'og', format: 'png (or the --out extension)', ground: 'white', theme: 'white', template: 'chosen from the inputs' },
		notes: d.notes,
	};
}

/** The request settled: template, sizes, copy and picture. */
export function settle(input: ImageInput, fromFile?: ReadCopy, contentFile?: string) {
	const { copy: given, image } = mergeCopy(input, fromFile);
	const template = parseTemplate(input.template, given, !!image, input.size || input.preset);
	const { copy, sample } = settleCopy(template, given, !!image, !!input.sample);
	const pic = image ? picture(image, contentFile) : undefined;
	return { template, copy, sample, pic };
}

const shown = (path: string) => {
	const rel = relative(process.cwd(), path);
	return rel.startsWith('..') || isAbsolute(rel) ? path : rel || path;
};

/** Render one or more images and write them. Paths in the result are relative to the working directory when they can be.
 *  Everything is drawn before anything is written, so a size that cannot hold the copy leaves no half set behind. */
export function renderImages(input: ImageInput): { template: TemplateId; ground: Theme; theme: Theme; files: Written[]; skipped: { size: string; reason: string }[]; warnings: string[]; layers: Record<string, DrawnLayer[]> } {
	const contentFile = input.content ? resolve(input.content) : undefined;
	const { template, copy, sample, pic } = settle(input, contentFile ? readContent(contentFile) : undefined, contentFile);
	const theme = parseTheme(input.theme, input.ground);
	const formats = parseFormats(input.format, input.out);
	const scale = parseScale(input.scale);
	const targets = parseSizes(input, template);
	const places = destinations(targets, formats, template, input.out);
	const warnings: string[] = [];
	const layers: Record<string, DrawnLayer[]> = {};
	const pending: { path: string; data: Buffer; entry: Omit<Written, 'bytes' | 'path'> }[] = [];
	const skipped: { size: string; reason: string }[] = [];
	const every = input.size === 'all' || (!input.size && input.preset === 'all');
	for (const target of targets) {
		let scene: ReturnType<typeof sceneSvg>;
		try {
			scene = sceneSvg(sceneFor(template, target, copy, sample, input, pic));
		} catch (error) {
			// Every size was asked for: the ones that cannot hold this copy are named, and the rest are drawn.
			if (!every || !(error as { fit?: boolean }).fit) throw error;
			skipped.push({ size: target.id, reason: (error as Error).message });
			continue;
		}
		assertScene({ template, sizeId: target.id, width: target.width, height: target.height, copy, edits: input.edits }, scene.layers);
		layers[target.id] = scene.layers;
		const data = encodeScene(scene.svg, target.width, target.height, formats, scale);
		for (const dest of places.filter((p) => p.target === target)) pending.push({ path: dest.path, data: data[dest.format]!, entry: { format: dest.format, preset: target.id, template, width: dest.format === 'svg' || dest.format === 'pdf' ? target.width : Math.round(target.width * scale), height: dest.format === 'svg' || dest.format === 'pdf' ? target.height : Math.round(target.height * scale) } });
	}
	if (!pending.length) throw new Error(`${skipped[0].reason} (No size holds it.)`);
	const files = pending.map((p) => {
		mkdirSync(dirname(p.path), { recursive: true });
		writeFileSync(p.path, p.data);
		const warn = overLimit(p.entry.preset, p.entry.format, p.data.length);
		if (warn) warnings.push(warn);
		return { path: shown(p.path), ...p.entry, bytes: statSync(p.path).size };
	});
	return { template, ground: theme, theme, files, skipped, warnings, layers };
}
