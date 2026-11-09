import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PRESETS, TEMPLATES, pngSize, renderImages, type TemplateId } from '../src/image/render.js';

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

	it('answers --help and writes JSON from the CLI', () => {
		const help = execFileSync(process.execPath, [BIN, 'image', '--help'], { encoding: 'utf8' });
		expect(help).toMatch(/Usage/);
		expect(help).toMatch(/headline/);
		expect(help).toMatch(/1200x630/);
		expect(execFileSync(process.execPath, [BIN, 'image', 'templates', '--help'], { encoding: 'utf8' })).toMatch(/Usage/);
		expect(execFileSync(process.execPath, [BIN, 'image', 'og', '--help'], { encoding: 'utf8' })).toMatch(/1200x630/);
		expect(execFileSync(process.execPath, [BIN, 'image', 'post', '--help'], { encoding: 'utf8' })).toMatch(/square/);
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
