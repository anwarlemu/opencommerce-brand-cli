import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { Doc, svgDocument } from '../assets/kit.js';
import { designFor, drawLayout, imageData, LAYOUTS, type Design, type LayoutId } from '../assets/layouts.js';
import { unknownName } from '../lib/names.js';
import { mergeCopy, readContent, type Copy } from './content.js';
import { paint } from './paint.js';
import { renderSvg, type SceneImage, type SceneRequest } from './scene.js';

type Size = { width: number; height: number; description: string };

/** Named sizes, from brand/assets/image.json. */
export const PRESETS: Record<string, Size> = new Proxy({} as Record<string, Size>, {
	get: (_t, key: string) => imageData().sizes[key],
	ownKeys: () => Object.keys(imageData().sizes),
	getOwnPropertyDescriptor: (_t, key: string) => (key in imageData().sizes ? { enumerable: true, configurable: true, value: imageData().sizes[key] } : undefined),
	has: (_t, key: string) => key in imageData().sizes,
});

export type PresetId = string;

const CLASSIC = [
	{ id: 'headline', description: 'A centered headline, with an optional label above it.', inputs: ['title', 'label'] },
	{ id: 'lead', description: 'A headline and a short supporting line.', inputs: ['title', 'text', 'label'] },
	{ id: 'frame', description: 'A product window. Pass --image for a screenshot, or --text for copy or code inside it.', inputs: ['title', 'text', 'label', 'image'] },
	{ id: 'quote', description: 'A quotation, with an optional attribution.', inputs: ['text', 'by', 'label', 'title'] },
	{ id: 'announcement', description: 'A label, a headline and an optional flat key.', inputs: ['title', 'label', 'action'] },
] as const;

const LAYOUT_INPUTS: Record<LayoutId, string[]> = {
	hero: ['chip', 'title', 'text', 'action', 'secondary', 'label', 'code', 'highlight', 'image'],
	window: ['chip', 'title', 'text', 'action', 'secondary', 'label', 'code', 'highlight', 'image'],
	closing: ['chip', 'title', 'text', 'action', 'secondary'],
	cards: ['title', 'cards', 'footer'],
};

export const TEMPLATES = [...CLASSIC.map((t) => ({ ...t, inputs: [...t.inputs] as string[], source: 'CLI' })), ...LAYOUTS.map((id) => ({ id, description: imageData().templates[id].description, inputs: LAYOUT_INPUTS[id], source: imageData().templates[id].source }))];

export type TemplateId = (typeof CLASSIC)[number]['id'] | LayoutId;
const isLayout = (id: string): id is LayoutId => (LAYOUTS as string[]).includes(id);

export type ImageInput = Partial<Record<keyof Copy, string>> & {
	preset?: string;
	size?: string;
	template?: string;
	ground?: string;
	format?: string;
	out?: string;
	content?: string;
	seed?: string | number;
	logo?: boolean;
	glyphs?: boolean;
	window?: boolean;
};

export type Written = { path: string; format: 'png' | 'svg'; preset: PresetId; template: TemplateId; width: number; height: number; bytes: number };

export function chooseTemplate(copy: Copy): TemplateId {
	if (copy.cards) return 'cards';
	if (copy.image) return 'frame';
	if (copy.by) return 'quote';
	if (copy.action) return 'announcement';
	if (copy.text && copy.title) return 'lead';
	if (copy.text) return 'quote';
	return 'headline';
}

const presetIds = () => Object.keys(imageData().sizes);

type Target = { id: string; width: number; height: number };

