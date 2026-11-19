import { readFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { Doc, glyphField, r2, svgDocument, windowSvg, type FieldOptions, type Picture, type Rect } from '../assets/kit.js';
import { imageData } from '../assets/layouts.js';
import { clamp01, smooth } from '../assets/noise.js';
import { getFaces } from '../image/fonts.js';
import { paint, type Paint } from '../image/paint.js';
import { unknownName } from '../lib/names.js';
import { pkgPath } from '../lib/paths.js';

// Illustrations in the brand's graphic language (brand/assets/illustrate.json, rules in brand/illustration.md):
// characters on a lattice in faint ink, blue only where the site puts it. Every glyph is a real vector outline from the
// bundled mono, defined once per size and placed with <use>, so the SVG stays editable and small.

type SubjectDoc = { description: string; source: string; size: [number, number]; seed: number; image: boolean; needsImage?: boolean };
type IllustrateDoc = {
	subjects: Record<string, SubjectDoc>;
	ramp: string;
	grids: Record<'main' | 'fine' | 'field', [number, number, number]>;
	rings: { count: number; first: number; step: number; tilt: number; roll: number };
	still: { ry: number; rx: number };
};

let data: IllustrateDoc | undefined;
export const illustrateData = (): IllustrateDoc => (data ??= JSON.parse(readFileSync(pkgPath('brand', 'assets', 'illustrate.json'), 'utf8')) as IllustrateDoc);
export const subjects = () => Object.keys(illustrateData().subjects);

/** A glyph outline, centered on its advance, top of the em box at y = 0, defined once per character and size. */
function glyphId(doc: Doc, ch: string, size: number) {
	const mono = getFaces().mono;
	const glyph = mono.charToGlyph(ch);
	const face = glyph.name === '.notdef' ? getFaces().sans : mono;
	const id = `g${ch.codePointAt(0)!.toString(16)}-${String(r2(size)).replace('.', '_')}`;
	if (!doc.defs.some((d) => d.includes(`id="${id}"`))) {
		const w = face.getAdvanceWidth(ch, size);
		const asc = (mono.ascender / mono.unitsPerEm) * size;
		doc.defs.push(`<path id="${id}" d="${face.getPath(ch, -w / 2, asc, size).toPathData(2)}"/>`);
	}
	return id;
}

/** Places a glyph centered in a cell (cx at the cell's middle, cy at its middle). */
function put(doc: Doc, ch: string, size: number, cx: number, cy: number, fill: string, alpha: number) {
	if (alpha < 0.01 || ch === ' ') return '';
	const id = glyphId(doc, ch, size);
	// The em box is centered on the cell: a middle baseline, as the site's canvases draw with textBaseline middle.
	const mono = getFaces().mono;
	const top = cy - (((mono.ascender - mono.descender) / mono.unitsPerEm) * size) / 2;
	return `<use href="#${id}" x="${r2(cx)}" y="${r2(top)}" fill="${fill}" fill-opacity="${Math.min(1, alpha).toFixed(3)}"/>`;
}

// The [*] as a slab: the logo's strokes (20 by 18 units, 2.4-unit square-capped), extruded and sampled into surface
// points with normals (the site's lib/mark-3d.ts).
const SEGMENTS: [number, number, number, number][] = [
	[3.45, 1.2, 1.2, 1.2],
	[1.2, 1.2, 1.2, 16.2],
	[1.2, 16.2, 3.45, 16.2],
	[16.45, 1.2, 18.7, 1.2],
	[18.7, 1.2, 18.7, 16.2],
	[18.7, 16.2, 16.45, 16.2],
	[9.95, 3.7, 9.95, 13.7],
	[5.62, 6.2, 14.28, 11.2],
	[5.62, 11.2, 14.28, 6.2],
];
const HALF = 1.2;
const CX = 9.95;
const CY = 8.7;
const DEPTH = 1.7;

function inside(x: number, y: number) {
	for (const [x1, y1, x2, y2] of SEGMENTS) {
		const dx = x2 - x1;
		const dy = y2 - y1;
		const len = Math.hypot(dx, dy);
		const ux = dx / len;
		const uy = dy / len;
		const px = x - x1;
		const py = y - y1;
		const along = px * ux + py * uy;
		const across = Math.abs(-px * uy + py * ux);
		if (along >= -HALF && along <= len + HALF && across <= HALF) return true;
	}
	return false;
}

let points: Float32Array | undefined;
function samplePoints(step = 0.1) {
	if (points) return points;
	const cols = Math.ceil(20 / step);
	const rows = Math.ceil(18 / step);
	const grid = new Uint8Array(cols * rows);
	for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) grid[r * cols + c] = inside(c * step, r * step) ? 1 : 0;
	const at = (c: number, r: number) => (c < 0 || r < 0 || c >= cols || r >= rows ? 0 : grid[r * cols + c]);
	const out: number[] = [];
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			if (!grid[r * cols + c]) continue;
			const x = c * step - CX;
			const y = r * step - CY;
			out.push(x, y, DEPTH, 0, 0, 1, x, y, -DEPTH, 0, 0, -1);
			const nx = at(c - 1, r) - at(c + 1, r);
			const ny = at(c, r - 1) - at(c, r + 1);
			if (nx || ny) {
				const n = Math.hypot(nx, ny);
				for (let z = -DEPTH; z <= DEPTH; z += step) out.push(x, y, z, nx / n, ny / n, 0);
			}
		}
	}
	points = new Float32Array(out);
	return points;
}

