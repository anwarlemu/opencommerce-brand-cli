import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { paint } from './paint.js';
import { renderSvg, type SceneImage, type SceneRequest } from './scene.js';

export const PRESETS = {
	og: { width: 1200, height: 630, description: 'Open Graph and link previews, 1200x630' },
	square: { width: 1080, height: 1080, description: 'Square social post, 1080x1080' },
	portrait: { width: 1080, height: 1350, description: 'Portrait social post, 1080x1350' },
	landscape: { width: 1200, height: 675, description: 'Landscape post for X and LinkedIn, 1200x675' },
} as const;

export type PresetId = keyof typeof PRESETS;

export const TEMPLATES = [
	{ id: 'headline', description: 'A centered headline, with an optional label above it.', inputs: ['title', 'label'] },
	{ id: 'lead', description: 'A headline and a short supporting line.', inputs: ['title', 'text', 'label'] },
	{ id: 'frame', description: 'A product window. Pass --image for a screenshot, or --text for copy or code inside it.', inputs: ['title', 'text', 'label', 'image'] },
	{ id: 'quote', description: 'A quotation, with an optional attribution.', inputs: ['text', 'by', 'label', 'title'] },
	{ id: 'announcement', description: 'A label, a headline and an optional flat key.', inputs: ['title', 'label', 'action'] },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]['id'];

const SIZE_ALIAS: Record<string, PresetId> = {
	'1200x630': 'og',
	'1080x1080': 'square',
	'1080x1350': 'portrait',
	'1200x675': 'landscape',
};

export type ImageInput = {
	preset?: string;
	template?: string;
	ground?: string;
	format?: string;
	out?: string;
	title?: string;
	text?: string;
	label?: string;
	by?: string;
	action?: string;
	image?: string;
	content?: string;
};

export type Written = { path: string; format: 'png' | 'svg'; preset: PresetId; template: TemplateId; width: number; height: number; bytes: number };

type Copy = { title: string; text: string; label: string; by: string; action: string; image?: string };

function asText(value: unknown) {
	return typeof value === 'string' ? value.trim() : '';
}

