import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { merchItems, itemSvg } from '../src/assets/merch.js';
import { isBlocks, slideScene, slideTypes } from '../src/assets/deck.js';
import { findingsOf } from '../src/image/check.js';
import { errorsOf } from '../src/design/index.js';
import { floorFor, placeFor, sceneSvg, TEMPLATE_IDS, TEMPLATE_SLOTS, type Copy, type Scene, type Slot } from '../src/assets/layouts.js';
import type { DrawnLayer, Rect } from '../src/design/types.js';
import { loadImage, parseSize, pngSize, rasterize, renderImages, sizesFor, type TemplateId } from '../src/image/render.js';
import { renderCarousel } from '../src/image/carousel.js';

// The rules every drawing keeps, over every template, size, theme and kind of copy: no word lost, nothing drawn that was
// not asked for, nothing overlapping or cut, text readable, and the platform's own areas left clear.

const LONG = 'Everything your agents need to search, buy and reply in one place';
const PARA = 'One endpoint for agents to search, check out and track orders at any store, with every step reported back as data.';
const WORD = 'Rindfleischetikettierungsueberwachungsaufgabenuebertragungsgesetz';
const COPIES: Record<string, Copy> = {
	short: { headline: 'Ship faster', body: 'Any store.', badge: 'New', by: 'Acme', action: 'Start', secondary: 'Docs', cards: 'One\nA line.\n\nTwo\nB line.' },
	long: { headline: LONG, body: PARA, badge: 'Now available to every merchant', by: 'a head of engineering at Acme Corporation', action: 'Get started with the router today', secondary: 'Read the documentation', cards: [1, 2, 3, 4].map((i) => `Heading number ${i} here\n${PARA.slice(0, 70)}`).join('\n\n') },
	word: { headline: WORD, body: `${WORD} ${WORD}`, by: WORD, cards: `${WORD}\n${WORD}\n\nTwo\n${WORD}` },
	letters: { headline: 'Привет, агенты', body: 'Γειά σου κόσμε', badge: 'Łódź', by: 'Акме', action: 'Начать', cards: 'Один\nДва три.\n\nДва\nЧетыре.' },
	marks: { headline: '“Buy” & <sell> it’s "100%"', body: 'Quotes \' " & ampersands < > …', badge: 'A & B', by: '"Acme" & co', action: 'Go & see', cards: 'A & B\n"Quoted" <b>\n\nC\nD & E' },
	code: { headline: 'Ship faster', body: 'Any store.', label: 'a.ts', code: 'const a = tool({\n  // a comment\n  name: "x",\n});' },
};