/** The slab turned (ry about y, then rx about x), projected into a cell grid with a depth test and lit from up left. */
function projectMark(cols: number, rows: number, cw: number, ch: number, o: { rx: number; ry: number; scale: number; ox: number; oy: number }) {
	const pts = samplePoints();
	const zbuf = new Float32Array(cols * rows).fill(-1e9);
	const lum = new Float32Array(cols * rows).fill(-1);
	const cy = Math.cos(o.ry);
	const sy = Math.sin(o.ry);
	const cx = Math.cos(o.rx);
	const sx = Math.sin(o.rx);
	const cam = 60;
	const LX = -16;
	const LY = -18;
	const LZ = 26;
	for (let i = 0; i < pts.length; i += 6) {
		const x = pts[i];
		const y = pts[i + 1];
		const z = pts[i + 2];
		const x1 = x * cy + z * sy;
		const z1 = -x * sy + z * cy;
		const y2 = y * cx - z1 * sx;
		const z2 = y * sx + z1 * cx;
		const nx1 = pts[i + 3] * cy + pts[i + 5] * sy;
		const nz1 = -pts[i + 3] * sy + pts[i + 5] * cy;
		const ny2 = pts[i + 4] * cx - nz1 * sx;
		const nz2 = pts[i + 4] * sx + nz1 * cx;
		if (nz2 <= 0.02) continue;
		const f = cam / (cam - z2);
		const c = Math.floor((o.ox + x1 * o.scale * f) / cw);
		const r = Math.floor((o.oy + y2 * o.scale * f) / ch);
		if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
		const k = r * cols + c;
		if (z2 <= zbuf[k]) continue;
		zbuf[k] = z2;
		const lx = LX - x1;
		const ly = LY - y2;
		const lz = LZ - z2;
		const diffuse = Math.max(0, (nx1 * lx + ny2 * ly + nz2 * lz) / Math.hypot(lx, ly, lz));
		lum[k] = Math.min(1, diffuse * diffuse * 1.35);
	}
	return lum;
}

/** The slab in characters: the ramp from faint to dense, the brightest cells in blue. */
function markGlyphs(doc: Doc, W: number, H: number, o: { rx: number; ry: number; scale: number; ox: number; oy: number; unit: number }, c: Paint) {
	const [fw, fh, fs] = illustrateData().grids.fine.map((v) => v * o.unit) as [number, number, number];
	const cols = Math.ceil(W / fw);
	const rows = Math.ceil(H / fh);
	const lum = projectMark(cols, rows, fw, fh, o);
	const ramp = illustrateData().ramp;
	const out: string[] = [];
	for (let r = 0; r < rows; r++)
		for (let col = 0; col < cols; col++) {
			const b = lum[r * cols + col];
			if (b < 0) continue;
			const v = 0.1 + b * 0.9;
			const lit = v > 0.93;
			out.push(put(doc, ramp[Math.min(ramp.length - 1, Math.floor(v * ramp.length))], fs, col * fw + fw / 2, r * fh + fh / 2, lit ? c.brand : c.ink, lit ? 0.85 : 0.2 + v * 0.55));
		}
	return out.join('');
}

