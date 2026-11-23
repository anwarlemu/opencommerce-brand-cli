import { createHash } from 'node:crypto';
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { imageData, sceneSvg, SLOTS, type Copy } from '../assets/layouts.js';
import { mergeCopy, readContent, type CopyInput } from '../image/content.js';
import { pngSize, rasterize } from '../image/load.js';
import { parseSeed, parseTheme } from '../image/render.js';
import { unknownName } from '../lib/names.js';
import { encodeMp4, encodeWebm } from './encode.js';
import { frameSvg, videoScene, type VideoFrame } from './frames.js';
import { templateDef, VIDEO_SIZE_ALIASES, VIDEO_SIZES, VIDEO_TEMPLATES, type VideoSize, type VideoTemplate } from './motion.js';

export type VideoInput = CopyInput & {
	template?: string;
	size?: string;
	ground?: string;
	theme?: string;
	out?: string;
	format?: string;
	sample?: boolean;
	seed?: string | number;
};

const sha256 = (data: Buffer) => createHash('sha256').update(data).digest('hex');

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[], label: string): T {
	if (value === undefined || value === '') throw new Error(`Missing ${label}. Use ${allowed.join(', ')}.`);
	if (!allowed.includes(value as T)) throw unknownName(label, value, [...allowed]);
	return value as T;
}

/** Copy as a template takes it; sample copy only on request, and an error for a slot it does not draw. */
function settleCopy(template: VideoTemplate, given: Copy, sampled: boolean): { copy: Copy; sample: Set<string> } {
	const def = templateDef(template);
	const copy: Copy = { ...given };
	if (copy.label && def.inputs.includes('badge') && !def.inputs.includes('label') && !copy.badge) {
		copy.badge = copy.label;
		delete copy.label;
	}
	const sample = new Set<string>();
	if (sampled)
		for (const [slot, value] of Object.entries(def.sample ?? imageData().templates[(template === 'product' ? 'frame' : template) as 'hero']?.sample ?? {})) {
			if (copy[slot as 'code'] || (slot === 'highlight' && given.code)) continue;
			copy[slot as 'code'] = value;
			sample.add(slot);
		}
	for (const slot of SLOTS) if (copy[slot] && !def.inputs.includes(slot) && !(slot === 'highlight' && copy.code)) throw new Error(`The ${template} template does not take --${slot}.${def.inputs.length ? ` It takes ${def.inputs.map((t) => `--${t}`).join(', ')}.` : ' It takes no copy.'}`);
	for (const slot of def.required) if (!copy[slot as 'code']) throw new Error(`The ${template} template needs --${slot} (or --sample for sample copy).`);
	if (template === 'product' && !copy.body && !copy.code) throw new Error('The product template needs --body or --code (or --sample).');
	if (copy.label && !copy.code && template !== 'product') throw new Error('--label names the window, and there is no window without --code.');
	// A product window given lines of code shows them as code.
	if (template === 'product' && copy.body && !copy.code && copy.body.includes('\n') && /(import |export |const |function |=>|[{;])/.test(copy.body)) {
		copy.code = copy.body;
		delete copy.body;
	}
	return { copy, sample };
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
	if (fromFile?.copy.by) throw new Error('Video templates do not take by.');
	if (fromFile?.image) throw new Error('Video templates do not take image.');
	const { copy: given } = mergeCopy(input, fromFile);
	const template = oneOf(input.template, VIDEO_TEMPLATES.map((item) => item.id), 'template');
	const size = oneOf(VIDEO_SIZE_ALIASES[input.size ?? ''] ?? input.size, Object.keys(VIDEO_SIZES) as VideoSize[], 'size');
	const { copy, sample } = settleCopy(template, given, !!input.sample);
	const req: VideoFrame = { template, size, ground: parseTheme(input.theme, input.ground), copy, sample, seed: parseSeed(input.seed) };
	// Copy that does not fit fails here, before any frame is drawn.
	if (templateDef(template).kind !== 'art') sceneSvg({ ...videoScene(req), dry: true });
	return req;
}

export const framesOf = (template: string) => Math.round(templateDef(template).fps * templateDef(template).seconds);

export function renderFramePng(input: VideoInput | VideoFrame, index: number, frames?: number) {
	const req = 'copy' in input ? input : videoRequest(input);
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
	const png = renderFramePng(req, index);
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
	const pngs = Array.from({ length: frames }, (_, index) => renderFramePng(req, index, frames));
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
