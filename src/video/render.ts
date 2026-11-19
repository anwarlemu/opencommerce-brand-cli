import { createHash } from 'node:crypto';
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { mergeCopy, readContent } from '../image/content.js';
import { pngSize, rasterize } from '../image/render.js';
import { unknownName } from '../lib/names.js';
import { encodeMp4, encodeWebm } from './encode.js';
import { frameSvg, type VideoFrame } from './frames.js';
import { templateDef, VIDEO_SIZES, VIDEO_TEMPLATES, type VideoSize, type VideoTemplate } from './motion.js';

export type VideoInput = {
	template?: string;
	size?: string;
	ground?: string;
	out?: string;
	format?: string;
	title?: string;
	text?: string;
	label?: string;
	action?: string;
	secondary?: string;
	chip?: string;
	code?: string;
	cards?: string;
	footer?: string;
	by?: string;
	image?: string;
	content?: string;
	seed?: string | number;
};

const sha256 = (data: Buffer) => createHash('sha256').update(data).digest('hex');

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[], label: string): T {
	if (value === undefined || value === '') throw new Error(`Missing ${label}. Use ${allowed.join(', ')}.`);
	if (!allowed.includes(value as T)) throw unknownName(label, value, [...allowed]);
	return value as T;
}

function parseGround(value: string | undefined): 'white' | 'mist' {
	if (!value || value === 'white') return 'white';
	if (value === 'mist') return 'mist';
	throw unknownName('ground', value, ['white', 'mist']);
}

function assertCopy(template: VideoTemplate, copy: Record<string, string | undefined>) {
	if ((template === 'social' || template === 'announcement') && !copy.title) throw new Error(`The ${template} template needs --title.`);
	if (template === 'product' && !copy.text) throw new Error('The product template needs --text.');
	const takes = templateDef(template).inputs;
	for (const key of ['chip', 'secondary', 'code', 'cards', 'footer', 'title', 'text', 'label', 'action'] as const) {
		if (copy[key] && !takes.includes(key) && !(templateDef(template).kind === 'poster' && ['title', 'text', 'label', 'action'].includes(key))) throw new Error(`The ${template} template does not take --${key}.${takes.length ? ` It takes ${takes.map((t) => `--${t}`).join(', ')}.` : ' It takes no copy.'}`);
	}
}

/** mp4 or webm, from --format or the --out extension. */
function formatOf(input: VideoInput): 'mp4' | 'webm' {
	const ext = input.out ? extname(input.out).slice(1).toLowerCase() : '';
	if (input.format) {
		const f = oneOf(input.format, ['mp4', 'webm'] as const, 'format');
		if (ext && ext !== f) throw new Error(`--out is a .${ext} file, but --format is ${f}.`);
		return f;
	}
	if (!ext || ext === 'mp4') return 'mp4';
	if (ext === 'webm') return 'webm';
	throw new Error('--out must be an .mp4 or .webm file, or a directory.');
}

function destination(size: VideoSize, template: VideoTemplate, format: string, out?: string) {
	if (!out) return resolve(join('.ds', 'videos', `${size}-${template}.${format}`));
	const ext = extname(out).slice(1).toLowerCase();
	if (!ext) return resolve(join(out, `${size}-${template}.${format}`));
	return resolve(out);
}

export function videoRequest(input: VideoInput): VideoFrame {
	if (input.by?.trim()) throw new Error('Video templates do not take --by.');
	if (input.image?.trim()) throw new Error('Video templates do not take --image.');
	const fromFile = input.content ? readContent(resolve(input.content)) : undefined;
	if (fromFile?.by) throw new Error('Video templates do not take by.');
	if (fromFile?.image) throw new Error('Video templates do not take image.');
	const copy = mergeCopy(input, fromFile);
	const template = oneOf(input.template, VIDEO_TEMPLATES.map((item) => item.id), 'template');
	const size = oneOf(input.size, Object.keys(VIDEO_SIZES) as VideoSize[], 'size');
	assertCopy(template, copy);
	let seed: number | undefined;
	if (input.seed !== undefined && input.seed !== '') {
		seed = Number(input.seed);
		if (!Number.isInteger(seed) || seed < 0 || seed > 100000) throw new Error('--seed takes a whole number from 0 to 100000.');
	}
	return { template, size, ground: parseGround(input.ground), title: copy.title, text: copy.text, label: copy.label, action: copy.action, chip: copy.chip, secondary: copy.secondary, code: copy.code, cards: copy.cards, footer: copy.footer, seed };
}

