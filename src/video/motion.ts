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

/** The image sizes of the same shape. */
export const VIDEO_SIZE_ALIASES: Record<string, VideoSize> = { reel: 'vertical', '1080x1080': 'square', '1080x1920': 'vertical', '1920x1080': 'landscape' };

export type VideoTemplateDef = { id: string; description: string; inputs: string[]; fps: number; seconds: number; kind: 'poster' | 'product' | 'layout' | 'art'; source: string; required: string[]; sample?: Record<string, string> };

export const VIDEO_TEMPLATES: VideoTemplateDef[] = [
	{ id: 'social', description: 'Animated social clip. A label, a headline and an optional supporting line settle in.', inputs: ['headline', 'body', 'badge'], required: ['headline'], sample: { headline: 'Open router for commerce', body: 'One endpoint for agents to search, check out and track orders.' }, fps: VIDEO_FPS, seconds: VIDEO_SECONDS, kind: 'poster', source: 'CLI' },
	{ id: 'announcement', description: 'Announcement clip. A label, a headline and an optional key settle in.', inputs: ['headline', 'badge', 'action'], required: ['headline'], fps: VIDEO_FPS, seconds: VIDEO_SECONDS, kind: 'poster', source: 'CLI' },
	{ id: 'product', description: 'Product clip. A window appears, then its lines appear in order.', inputs: ['headline', 'body', 'code', 'label'], required: [], fps: VIDEO_FPS, seconds: VIDEO_SECONDS, kind: 'product', source: 'CLI' },
	{ id: 'hero', description: 'The hero layout plays in once (field, words, then the window rising with its code lines in order) and rests while the glyph field drifts.', inputs: ['badge', 'headline', 'body', 'action', 'secondary', 'label', 'code'], required: ['headline'], fps: 30, seconds: 4, kind: 'layout', source: 'image tool hero layout; the drift from the site\'s scatter-stage.tsx' },
	{ id: 'window', description: 'The window layout: the words settle, the window rises and types its lines, the field drifts round it.', inputs: ['badge', 'headline', 'body', 'action', 'secondary', 'label', 'code'], required: ['headline'], fps: 30, seconds: 4, kind: 'layout', source: 'image tool window layout; the drift from scatter-stage.tsx' },
	{ id: 'closing', description: 'The closing card: the lockup, words and keys settle on the mist card while the field drifts at its edges.', inputs: ['badge', 'headline', 'body', 'action', 'secondary'], required: ['headline'], fps: 30, seconds: 4, kind: 'layout', source: 'image tool closing layout; the drift from scatter-stage.tsx' },
	{ id: 'cards', description: 'Numbered cards come in one after another under the title; the field drifts round them.', inputs: ['headline', 'cards', 'footer'], required: ['cards'], fps: 30, seconds: 4, kind: 'layout', source: 'image tool cards layout; the drift from scatter-stage.tsx' },
	{ id: 'field', description: 'The glyph field alone, drifting as the site draws it: a slow sideways slide and a gentle warp, about 12 redraws a second.', inputs: [], required: [], fps: 12, seconds: 6, kind: 'art', source: 'scatter-stage.tsx' },
	{ id: 'mark', description: 'The [*] slab in characters, swaying gently as the hero\'s sun does.', inputs: [], required: [], fps: 30, seconds: 6, kind: 'art', source: 'merchant-orbit.tsx and lib/mark-3d.ts' },
	{ id: 'orbit', description: 'The rings of dots round the swaying [*] slab (the hero without its stores).', inputs: [], required: [], fps: 30, seconds: 6, kind: 'art', source: 'merchant-orbit.tsx' },
];

export type VideoTemplate = string;
export const templateDef = (id: string) => VIDEO_TEMPLATES.find((t) => t.id === id)!;

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
			encode: 'ffmpeg-static: libx264 (mp4) or libvpx-vp9 (webm), cpuflags none, bitexact, yuv420p',
			fps: VIDEO_FPS,
			frames: VIDEO_FRAMES,
			seconds: VIDEO_SECONDS,
		},
		sizes: Object.entries(VIDEO_SIZES).map(([id, size]) => ({ id, width: size.width, height: size.height, description: size.description })),
		templates: VIDEO_TEMPLATES.map((item) => ({ ...item, frames: Math.round(item.fps * item.seconds) })),
		grounds: ['white', 'mist'],
		themes: ['white', 'mist'],
		formats: ['mp4', 'webm'],
		still: 'Pass --still <seconds> to write one PNG frame instead of a clip.',
		motion: 'Entrances use the ease-out token at the duration tokens (160 to 300ms), staggered 60ms; the field drifts linearly (constant motion) and the mark sways on a slow sine, as the site does. Nothing eases in.',
		defaults: { ground: 'white', format: 'mp4 (or the --out extension)' },
		required: ['template', 'size'],
	};
}
