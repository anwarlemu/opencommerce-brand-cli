import { readFileSync } from 'node:fs';
import { loadSync, type Font } from 'opentype.js';
import { pkgPath } from '../lib/paths.js';

// Outlined type, so an image renders the same on a machine that does not have the faces installed.
// opentype.js 1.3 reads these files; 2.0 rejects the text face's glyph substitution table.

export type Faces = { display: Font; sans: Font; sansMedium: Font; mono: Font };

let faces: Faces | undefined;
export function getFaces(): Faces {
	faces ??= {
		display: loadSync(pkgPath('brand', 'fonts', 'TeXGyreHeros-Regular.otf')),
		sans: loadSync(pkgPath('brand', 'fonts', 'Inter-Regular.ttf')),
		sansMedium: loadSync(pkgPath('brand', 'fonts', 'Inter-Medium.ttf')),
		mono: loadSync(pkgPath('brand', 'fonts', 'JetBrainsMono-Regular.ttf')),
	};
	return faces;
}

const ink = new WeakMap<Font, { cap: number; desc: number }>();
/** Cap height and descender as a fraction of the font size, from the ink rather than the em box. */
export function ratios(font: Font) {
	const cached = ink.get(font);
	if (cached) return cached;
	const box = font.getPath('Hyg', 0, 0, 100, { kerning: true }).getBoundingBox();
	const value = { cap: -box.y1 / 100, desc: box.y2 / 100 };
	ink.set(font, value);
	return value;
}

export function measure(font: Font, text: string, size: number, tracking: number) {
	return font.getAdvanceWidth(text, size, { kerning: true, letterSpacing: tracking });
}

export function textPath(font: Font, text: string, x: number, baseline: number, size: number, tracking: number, fill: string, opacity = 1) {
	const d = font.getPath(text, x, baseline, size, { kerning: true, letterSpacing: tracking }).toPathData(2);
	if (!d) return '';
	const fade = opacity < 1 ? ` fill-opacity="${opacity.toFixed(3)}"` : '';
	return `<path fill="${fill}"${fade} d="${d}"/>`;
}

function wrapParagraph(font: Font, paragraph: string, size: number, maxWidth: number, tracking: number) {
	const words = paragraph.trim().split(/\s+/).filter(Boolean);
	const lines: string[] = [];
	let line = '';
	const width = (value: string) => measure(font, value, size, tracking);
	const pushWord = (word: string) => {
		if (width(word) <= maxWidth) {
			line = word;
			return;
		}
		let chunk = '';
		for (const ch of word) {
			if (chunk && width(chunk + ch) > maxWidth) {
				lines.push(chunk);
				chunk = ch;
			} else chunk += ch;
		}
		line = chunk;
	};
	for (const word of words) {
		const trial = line ? `${line} ${word}` : word;
		if (!line || width(trial) <= maxWidth) line = trial;
		else {
			lines.push(line);
			pushWord(word);
		}
	}
	if (line) lines.push(line);
	return lines;
}

/** Greedy wrap that keeps explicit line breaks, then evens two- and three-line blocks. */
export function wrap(font: Font, text: string, size: number, maxWidth: number, tracking: number) {
	const parts = text.replace(/\r\n/g, '\n').split('\n');
	const explicit = parts.length > 1;
	const lines = parts.flatMap((part) => (part.trim() ? wrapParagraph(font, part, size, maxWidth, tracking) : []));
	if (explicit || lines.length < 2 || lines.length > 3) return lines;
	const words = lines.join(' ').split(' ');
	const width = (value: string) => measure(font, value, size, tracking);
	let best = lines;
	let bestScore = Math.max(...lines.map(width)) - Math.min(...lines.map(width));
	const consider = (candidate: string[]) => {
		if (candidate.some((line) => width(line) > maxWidth + 0.5)) return;
		const widths = candidate.map(width);
		const score = Math.max(...widths) - Math.min(...widths);
		if (score < bestScore) {
			bestScore = score;
			best = candidate;
		}
	};
	if (lines.length === 2) {
		for (let i = 1; i < words.length; i++) consider([words.slice(0, i).join(' '), words.slice(i).join(' ')]);
	} else {
		for (let i = 1; i < words.length - 1; i++) for (let j = i + 1; j < words.length; j++) consider([words.slice(0, i).join(' '), words.slice(i, j).join(' '), words.slice(j).join(' ')]);
	}
	return best;
}

export function blockHeight(font: Font, lineCount: number, size: number, leading: number) {
	if (lineCount <= 0) return 0;
	const { cap, desc } = ratios(font);
	return cap * size + Math.max(0, lineCount - 1) * size * leading + desc * size;
}

export type Fitted = { lines: string[]; size: number; tracking: number; height: number };

export function fitText(font: Font, text: string, maxWidth: number, start: number, min: number, maxLines: number, leading: number, trackingAt: (size: number) => number): Fitted {
	const source = text.trim();
	for (let size = start; size >= min; size -= 2) {
		const tracking = trackingAt(size);
		const lines = wrap(font, source, size, maxWidth, tracking);
		if (lines.length > maxLines) continue;
		if (lines.some((line) => measure(font, line, size, tracking) > maxWidth + 1)) continue;
		return { lines, size, tracking, height: blockHeight(font, lines.length, size, leading) };
	}
	const tracking = trackingAt(min);
	const all = wrap(font, source, min, maxWidth, tracking);
	const lines = all.slice(0, maxLines);
	const last = lines[lines.length - 1] ?? '';
	if (all.length > maxLines && last && !last.endsWith('...')) {
		let cut = last;
		while (cut.length > 1 && measure(font, `${cut}...`, min, tracking) > maxWidth) cut = cut.slice(0, -1).trimEnd();
		lines[lines.length - 1] = `${cut}...`;
	}
	return { lines, size: min, tracking, height: blockHeight(font, lines.length, min, leading) };
}

export function drawLines(font: Font, fitted: Fitted, leading: number, fill: string, centerX: number, top: number) {
	const { cap } = ratios(font);
	let baseline = top + cap * fitted.size;
	const parts: string[] = [];
	for (const line of fitted.lines) {
		const width = measure(font, line, fitted.size, fitted.tracking);
		const x = Math.round((centerX - width / 2) * 100) / 100;
		parts.push(textPath(font, line, x, Math.round(baseline * 100) / 100, fitted.size, fitted.tracking, fill));
		baseline += fitted.size * leading;
	}
	return parts.join('');
}
