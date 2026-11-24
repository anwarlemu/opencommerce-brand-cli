import { sceneSvg, type Scene, type TemplateId } from '../assets/layouts.js';
import { illustrate } from '../illustrate/render.js';
import { lockup } from '../assets/kit.js';
import { logoMark, paint } from '../image/paint.js';
const paintOf = () => paint();
const logoMarkAt = (x: number, y: number, s: number) => logoMark(x, y, s);
const lockupAt = (x: number, y: number, s: number) => lockup(x, y, s, paint()).svg;
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
	if (def.kind === 'reveal') return revealFrame(req, frame, fps);
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

/** The logo reveal and the counting figure: the closing card's parts, brought in on the ease-out token. */
function revealFrame(req: VideoFrame, frame: number, fps: number) {
	const size = VIDEO_SIZES[req.size];
	const ms = (frame / fps) * 1000;
	const fast = duration('--ds-duration-fast');
	const slow = duration('--ds-duration-slow');
	const W = size.width;
	const H = size.height;
	if (req.template === 'logo') {
		const u = lockup(0, 0, 100, paint(), 'measure').w / 100;
		const s = Math.min(Math.min(W, H) * 0.12, (W * 0.8) / (1.5 + 0.62 * u));
		const lw = lockup(0, 0, s * 0.62, paint(), 'measure').w;
		const total = s + s * 0.5 + lw;
		const x = (W - total) / 2;
		const y = (H - s) / 2;
		const mark = played(ms, 120, slow);
		const word = played(ms, 180, slow);
		const scale = 0.97 + 0.03 * mark;
		const cx = x + s / 2;
		const cy = y + s / 2;
		const c = paintOf();
		const lockupSvg = lockupAt(x + s * 1.5, y + s * 0.18, s * 0.62);
		const field = illustrate({ subject: 'field', width: W, height: H, t: frame / fps, seed: req.seed, ground: req.ground }).svg;
		const body = field.replace(/<\/svg>\s*$/, '');
		return `${body}<g opacity="${mark.toFixed(3)}" transform="translate(${cx} ${cy}) scale(${scale.toFixed(4)}) translate(${-cx} ${-cy})"><rect x="${x - s * 0.3}" y="${y - s * 0.3}" width="${total + s * 0.6}" height="${s * 1.6}" rx="${s * 0.2}" fill="${req.ground === 'mist' ? c.mist : c.white}"/>${logoMarkAt(x, y, s)}</g><g opacity="${word.toFixed(3)}" transform="translate(0 ${((1 - word) * s * 0.12).toFixed(2)})">${lockupSvg}</g>\n</svg>\n`;
	}
	// The figure counts from zero to its value, keeping the words around the number as they were written.
	const m = /^(\D*)(\d[\d,]*(?:\.\d+)?)(.*)$/.exec(req.copy.headline ?? '');
	const target = m ? Number(m[2].replace(/,/g, '')) : 0;
	const decimals = m && m[2].includes('.') ? m[2].split('.')[1].length : 0;
	const amount = played(ms, fast, 600);
	const now = m ? `${m[1]}${(target * amount).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: m[2].includes(',') })}${m[3]}` : req.copy.headline ?? '';
	const base = { template: 'closing' as const, width: W, height: H, theme: req.ground, logo: false, textScale: 2, seed: req.seed };
	const last = sceneSvg({ ...base, copy: { headline: req.copy.headline, ...(req.copy.body ? { body: req.copy.body } : {}) }, dry: true }).layers.find((y) => y.id === 'headline')?.text?.size;
	return sceneSvg({ ...base, hold: last ? { headline: last } : undefined, template: 'closing', width: W, height: H, theme: req.ground, copy: { headline: now, ...(req.copy.body ? { body: req.copy.body } : {}) }, logo: false, textScale: 2, seed: req.seed, t: frame / fps, enter: (id) => (id === 'body' ? { alpha: played(ms, fast + 600, slow), drop: 12 } : id === 'headline' ? { alpha: played(ms, 0, fast) } : undefined) }).svg;
}
