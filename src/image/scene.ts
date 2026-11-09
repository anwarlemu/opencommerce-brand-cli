import { brand } from '../lib/brand.js';
import { drawLines, fitText, getFaces, measure, ratios, textPath } from './fonts.js';
import { logoMark, lockupByline, trackingFor, type Paint } from './paint.js';

export type SceneImage = { data: Buffer; width: number; height: number; mime: string };

export type SceneRequest = {
	width: number;
	height: number;
	template: 'headline' | 'lead' | 'frame' | 'quote' | 'announcement';
	ground: 'white' | 'mist';
	title: string;
	text: string;
	label: string;
	by: string;
	action: string;
	image?: SceneImage;
};

type Box = { x: number; y: number; w: number; h: number };

function esc(value: string) {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function layoutFor(width: number, height: number) {
	const wide = width / height > 1.3;
	return {
		wide,
		padX: wide ? 72 : 84,
		padY: wide ? 52 : 76,
		mark: wide ? 44 : 52,
		headline: wide ? 68 : 80,
		lead: wide ? 22 : 26,
		kicker: wide ? 15 : 16,
		frameTitle: wide ? 36 : 44,
	};
}

function drawLockup(x: number, y: number, mark: number, colors: Paint) {
	const { display } = getFaces();
	const nameSize = Math.round(mark * (17 / 32));
	const bylineSize = Math.max(12, Math.round(mark * (12 / 32)));
	const name = brand().name;
	const byline = lockupByline();
	const tracking = colors.trackingTight;
	const { cap, desc } = ratios(display);
	const baseline = y + mark / 2 + ((cap - desc) * nameSize) / 2;
	let cursor = x + mark + Math.round(mark * 0.24);
	const parts = [logoMark(x, y, mark), textPath(display, name, cursor, baseline, nameSize, tracking, colors.ink)];
	if (byline) {
		cursor += measure(display, name, nameSize, tracking) + Math.round(mark * 0.16);
		parts.push(textPath(display, byline, cursor, baseline, bylineSize, 0, colors.secondary));
	}
	return parts.join('');
}

type Piece = { gap: number; height: number; draw: (top: number) => string };

function place(pieces: Piece[], areaTop: number, areaHeight: number, bias: number) {
	const total = pieces.reduce((sum, piece, index) => sum + piece.height + (index === 0 ? 0 : piece.gap), 0);
	const slack = Math.max(0, areaHeight - total);
	let y = areaTop + Math.round(slack * bias);
	return pieces
		.map((piece, index) => {
			if (index) y += piece.gap;
			const svg = piece.draw(y);
			y += piece.height;
			return svg;
		})
		.join('');
}

function typePiece(text: string, font: 'display' | 'sans', start: number, min: number, maxWidth: number, maxLines: number, leading: number, fill: string, centerX: number, colors: Paint, track: (size: number) => number): Piece {
	const face = font === 'display' ? getFaces().display : getFaces().sans;
	const fitted = fitText(face, text, maxWidth, start, min, maxLines, leading, track);
	return { gap: 0, height: fitted.height, draw: (top) => drawLines(face, fitted, leading, fill, centerX, top) };
}

function keyPiece(label: string, centerX: number, maxWidth: number, colors: Paint, tall: boolean): Piece {
	const face = getFaces().sansMedium;
	const tracking = colors.trackingTight;
	let height = tall ? 48 : 44;
	let size = Math.round(height * (15 / 40));
	const padOf = (value: number) => Math.round(value * (18 / 40));
	let text = label.trim();
	let textWidth = measure(face, text, size, tracking);
	while (textWidth + padOf(height) * 2 > maxWidth && size > 13) {
		size -= 1;
		height = Math.max(36, Math.round((size * 40) / 15));
		textWidth = measure(face, text, size, tracking);
	}
	const limit = Math.max(24, maxWidth - padOf(height) * 2);
	if (textWidth > limit) {
		let cut = text;
		while (cut.length > 1 && measure(face, `${cut}...`, size, tracking) > limit) cut = cut.slice(0, -1).trimEnd();
		text = `${cut}...`;
		textWidth = measure(face, text, size, tracking);
	}
	const pad = padOf(height);
	const width = Math.min(maxWidth, Math.max(Math.round(textWidth + pad * 2), Math.round(height * 2.6)));
	const radius = Math.round(height * (colors.radiusControl / 40));
	const { cap, desc } = ratios(face);
	const ink = (cap + desc) * size;
	return {
		gap: 0,
		height,
		draw: (top) => {
			const x = Math.round(centerX - width / 2);
			const baseline = top + (height - ink) / 2 + cap * size;
			return `<rect x="${x}" y="${Math.round(top)}" width="${width}" height="${height}" rx="${radius}" fill="${colors.brand}" stroke="${colors.blueEdge}" stroke-width="1"/>${textPath(face, text, Math.round(centerX - textWidth / 2), baseline, size, tracking, colors.onBrand)}`;
		},
	};
}

function kicker(text: string, size: number, maxWidth: number, fill: string, centerX: number, colors: Paint): Piece {
	const face = getFaces().mono;
	const fitted = fitText(face, text, maxWidth, size, Math.max(11, size - 4), 2, 1.2, () => 0);
	return { gap: 0, height: fitted.height, draw: (top) => drawLines(face, fitted, 1.2, fill, centerX, top) };
}

function unit(n: number) {
	const value = Math.sin(n * 12.9898) * 43758.5453;
	return value - Math.floor(value);
}

function outsideDistance(px: number, py: number, box: Box) {
	const dx = Math.max(box.x - px, 0, px - (box.x + box.w));
	const dy = Math.max(box.y - py, 0, py - (box.y + box.h));
	return dx === 0 && dy === 0 ? 0 : Math.hypot(dx, dy);
}

/** The page's faint * and @ field, dense beside the window and gone before the edge. */
function glyphField(box: Box, headerBottom: number, colors: Paint) {
	const face = getFaces().mono;
	const step = 30;
	const size = 13;
	const parts: string[] = [];
	let row = 0;
	for (let y = box.y - step * 5; y < box.y + box.h + step * 5; y += step, row++) {
		let col = 0;
		for (let x = box.x - step * 6; x < box.x + box.w + step * 6; x += step, col++) {
			if ((row + col) % 2 !== 0) continue;
			if (y < headerBottom) continue;
			const jx = (unit(row * 19 + col) - 0.5) * 12;
			const jy = (unit(row * 7 + col * 3) - 0.5) * 12;
			const d = outsideDistance(x + jx + size / 2, y + jy + size / 2, box);
			if (d < 12 || d > 168) continue;
			const t = 1 - (d - 12) / 156;
			const opacity = 0.03 + 0.06 * t * t;
			const ch = (row * 3 + col) % 7 === 0 ? '@' : '*';
			parts.push(textPath(face, ch, x + jx, y + jy + size * 0.82, size, 0, colors.ink, opacity));
		}
	}
	return parts.join('');
}

function windowMark(right: number, centerY: number, size: number, colors: Paint) {
	const face = getFaces().mono;
	const bracket = measure(face, '[', size, 0);
	const star = size * 0.78;
	const gap = Math.max(1, Math.round(size * 0.08));
	const total = bracket * 2 + star + gap * 2;
	const x = right - total;
	const baseline = centerY + (ratios(face).cap * size) / 2;
	const starScale = star / 12;
	const starY = centerY - star / 2;
	return [
		textPath(face, '[', x, baseline, size, 0, colors.brand),
		`<g transform="translate(${Math.round(x + bracket + gap)} ${Math.round(starY)}) scale(${Math.round(starScale * 1000) / 1000})" fill="none" stroke="${colors.brand}" stroke-width="1.6" stroke-linecap="square"><path d="M6 .5v11M1.24 3.25l9.52 5.5M1.24 8.75l9.52-5.5"/></g>`,
		textPath(face, ']', x + bracket + gap + star + gap, baseline, size, 0, colors.brand),
	].join('');
}

function ellipsize(text: string, size: number, maxWidth: number) {
	const face = getFaces().mono;
	if (measure(face, text, size, 0) <= maxWidth) return text;
	let cut = text;
	while (cut.length > 1 && measure(face, `${cut}...`, size, 0) > maxWidth) cut = cut.slice(0, -1);
	return `${cut}...`;
}

const CODE_WORD = /\b(?:import|from|export|const|let|return|function|async|await|new|if|else|type)\b/;

function codeSpans(line: string, colors: Paint): { text: string; fill: string }[] {
	if (line.trimStart().startsWith('//')) return [{ text: line, fill: colors.codeDim }];
	const spans: { text: string; fill: string }[] = [];
	const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(?:import|from|export|const|let|return|function|async|await|new|if|else|type)\b|\s+|\S+/g;
	for (const match of line.matchAll(re)) {
		const text = match[0];
		const fill = text.startsWith('"') || text.startsWith("'") || text.startsWith('`') ? colors.codeString : CODE_WORD.test(text) ? colors.codeKey : colors.codeText;
		spans.push({ text, fill });
	}
	return spans.length ? spans : [{ text: line, fill: colors.codeText }];
}

function looksLikeCode(text: string) {
	return text.includes('\n') && /(import |export |const |function |=>|[{;])/.test(text);
}

function drawCode(body: Box, text: string, colors: Paint) {
	const face = getFaces().mono;
	const lines = text.replace(/\r\n/g, '\n').split('\n');
	let size = 15;
	const pad = 28;
	const maxWidth = body.w - pad * 2;
	while (size > 11 && lines.some((line) => measure(face, line, size, 0) > maxWidth)) size -= 1;
	const leading = colors.leadingCode;
	const lineHeight = size * leading;
	const { cap } = ratios(face);
	const content = lines.length * lineHeight;
	const spare = body.h - content;
	const top = spare > pad * 2 ? body.y + (body.h - content) / 2 : body.y + pad;
	let baseline = top + cap * size;
	const parts: string[] = [];
	for (const line of lines) {
		if (baseline - cap * size > body.y + body.h - 16) break;
		let x = body.x + pad;
		for (const span of codeSpans(line, colors)) {
			parts.push(textPath(face, span.text, x, baseline, size, 0, span.fill));
			x += measure(face, span.text, size, 0);
		}
		baseline += lineHeight;
	}
	return parts.join('');
}

function drawProse(body: Box, text: string, colors: Paint) {
	const face = getFaces().sans;
	const pad = 36;
	const maxWidth = body.w - pad * 2;
	const fitted = fitText(face, text, maxWidth, 22, 16, 8, colors.leadingLead, () => 0);
	const top = body.y + Math.max(pad, (body.h - fitted.height) / 2);
	const { cap } = ratios(face);
	let baseline = top + cap * fitted.size;
	const parts: string[] = [];
	for (const line of fitted.lines) {
		parts.push(textPath(face, line, body.x + pad, baseline, fitted.size, 0, colors.ink));
		baseline += fitted.size * colors.leadingLead;
	}
	return parts.join('');
}

function drawStatement(body: Box, text: string, colors: Paint) {
	const face = getFaces().display;
	const pad = 48;
	const fitted = fitText(face, text, body.w - pad * 2, 48, 28, 4, colors.leadingHeading, (size) => trackingFor(size, colors));
	const top = body.y + (body.h - fitted.height) / 2;
	return drawLines(face, fitted, colors.leadingHeading, colors.ink, body.x + body.w / 2, top);
}

function drawWindow(box: Box, barName: string, colors: Paint, body: string, dark: boolean) {
	const radius = colors.radiusPanel;
	const barH = 40;
	const clip = `frame${box.x}${box.y}`;
	const barSize = 14;
	const face = getFaces().mono;
	const { cap, desc } = ratios(face);
	const name = ellipsize(barName, barSize, box.w * 0.5);
	const nameW = measure(face, name, barSize, 0);
	const baseline = box.y + (barH - (cap + desc) * barSize) / 2 + cap * barSize;
	const arrow = '↳';
	return `<defs><filter id="cardShadow" x="-20%" y="-16%" width="140%" height="150%" color-interpolation-filters="sRGB"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="${colors.ink}" flood-opacity="0.08"/></filter><clipPath id="${clip}"><rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="${radius}"/></clipPath></defs><g filter="url(#cardShadow)"><g clip-path="url(#${clip})"><rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" fill="${dark ? colors.codeBg : colors.white}"/><rect x="${box.x}" y="${box.y}" width="${box.w}" height="${barH}" fill="${colors.windowBar}"/><line x1="${box.x}" y1="${box.y + barH}" x2="${box.x + box.w}" y2="${box.y + barH}" stroke="${colors.rule}" stroke-width="1"/>${textPath(face, arrow, box.x + 16, baseline, barSize, 0, colors.secondary, 0.6)}${textPath(face, name, box.x + (box.w - nameW) / 2, baseline, barSize, 0, colors.secondary)}${windowMark(box.x + box.w - 16, box.y + barH / 2, barSize, colors)}${body}</g><rect x="${box.x + 0.5}" y="${box.y + 0.5}" width="${box.w - 1}" height="${box.h - 1}" rx="${radius}" fill="none" stroke="${colors.border}" stroke-width="1"/></g>`;
}

function frame(req: SceneRequest, colors: Paint) {
	const L = layoutFor(req.width, req.height);
	const headerBottom = L.padY + L.mark;
	const lockup = drawLockup(L.padX, L.padY, L.mark, colors);
	const centerX = req.width / 2;
	let cursor = headerBottom + (L.wide ? 28 : 36);
	let titleSvg = '';
	if (req.title && (req.image || req.text)) {
		const piece = typePiece(req.title, 'display', L.frameTitle, 24, req.width - L.padX * 2, 2, colors.leadingHeading, colors.ink, centerX, colors, (size) => trackingFor(size, colors));
		titleSvg = piece.draw(cursor);
		cursor += piece.height + (L.wide ? 22 : 28);
	}
	const bottom = req.height - L.padY;
	const windowW = Math.min(req.width - L.padX * 2, L.wide ? 960 : req.width - L.padX * 2);
	const box: Box = { x: Math.round((req.width - windowW) / 2), y: Math.round(cursor), w: Math.round(windowW), h: Math.round(bottom - cursor) };
	const body: Box = { x: box.x, y: box.y + 40, w: box.w, h: box.h - 40 };
	const barName = req.label || 'preview';
	let inner = '';
	let dark = false;
	if (req.image) {
		const scale = Math.max(body.w / req.image.width, body.h / req.image.height);
		const w = req.image.width * scale;
		const h = req.image.height * scale;
		const x = body.x + (body.w - w) / 2;
		const y = body.y + (body.h - h) / 2;
		inner = `<image href="data:${req.image.mime};base64,${req.image.data.toString('base64')}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none"/>`;
	} else if (req.text && looksLikeCode(req.text)) {
		dark = true;
		inner = drawCode(body, req.text, colors);
	} else if (req.text) {
		inner = drawProse(body, req.text, colors);
	} else {
		inner = drawStatement(body, req.title || brand().name, colors);
	}
	return `${glyphField(box, headerBottom, colors)}${lockup}${titleSvg}${drawWindow(box, barName, colors, inner, dark)}`;
}

function poster(req: SceneRequest, colors: Paint) {
	const L = layoutFor(req.width, req.height);
	const centerX = req.width / 2;
	const column = req.width - L.padX * 2;
	const pieces: Piece[] = [];
	const add = (piece: Piece, gap: number) => {
		piece.gap = pieces.length ? gap : 0;
		pieces.push(piece);
	};
	if (req.template !== 'quote' && req.label) add(kicker(req.label, L.kicker, column, req.template === 'announcement' ? colors.label : colors.secondary, centerX, colors), 0);
	if (req.template === 'quote' && req.label) add(kicker(req.label, L.kicker, column, colors.secondary, centerX, colors), 0);
	if (req.template === 'headline' || req.template === 'lead' || req.template === 'announcement') {
		add(typePiece(req.title, 'display', L.headline, 32, Math.min(column, L.wide ? 1000 : 920), L.wide ? 3 : 4, colors.leadingHeading, colors.ink, centerX, colors, (size) => trackingFor(size, colors)), req.label ? 22 : 0);
	}
	if (req.template === 'lead' && req.text) {
		add(typePiece(req.text, 'sans', L.lead, 16, Math.min(column, L.wide ? 660 : 740), L.wide ? 3 : 5, colors.leadingLead, colors.secondary, centerX, colors, () => 0), 22);
	}
	if (req.template === 'quote') {
		add(typePiece(req.text || req.title, 'display', L.wide ? 56 : 68, 28, Math.min(column, L.wide ? 920 : 860), L.wide ? 5 : 7, colors.leadingHeading, colors.ink, centerX, colors, (size) => trackingFor(size, colors)), req.label ? 22 : 0);
		if (req.by) {
			const name = /^by\s+/i.test(req.by) ? req.by : `by ${req.by}`;
			add(typePiece(name, 'sans', L.wide ? 20 : 22, 16, column, 1, 1.3, colors.secondary, centerX, colors, () => 0), 26);
		}
	}
	if (req.template === 'announcement' && req.action) add(keyPiece(req.action, centerX, column, colors, !L.wide), 32);
	const areaTop = L.padY + L.mark + (L.wide ? 32 : 48);
	const areaHeight = req.height - L.padY - areaTop;
	const bias = L.wide ? 0.46 : req.height / req.width > 1.15 ? 0.4 : 0.48;
	return `${drawLockup(L.padX, L.padY, L.mark, colors)}${place(pieces, areaTop, areaHeight, bias)}`;
}

export function renderSvg(req: SceneRequest, colors: Paint) {
	const ground = req.ground === 'mist' ? colors.mist : colors.white;
	const body = req.template === 'frame' ? frame(req, colors) : poster(req, colors);
	const title = req.title || req.text || brand().name;
	const desc = [req.label, req.title, req.text, req.by, req.action].filter(Boolean).join(' ');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${req.width}" height="${req.height}" viewBox="0 0 ${req.width} ${req.height}" role="img">\n<title>${esc(title)}</title>\n<desc>${esc(desc)}</desc>\n<rect width="${req.width}" height="${req.height}" fill="${ground}"/>\n${body}\n</svg>\n`;
}
