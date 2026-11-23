import { sceneSvg, type Scene, type TemplateId } from '../assets/layouts.js';
import { illustrate } from '../illustrate/render.js';
import { tokens } from '../lib/brand.js';
import type { Copy } from '../assets/layouts.js';
import { duration, played, templateDef, VIDEO_SIZES, type VideoSize, type VideoTemplate } from './motion.js';

export type VideoFrame = {
	template: VideoTemplate;
	size: VideoSize;
	ground: 'white' | 'mist';
	copy: Copy;
	sample?: Set<string>;
	seed?: number;
};

function px(value: string) {
	if (value.endsWith('rem')) return Number.parseFloat(value) * 16;
	return Number.parseFloat(value);
}

function slide(value: string) {
	const n = px(tokens().site[value] ?? '');
	if (!Number.isFinite(n)) throw new Error(`Missing space token ${value}.`);
	return n;
}

/** The still each clip rests on: the same layout, fitted the same way, as the image of that name. */
const STILL: Record<string, (copy: Copy) => TemplateId> = {
	social: (copy) => (copy.body ? 'lead' : 'headline'),
	announcement: () => 'announcement',
	product: () => 'frame',
};

export function videoScene(req: VideoFrame): Scene {
	const size = VIDEO_SIZES[req.size];
	const template = STILL[req.template]?.(req.copy) ?? (req.template as TemplateId);
	return { template, width: size.width, height: size.height, theme: req.ground, copy: req.copy, seed: req.seed, sample: req.sample };
}

export function frameSvg(req: VideoFrame, frame: number, fps = 12) {
	const def = templateDef(req.template);
	const size = VIDEO_SIZES[req.size];
	if (def.kind === 'art') return illustrate({ subject: req.template, width: size.width, height: size.height, t: frame / fps, seed: req.seed, ground: req.ground }).svg;
	const ms = (frame / fps) * 1000;
	const fast = duration('--ds-duration-fast');
	const base = duration('--ds-duration-base');
	const slow = duration('--ds-duration-slow');
	const scene = videoScene(req);
	const still = STILL[req.template] !== undefined;
	const drop = still ? slide('--ds-space-3') : undefined;
	const k = Math.sqrt((size.width * size.height) / (1200 * 630));
	// Posters settle top to bottom; layouts bring in the field, the words, then the window with its code or the cards,
	// 60ms apart. Each on the ease-out token at the duration tokens; the field drifts linearly from the first frame.
	const enter = (id: string) => {
		if (id === 'logo') return still ? { alpha: played(ms, 0, fast) } : req.template === 'closing' ? { alpha: played(ms, 80, base), drop: 12 * k } : undefined;
		if (id === 'panel') return undefined;
		if (id === 'art') return { alpha: still ? played(ms, 0, base) : played(ms, 0, slow) };
		if (still) {
			if (id === 'badge') return { alpha: played(ms, 0, fast) };
			if (id === 'headline') return { alpha: req.template === 'product' ? played(ms, 0, fast) : played(ms, fast * 0.5, base), drop };
			if (id === 'body') return { alpha: played(ms, fast + base * 0.5, slow), drop };
			if (id === 'window') return { alpha: played(ms, 0, base), drop };
			if (id === 'action') {
				const amount = played(ms, fast + base, base);
				// A press scales a key to 97 percent. The key settles from that scale to 1.
				return { alpha: amount, scale: 0.97 + 0.03 * amount };
			}
			return undefined;
		}
		const card = /^card-(\d+)$/.exec(id);
		if (card) return { alpha: played(ms, 160 + (Number(card[1]) - 1) * 60, slow), drop: 24 * k };
		if (id === 'window') return { alpha: played(ms, 160, slow), drop: 24 * k };
		return { alpha: played(ms, 80, base), drop: 12 * k };
	};
	const lines = still ? (i: number) => played(ms, fast + i * 60, base) : (i: number) => played(ms, 360 + i * 60, fast);
	return sceneSvg({ ...scene, enter, lines, ...(still ? {} : { t: frame / fps }) }).svg;
}
