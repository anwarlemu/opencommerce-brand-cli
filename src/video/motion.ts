import { tokens } from '../lib/brand.js';

export const VIDEO_FPS = 12;
export const VIDEO_SECONDS = 2;
export const VIDEO_FRAMES = VIDEO_FPS * VIDEO_SECONDS;

export const VIDEO_SIZES = {
	square: { width: 1080, height: 1080, description: 'Square clip, 1080x1080' },
	vertical: { width: 1080, height: 1920, description: 'Vertical clip, 9:16 (1080x1920)' },
	landscape: { width: 1920, height: 1080, description: 'Landscape clip, 16:9 (1920x1080)' },
} as const;

export type VideoSize = keyof typeof VIDEO_SIZES;

export const VIDEO_TEMPLATES = [
	{ id: 'social', description: 'Animated social clip. A label, a headline and an optional supporting line settle in.', inputs: ['title', 'text', 'label'] },
	{ id: 'announcement', description: 'Announcement clip. A label, a headline and an optional key settle in.', inputs: ['title', 'label', 'action'] },
	{ id: 'product', description: 'Product clip. A window appears, then its lines appear in order.', inputs: ['title', 'text', 'label'] },
] as const;

export type VideoTemplate = (typeof VIDEO_TEMPLATES)[number]['id'];

const DURATION = ['--ds-duration-fast', '--ds-duration-base', '--ds-duration-moderate', '--ds-duration-slow'] as const;
export type DurationName = (typeof DURATION)[number];

function sample(x1: number, y1: number, x2: number, y2: number, x: number) {
	if (x <= 0) return 0;
	if (x >= 1) return 1;
	let t = x;
	const cx = 3 * x1;
	const bx = 3 * (x2 - x1) - cx;
	const ax = 1 - cx - bx;
	for (let i = 0; i < 8; i++) {
		const xEst = ((ax * t + bx) * t + cx) * t;
		const dx = (3 * ax * t + 2 * bx) * t + cx;
		if (Math.abs(xEst - x) < 1e-6 || dx === 0) break;
		t = Math.min(1, Math.max(0, t - (xEst - x) / dx));
	}
	const cy = 3 * y1;
	const by = 3 * (y2 - y1) - cy;
	const ay = 1 - cy - by;
	return ((ay * t + by) * t + cy) * t;
}

let ease: ((amount: number) => number) | undefined;
/** The brand ease-out, sampled from the motion token. */
export function easeOut(amount: number) {
	ease ??= (() => {
		const raw = tokens().site['--ds-easing-out'];
		const match = raw?.match(/cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/);
		if (!match) throw new Error('The ease-out token is not a cubic-bezier.');
		const [x1, y1, x2, y2] = match.slice(1).map(Number);
		return (value: number) => sample(x1, y1, x2, y2, value);
	})();
	return ease(amount);
}

export function duration(name: DurationName) {
	const raw = tokens().site[name];
	if (!raw?.endsWith('ms')) throw new Error(`Missing motion token ${name}.`);
	const value = Number.parseFloat(raw);
	if (!Number.isFinite(value)) throw new Error(`Motion token ${name} is not a duration.`);
	return value;
}

export function timeOf(index: number) {
	return (index / VIDEO_FPS) * 1000;
}

/** 0 before start, then the ease-out across length milliseconds. */
export function played(timeMs: number, start: number, length: number) {
	if (length <= 0) return timeMs >= start ? 1 : 0;
	return easeOut(Math.min(1, Math.max(0, (timeMs - start) / length)));
}

export function videoSpec() {
	return {
		renderer: {
			id: 'resvg-ffmpeg',
			raster: 'SVG paths from the bundled fonts, rasterized by resvg with system fonts off',
			encode: 'ffmpeg-static libx264, cpuflags none, bitexact, yuv420p, crf 18',
			fps: VIDEO_FPS,
			frames: VIDEO_FRAMES,
			seconds: VIDEO_SECONDS,
		},
		sizes: Object.entries(VIDEO_SIZES).map(([id, size]) => ({ id, width: size.width, height: size.height, description: size.description })),
		templates: VIDEO_TEMPLATES.map((item) => ({ ...item })),
		grounds: ['white', 'mist'],
		defaults: { ground: 'white', format: 'mp4' },
		required: ['template', 'size'],
	};
}