/** The rings: a dot in every main-grid cell along each, far half or near half. */
function rings(doc: Doc, W: number, H: number, sun: { x: number; y: number }, unit: number, near: boolean, g: number, c: Paint, alpha = 1) {
	const R = illustrateData().rings;
	const [cw, ch, fs] = illustrateData().grids.main.map((v) => v * g) as [number, number, number];
	const cols = Math.ceil(W / cw);
	const seen = new Set<number>();
	const out: string[] = [];
	const cr = Math.cos(R.roll);
	const sr = Math.sin(R.roll);
	for (let i = 0; i < R.count; i++) {
		const rad = (R.first + i * R.step) * unit;
		const n = Math.round((rad * 2 * Math.PI) / (cw * 0.7));
		for (let j = 0; j < n; j++) {
			const th = (j / n) * Math.PI * 2;
			if (Math.sin(th) > 0 !== near) continue;
			const x0 = Math.cos(th) * rad;
			const y0 = Math.sin(th) * rad * R.tilt;
			const x = sun.x + x0 * cr - y0 * sr;
			const y = sun.y + x0 * sr + y0 * cr;
			const col = Math.floor(x / cw);
			const row = Math.floor(y / ch);
			if (col < 0 || row < 0 || x > W || y > H) continue;
			const key = row * cols + col;
			if (seen.has(key)) continue;
			seen.add(key);
			out.push(put(doc, '·', fs, col * cw + cw / 2, row * ch + ch / 2, c.ink, (near ? 0.36 : 0.2) * alpha));
		}
	}
	return out.join('');
}

export type IllustrateRequest = {
	subject: string;
	width?: number;
	height?: number;
	seed?: number;
	picture?: Picture;
	/** Window subject: the bar name and code. */
	label?: string;
	code?: string;
	/** Seconds into the motion (video): the field drifts, the mark sways. Unset is the still frame. */
	t?: number;
	/** Ground: white (default), mist or none (transparent). */
	ground?: 'white' | 'mist' | 'none';
};

export type Illustration = { svg: string; width: number; height: number; subject: string; glyphs: number };

function sizeOf(req: IllustrateRequest, s: SubjectDoc) {
	let width = req.width ?? s.size[0];
	let height = req.height ?? s.size[1];
	if (!height && req.picture) height = Math.round((width * req.picture.height) / req.picture.width);
	if (!height) height = Math.round(width * 0.625);
	for (const v of [width, height]) if (!Number.isInteger(v) || v < 200 || v > 4000) throw new Error('An illustration takes 200 to 4000 px a side.');
	return { width, height };
}