const lum = (hex: string) => {
	const v = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
	return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
const contrast = (a: string, b: string) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
const meet = (a: Rect, b: Rect, pad = 0) => a.x < b.x + b.w + pad - 0.6 && a.x + a.w > b.x - pad + 0.6 && a.y < b.y + b.h + pad - 0.6 && a.y + a.h > b.y - pad + 0.6;
const flat = (s: string) => s.replace(/\s+/g, ' ').trim();

export function problems(req: Scene, layers: DrawnLayer[]): string[] {
	const out: string[] = [];
	const place = req.safe ? { safe: req.safe, avoid: [] } : placeFor(req.width, req.height);
	const floor = req.floor ?? floorFor(req.width, req.height);
	for (const y of layers) {
		const marks = y.ink ?? [y.box];
		if (y.text) {
			if (flat(y.text.asked) !== flat(y.text.drawn)) out.push(`words lost in ${y.id}`);
			if (y.text.size < floor - 0.05) out.push(`${y.id} at ${y.text.size} is under ${floor}`);
			const large = y.text.size >= 24 * (req.width / 1200);
			for (const g of y.text.ground) if (contrast(y.text.color, g) < (large ? 3 : 4.5)) out.push(`${y.id} contrast on ${g}`);
		}
		if (y.kind !== 'art' && !y.bleeds && !y.fades && marks.some((b) => b.x < -0.5 || b.y < -0.5 || b.x + b.w > req.width + 0.5 || b.y + b.h > req.height + 0.5)) out.push(`${y.id} is cut`);
		if (['text', 'logo', 'key'].includes(y.kind) && !y.bleeds) {
			const s = place.safe;
			if (marks.some((b) => b.x < s.x - 1 || b.y < s.y - 1 || b.x + b.w > s.x + s.w + 1 || b.y + b.h > s.y + s.h + 1)) out.push(`${y.id} leaves the safe area`);
			if (marks.some((b) => place.avoid.some((a) => meet(a, b)))) out.push(`${y.id} is under the platform's own element`);
		}
		if (y.logo && y.box.h < y.logo.min - 0.01) out.push('logo under its minimum');
	}
	layers.forEach((a, i) => {
		for (const b of layers.slice(i + 1)) {
			if (a.over?.includes(b.id) || b.over?.includes(a.id) || a.id === 'panel' || b.id === 'panel') continue;
			const pad = Math.max(a.logo?.clear ?? 0, b.logo?.clear ?? 0);
			if ((a.ink ?? [a.box]).some((x) => (b.ink ?? [b.box]).some((z) => meet(x, z, pad)))) out.push(`${a.id} touches ${b.id}`);
		}
	});
	const panel = layers.find((y) => y.id === 'panel')?.box;
	if (panel) for (const y of layers) if (y.kind !== 'art' && y.over?.includes('panel') && (y.box.x < panel.x + 8 || y.box.x + y.box.w > panel.x + panel.w - 8)) out.push(`${y.id} touches the panel edge`);
	return out;
}

/** Every text a drawing may hold: the copy asked for, the numbers on cards, and the brand's own address. */
function invented(layers: DrawnLayer[], copy: Copy): string[] {
	const asked = flat(Object.values(copy).join(' ')).split(' ');
	return layers.filter((y) => y.text && !y.text.own).filter((y) => flat(y.text!.drawn).split(' ').some((w) => !asked.includes(w))).map((y) => `${y.id}: ${y.text!.drawn}`);
}

function copyFor(template: TemplateId, all: Copy): Copy | null {
	const spec = TEMPLATE_SLOTS[template];
	const copy: Copy = {};
	for (const slot of spec.takes) if (all[slot] && !(template === 'frame' && slot === 'body' && all.code)) copy[slot as Slot] = all[slot];
	if (copy.label && !copy.code) delete copy.label;
	if (spec.required.some((r) => !copy[r]) || (spec.needs && !spec.needs.some((n) => copy[n]))) return null;
	return copy;
}

describe('every layout', () => {
	it('keeps the rules for every template, size, theme and kind of copy', { timeout: 240000 }, () => {
		let drawn = 0;
		let refused = 0;
		const found: string[] = [];
		for (const template of TEMPLATE_IDS) {
			for (const id of sizesFor(template)) {
				const size = parseSize(id);
				for (const theme of ['white', 'mist'] as const) {
					for (const [kind, all] of Object.entries(template === 'avatar' ? { none: {} as Copy } : COPIES)) {
						const copy = copyFor(template, all);
						if (!copy) continue;
						const req: Scene = { template, width: size.width, height: size.height, theme, copy };
						let layers: DrawnLayer[];
						try {
							layers = sceneSvg(req).layers;
						} catch (error) {
							// Copy that cannot be drawn whole is refused with what to shorten, never cut.
							expect((error as Error).message).toMatch(/do(es)? not fit .*(Shorten the|--no-logo|larger size)/);
							refused++;
							continue;
						}
						drawn++;
						const core = errorsOf(findingsOf({ template, sizeId: id, width: size.width, height: size.height, copy }, layers)).map((f) => `${f.rule}: ${f.message}`);
						for (const p of [...problems(req, layers), ...invented(layers, copy), ...core]) found.push(`${template} ${id} ${theme} ${kind}: ${p}`);
					}
				}
			}
		}
		expect(found).toEqual([]);
		expect(drawn).toBeGreaterThan(900);
		expect(refused).toBeLessThan(drawn * 0.12);
	});

	it('holds a nine word headline on every banner', () => {
		for (const template of ['hero', 'window', 'closing', 'headline', 'announcement'] as const)
			for (const id of ['x-banner', 'linkedin-banner', 'linkedin-page', 'email', 'youtube']) {
				const size = parseSize(id);
				const req: Scene = { template, width: size.width, height: size.height, copy: { headline: LONG } };
				expect(problems(req, sceneSvg(req).layers), `${template} ${id}`).toEqual([]);
			}
	});

	it('draws pictures whole, or fades the one that leaves the canvas', () => {
		for (const [w, h] of [[1600, 900], [600, 1400], [40, 30], [4000, 500]]) {
			const picture = { data: rasterize(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#CCDBFF"/></svg>`), mime: 'image/png', width: w, height: h };
			for (const template of ['hero', 'window', 'frame'] as const)
				for (const id of ['og', 'square', 'portrait', 'story', 'landscape']) {
					const size = parseSize(id);
					const req: Scene = { template, width: size.width, height: size.height, copy: { headline: 'Ship faster', label: 'shot.png' }, picture };
					const { svg, layers } = sceneSvg(req);
					expect(problems(req, layers), `${template} ${id} ${w}x${h}`).toEqual([]);
					const win = layers.find((y) => y.id === 'window')!;
					expect(Boolean(win.fades)).toBe(/<mask /.test(svg));
					const pic = layers.find((y) => y.id === 'picture')!.box;
					expect(pic.w / pic.h).toBeCloseTo(w / h, 1);
				}
		}
	});

	it('draws only the copy it is given, and sample copy only when asked', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-only-'));
		try {
			for (const template of ['hero', 'window', 'closing'] as const) {
				const r = renderImages({ template, headline: 'Ship faster', out: join(dir, 'a.png') });
				expect(r.layers.og.filter((y) => y.text).map((y) => y.id)).toEqual(['headline']);
				expect(r.layers.og.some((y) => y.id === 'window')).toBe(false);
			}
			const s = renderImages({ template: 'hero', sample: true, out: join(dir, 'b.png') });
			expect(s.layers.og.filter((y) => y.text && y.text.sample).map((y) => y.id).sort()).toEqual(['badge', 'body', 'code', 'headline', 'label']);
			expect(() => renderImages({ template: 'frame', headline: 'x', out: join(dir, 'c.png') })).toThrow(/an empty window says nothing/);
			expect(() => renderImages({ template: 'avatar', headline: 'x' })).toThrow(/does not take --headline/);
			expect(() => renderImages({ template: 'hero', headline: 'x', label: 'a.ts' })).toThrow(/no window without/);
			expect(existsSync(join(dir, 'c.png'))).toBe(false);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('names characters no bundled face has instead of drawing empty boxes', () => {
		expect(() => renderImages({ headline: 'Ship 🚀 日本' })).toThrow(/no bundled face can draw: 🚀 \(U\+1F680\), 日 \(U\+65E5\), 本/);
		expect(() => renderImages({ template: 'cards', cards: 'One\nمرحبا' })).toThrow(/The card 1 has characters/);
	});

	it('says what to shorten', () => {
		expect(() => renderImages({ template: 'lead', headline: 'Ship', body: PARA.repeat(12), size: 'x-banner' })).toThrow(/lead at x-banner .*Shorten the body to about \d+ characters \(it has \d+\)/);
	});

	it('takes every shared name and its alias, and draws the same bytes', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-names-'));
		try {
			renderImages({ template: 'hero', headline: 'A', body: 'B', badge: 'C', theme: 'mist', size: 'og', out: join(dir, 'a.png') });
			renderImages({ template: 'hero', title: 'A', text: 'B', chip: 'C', ground: 'mist', preset: 'open-graph', out: join(dir, 'b.png') });
			expect(readFileSync(join(dir, 'a.png')).equals(readFileSync(join(dir, 'b.png')))).toBe(true);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('writes every format, at a scale, and any size', { timeout: 60000 }, () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-formats-'));
		try {
			const r = renderImages({ headline: 'Ship faster', width: 800, height: 600, format: 'png,svg,jpg,webp,pdf', scale: 2, out: dir });
			expect(r.files.map((f) => f.format)).toEqual(['png', 'svg', 'jpg', 'webp', 'pdf']);
			expect(pngSize(readFileSync(join(dir, '800x600-headline.png')))).toEqual({ width: 1600, height: 1200 });
			expect(loadImage(join(dir, '800x600-headline.jpg'))).toMatchObject({ width: 1600, height: 1200 });
			expect(loadImage(join(dir, '800x600-headline.webp'))).toMatchObject({ width: 1600, height: 1200 });
			expect(readFileSync(join(dir, '800x600-headline.pdf')).subarray(0, 5).toString()).toBe('%PDF-');
			expect(renderImages({ headline: 'Ship', size: 'og,x-banner', out: dir }).files).toHaveLength(2);
			expect(() => renderImages({ headline: 'Ship', size: 'custom' })).toThrow(/--width and --height/);
			expect(() => renderImages({ headline: 'Ship', width: 800 })).toThrow(/both/);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('refuses a missing, damaged or unreadable picture', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds pictures '));
		try {
			const good = renderImages({ headline: 'Shot', size: 'square', out: join(dir, 'a shot.png') }).files[0].path;
			expect(renderImages({ template: 'frame', image: good, out: join(dir, 'f.png') }).files).toHaveLength(1);
			writeFileSync(join(dir, 'cut.png'), readFileSync(good).subarray(0, 900));
			expect(() => renderImages({ template: 'frame', image: join(dir, 'cut.png') })).toThrow(/damaged/);
			writeFileSync(join(dir, 'not.png'), 'hello');
			expect(() => renderImages({ template: 'frame', image: join(dir, 'not.png') })).toThrow(/must be a PNG/);
			expect(() => renderImages({ template: 'frame', image: join(dir, 'none.png') })).toThrow(/No image at/);
			expect(() => renderImages({ template: 'frame', image: dir })).toThrow(/No image at/);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('draws a carousel: one size, numbered, the same headline size per template', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-carousel-'));
		try {
			const file = join(dir, 'c.json');
			writeFileSync(file, JSON.stringify({ size: 'portrait', slides: [{ headline: 'Short' }, { headline: LONG }, { template: 'cards', cards: ['One\nA.', 'Two\nB.'] }] }));
			const r = renderCarousel({ file, out: join(dir, 'out') });
			expect(r.files.map((f) => f.path.split('/').pop())).toEqual(['01-headline.png', '02-headline.png', '03-cards.png']);
			for (const f of r.files) expect(f).toMatchObject({ width: 1080, height: 1350 });
			writeFileSync(file, JSON.stringify({ slides: [{ headline: 'x' }, { headline: 'y', subtitle: 'z' }] }));
			expect(() => renderCarousel({ file })).toThrow(/Slide 2: Unknown content field "subtitle"/);
			for (const template of TEMPLATE_IDS.filter((t) => t !== 'avatar')) {
				const copy = copyFor(template, COPIES.long);
				if (!copy || (template === 'frame' && !copy.body)) continue;
				const req: Scene = { template, width: 1080, height: 1350, copy, page: '3/10' };
				expect(problems(req, sceneSvg(req).layers), template).toEqual([]);
			}
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});
});

describe('slides and print files', () => {
	it('keeps the rules on every slide type', () => {
		const given: Record<string, Record<string, unknown>> = { image: { title: 'Watch', picture: { data: rasterize('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="900" height="600" fill="#CCDBFF"/></svg>'), mime: 'image/png', width: 900, height: 600 } } };
		for (const type of slideTypes().filter((t) => !isBlocks(t))) {
			const scene = slideScene({ type, sample: true, ...(given[type] ?? {}) });
			expect(problems(scene, sceneSvg(scene).layers), type).toEqual([]);
		}
		const bare = slideScene({ type: 'cover', title: 'Only a title' });
		expect(sceneSvg(bare).layers.filter((y) => y.text).map((y) => y.id)).toEqual(['headline']);
	});

	it('keeps words and logos inside the safe area of every print item, and draws no unasked copy', () => {
		for (const item of merchItems()) {
			const hero = item.layers.some((y) => y.type === 'hero');
			const needs = item.layers.flatMap((l) => (l.type === 'text' && l.required ? [l.slot] : []));
			const slots = Object.fromEntries([...(hero ? ['headline'] : []), ...needs].map((k) => [k, k === 'name' ? 'Alex Acme' : LONG]));
			const r = itemSvg(item, { slots });
			const words = r.layers.filter((y) => y.text);
			expect(words.map((y) => y.text!.drawn).sort(), item.id).toEqual(Object.values(slots).sort());
			const s = itemSvg(item, { sample: true });
			for (const y of s.layers.filter((l) => (l.text || l.kind === 'logo') && !l.bleeds)) {
				expect(y.box.x, `${item.id} ${y.id}`).toBeGreaterThanOrEqual(s.safe.x - 1);
				expect(y.box.y, `${item.id} ${y.id}`).toBeGreaterThanOrEqual(s.safe.y - 1);
				expect(y.box.x + y.box.w, `${item.id} ${y.id}`).toBeLessThanOrEqual(s.safe.x + s.safe.w + 1);
				expect(y.box.y + y.box.h, `${item.id} ${y.id}`).toBeLessThanOrEqual(s.safe.y + s.safe.h + 1);
			}
		}
	});
});

describe('the logo', () => {
	it('keeps its clear space from every word at every anchor it offers', { timeout: 240000 }, () => {
		const found: string[] = [];
		const anchors = ['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'] as const;
		for (const template of ['headline', 'lead', 'quote', 'announcement', 'hero', 'window', 'closing', 'cards', 'frame'] as TemplateId[]) {
			for (const id of ['og', 'square', 'story', 'x-banner', 'linkedin-banner']) {
				const size = parseSize(id);
				const copy = copyFor(template, COPIES.long);
				if (!copy) continue;
				for (const anchor of anchors) {
					const req: Scene = { template, width: size.width, height: size.height, copy, logo: true, edits: { logo: { anchor, hidden: false } } };
					let layers: DrawnLayer[];
					try {
						layers = sceneSvg(req).layers;
					} catch (error) {
						expect((error as Error).message, `${template} ${id} ${anchor}`).toMatch(/do(es)? not fit/);
						continue;
					}
					const logo = layers.find((y) => y.kind === 'logo');
					if (!logo) {
						found.push(`${template} ${id} ${anchor}: no logo drawn`);
						continue;
					}
					const clear = errorsOf(findingsOf({ template, sizeId: id, width: size.width, height: size.height, copy }, layers)).filter((f) => f.rule === 'logo-clear' || f.rule === 'logo-whole' || f.rule === 'safe-area');
					for (const f of clear) found.push(`${template} ${id} ${anchor}: ${f.message}`);
				}
			}
		}
		expect(found).toEqual([]);
	});
});