function readContent(file: string): Copy {
	let parsed: unknown;
	try {
		parsed = JSON.parse(readFileSync(file, 'utf8'));
	} catch {
		throw new Error(`Could not read JSON from ${file}.`);
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error(`${file} must be a JSON object with title, text, label, by, action and image.`);
	const record = parsed as Record<string, unknown>;
	return { title: asText(record.title), text: asText(record.text), label: asText(record.label), by: asText(record.by), action: asText(record.action), image: asText(record.image) || undefined };
}

export function chooseTemplate(copy: Copy): TemplateId {
	if (copy.image) return 'frame';
	if (copy.by) return 'quote';
	if (copy.action) return 'announcement';
	if (copy.text && copy.title) return 'lead';
	if (copy.text) return 'quote';
	return 'headline';
}

function parsePreset(value: string): PresetId[] {
	if (value === 'all') return Object.keys(PRESETS) as PresetId[];
	const ids = value.split(',').map((part) => part.trim()).filter(Boolean);
	if (!ids.length) throw new Error('Pass a preset: og, square, portrait, landscape, or all.');
	return ids.map((id) => {
		const alias = SIZE_ALIAS[id] ?? id;
		if (!(alias in PRESETS)) throw new Error(`Unknown preset "${id}". Use og, square, portrait, landscape, or all.`);
		return alias as PresetId;
	});
}

function parseTemplate(value: string | undefined, copy: Copy): TemplateId {
	if (!value) return chooseTemplate(copy);
	const found = TEMPLATES.find((item) => item.id === value);
	if (!found) throw new Error(`Unknown template "${value}". Use headline, lead, frame, quote or announcement.`);
	return found.id;
}

function parseGround(value: string | undefined): 'white' | 'mist' {
	if (!value || value === 'white') return 'white';
	if (value === 'mist') return 'mist';
	throw new Error('Unknown ground. Use white or mist.');
}

function parseFormat(value: string | undefined): ('png' | 'svg')[] {
	if (!value || value === 'png') return ['png'];
	if (value === 'svg') return ['svg'];
	if (value === 'both') return ['svg', 'png'];
	throw new Error('Unknown format. Use png, svg or both.');
}

function assertCopy(template: TemplateId, copy: Copy) {
	if ((template === 'headline' || template === 'lead' || template === 'announcement') && !copy.title) throw new Error(`The ${template} template needs --title.`);
	if (template === 'quote' && !copy.text && !copy.title) throw new Error('The quote template needs --text.');
	if (template === 'lead' && !copy.text) throw new Error('The lead template needs --text. Use headline when there is no supporting line.');
}

export function pngSize(buffer: Buffer) {
	if (buffer.length < 24 || buffer[0] !== 0x89 || buffer.toString('ascii', 1, 4) !== 'PNG') throw new Error('Output is not a PNG.');
	return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

export function rasterize(svg: string) {
	const resvg = new Resvg(svg, { fitTo: { mode: 'original' }, font: { loadSystemFonts: false }, shapeRendering: 2, textRendering: 2, imageRendering: 0 });
	return Buffer.from(resvg.render().asPng());
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

function resolveImage(file: string, contentFile?: string) {
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

function destinations(presets: PresetId[], formats: ('png' | 'svg')[], template: TemplateId, out?: string) {
	const single = presets.length === 1 && formats.length === 1;
	if (out) {
		const ext = extname(out).slice(1).toLowerCase();
		if (ext) {
			if (ext !== 'png' && ext !== 'svg') throw new Error('--out must be a .png or .svg file, or a directory.');
			if (!single) throw new Error('Pass a directory to --out when rendering more than one file.');
			if (ext !== formats[0]) throw new Error(`--out is a .${ext} file, but --format is ${formats[0]}.`);
			return [{ preset: presets[0], format: formats[0], path: resolve(out) }];
		}
	}
	const dir = resolve(out || join('.ds', 'images'));
	return presets.flatMap((preset) => formats.map((format) => ({ preset, format, path: join(dir, `${preset}-${template}.${format}`) })));
}

export function imageSpec() {
	return {
		presets: Object.entries(PRESETS).map(([id, preset]) => ({ id, width: preset.width, height: preset.height, description: preset.description })),
		templates: TEMPLATES.map((item) => ({ ...item })),
		formats: ['png', 'svg', 'both'],
		grounds: ['white', 'mist'],
		defaults: { preset: 'og', format: 'png', ground: 'white', template: 'chosen from the inputs' },
	};
}

/** Render one or more images and write them. Paths in the result are relative to the working directory when they can be. */
export function renderImages(input: ImageInput): { template: TemplateId; ground: 'white' | 'mist'; files: Written[] } {
	const fromFile = input.content ? readContent(resolve(input.content)) : undefined;
	const copy: Copy = {
		title: input.title?.trim() || fromFile?.title || '',
		text: input.text?.trim() || fromFile?.text || '',
		label: input.label?.trim() || fromFile?.label || '',
		by: input.by?.trim() || fromFile?.by || '',
		action: input.action?.trim() || fromFile?.action || '',
		image: input.image?.trim() || fromFile?.image,
	};
	const template = parseTemplate(input.template, copy);
	assertCopy(template, copy);
	const ground = parseGround(input.ground);
	const formats = parseFormat(input.format);
	const presets = parsePreset(input.preset || 'og');
	const unique = [...new Set(presets)];
	if (template === 'quote' && !copy.text) copy.text = copy.title;
	if (template === 'quote' && copy.title && copy.text && copy.title !== copy.text && !copy.label) copy.label = copy.title;
	const image = copy.image ? loadImage(resolveImage(copy.image, input.content ? resolve(input.content) : undefined)) : undefined;
	const colors = paint();
	const files: Written[] = [];
	for (const target of destinations(unique, formats, template, input.out)) {
		const preset = PRESETS[target.preset];
		const scene: SceneRequest = { width: preset.width, height: preset.height, template, ground, title: copy.title, text: copy.text, label: copy.label, by: copy.by, action: copy.action, image };
		const svg = renderSvg(scene, colors);
		const data = target.format === 'svg' ? Buffer.from(svg) : rasterize(svg);
		if (target.format === 'png') {
			const size = pngSize(data);
			if (size.width !== preset.width || size.height !== preset.height) throw new Error(`Rendered ${size.width}x${size.height}, expected ${preset.width}x${preset.height}.`);
		}
		mkdirSync(dirname(target.path), { recursive: true });
		writeFileSync(target.path, data);
		const rel = relative(process.cwd(), target.path);
		files.push({ path: rel.startsWith('..') || isAbsolute(rel) ? target.path : rel || target.path, format: target.format, preset: target.preset, template, width: preset.width, height: preset.height, bytes: statSync(target.path).size });
	}
	return { template, ground, files };
}