function parseSizes(value: string): Target[] {
	if (value === 'all') return presetIds().map((id) => ({ id, ...imageData().sizes[id] }));
	const ids = value.split(',').map((part) => part.trim()).filter(Boolean);
	if (!ids.length) throw new Error(`Pass a preset: ${presetIds().join(', ')}, a size such as 1600x900, or all.`);
	return ids.map((id) => {
		const alias = imageData().aliases[id] ?? id;
		if (alias in imageData().sizes) return { id: alias, ...imageData().sizes[alias] };
		const custom = /^(\d+)x(\d+)$/i.exec(id);
		if (custom) {
			const { min, max } = imageData().custom;
			const width = Number(custom[1]);
			const height = Number(custom[2]);
			if (width < min || height < min || width > max || height > max) throw new Error(`A custom size takes ${min} to ${max} px on each side; ${id} is outside that.`);
			return { id: `${width}x${height}`, width, height };
		}
		const err = unknownName('preset', id, [...presetIds(), ...Object.keys(imageData().aliases).filter((a) => !/^\d/.test(a)), 'all']);
		throw Object.assign(new Error(`${err.message} Or pass a size such as 1600x900.`), { suggestions: (err as Error & { suggestions?: string[] }).suggestions });
	});
}

function parseTemplate(value: string | undefined, copy: Copy): TemplateId {
	if (!value) return chooseTemplate(copy);
	const found = TEMPLATES.find((item) => item.id === value);
	if (!found) throw unknownName('template', value, TEMPLATES.map((t) => t.id));
	return found.id as TemplateId;
}

function parseGround(value: string | undefined): 'white' | 'mist' {
	if (!value || value === 'white') return 'white';
	if (value === 'mist') return 'mist';
	throw unknownName('ground', value, ['white', 'mist']);
}

/** png, svg or both; when --out names one file, its extension decides. */
function parseFormat(value: string | undefined, out?: string): ('png' | 'svg')[] {
	const ext = out ? extname(out).slice(1).toLowerCase() : '';
	if (!value && (ext === 'png' || ext === 'svg')) return [ext];
	if (!value || value === 'png') return ['png'];
	if (value === 'svg') return ['svg'];
	if (value === 'both') return ['svg', 'png'];
	throw unknownName('format', value, ['png', 'svg', 'both']);
}

function assertCopy(template: TemplateId, copy: Copy) {
	if ((template === 'headline' || template === 'lead' || template === 'announcement') && !copy.title) throw new Error(`The ${template} template needs --title.`);
	if (template === 'quote' && !copy.text && !copy.title) throw new Error('The quote template needs --text.');
	if (template === 'lead' && !copy.text) throw new Error('The lead template needs --text. Use headline when there is no supporting line.');
	if (!isLayout(template)) {
		for (const key of ['chip', 'secondary', 'code', 'highlight', 'cards', 'footer'] as const) if (copy[key]) throw new Error(`The ${template} template does not take --${key}. It goes with ${LAYOUTS.filter((id) => LAYOUT_INPUTS[id].includes(key)).join(', ')}.`);
	} else {
		const takes = LAYOUT_INPUTS[template];
		for (const key of ['chip', 'text', 'action', 'secondary', 'label', 'code', 'highlight', 'image', 'cards', 'footer', 'by'] as const) if (copy[key] && !takes.includes(key)) throw new Error(`The ${template} template does not take --${key}. It takes ${takes.map((t) => `--${t}`).join(', ')}.`);
	}
}

