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

/** A face for each run of characters: the asked face where it has them, else the other bundled faces. Copy is drawn
 *  whole or not at all, so a character no bundled face has is an error (assertDrawable), never an empty box. */
function runs(font: Font, text: string): { font: Font; text: string }[] {
	const f = getFaces();
	const out: { font: Font; text: string }[] = [];
	for (const ch of text) {
		const face = has(font, ch) ? font : ([f.sans, f.mono, f.display].find((other) => has(other, ch)) ?? font);
		const last = out[out.length - 1];
		if (last && last.font === face) last.text += ch;
		else out.push({ font: face, text: ch });
	}
	return out;
}

const glyphs = new WeakMap<Font, Map<string, boolean>>();
function has(font: Font, ch: string) {
	let known = glyphs.get(font);
	if (!known) glyphs.set(font, (known = new Map()));
	let yes = known.get(ch);
	if (yes === undefined) known.set(ch, (yes = /\s/.test(ch) || font.charToGlyphIndex(ch) > 0));
	return yes;
}

/** Copy as it is drawn: composed characters, straight line breaks, no invisible joiners. */
export const cleanText = (value: string) => value.normalize('NFC').replace(/\r\n?/g, '\n').replace(/[\u200b\u200c\u2060\ufeff\u00ad]/g, '').replace(/\u00a0/g, ' ');

/** The characters in a text that no bundled face can draw. */
export function undrawable(text: string): string[] {
	const f = getFaces();
	const out = new Set<string>();
	for (const ch of text) {
		const code = ch.codePointAt(0)!;
		if (ch === '\n' || ch === '\t') continue;
		if (code < 32 || (code >= 0x7f && code < 0xa0)) out.add(ch);
		else if (![f.display, f.sans, f.mono].some((face) => has(face, ch))) out.add(ch);
	}
	return [...out];
}

/** Throws when a slot holds a character the bundled faces lack, naming it. */
export function assertDrawable(slot: string, text: string) {
	const bad = undrawable(text);
	if (!bad.length) return;
	const shown = bad.slice(0, 6).map((ch) => `${ch.codePointAt(0)! < 32 ? '' : `${ch} `}(U+${ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')})`);
	throw new Error(`The ${slot} has ${bad.length === 1 ? 'a character' : 'characters'} no bundled face can draw: ${shown.join(', ')}${bad.length > 6 ? ` and ${bad.length - 6} more` : ''}. The faces cover Latin, Greek and Cyrillic, with no emoji. Change the text, or put it in a picture and pass --image.`);
}

// Advances scale with the size, so each string is measured once at 1000 units and reused at every size the fitting tries.
const widths = new WeakMap<Font, Map<string, number>>();
function unitWidth(font: Font, text: string, tracking: number) {
	let known = widths.get(font);
	if (!known) widths.set(font, (known = new Map()));
	const key = `${tracking}|${text}`;
	let w = known.get(key);
	if (w === undefined) {
		w = runs(font, text).reduce((sum, run) => sum + run.font.getAdvanceWidth(run.text, 1000, { kerning: true, letterSpacing: tracking }), 0) / 1000;
		if (known.size > 20000) known.clear();
		known.set(key, w);
	}
	return w;
}

export const measure = (font: Font, text: string, size: number, tracking: number) => unitWidth(font, text, tracking) * size;

export function textPath(font: Font, text: string, x: number, baseline: number, size: number, tracking: number, fill: string, opacity = 1) {
	let at = x;
	let d = '';
	const list = runs(font, text);
	for (const run of list) {
		d += run.font.getPath(run.text, at, baseline, size, { kerning: true, letterSpacing: tracking }).toPathData(2);
		if (list.length > 1) at += run.font.getAdvanceWidth(run.text, size, { kerning: true, letterSpacing: tracking });
	}
	if (!d) return '';
	const fade = opacity < 1 ? ` fill-opacity="${opacity.toFixed(3)}"` : '';
	return `<path fill="${fill}"${fade} d="${d}"/>`;
}

/** A drawn line. `glued` marks one that continues a word broken from the line before. */
export type Line = { text: string; glued: boolean };

function greedy(font: Font, paragraph: string, size: number, max: number, tracking: number): Line[] {
	const out: Line[] = [];
	const width = (value: string) => measure(font, value, size, tracking);
	let line = '';
	let glued = false;
	for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
		const trial = line ? `${line} ${word}` : word;
		if (width(trial) <= max) {
			line = trial;
			continue;
		}
		if (line) out.push({ text: line, glued });
		glued = false;
		line = '';
		if (width(word) <= max) {
			line = word;
			continue;
		}
		// A word wider than the line: broken by character, every character kept.
		for (const ch of word) {
			if (line && width(line + ch) > max) {
				out.push({ text: line, glued });
				line = ch;
				glued = true;
			} else line += ch;
		}
	}
	if (line) out.push({ text: line, glued });
	return out;
}

/** Wraps text to a width, keeping typed line breaks. `even` narrows the measure while the line count holds, so the last
 *  line is not left with one word. */
export function wrapLines(font: Font, value: string, size: number, max: number, tracking: number, even = false): Line[] {
	return value.split('\n').flatMap((part) => {
		if (!part.trim()) return [];
		const lines = greedy(font, part, size, max, tracking);
		if (!even || lines.length < 2 || lines.length > 6 || lines.some((l) => l.glued)) return lines;
		let lo = max / 2;
		let hi = max;
		let best = lines;
		for (let i = 0; i < 9; i++) {
			const mid = (lo + hi) / 2;
			const trial = greedy(font, part, size, mid, tracking);
			if (trial.length === lines.length && !trial.some((l) => l.glued)) {
				best = trial;
				hi = mid;
			} else lo = mid;
		}
		return best;
	});
}

/** The text the lines say, with broken words whole again. */
export const joinLines = (lines: Line[]) => lines.reduce((all, line, i) => (i === 0 ? line.text : line.glued ? all + line.text : `${all} ${line.text}`), '');

export function blockHeight(font: Font, lineCount: number, size: number, leading: number) {
	if (lineCount <= 0) return 0;
	const { cap, desc } = ratios(font);
	return cap * size + Math.max(0, lineCount - 1) * size * leading + desc * size;
}
