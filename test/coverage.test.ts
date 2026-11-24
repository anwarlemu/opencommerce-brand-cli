import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { slideSvg, slideTypes } from '../src/assets/deck.js';
import { itemSvg, merchItems } from '../src/assets/merch.js';
import { iconSet } from '../src/commands/icons.js';
import { EMAILS, renderEmail, type EmailId } from '../src/commands/email.js';
import { pngSize } from '../src/image/load.js';
import { renderFramePng, renderVideo } from '../src/video/render.js';

// Everything the CLI makes beyond the image templates draws, keeps the brand's rules and invents no words.

describe('coverage', () => {
	it('writes the icon set from the mark', () => {
		const files = iconSet();
		expect(Object.keys(files).sort()).toEqual(['apple-touch-icon.png', 'favicon-16.png', 'favicon-32.png', 'favicon.ico', 'favicon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'og-default.png', 'site.webmanifest']);
		expect(pngSize(files['icon-512.png'] as Buffer)).toEqual({ width: 512, height: 512 });
		expect(pngSize(files['og-default.png'] as Buffer)).toEqual({ width: 1200, height: 630 });
		const ico = files['favicon.ico'] as Buffer;
		expect(ico.readUInt16LE(2)).toBe(1);
		expect(ico.readUInt16LE(4)).toBe(3);
	});

	it('writes every email with only the words given', () => {
		for (const id of Object.keys(EMAILS) as EmailId[]) {
			const copy: Record<string, string> = { headline: 'Agents can buy from any store', items: id === 'receipt' ? 'Cup | $12\nTotal | $12' : 'Faster\nOne request.\n\nNew stores\nTwelve more.', action: 'Get started', href: 'https://example.com/start' };
			const r = renderEmail(id, Object.fromEntries(Object.entries(copy).filter(([k]) => (EMAILS[id].takes as readonly string[]).includes(k))));
			expect(r.html).toContain('<table role="presentation"');
			expect(r.html).toContain('Agents can buy from any store');
			expect(r.html).not.toMatch(/Subscribe|Unsubscribe|Learn more|Read more/);
			expect(r.text).toContain('Agents can buy from any store');
		}
		expect(() => renderEmail('announcement', {})).toThrow(/needs --headline/);
		expect(() => renderEmail('announcement', { headline: 'x', items: 'y' })).toThrow(/does not take --items/);
	});

	it('draws every print item, with the words given and nothing more', { timeout: 120_000 }, () => {
		for (const item of merchItems()) {
			const r = itemSvg(item, { sample: true });
			for (const y of r.layers.filter((l) => l.text && !l.bleeds)) {
				expect(y.box.x, `${item.id} ${y.id}`).toBeGreaterThanOrEqual(r.safe.x - 1);
				expect(y.box.x + y.box.w, `${item.id} ${y.id}`).toBeLessThanOrEqual(r.safe.x + r.safe.w + 1);
				expect(y.text!.drawn.replace(/\s+/g, ' ')).toBe(y.text!.asked.replace(/\s+/g, ' '));
			}
		}
		expect(() => itemSvg(merchItems().find((i) => i.id === 'certificate')!, {})).toThrow(/needs --headline/);
		const bare = itemSvg(merchItems().find((i) => i.id === 'letterhead-letter')!, {});
		expect(bare.layers.filter((l) => l.text)).toEqual([]);
	});

	it('draws the block slides', () => {
		for (const type of ['agenda', 'team', 'timeline', 'chart', 'comparison', 'qa']) {
			expect(slideTypes()).toContain(type);
			expect(slideSvg({ type, sample: true })).toContain('viewBox="0 0 1920 1080"');
			expect(() => slideSvg({ type })).toThrow(/needs/);
		}
	});

	it('plays the logo reveal and counts a figure, and writes a GIF', { timeout: 120_000 }, () => {
		const a = renderFramePng({ template: 'logo', size: 'square' }, 2);
		const b = renderFramePng({ template: 'logo', size: 'square' }, 60);
		expect(a.equals(b)).toBe(false);
		expect(pngSize(b)).toEqual({ width: 1080, height: 1080 });
		const s = renderFramePng({ template: 'stat', size: 'landscape', headline: '1,200+', body: 'stores' }, 89);
		expect(pngSize(s)).toEqual({ width: 1920, height: 1080 });
		expect(() => renderFramePng({ template: 'stat', size: 'square' }, 1)).toThrow(/needs --headline/);
		const dir = mkdtempSync(join(tmpdir(), 'oc-gif-'));
		const g = renderVideo({ template: 'social', size: 'square', headline: 'Hello', out: join(dir, 'a.gif') });
		expect(g.files[0].format).toBe('gif');
		expect(readFileSync(join(dir, 'a.gif')).subarray(0, 6).toString('latin1')).toBe('GIF89a');
		writeFileSync(join(dir, 'ok'), '');
	});
});
