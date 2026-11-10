import { createHash } from 'node:crypto';
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { mergeCopy, readContent } from '../image/content.js';
import { pngSize, rasterize } from '../image/render.js';
import { encodeMp4 } from './encode.js';
import { frameSvg, type VideoFrame } from './frames.js';
import { VIDEO_FRAMES, VIDEO_FPS, VIDEO_SIZES, VIDEO_TEMPLATES, type VideoSize, type VideoTemplate } from './motion.js';

export type VideoInput = {
	template?: string;
	size?: string;
	ground?: string;
	out?: string;
	title?: string;
	text?: string;
	label?: string;
	action?: string;
	by?: string;
	image?: string;
	content?: string;
};

const sha256 = (data: Buffer) => createHash('sha256').update(data).digest('hex');

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[], label: string): T {
	if (value === undefined || value === '') throw new Error(`Missing ${label}. Use ${allowed.join(', ')}.`);
	if (!allowed.includes(value as T)) throw new Error(`Unknown ${label} "${value}". Use ${allowed.join(', ')}.`);
	return value as T;
}

function parseGround(value: string | undefined): 'white' | 'mist' {
	if (!value || value === 'white') return 'white';
	if (value === 'mist') return 'mist';
	throw new Error('Unknown ground. Use white or mist.');
}

function assertCopy(template: VideoTemplate, copy: { title: string; text: string }) {
	if ((template === 'social' || template === 'announcement') && !copy.title) throw new Error(`The ${template} template needs --title.`);
	if (template === 'product' && !copy.text) throw new Error('The product template needs --text.');
}

function destination(size: VideoSize, template: VideoTemplate, out?: string) {
	if (!out) return resolve(join('.ds', 'videos', `${size}-${template}.mp4`));
	const ext = extname(out).slice(1).toLowerCase();
	if (!ext) return resolve(join(out, `${size}-${template}.mp4`));
	if (ext !== 'mp4') throw new Error('--out must be an .mp4 file, or a directory.');
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
	return { template, size, ground: parseGround(input.ground), title: copy.title, text: copy.text, label: copy.label, action: copy.action };
}

export function renderFramePng(input: VideoInput, index: number, frames = VIDEO_FRAMES) {
	const req = videoRequest(input);
	if (!Number.isInteger(frames) || frames < 1 || frames > VIDEO_FRAMES) throw new Error(`Frame count must be an integer from 1 to ${VIDEO_FRAMES}.`);
	if (!Number.isInteger(index) || index < 0 || index >= frames) throw new Error(`Frame index must be from 0 to ${frames - 1}.`);
	const png = rasterize(frameSvg(req, index));
	const size = pngSize(png);
	const expected = VIDEO_SIZES[req.size];
	if (size.width !== expected.width || size.height !== expected.height) throw new Error(`Rendered ${size.width}x${size.height}, expected ${expected.width}x${expected.height}.`);
	return png;
}

export function renderVideo(input: VideoInput, options?: { frames?: number }) {
	const frames = options?.frames ?? VIDEO_FRAMES;
	const req = videoRequest(input);
	if (!Number.isInteger(frames) || frames < 1 || frames > VIDEO_FRAMES) throw new Error(`Frame count must be an integer from 1 to ${VIDEO_FRAMES}.`);
	const pngs = Array.from({ length: frames }, (_, index) => renderFramePng(input, index, frames));
	const mp4 = encodeMp4(pngs, VIDEO_FPS);
	const path = destination(req.size, req.template, input.out);
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, mp4);
	const rel = relative(process.cwd(), path);
	const expected = VIDEO_SIZES[req.size];
	return {
		template: req.template,
		size: req.size,
		ground: req.ground,
		width: expected.width,
		height: expected.height,
		fps: VIDEO_FPS,
		frames,
		seconds: frames / VIDEO_FPS,
		renderer: 'resvg-ffmpeg',
		files: [{ path: rel.startsWith('..') || isAbsolute(rel) ? path : rel || path, format: 'mp4' as const, bytes: statSync(path).size, sha256: sha256(mp4), width: expected.width, height: expected.height }],
		framesSha256: { first: sha256(pngs[0]), last: sha256(pngs[pngs.length - 1]) },
	};
}
