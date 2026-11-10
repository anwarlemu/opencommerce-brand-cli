import { drawLines, fitText, getFaces } from '../image/fonts.js';
import { paint, trackingFor, type Paint } from '../image/paint.js';
import { drawCode, drawLockup, drawProse, drawWindow, glyphField, keyPiece, layoutFor, type Box } from '../image/scene.js';
import { tokens } from '../lib/brand.js';
import { duration, played, timeOf, type VideoSize, type VideoTemplate, VIDEO_SIZES } from './motion.js';

export type VideoFrame = {
	template: VideoTemplate;
	size: VideoSize;
	ground: 'white' | 'mist';
	title: string;
	text: string;
	label: string;
	action: string;
};

type FrameReq = VideoFrame & { width: number; height: number };

function esc(value: string) {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function px(value: string) {
	if (value.endsWith('rem')) return Number.parseFloat(value) * 16;
	if (value.endsWith('px')) return Number.parseFloat(value);
	return Number.parseFloat(value);
}

function slide(value: string) {
	const n = px(tokens().site[value] ?? '');
	if (!Number.isFinite(n)) throw new Error(`Missing space token ${value}.`);
	return n;
}

function fade(svg: string, amount: number, drop = 0) {
	const dy = Math.round((1 - amount) * drop);
	return `<g opacity="${amount.toFixed(3)}" transform="translate(0 ${dy})">${svg}</g>`;
}

function looksLikeCode(text: string) {
	return text.includes('\n') && /(import |export |const |function |=>|[{;])/.test(text);
}

type StackPiece = { height: number; gap: number; draw: (top: number) => string };

function stack(pieces: StackPiece[], areaTop: number, areaHeight: number, bias: number) {
	const total = pieces.reduce((sum, piece, index) => sum + piece.height + (index ? piece.gap : 0), 0);
	let y = areaTop + Math.round(Math.max(0, areaHeight - total) * bias);
	return pieces
		.map((piece, index) => {
			if (index) y += piece.gap;
			const svg = piece.draw(y);
			y += piece.height;
			return svg;
		})
		.join('');
}

function textBlock(text: string, font: 'display' | 'sans' | 'mono', start: number, min: number, maxWidth: number, maxLines: number, leading: number, fill: string, centerX: number, colors: Paint) {
	const face = font === 'display' ? getFaces().display : font === 'mono' ? getFaces().mono : getFaces().sans;
	const track = font === 'display' ? (size: number) => trackingFor(size, colors) : () => 0;
	const fitted = fitText(face, text, maxWidth, start, min, maxLines, leading, track);
	return { height: fitted.height, draw: (top: number) => drawLines(face, fitted, leading, fill, centerX, top) };
}

function poster(req: FrameReq, frame: number, colors: Paint) {
	const L = layoutFor(req.width, req.height);
	const centerX = req.width / 2;
	const column = req.width - L.padX * 2;
	const fast = duration('--ds-duration-fast');
	const base = duration('--ds-duration-base');
	const slow = duration('--ds-duration-slow');
	const time = timeOf(frame);
	const drop = slide('--ds-space-3');
	const pieces: StackPiece[] = [];
	const add = (height: number, gap: number, draw: (top: number) => string) => pieces.push({ height, gap: pieces.length ? gap : 0, draw });
	if (req.label) {
		const block = textBlock(req.label, 'mono', L.kicker, 12, column, 2, 1.2, req.template === 'announcement' ? colors.label : colors.secondary, centerX, colors);
		const amount = played(time, 0, fast);
		add(block.height, 0, (top) => fade(block.draw(top), amount));
	}
	const headline = textBlock(req.title, 'display', L.headline, 32, Math.min(column, L.wide ? 1000 : 920), L.wide ? 3 : 4, colors.leadingHeading, colors.ink, centerX, colors);
	const headlineAt = played(time, fast * 0.5, base);
	add(headline.height, req.label ? 22 : 0, (top) => fade(headline.draw(top), headlineAt, drop));
	if (req.template === 'social' && req.text) {
		const body = textBlock(req.text, 'sans', L.lead, 16, Math.min(column, L.wide ? 660 : 740), L.wide ? 3 : 5, colors.leadingLead, colors.secondary, centerX, colors);
		const amount = played(time, fast + base * 0.5, slow);
		add(body.height, 22, (top) => fade(body.draw(top), amount, drop));
	}
	if (req.template === 'announcement' && req.action) {
		const key = keyPiece(req.action, centerX, column, colors, !L.wide);
		const amount = played(time, fast + base, base);
		// A press scales a key to 97 percent. The key settles from that scale to 1.
		add(key.height, 32, (top) => {
			const cy = top + key.height / 2;
			const scale = (0.97 + 0.03 * amount).toFixed(4);
			return `<g opacity="${amount.toFixed(3)}" transform="translate(${centerX} ${cy}) scale(${scale}) translate(${-centerX} ${-cy})">${key.draw(top)}</g>`;
		});
	}
	const areaTop = L.padY + L.mark + (L.wide ? 32 : 48);
	const areaHeight = req.height - L.padY - areaTop;
	const bias = L.wide ? 0.46 : req.height / req.width > 1.15 ? 0.4 : 0.48;
	const lock = played(time, 0, fast);
	return `${fade(drawLockup(L.padX, L.padY, L.mark, colors), lock)}${stack(pieces, areaTop, areaHeight, bias)}`;
}

function product(req: FrameReq, frame: number, colors: Paint) {
	const L = layoutFor(req.width, req.height);
	const time = timeOf(frame);
	const fast = duration('--ds-duration-fast');
	const base = duration('--ds-duration-base');
	const drop = slide('--ds-space-3');
	const centerX = req.width / 2;
	const headerBottom = L.padY + L.mark;
	let cursor = headerBottom + (L.wide ? 28 : 36);
	let titleSvg = '';
	if (req.title) {
		const block = textBlock(req.title, 'display', L.frameTitle, 24, req.width - L.padX * 2, 2, colors.leadingHeading, colors.ink, centerX, colors);
		const amount = played(time, 0, fast);
		titleSvg = fade(block.draw(cursor), amount, drop);
		cursor += block.height + (L.wide ? 22 : 28);
	}
	const bottom = req.height - L.padY;
	const windowW = Math.min(req.width - L.padX * 2, L.wide ? 960 : req.width - L.padX * 2);
	const box: Box = { x: Math.round((req.width - windowW) / 2), y: Math.round(cursor), w: Math.round(windowW), h: Math.max(80, Math.round(bottom - cursor)) };
	const body: Box = { x: box.x, y: box.y + 40, w: box.w, h: box.h - 40 };
	const dark = looksLikeCode(req.text);
	const lineAlpha = (index: number) => played(time, fast + index * base, base);
	const inner = dark ? drawCode(body, req.text, colors, lineAlpha) : drawProse(body, req.text, colors, lineAlpha);
	const amount = played(time, 0, base);
	const dy = Math.round((1 - amount) * drop);
	const field = fade(glyphField(box, headerBottom, colors), amount);
	const lock = fade(drawLockup(L.padX, L.padY, L.mark, colors), played(time, 0, fast));
	const window = `<g opacity="${amount.toFixed(3)}" transform="translate(0 ${dy})">${drawWindow(box, req.label || 'preview', colors, inner, dark)}</g>`;
	return `${field}${lock}${titleSvg}${window}`;
}

export function frameSvg(req: VideoFrame, frame: number) {
	const size = VIDEO_SIZES[req.size];
	const colors = paint();
	const ground = req.ground === 'mist' ? colors.mist : colors.white;
	const full: FrameReq = { ...req, width: size.width, height: size.height };
	const body = req.template === 'product' ? product(full, frame, colors) : poster(full, frame, colors);
	const title = req.title || req.text || req.template;
	const desc = [req.label, req.title, req.text, req.action].filter(Boolean).join(' ');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}" role="img">\n<title>${esc(title)}</title>\n<desc>${esc(desc)}</desc>\n<rect width="${size.width}" height="${size.height}" fill="${ground}"/>\n${body}\n</svg>\n`;
}
