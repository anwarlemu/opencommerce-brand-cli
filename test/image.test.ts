import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PRESETS, TEMPLATES, loadImage, pngSize, renderImages, type TemplateId } from '../src/image/render.js';

const ROOT = join(import.meta.dirname, '..');
const BIN = join(ROOT, 'bin.js');

const copy: Record<TemplateId, { title?: string; text?: string; label?: string; by?: string; action?: string }> = {
	headline: { title: 'Open router for commerce' },
	lead: { title: 'Open router for commerce', text: 'One endpoint for agents to search, check out and track orders.' },
	frame: { title: 'Watch it in action', label: 'agent.ts' },
	quote: { text: 'The checkout is one request, and the order comes back as data.', by: 'A merchant' },
	announcement: { label: 'Now available', title: 'Agents can buy from any store', action: 'Get started' },
};

describe('image', () => {
	it('renders every template at every preset as a PNG of the right size', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-image-'));
		try {
			for (const template of TEMPLATES) {
				for (const [preset, size] of Object.entries(PRESETS)) {
					const result = renderImages({ ...copy[template.id], template: template.id, preset, format: 'png', out: join(dir, `${preset}-${template.id}.png`) });
					expect(result.files).toHaveLength(1);
					expect(result.template).toBe(template.id);
					const file = result.files[0];
					expect(file.width).toBe(size.width);
					expect(file.height).toBe(size.height);
					const buf = readFileSync(join(dir, `${preset}-${template.id}.png`));
					expect(pngSize(buf)).toEqual({ width: size.width, height: size.height });
					expect(buf.length).toBeGreaterThan(1000);
				}
			}
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('writes SVG with the copy in the description, and accepts a content file', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-image-'));
		try {
			const content = join(dir, 'card.json');
			writeFileSync(content, JSON.stringify({ title: 'From a file', text: 'Supporting line from the file.' }));
			const result = renderImages({ content, preset: 'og', format: 'both', out: dir });
			expect(result.template).toBe('lead');
			expect(result.files.map((file) => file.format).sort()).toEqual(['png', 'svg']);
			const svg = readFileSync(join(dir, 'og-lead.svg'), 'utf8');
			expect(svg).toContain('width="1200"');
			expect(svg).toContain('height="630"');
			expect(svg).toContain('From a file');
			expect(svg).toContain('<path');
			expect(pngSize(readFileSync(join(dir, 'og-lead.png')))).toEqual({ width: 1200, height: 630 });
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('places a screenshot in the frame and renders code in a dark window', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-image-'));
		try {
			const shot = renderImages({ template: 'headline', title: 'Inside', preset: 'square', out: join(dir, 'shot.png') });
			const framed = renderImages({ template: 'frame', image: shot.files[0].path, label: 'shot.png', preset: 'landscape', out: join(dir, 'framed.png') });
			expect(pngSize(readFileSync(framed.files[0].path))).toEqual({ width: 1200, height: 675 });
			const coded = renderImages({ template: 'frame', label: 'order.ts', text: 'const order = {\n  sku: "cup",\n}\nreturn order\n', preset: 'og', format: 'svg', out: join(dir, 'code.svg') });
			const svg = readFileSync(coded.files[0].path, 'utf8');
			expect(svg).toContain('order.ts');
			expect(svg).not.toContain('font-family');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('rejects an unknown template and a headline with no title', () => {
		expect(() => renderImages({ template: 'banner', title: 'Hello' })).toThrow(/Unknown template/);
		expect(() => renderImages({ template: 'headline' })).toThrow(/needs --title/);
		expect(() => renderImages({ preset: 'story', title: 'Hello' })).toThrow(/Unknown preset/);
	});

	it('rejects an --out file that is not a png or an svg', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-image-out-'));
		try {
			const out = join(dir, 'card.jpg');
			expect(() => renderImages({ title: 'Hello', out })).toThrow(/--out must be a \.png or \.svg/);
			expect(existsSync(out)).toBe(false);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('reads a JPEG that has a restart marker before the frame', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-image-jpeg-'));
		try {
			const file = join(dir, 'shot.jpg');
			// SOI, RST0 (no length), a padding FF, then SOF0 for 200x100, then EOI.
			writeFileSync(file, Buffer.from([0xff, 0xd8, 0xff, 0xd0, 0xff, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x64, 0x00, 0xc8, 0x01, 0x01, 0x11, 0x00, 0xff, 0xd9]));
			expect(loadImage(file)).toMatchObject({ width: 200, height: 100, mime: 'image/jpeg' });
			writeFileSync(file, Buffer.from([0xff, 0xd8, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 0x02, 0x01, 0x01, 0x11, 0x00, 0xff, 0xd9]));
			expect(loadImage(file)).toMatchObject({ width: 2, height: 1, mime: 'image/jpeg' });
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('keeps a long announcement label and key inside the canvas', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-image-fit-'));
		try {
			const result = renderImages({
				template: 'announcement',
				preset: 'square',
				format: 'svg',
				title: 'Agents can buy from any store',
				label: 'Now available to every merchant that wants agents to check out in one request',
				action: 'Get started with the router and keep this key on the canvas please',
				out: join(dir, 'long.svg'),
			});
			const svg = readFileSync(join(dir, 'long.svg'), 'utf8');
			const width = result.files[0].width;
			const height = result.files[0].height;
			const rects = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)];
			expect(rects.length).toBeGreaterThan(0);
			for (const match of rects) {
				const x = Number(match[1]);
				const y = Number(match[2]);
				const w = Number(match[3]);
				const h = Number(match[4]);
				expect(x).toBeGreaterThanOrEqual(0);
				expect(y).toBeGreaterThanOrEqual(0);
				expect(x + w).toBeLessThanOrEqual(width + 0.5);
				expect(y + h).toBeLessThanOrEqual(height + 0.5);
			}
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('answers --help and writes JSON from the CLI', () => {
		const help = execFileSync(process.execPath, [BIN, 'image', '--help'], { encoding: 'utf8' });
		expect(help).toMatch(/Usage/);
		expect(help).toMatch(/headline/);
		expect(help).toMatch(/1200x630/);
		expect(execFileSync(process.execPath, [BIN, 'image', 'templates', '--help'], { encoding: 'utf8' })).toMatch(/Usage/);
		expect(execFileSync(process.execPath, [BIN, 'image', 'og', '--help'], { encoding: 'utf8' })).toMatch(/1200x630/);
		const postHelp = execFileSync(process.execPath, [BIN, 'image', 'post', '--help'], { encoding: 'utf8' });
		expect(postHelp).toMatch(/square/);
		expect(postHelp).toMatch(/--preset/);
		const listed = JSON.parse(execFileSync(process.execPath, [BIN, 'image', 'templates', '--json'], { encoding: 'utf8' }));
		expect(listed.presets.map((preset: { id: string }) => preset.id)).toEqual(['og', 'square', 'portrait', 'landscape']);
		expect(listed.templates).toHaveLength(5);
		const dir = mkdtempSync(join(tmpdir(), 'ds-image-cli-'));
		try {
			const stdout = execFileSync(process.execPath, [BIN, 'image', '--preset', '1200x675', '--template', 'headline', '--title', 'Hello', '--out', join(dir, 'card.png'), '--json'], { encoding: 'utf8' });
			const parsed = JSON.parse(stdout);
			expect(parsed.ok).toBe(true);
			expect(parsed.files[0]).toMatchObject({ width: 1200, height: 675, format: 'png', template: 'headline' });
			expect(pngSize(readFileSync(parsed.files[0].path.startsWith('/') ? parsed.files[0].path : join(ROOT, parsed.files[0].path)))).toEqual({ width: 1200, height: 675 });
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('defaults image post to square and keeps a preset that was passed', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-image-post-'));
		const run = (args: string[]) => JSON.parse(execFileSync(process.execPath, [BIN, ...args, '--title', 'Hello', '--out', join(dir, 'card.png'), '--json'], { encoding: 'utf8' })) as { files: { width: number; height: number; preset: string }[] };
		try {
			expect(run(['image', 'post']).files[0]).toMatchObject({ width: 1080, height: 1080, preset: 'square' });
			expect(run(['image', 'post', '--preset', 'landscape']).files[0]).toMatchObject({ width: 1200, height: 675, preset: 'landscape' });
			expect(run(['image', '--preset', 'portrait', 'post']).files[0]).toMatchObject({ width: 1080, height: 1350, preset: 'portrait' });
			expect(run(['image', 'og']).files[0]).toMatchObject({ width: 1200, height: 630, preset: 'og' });
			let failed = false;
			try {
				execFileSync(process.execPath, [BIN, 'image', 'og', '--preset', 'square', '--title', 'Hello', '--json'], { encoding: 'utf8' });
			} catch (error) {
				failed = true;
				const stdout = String((error as { stdout?: string }).stdout ?? '');
				const parsed = JSON.parse(stdout) as { ok: boolean; error: string };
				expect(parsed.ok).toBe(false);
				expect(parsed.error).toMatch(/1200x630/);
			}
			expect(failed).toBe(true);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('keeps the committed samples at the preset sizes', () => {
		const dir = join(ROOT, 'samples', 'images');
		for (const name of ['og-headline.png', 'og-lead.png', 'og-quote.png', 'og-announcement.png', 'og-frame.png', 'og-frame-code.png', 'square-announcement.png', 'portrait-quote.png', 'landscape-lead.png']) {
			const preset = name.startsWith('square') ? 'square' : name.startsWith('portrait') ? 'portrait' : name.startsWith('landscape') ? 'landscape' : 'og';
			const size = pngSize(readFileSync(join(dir, name)));
			expect(size).toEqual({ width: PRESETS[preset].width, height: PRESETS[preset].height });
		}
		expect(readFileSync(join(dir, 'og-headline.svg'), 'utf8')).toContain('Open router for commerce');
	});
});
