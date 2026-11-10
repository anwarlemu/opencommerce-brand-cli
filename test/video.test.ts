import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { pngSize } from '../src/image/render.js';
import { VIDEO_SIZES, VIDEO_TEMPLATES } from '../src/video/motion.js';
import { renderFramePng, renderVideo } from '../src/video/render.js';

const ROOT = join(import.meta.dirname, '..');
const BIN = join(ROOT, 'bin.js');

const copy = {
	social: { title: 'Open router for commerce', text: 'One endpoint for agents to search, check out and track orders.' },
	announcement: { label: 'Now available', title: 'Agents can buy from any store', action: 'Get started' },
	product: { title: 'One request', label: 'order.ts', text: 'const order = {\n  sku: "cup",\n}\nreturn order\n' },
};

describe('video', () => {
	it('rejects unknown templates, sizes and missing copy', () => {
		expect(() => renderVideo({ template: 'reel', size: 'square', title: 'Hello' }, { frames: 1 })).toThrow(/Unknown template/);
		expect(() => renderVideo({ template: 'social', size: 'story', title: 'Hello' }, { frames: 1 })).toThrow(/Unknown size/);
		expect(() => renderVideo({ template: 'social', title: 'Hello' }, { frames: 1 })).toThrow(/Missing size/);
		expect(() => renderVideo({ size: 'square', title: 'Hello' }, { frames: 1 })).toThrow(/Missing template/);
		expect(() => renderVideo({ template: 'social', size: 'square' }, { frames: 1 })).toThrow(/needs --title/);
		expect(() => renderVideo({ template: 'product', size: 'square', title: 'Hello' }, { frames: 1 })).toThrow(/needs --text/);
		expect(() => renderVideo({ template: 'social', size: 'square', title: 'Hello', ground: 'blue' }, { frames: 1 })).toThrow(/Unknown ground/);
		expect(() => renderVideo({ template: 'social', size: 'square', title: 'Hello', by: 'Ada' }, { frames: 1 })).toThrow(/do not take --by/);
		expect(() => renderVideo({ template: 'announcement', size: 'square', title: 'Hello', out: 'clip.gif' }, { frames: 1 })).toThrow(/\.mp4/);
	});

	it('renders every template at every size as a PNG of that size', { timeout: 120000 }, () => {
		for (const template of VIDEO_TEMPLATES) {
			for (const [size, box] of Object.entries(VIDEO_SIZES)) {
				const png = renderFramePng({ template: template.id, size, ...copy[template.id] }, 0, 1);
				expect(pngSize(png)).toEqual({ width: box.width, height: box.height });
			}
		}
	});

	it('encodes the same bytes twice and moves between the first and last frame', { timeout: 120000 }, () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-video-'));
		try {
			const input = { template: 'social', size: 'square', ...copy.social };
			const once = renderVideo({ ...input, out: join(dir, 'a.mp4') }, { frames: 4 });
			const twice = renderVideo({ ...input, out: join(dir, 'b.mp4') }, { frames: 4 });
			expect(once.files[0].sha256).toBe(twice.files[0].sha256);
			expect(once.width).toBe(1080);
			expect(once.height).toBe(1080);
			expect(once.fps).toBe(12);
			expect(readFileSync(join(dir, 'a.mp4')).subarray(4, 8).toString('ascii')).toBe('ftyp');
			expect(once.framesSha256.first).not.toBe(once.framesSha256.last);
			const announcement = renderVideo({ template: 'announcement', size: 'vertical', ...copy.announcement, out: join(dir, 'announcement.mp4') }, { frames: 2 });
			expect(announcement.height).toBe(1920);
			expect(announcement.files[0].sha256).toBe(renderVideo({ template: 'announcement', size: 'vertical', ...copy.announcement, out: join(dir, 'announcement-2.mp4') }, { frames: 2 }).files[0].sha256);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('lists templates from the CLI and rejects an unknown template', () => {
		const listed = JSON.parse(execFileSync(process.execPath, [BIN, 'video', 'templates', '--json'], { encoding: 'utf8' }));
		expect(listed.templates.map((item: { id: string }) => item.id)).toEqual(['social', 'announcement', 'product']);
		expect(listed.sizes.map((item: { id: string }) => item.id)).toEqual(['square', 'vertical', 'landscape']);
		expect(listed.renderer.fps).toBe(12);
		expect(listed.renderer.frames).toBe(24);
		let failed = false;
		try {
			execFileSync(process.execPath, [BIN, 'video', '--template', 'story', '--size', 'square', '--title', 'Hello', '--json'], { encoding: 'utf8' });
		} catch (error) {
			failed = true;
			const body = JSON.parse(String((error as { stdout?: string }).stdout)) as { ok: boolean; error: string };
			expect(body.ok).toBe(false);
			expect(body.error).toMatch(/Unknown template/);
		}
		expect(failed).toBe(true);
		const dir = mkdtempSync(join(tmpdir(), 'ds-video-cli-'));
		try {
			const stdout = execFileSync(process.execPath, [BIN, 'video', '--template', 'social', '--size', 'square', '--title', 'Hello', '--text', 'One line.', '--out', join(dir, 'clip.mp4'), '--json'], { encoding: 'utf8' });
			const parsed = JSON.parse(stdout);
			expect(parsed.ok).toBe(true);
			expect(parsed).toMatchObject({ template: 'social', size: 'square', width: 1080, height: 1080, frames: 24, fps: 12 });
			expect(parsed.files[0].format).toBe('mp4');
			expect(readFileSync(join(dir, 'clip.mp4')).subarray(4, 8).toString('ascii')).toBe('ftyp');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it('re-renders each committed sample to the same bytes', { timeout: 120000 }, () => {
		const dir = join(ROOT, 'samples', 'videos');
		const jobs = {
			'square-social': { template: 'social', size: 'square', title: 'Open router for commerce', text: 'One endpoint for agents to search, check out and track orders.' },
			'vertical-announcement': { template: 'announcement', size: 'vertical', label: 'Now available', title: 'Agents can buy from any store', action: 'Get started' },
			'landscape-product': { template: 'product', size: 'landscape', title: 'One request', label: 'order.ts', text: 'const order = {\n  sku: "cup",\n}\nreturn order\n' },
		} as const;
		const tmp = mkdtempSync(join(tmpdir(), 'ds-video-sample-'));
		try {
			for (const [name, input] of Object.entries(jobs)) {
				const committed = readFileSync(join(dir, `${name}.mp4`));
				expect(committed.subarray(4, 8).toString('ascii')).toBe('ftyp');
				const again = renderVideo({ ...input, out: join(tmp, `${name}.mp4`) });
				expect(again.files[0].sha256).toBe(createHash('sha256').update(committed).digest('hex'));
				const frame = renderFramePng(input, again.frames - 1, again.frames);
				expect(frame).toEqual(readFileSync(join(dir, `${name}.png`)));
				const size = name.startsWith('square') ? VIDEO_SIZES.square : name.startsWith('vertical') ? VIDEO_SIZES.vertical : VIDEO_SIZES.landscape;
				expect(pngSize(frame)).toEqual({ width: size.width, height: size.height });
			}
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});
});