export const framesOf = (template: string) => Math.round(templateDef(template).fps * templateDef(template).seconds);

export function renderFramePng(input: VideoInput, index: number, frames?: number) {
	const req = videoRequest(input);
	const all = framesOf(req.template);
	const count = frames ?? all;
	if (!Number.isInteger(count) || count < 1 || count > all) throw new Error(`Frame count must be an integer from 1 to ${all}.`);
	if (!Number.isInteger(index) || index < 0 || index >= count) throw new Error(`Frame index must be from 0 to ${count - 1}.`);
	const png = rasterize(frameSvg(req, index, templateDef(req.template).fps));
	const size = pngSize(png);
	const expected = VIDEO_SIZES[req.size];
	if (size.width !== expected.width || size.height !== expected.height) throw new Error(`Rendered ${size.width}x${size.height}, expected ${expected.width}x${expected.height}.`);
	return png;
}

const shown = (path: string) => {
	const rel = relative(process.cwd(), path);
	return rel.startsWith('..') || isAbsolute(rel) ? path : rel || path;
};

/** One frame as a PNG, at a time in seconds (snapped to the template's frame rate). */
export function renderStill(input: VideoInput, seconds: number) {
	const req = videoRequest(input);
	const def = templateDef(req.template);
	if (!Number.isFinite(seconds) || seconds < 0 || seconds > def.seconds) throw new Error(`--still takes a time from 0 to ${def.seconds} seconds for ${req.template}.`);
	const index = Math.min(framesOf(req.template) - 1, Math.round(seconds * def.fps));
	const png = renderFramePng(input, index);
	const out = input.out ? resolve(extname(input.out) ? input.out.replace(/\.(mp4|webm)$/i, '.png') : join(input.out, `${req.size}-${req.template}.png`)) : resolve(join('.ds', 'videos', `${req.size}-${req.template}.png`));
	if (extname(out).toLowerCase() !== '.png') throw new Error('--out for a still must be a .png file, or a directory.');
	mkdirSync(dirname(out), { recursive: true });
	writeFileSync(out, png);
	const size = VIDEO_SIZES[req.size];
	return { template: req.template, size: req.size, frame: index, seconds: index / def.fps, width: size.width, height: size.height, files: [{ path: shown(out), format: 'png' as const, bytes: png.length, sha256: sha256(png), width: size.width, height: size.height }] };
}

export function renderVideo(input: VideoInput, options?: { frames?: number }) {
	const req = videoRequest(input);
	const def = templateDef(req.template);
	const format = formatOf(input);
	const all = framesOf(req.template);
	const frames = options?.frames ?? all;
	if (!Number.isInteger(frames) || frames < 1 || frames > all) throw new Error(`Frame count must be an integer from 1 to ${all}.`);
	const pngs = Array.from({ length: frames }, (_, index) => renderFramePng(input, index, frames));
	const data = format === 'webm' ? encodeWebm(pngs, def.fps) : encodeMp4(pngs, def.fps);
	const path = destination(req.size, req.template, format, input.out);
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, data);
	const expected = VIDEO_SIZES[req.size];
	return {
		template: req.template,
		size: req.size,
		ground: req.ground,
		width: expected.width,
		height: expected.height,
		fps: def.fps,
		frames,
		seconds: frames / def.fps,
		renderer: 'resvg-ffmpeg',
		files: [{ path: shown(path), format, bytes: statSync(path).size, sha256: sha256(data), width: expected.width, height: expected.height }],
		framesSha256: { first: sha256(pngs[0]), last: sha256(pngs[pngs.length - 1]) },
	};
}