/** The halftone: a picture sampled into the fine grid (pixels read through resvg, so any PNG, JPEG or SVG works). */
function halftone(doc: Doc, W: number, H: number, pic: Picture, c: Paint) {
	const g = Math.max(1, Math.min(W, H) / 600);
	const [fw, fh, fs] = illustrateData().grids.fine.map((v) => v * g) as [number, number, number];
	const cols = Math.ceil(W / fw);
	const rows = Math.ceil(H / fh);
	const sc = Math.min(W / pic.width, H / pic.height);
	const pw = pic.width * sc;
	const ph = pic.height * sc;
	const sample = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols}" height="${rows}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><image href="data:${pic.mime};base64,${pic.data.toString('base64')}" x="${r2((W - pw) / 2)}" y="${r2((H - ph) / 2)}" width="${r2(pw)}" height="${r2(ph)}" preserveAspectRatio="none"/></svg>`;
	const px = new Resvg(sample, { fitTo: { mode: 'original' }, font: { loadSystemFonts: false } }).render().pixels;
	const ramp = illustrateData().ramp;
	const out: string[] = [];
	let n = 0;
	for (let r = 0; r < rows; r++)
		for (let col = 0; col < cols; col++) {
			const i = (r * cols + col) * 4;
			const a = px[i + 3] / 255;
			if (a < 0.05) continue;
			const lumin = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
			const v = (1 - lumin) * a;
			if (v < 0.06) continue;
			const lit = v > 0.93;
			out.push(put(doc, ramp[Math.min(ramp.length - 1, Math.floor(v * ramp.length))], fs, col * fw + fw / 2, r * fh + fh / 2, lit ? c.brand : c.ink, lit ? 0.85 : 0.2 + v * 0.55));
			n++;
		}
	return { svg: out.join(''), n };
}

export function illustrate(req: IllustrateRequest): Illustration {
	const D = illustrateData();
	if (!(req.subject in D.subjects)) throw unknownName('subject', req.subject, subjects());
	const s = D.subjects[req.subject];
	if (req.picture && !s.image) throw new Error(`The ${req.subject} subject takes no --image. Use ${subjects().filter((k) => D.subjects[k].image).join(' or ')}.`);
	if (s.needsImage && !req.picture) throw new Error(`The ${req.subject} subject needs --image <file>.`);
	const { width: W, height: H } = sizeOf(req, s);
	const c = paint();
	const doc = new Doc();
	const seed = req.seed ?? s.seed;
	const moving = req.t !== undefined;
	const t = req.t ?? 0;
	const k = Math.sqrt((W * H) / (imageData().unit.width * imageData().unit.height));
	let body = '';
	if (req.subject === 'field') {
		const o: FieldOptions = { box: { x: 0, y: 0, w: W, h: H }, z: 1.3 * k, seed, t: req.t, fade: (nx, ny) => smooth(clamp01((1 - Math.max(Math.abs(nx), Math.abs(ny))) / 0.35)), keep: [], density: 0.04 };
		body = glyphField(doc, o, c);
	} else if (req.subject === 'window') {
		const z = 1.3 * k;
		const win: Rect = { x: W * 0.18, y: H * 0.16, w: W * 0.64, h: H * 0.68 };
		const field = glyphField(doc, { box: { x: 0, y: 0, w: W, h: H }, z, seed, t: req.t, fade: (nx, ny) => 1 - smooth(clamp01((Math.hypot(nx, ny) - 0.75) / 0.35)), keep: [{ x: win.x - 4 * k, y: win.y - 4 * k, w: win.w + 8 * k, h: win.h + 8 * k }], density: 0.06 }, c);
		const inner = req.picture ? { kind: 'picture' as const, picture: req.picture } : { kind: 'code' as const, code: req.code ?? imageData().code, highlight: req.code ? '' : '1-5', scale: 1 };
		body = field + windowSvg(doc, win, req.label ?? (req.picture ? 'picture.png' : 'agent.ts'), inner, z, c);
	} else if (req.subject === 'mark') {
		const ry = moving ? D.still.ry + Math.sin(t * 0.25) * 0.34 : D.still.ry;
		const rx = moving ? D.still.rx + Math.sin(t * 0.19) * 0.06 : D.still.rx;
		const unit = Math.max(1, Math.min(W, H) / 800);
		body = markGlyphs(doc, W, H, { rx, ry, scale: (Math.min(W, H) * 0.62) / 20, ox: W / 2, oy: H / 2, unit }, c);
	} else if (req.subject === 'orbit') {
		const g = Math.max(1, Math.min(W, H) / 900);
		const sun = { x: W / 2, y: H * 0.46 };
		const unit = Math.min(W * 0.5, 740 * g);
		const ry = moving ? D.still.ry + Math.sin(t * 0.25) * 0.34 : D.still.ry;
		const rx = moving ? D.still.rx + Math.sin(t * 0.19) * 0.06 : D.still.rx;
		body = rings(doc, W, H, sun, unit, false, g, c) + markGlyphs(doc, W, H, { rx, ry, scale: Math.min(Math.min(W, H) * 0.38, 340 * g) / 20, ox: sun.x, oy: sun.y, unit: g }, c) + rings(doc, W, H, sun, unit, true, g, c);
	} else if (req.subject === 'halftone') {
		body = halftone(doc, W, H, req.picture!, c).svg;
	}
	const ground = req.ground === 'none' ? null : req.ground === 'mist' ? c.mist : c.white;
	const svg = svgDocument(doc, W, H, ground, body, { title: `${req.subject} illustration`, desc: s.description });
	return { svg, width: W, height: H, subject: req.subject, glyphs: (body.match(/<use /g) ?? []).length };
}