export function pngSize(buffer: Buffer) {
	if (buffer.length < 24 || buffer[0] !== 0x89 || buffer.toString('ascii', 1, 4) !== 'PNG') throw new Error('Output is not a PNG.');
	return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

export function rasterize(svg: string, opts: { width?: number } = {}) {
	const resvg = new Resvg(svg, { fitTo: opts.width ? { mode: 'width', value: opts.width } : { mode: 'original' }, font: { loadSystemFonts: false }, shapeRendering: 2, textRendering: 2, imageRendering: 0 });
	return Buffer.from(resvg.render().asPng());
}

/** The RGB pixels of an SVG (for a PDF page), and its size. */
export function rasterRgb(svg: string, opts: { width?: number } = {}) {
	const resvg = new Resvg(svg, { fitTo: opts.width ? { mode: 'width', value: opts.width } : { mode: 'original' }, font: { loadSystemFonts: false }, shapeRendering: 2, textRendering: 2, imageRendering: 0, background: '#ffffff' });
	const img = resvg.render();
	const px = img.pixels;
	const rgb = Buffer.alloc((px.length / 4) * 3);
	for (let i = 0, j = 0; i < px.length; i += 4, j += 3) {
		const a = px[i + 3] / 255;
		rgb[j] = Math.round(px[i] * a + 255 * (1 - a));
		rgb[j + 1] = Math.round(px[i + 1] * a + 255 * (1 - a));
		rgb[j + 2] = Math.round(px[i + 2] * a + 255 * (1 - a));
	}
	return { rgb, width: img.width, height: img.height, png: Buffer.from(img.asPng()) };
}

function jpegSize(buffer: Buffer) {
	let offset = 2;
	while (offset + 1 < buffer.length) {
		if (buffer[offset] !== 0xff) {
			offset += 1;
			continue;
		}
		while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
		if (offset >= buffer.length) break;
		const marker = buffer[offset];
		offset += 1;
		// Standalone markers carry no length: stuffed 0x00, TEM, restart, SOI and EOI.
		if (marker === 0x00 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) continue;
		if (offset + 1 >= buffer.length) break;
		const length = buffer.readUInt16BE(offset);
		if (length < 2) throw new Error('Could not read the JPEG size.');
		const startOfFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
		if (startOfFrame) {
			if (offset + 6 >= buffer.length) break;
			return { height: buffer.readUInt16BE(offset + 3), width: buffer.readUInt16BE(offset + 5) };
		}
		offset += length;
	}
	throw new Error('Could not read the JPEG size.');
}

export function loadImage(file: string): SceneImage {
	const buffer = readFileSync(file);
	if (buffer.length > 12 * 1024 * 1024) throw new Error('Image files must be under 12 MB.');
	if (buffer[0] === 0x89 && buffer.toString('ascii', 1, 4) === 'PNG') {
		const size = pngSize(buffer);
		return { data: buffer, mime: 'image/png', ...size };
	}
	if (buffer[0] === 0xff && buffer[1] === 0xd8) return { data: buffer, mime: 'image/jpeg', ...jpegSize(buffer) };
	const head = buffer.subarray(0, 300).toString('utf8');
	if (head.includes('<svg')) {
		const png = rasterize(buffer.toString('utf8'));
		return { data: png, mime: 'image/png', ...pngSize(png) };
	}
	throw new Error('The image must be a PNG, JPEG or SVG file.');
}

export function resolveImage(file: string, contentFile?: string) {
	const fromCwd = resolve(file);
	if (exists(fromCwd)) return fromCwd;
	if (contentFile) {
		const beside = resolve(dirname(contentFile), file);
		if (exists(beside)) return beside;
	}
	throw new Error(`No image at ${file}.`);
}

function exists(file: string) {
	try {
		statSync(file);
		return true;
	} catch {
		return false;
	}
}

function destinations(targets: Target[], formats: ('png' | 'svg')[], template: TemplateId, out?: string) {
	const single = targets.length === 1 && formats.length === 1;
	if (out) {
		const ext = extname(out).slice(1).toLowerCase();
		if (ext) {
			if (ext !== 'png' && ext !== 'svg') throw new Error('--out must be a .png or .svg file, or a directory.');
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
		presets: presetIds().map((id) => ({ id, width: d.sizes[id].width, height: d.sizes[id].height, description: d.sizes[id].description })),
		aliases: d.aliases,
		custom: { ...d.custom, usage: 'Pass --preset WIDTHxHEIGHT, such as 1600x900.' },
		templates: TEMPLATES.map((item) => ({ ...item })),
		slots: ['title', 'text', 'label', 'by', 'action', 'secondary', 'chip', 'code', 'highlight', 'cards', 'footer', 'image'],
		options: { seed: 'glyph field seed (integer); each layout has its own default', logo: 'show or hide the lockup (--logo, --no-logo)', glyphs: 'show or hide the glyph field (--no-glyphs)', window: 'hero and window: hide the window (--no-window)' },
		formats: ['png', 'svg', 'both'],
		grounds: ['white', 'mist'],
		defaults: { preset: 'og', format: 'png (or the --out extension)', ground: 'white', template: 'chosen from the inputs' },
		notes: d.notes,
	};
}

/** A layout design from the copy and options, over the layout's opening values. */
export function layoutDesign(template: LayoutId, width: number, height: number, copy: Copy, input: ImageInput, picture?: SceneImage): Design {
	const d = designFor(template, width, height);
	const given = Boolean(copy.title || copy.text || copy.chip || copy.cards);
	if (given) {
		d.title = copy.title;
		d.text = copy.text;
		d.chip = copy.chip;
	}
	if (copy.cards) d.cards = copy.cards;
	if (copy.footer) d.footer = copy.footer;
	d.primary = copy.action;
	d.secondary = copy.secondary;
	if (copy.label) d.windowName = copy.label;
	if (copy.code) d.code = copy.code;
	if (copy.highlight) d.highlight = copy.highlight === 'none' ? '' : copy.highlight;
	if (picture) {
		d.inside = 'picture';
		d.picture = picture;
	}
	if (input.seed !== undefined && input.seed !== '') {
		const seed = Number(input.seed);
		if (!Number.isInteger(seed) || seed < 0 || seed > 100000) throw new Error('--seed takes a whole number from 0 to 100000.');
		d.seed = seed;
	}
	if (typeof input.logo === 'boolean') d.logo = input.logo;
	if (input.glyphs === false) d.glyphs = false;
	if (input.window === false) d.showWindow = false;
	if (template === 'cards' && !d.cards.trim()) throw new Error('The cards template needs --cards (blank-line-separated cards, heading first).');
	return d;
}

export function layoutSvg(design: Design, ground: 'white' | 'mist' = 'white') {
	const colors = paint();
	const doc = new Doc();
	const body = drawLayout(doc, design, colors).svg;
	const title = design.title || design.text || design.layout;
	const desc = [design.chip, design.title, design.text, design.primary, design.secondary, design.layout === 'cards' ? design.cards.replace(/\s+/g, ' ') : ''].filter(Boolean).join(' ');
	return svgDocument(doc, design.width, design.height, ground === 'mist' ? colors.mist : colors.white, body, { title, desc });
}

/** Render one or more images and write them. Paths in the result are relative to the working directory when they can be. */
export function renderImages(input: ImageInput): { template: TemplateId; ground: 'white' | 'mist'; files: Written[] } {
	const fromFile = input.content ? readContent(resolve(input.content)) : undefined;
	const copy = mergeCopy(input, fromFile);
	const template = parseTemplate(input.template, copy);
	assertCopy(template, copy);
	const ground = parseGround(input.ground);
	const formats = parseFormat(input.format, input.out);
	const sizes = parseSizes(input.size || input.preset || 'og');
	const unique = sizes.filter((s, i) => sizes.findIndex((o) => o.id === s.id) === i);
	if (template === 'quote' && !copy.text) copy.text = copy.title;
	if (template === 'quote' && copy.title && copy.text && copy.title !== copy.text && !copy.label) copy.label = copy.title;
	const image = copy.image ? loadImage(resolveImage(copy.image, input.content ? resolve(input.content) : undefined)) : undefined;
	const colors = paint();
	const files: Written[] = [];
	for (const dest of destinations(unique, formats, template, input.out)) {
		const { width, height } = dest.target;
		let svg: string;
		if (isLayout(template)) svg = layoutSvg(layoutDesign(template, width, height, copy, input, image), ground);
		else {
			const scene: SceneRequest = { width, height, template, ground, title: copy.title, text: copy.text, label: copy.label, by: copy.by, action: copy.action, image };
			svg = renderSvg(scene, colors);
		}
		const data = dest.format === 'svg' ? Buffer.from(svg) : rasterize(svg);
		if (dest.format === 'png') {
			const size = pngSize(data);
			if (size.width !== width || size.height !== height) throw new Error(`Rendered ${size.width}x${size.height}, expected ${width}x${height}.`);
		}
		mkdirSync(dirname(dest.path), { recursive: true });
		writeFileSync(dest.path, data);
		const rel = relative(process.cwd(), dest.path);
		files.push({ path: rel.startsWith('..') || isAbsolute(rel) ? dest.path : rel || dest.path, format: dest.format, preset: dest.target.id, template, width, height, bytes: statSync(dest.path).size });
	}
	return { template, ground, files };
}
