import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { slideSvg, slideTypes } from '../src/assets/deck.js';
import { merchItems, renderItem, PX_PER_IN } from '../src/assets/merch.js';
import { checkFigmaValues } from '../src/figma/check.js';
import { figmaTokens, figmaTokenScripts } from '../src/figma/tokens.js';
import { loadImage, pngSize, PRESETS, renderImages } from '../src/image/render.js';
import { illustrate, subjects } from '../src/illustrate/render.js';
import { renderFramePng } from '../src/video/render.js';

const ROOT = join(import.meta.dirname, '..');
const BIN = join(ROOT, 'bin.js');
const sha = (b: Buffer | string) => createHash('sha256').update(b).digest('hex');
const run = (args: string[], cwd?: string) => execFileSync(process.execPath, [BIN, ...args], { encoding: 'utf8', cwd });
const fails = (args: string[]) => {
	try {
		execFileSync(process.execPath, [BIN, ...args, '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
	} catch (error) {
		const e = error as { status: number; stdout: string };
		return { status: e.status, body: JSON.parse(e.stdout) as { ok: boolean; error: string; suggestions?: string[] } };
	}
	throw new Error(`${args.join(' ')} did not fail`);
};

describe('image layouts from the brand tool', () => {
	it('renders hero, window, closing and cards at every size, PNG and SVG', { timeout: 240000 }, () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-layouts-'));
		try {
			for (const template of ['hero', 'window', 'closing', 'cards']) {
				const r = renderImages({ template, preset: 'all', format: 'both', sample: true, out: dir });
				// Every size but the profile picture, less the ones too small for the sample, which are named.
				expect(r.files.length + r.skipped.length * 2).toBe((Object.keys(PRESETS).length - 1) * 2);
				for (const s of r.skipped) expect(s.reason).toMatch(/Shorten the (code|cards)/);
				for (const f of r.files.filter((x) => x.format === 'png')) expect(pngSize(readFileSync(f.path.startsWith('/') ? f.path : join(process.cwd(), f.path)))).toEqual({ width: f.width, height: f.height });
				const svg = readFileSync(join(dir, `og-${template}.svg`), 'utf8');
				expect(svg).not.toContain('font-family');
				expect(svg).toContain('<path');
			}
			const custom = renderImages({ template: 'hero', sample: true, preset: '1600x900', out: join(dir, 'c.png') });
			expect(custom.files[0]).toMatchObject({ width: 1600, height: 900 });
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('is deterministic per seed, and the seed changes the field', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-seed-'));
		try {
			const a = renderImages({ template: 'hero', sample: true, preset: 'og', seed: 7, out: join(dir, 'a.png') });
			const b = renderImages({ template: 'hero', sample: true, preset: 'og', seed: 7, out: join(dir, 'b.png') });
			const c = renderImages({ template: 'hero', sample: true, preset: 'og', seed: 8, out: join(dir, 'c.png') });
			expect(sha(readFileSync(join(dir, 'a.png')))).toBe(sha(readFileSync(join(dir, 'b.png'))));
			expect(sha(readFileSync(join(dir, 'a.png')))).not.toBe(sha(readFileSync(join(dir, 'c.png'))));
			expect(a.files[0].bytes).toBe(b.files[0].bytes);
			expect(c.template).toBe('hero');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('takes copy, keys, a picture and a content file; rejects slots a template does not draw', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-copy-'));
		try {
			const shot = renderImages({ template: 'headline', title: 'Shot', preset: 'square', out: join(dir, 'shot.png') });
			const win = renderImages({ template: 'window', preset: 'og', title: 'Watch it buy', image: shot.files[0].path, label: 'shot.png', format: 'svg', out: join(dir, 'w.svg') });
			expect(readFileSync(win.files[0].path.startsWith('/') ? win.files[0].path : join(process.cwd(), win.files[0].path), 'utf8')).toContain('data:image/png;base64');
			const content = join(dir, 'cards.json');
			writeFileSync(content, JSON.stringify({ title: 'Three things', cards: ['Search\nAny store.', 'Check out\nEnd to end.', 'Track\nEvery order.'] }));
			expect(renderImages({ content, preset: 'square', out: join(dir, 'cards.png') }).template).toBe('cards');
			const closing = renderImages({ template: 'closing', preset: 'og', title: 'Give your agent a checkout', action: 'Get started', secondary: 'Read the docs', format: 'svg', out: join(dir, 'k.svg') });
			expect(readFileSync(closing.files[0].path.startsWith('/') ? closing.files[0].path : join(process.cwd(), closing.files[0].path), 'utf8')).toContain('Get started');
			expect(() => renderImages({ template: 'cards', preset: 'og', title: 'x', cards: 'a', chip: 'no' })).toThrow(/does not take --badge/);
			expect(() => renderImages({ template: 'headline', title: 'x', code: 'y' })).toThrow(/does not take --code/);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});
});

describe('deck', () => {
	it('draws every slide type at 1920x1080 and writes one PDF page per slide', { timeout: 120000 }, () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-deck-'));
		try {
			const shot = renderImages({ template: 'headline', title: 'Shot', preset: 'square', out: join(dir, 'a shot.png') }).files[0].path;
			const of = (type: string) => (type === 'image' ? { type, title: 'Watch it buy', image: 'a shot.png' } : { type, sample: true });
			for (const type of slideTypes()) expect(slideSvg(type === 'image' ? { type, title: 'Watch it buy', picture: loadImage(shot) } : { type, sample: true })).toContain('viewBox="0 0 1920 1080"');
			for (const type of slideTypes()) expect(() => slideSvg({ type })).toThrow(/needs/);
			const input = join(dir, 'deck.json');
			writeFileSync(input, JSON.stringify({ slides: slideTypes().map(of) }));
			const out = JSON.parse(run(['deck', '--input', input, '--out', join(dir, 'out'), '--json']));
			const pngs = out.files.filter((f: { format: string }) => f.format === 'png');
			expect(pngs).toHaveLength(slideTypes().length);
			for (const f of pngs) expect(pngSize(readFileSync(f.path))).toEqual({ width: 1920, height: 1080 });
			const pdf = readFileSync(join(dir, 'out', 'deck.pdf'));
			expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
			expect((pdf.toString('latin1').match(/\/Type \/Page\b/g) ?? []).length).toBe(slideTypes().length);
			const again = JSON.parse(run(['deck', '--input', input, '--out', join(dir, 'again'), '--format', 'pdf', '--json']));
			expect(again.files).toHaveLength(1);
			expect(sha(readFileSync(join(dir, 'again', 'deck.pdf')))).toBe(sha(pdf));
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('rejects unknown slide types and slots', () => {
		expect(fails(['deck', 'cvoer']).body.suggestions).toContain('cover');
		expect(() => slideSvg({ type: 'quote', title: 'x' })).toThrow(/does not take "title"/);
	});
});

describe('merch', () => {
	it('writes each item at its physical size with bleed, logos inside the safe area', { timeout: 120000 }, () => {
		for (const item of merchItems()) {
			for (const variant of item.variants) {
				const r = renderItem(item, { variant, dpi: 72, sample: true });
				expect(r.widthIn).toBe(item.size[0] + 2 * item.bleed);
				expect(r.svg).toContain(`width="${r.widthIn}in"`);
				expect(pngSize(r.png!)).toEqual({ width: Math.round(r.widthIn * 72), height: Math.round(r.heightIn * 72) });
				expect(r.png!.includes(Buffer.from('pHYs'))).toBe(true);
				const o = item.bleed * PX_PER_IN;
				const s = item.safe * PX_PER_IN;
				for (const p of r.placed) {
					// The sticker is the mark itself, cut along its own edge; everything else keeps to the safe area.
					if (item.cut) continue;
					expect(p.rect.x).toBeGreaterThanOrEqual(o + s - 0.5);
					expect(p.rect.y).toBeGreaterThanOrEqual(o + s - 0.5);
					expect(p.rect.x + p.rect.w).toBeLessThanOrEqual(o + item.size[0] * PX_PER_IN - s + 0.5);
					expect(p.rect.y + p.rect.h).toBeLessThanOrEqual(o + item.size[1] * PX_PER_IN - s + 0.5);
				}
				if (item.cut) expect(r.svg).toContain('id="CutContour"');
			}
		}
	});

	it('uses only the logo files as drawn and brand colors', () => {
		const tee = renderItem(merchItems().find((i) => i.id === 'tote')!, { png: false });
		const mark = readFileSync(join(ROOT, 'brand', 'logo', 'mark.svg'), 'utf8');
		expect(tee.svg).toContain('rx="7" fill="#2e3ae8"');
		expect(mark).toContain('fill="#2e3ae8"');
		const tokens = readFileSync(join(ROOT, 'brand', 'tokens.css'), 'utf8').toLowerCase();
		for (const hex of new Set((tee.svg!.match(/#[0-9a-fA-F]{6}\b/g) ?? []).map((h) => h.toLowerCase()))) expect(tokens).toContain(hex);
		expect(fails(['merch', 'tshirt']).status).toBe(1);
		expect(fails(['merch', 'tote', '--variant', 'blue']).body.error).toMatch(/Unknown variant/);
	});
});

describe('illustrate', () => {
	it('draws every subject as vector glyphs, the same bytes for the same seed', () => {
		for (const subject of subjects()) {
			const picture = subject === 'halftone' ? loadImage(join(ROOT, 'brand', 'logo', 'mark.svg')) : undefined;
			const one = illustrate({ subject, width: 1200, height: 800, seed: 5, picture, sample: true });
			const two = illustrate({ subject, width: 1200, height: 800, seed: 5, picture, sample: true });
			expect(one.svg).toBe(two.svg);
			expect(one.glyphs).toBeGreaterThan(20);
			expect(one.svg).toMatch(/<path id="g/);
			expect(one.svg).not.toContain('<text');
		}
		expect(() => illustrate({ subject: 'halftone' })).toThrow(/needs --image/);
		expect(fails(['illustrate', 'feild']).body.suggestions).toContain('field');
	});
});

describe('video', () => {
	it('renders layout and art frames and moves between frames', { timeout: 120000 }, () => {
		for (const template of ['hero', 'cards', 'field', 'mark']) {
			const a = renderFramePng({ template, size: 'square', sample: true }, 2);
			const b = renderFramePng({ template, size: 'square', sample: true }, 40);
			expect(pngSize(a)).toEqual({ width: 1080, height: 1080 });
			expect(sha(a)).not.toBe(sha(b));
			expect(sha(renderFramePng({ template, size: 'square', sample: true }, 40))).toBe(sha(b));
		}
	});

	it('writes a still and a webm', { timeout: 240000 }, () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-webm-'));
		try {
			const still = JSON.parse(run(['video', '--template', 'mark', '--size', 'square', '--still', '1', '--out', join(dir, 'm.png'), '--json']));
			expect(still.frame).toBe(30);
			expect(pngSize(readFileSync(join(dir, 'm.png')))).toEqual({ width: 1080, height: 1080 });
			const webm = JSON.parse(run(['video', '--template', 'social', '--size', 'square', '--title', 'Hello', '--out', join(dir, 'c.webm'), '--json']));
			expect(webm.files[0].format).toBe('webm');
			expect(readFileSync(join(dir, 'c.webm')).subarray(0, 4).toString('hex')).toBe('1a45dfa3');
			const again = JSON.parse(run(['video', '--template', 'social', '--size', 'square', '--title', 'Hello', '--out', join(dir, 'd.webm'), '--json']));
			expect(again.files[0].sha256).toBe(webm.files[0].sha256);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});
});

describe('figma', () => {
	it('writes tokens as variables and checks exported values', () => {
		const doc = figmaTokens();
		expect(doc.modes).toEqual(['Site']);
		expect(doc.variables.find((v) => v.css === '--ds-color-brand')?.type).toBe('COLOR');
		for (const s of figmaTokenScripts(doc)) expect(s.length).toBeLessThan(45000);
		const findings = checkFigmaValues('{"a":"#2E3AE8","b":"#123456"}');
		expect(findings.find((f) => f.value === '#2E3AE8')?.ok).toBe(true);
		expect(findings.find((f) => f.value === '#123456')?.nearest).toMatch(/^--ds-color-/);
	});

	it('prints MCP steps and exits 1 on unknown actions and off-brand files', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-figma-'));
		try {
			const push = JSON.parse(run(['figma', 'push', 'illustration', 'field', '--size', '400x300', '--json'], dir));
			expect(push.steps.map((s: { tool: string }) => s.tool)).toContain('create_session');
			expect(readdirSync(join(dir, 'figma')).some((f) => f.endsWith('.figma.svg'))).toBe(true);
			const pull = JSON.parse(run(['figma', 'pull', 'https://www.figma.com/design/AbCdEfGhIjKlMn/Test?node-id=1-2', '--json'], dir));
			expect(pull.nodeId).toBe('1:2');
			writeFileSync(join(dir, 'v.json'), '{"x":"#123456"}');
			expect(fails(['figma', 'check', join(dir, 'v.json')]).status).toBe(1);
			expect(fails(['figma', 'pusj']).body.suggestions).toContain('push');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});
});

describe('manifest and help', () => {
	it('lists every asset command, size, slot, subject, item and rule', () => {
		const m = JSON.parse(run(['describe', '--json']));
		for (const id of ['image', 'video', 'deck', 'merch', 'illustrate', 'figma tokens', 'figma push', 'figma pull', 'figma check']) expect(m.commands.map((c: { id: string }) => c.id)).toContain(id);
		expect(m.image.presets.map((p: { id: string }) => p.id)).toEqual(expect.arrayContaining(['og', 'square', 'portrait', 'story', 'landscape', 'x-banner', 'linkedin-banner']));
		expect(Object.keys(m.illustrate.subjects)).toEqual(subjects());
		expect(m.deck.slides).toHaveLength(slideTypes().length);
		expect(m.merch.lockups).toEqual(['brand/logo/lockup.svg', 'brand/logo/mark.svg']);
		expect(m.video.formats).toEqual(['mp4', 'webm']);
	});

	it('names the nearest command for a typo and keeps help rows apart', () => {
		const typo = fails(['imgae']);
		expect(typo.status).toBe(1);
		expect(typo.body.suggestions).toContain('image');
		for (const cmd of [[], ['image'], ['video'], ['deck'], ['merch'], ['illustrate'], ['figma']]) {
			const help = run([...cmd, '--help']);
			for (const line of help.split('\n')) {
				// An option or command row: its term and description are separated by at least two spaces.
				const m = /^ {2}(-{1,2}\S.*?|[a-z][\w-]*(?: \[[^\]]+\]| <[^>]+>| \[options\])*)( {2,})\S/.exec(line);
				if (/^ {2}-/.test(line) && !/ {2,}\S/.test(line.trim())) throw new Error(`help row runs into its description: ${line}`);
				if (m) expect(m[2].length).toBeGreaterThanOrEqual(2);
			}
		}
	});
});

