import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { adapter, paint } from '../../src/design/adapter.js';
import type { DesignDoc, TemplateInfo } from '../../src/design/index.js';
import { rasterize, renderImages } from '../../src/image/render.js';
import { describe, expect, it } from 'vitest';
import { runDesign } from '../../src/design/index.js';
import { designConformance, LONG, SHORT } from './conformance.js';

const dir = mkdtempSync(join(tmpdir(), 'oc-design-'));
const picture = join(dir, 'a shot.png');
writeFileSync(picture, rasterize('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700"><rect width="1200" height="700" fill="#CCDBFF"/></svg>'));

const CODE = 'const order = {\n  sku: "cup", // one\n};';
const words = (long: boolean) => (t: TemplateInfo) => {
	const of: Record<string, string> = {
		headline: long ? LONG : SHORT,
		body: t.id === 'quote' || t.id === 'slide-quote' ? (long ? LONG : SHORT) : long ? 'Search, check out and track the order from one endpoint' : 'One line about it',
		badge: long ? 'Now available to every merchant' : 'New',
		action: long ? 'Get started today' : 'Start',
		secondary: long ? 'Read the documentation' : 'Docs',
		code: CODE,
		label: 'order.ts',
		by: long ? 'a head of engineering at Acme' : 'Acme',
		cards: long ? 'Search any store\nFind a product at any online store.\n\nCheck out\nCarts, payment and confirmation.\n\nTrack it\nEvery order reports back.' : 'Search\nAny store.\n\nTrack\nEvery order.',
		footer: 'acme.example',
		number: '01',
		stat: long ? '1,000,000+' : '42%',
		url: 'acme.example',
		value: 'Mon 12, Tue 18, Wed 24',
		name: 'Alex Acme',
		detail: 'Engineer, Acme',
		rows: 'Step | Before\nCheckout | One request',
	};
	return Object.fromEntries(t.copy.filter((c) => of[c.id] !== undefined && !(t.images.some((i) => i.required) && c.id === 'code')).map((c) => [c.id, of[c.id]]));
};

designConformance(adapter(), {
	paint,
	picture,
	short: words(false),
	long: words(true),
	timeout: 300_000,
	async plain(doc: DesignDoc) {
		if (doc.kind !== 'image') return undefined;
		const out = join(dir, 'plain.png');
		renderImages({ template: doc.template.startsWith('frame') ? 'frame' : doc.template, size: doc.size.id, theme: doc.theme, ...doc.copy, ...(doc.images.picture ? { image: picture } : {}), out });
		return readFileSync(out);
	},
});

describe('edits inside this brand\'s layouts', () => {
	const run = async (cwd: string, ...argv: string[]) => {
		const lines: string[] = [];
		const code = await runDesign([...argv, '--json'], adapter(), { cwd, bin: 'x', out: (s) => lines.push(s), err: (s) => lines.push(s), paint });
		return { code, data: JSON.parse(lines.join('')) as Record<string, any> };
	};
	const fresh = async (template = 'hero', ...more: string[]) => {
		const cwd = mkdtempSync(join(tmpdir(), 'oc-session-'));
		const r = await run(cwd, 'new', template, '--set', template === 'quote' ? 'body=One endpoint for every online store' : 'headline=One endpoint for every online store', ...more, '-o', 'a');
		expect(r.code, JSON.stringify(r.data)).toBe(0);
		return cwd;
	};
	const layer = (r: { data: Record<string, any> }, id: string) => r.data.layers.find((l: { id: string }) => l.id === id);

	it('wraps a bigger headline again, and names the most that fits when it is too much', { timeout: 60_000 }, async () => {
		const cwd = await fresh('hero', '--size', 'x-banner', '--set', 'body=Search, check out and track orders.', '--set', 'badge=Product by Agentcard', '--set', 'action=Get started');
		const before = readFileSync(join(cwd, 'a.design.json'), 'utf8');
		const big = await run(cwd, 'revise', 'a', 'bigger headline');
		expect(big.code).toBe(0);
		expect(layer(big, 'headline').textSize).toBeGreaterThan(80);
		const far = await run(cwd, 'edit', 'a', '--layer', 'headline.scale=1.5');
		expect(far.code).toBe(1);
		expect(far.data.error.message).toMatch(/too long to be 1\.5 times its size here: it fits at [\d.]+ to 1\.[0-4]\d*/);
		expect((await run(cwd, 'undo', 'a')).code).toBe(0);
		expect(JSON.parse(readFileSync(join(cwd, 'a.design.json'), 'utf8')).layers).toEqual(JSON.parse(before).layers);
	});

	it('holds a nudge where there is room, and says how far it can go', { timeout: 60_000 }, async () => {
		const cwd = await fresh('hero', '--size', 'x-banner');
		const at = readFileSync(join(cwd, 'a.design.json'), 'utf8');
		const r = await run(cwd, 'edit', 'a', '--layer', 'headline.dx=-0.45');
		expect(r.code).toBe(1);
		expect(r.data.error.message).toMatch(/The furthest is headline\.dx -0\.\d+/);
		expect(readFileSync(join(cwd, 'a.design.json'), 'utf8')).toBe(at);
	});

	it('carries edits to other sizes, laid out again', { timeout: 60_000 }, async () => {
		const cwd = await fresh('closing', '--set', 'action=Get started');
		expect((await run(cwd, 'revise', 'a', 'bigger headline, logo bottom right')).code).toBe(0);
		const r = await run(cwd, 'sizes', 'a', '--to', 'og,square,story,x-banner,linkedin-banner,youtube');
		expect(r.code, JSON.stringify(r.data.blocked)).toBe(0);
		expect(r.data.made).toHaveLength(6);
	});

	it('shows and hides parts, and moves the block by its headline', { timeout: 60_000 }, async () => {
		const cwd = await fresh('hero', '--set', 'body=Any store.', '--set', 'code=const a = 1;');
		expect(layer(await run(cwd, 'show', 'a'), 'logo')).toBeUndefined();
		const shown = await run(cwd, 'revise', 'a', 'show the logo, hide the window, left align the headline');
		expect(shown.code, JSON.stringify(shown.data)).toBe(0);
		expect(layer(shown, 'logo')).toBeTruthy();
		expect(layer(shown, 'code')).toBeUndefined();
		expect(Math.abs(layer(shown, 'headline').box.x - layer(shown, 'body').box.x)).toBeLessThan(6);
	});

	it('puts a window on the other side, and makes room for a bigger one', { timeout: 60_000 }, async () => {
		const cwd = await fresh('window', '--image', `picture=${picture}`);
		const right = layer(await run(cwd, 'show', 'a'), 'window').box;
		const left = await run(cwd, 'revise', 'a', 'window left');
		expect(left.code, JSON.stringify(left.data)).toBe(0);
		expect(layer(left, 'window').box.x).toBeLessThan(right.x / 2);
		const big = await run(cwd, 'revise', 'a', 'bigger window');
		expect(big.code, JSON.stringify(big.data)).toBe(0);
		expect(layer(big, 'window').box.w).toBeGreaterThan(right.w * 1.15);
	});

	it('makes and revises print files, illustrations and clips', { timeout: 120_000 }, async () => {
		const cwd = mkdtempSync(join(tmpdir(), 'oc-kinds-'));
		expect((await run(cwd, 'new', 'merch-sticker', '-o', 's')).code).toBe(0);
		expect((await run(cwd, 'new', 'merch-tee-back', '--set', 'headline=Any store', '-o', 't')).code).toBe(0);
		expect((await run(cwd, 'revise', 't', 'headline "Every store", another version')).code).toBe(0);
		expect((await run(cwd, 'new', 'illustration-field', '--size', 'x-banner', '-o', 'f')).code).toBe(0);
		expect((await run(cwd, 'variants', 'f', '--by', 'seed', '--count', '2')).code).toBe(0);
		expect((await run(cwd, 'new', 'video-closing', '--set', 'headline=Any store', '-o', 'v')).code).toBe(0);
		const r = await run(cwd, 'revise', 'v', 'mist theme, as vertical');
		expect(r.code, JSON.stringify(r.data)).toBe(0);
		expect((await run(cwd, 'new', 'slide-bullets', '--set', 'cards=One\nA line.\n\nTwo', '-o', 'b')).code).toBe(0);
	});
});

describe('compose and pages', () => {
	const run = async (cwd: string, ...argv: string[]) => {
		const lines: string[] = [];
		const code = await runDesign([...argv, '--json'], adapter(), { cwd, bin: 'x', out: (s) => lines.push(s), err: (s) => lines.push(s), paint });
		return { code, data: JSON.parse(lines.join('')) as Record<string, any> };
	};

	it('builds a graphic no template anticipated from blocks, and refuses what breaks a rule', { timeout: 120_000 }, async () => {
		const cwd = mkdtempSync(join(tmpdir(), 'oc-compose-'));
		expect((await run(cwd, 'new', 'compose', '--size', 'og', '-o', 'c')).code).toBe(0);
		expect((await run(cwd, 'compose', 'add', 'c', 'headline', 'Agents can buy from any store', '--at', '0,1,12,3')).code).toBe(0);
		expect((await run(cwd, 'compose', 'add', 'c', 'stat', '42%', '--set', 'label=of checkouts in one request', '--place', 'bottom-left')).code).toBe(0);
		const chart = await run(cwd, 'compose', 'add', 'c', 'chart', '--set', 'value=Mon 12, Tue 18, Wed 15, Thu 24', '--place', 'bottom-right');
		expect(chart.code, JSON.stringify(chart.data)).toBe(0);
		expect((await run(cwd, 'compose', 'add', 'c', 'art')).code).toBe(0);
		expect((await run(cwd, 'revise', 'c', 'send the art to the back, add a logo top left')).code).toBe(0);
		const layers = (await run(cwd, 'show', 'c')).data.layers.map((l: { id: string }) => l.id);
		expect(layers).toEqual(expect.arrayContaining(['art', 'headline', 'stat', 'chart', 'logo']));
		// A block too small for its words is refused with what to do.
		const small = await run(cwd, 'compose', 'add', 'c', 'body', 'Search, check out and track the order from one endpoint, at any store', '--at', '5,4,1,1');
		expect(small.code).toBe(1);
		expect(small.data.error.message).toMatch(/does not fit its cells/);
		expect((await run(cwd, 'sizes', 'c', '--to', 'square,story')).code).toBe(0);
	});

	it('writes a page from an outline in React and plain HTML, with only the outline\'s words', { timeout: 60_000 }, async () => {
		const cwd = mkdtempSync(join(tmpdir(), 'oc-page-'));
		const outline = { title: 'Acme', sections: [{ type: 'hero', copy: { title: 'One endpoint for every online store', action: 'Get started', 'action-href': '/start' } }, { type: 'features', copy: { title: 'Built for agents' }, items: [{ title: 'Every store' }, { title: 'Checkout' }] }, { type: 'cta', copy: { title: 'Give your agent a checkout' } }] };
		writeFileSync(join(cwd, 'o.json'), JSON.stringify(outline));
		const r = await run(cwd, 'page', 'compose', 'o.json', '-o', 'out');
		expect(r.code, JSON.stringify(r.data)).toBe(0);
		const tsx = readFileSync(join(cwd, 'out', 'page.tsx'), 'utf8');
		const html = readFileSync(join(cwd, 'out', 'index.html'), 'utf8');
		for (const words of ['One endpoint for every online store', 'Built for agents', 'Give your agent a checkout']) {
			expect(tsx).toContain(words);
			expect(html).toContain(words);
		}
		expect(tsx).toContain('from "@/components/site/hero"');
		writeFileSync(join(cwd, 'bad.json'), JSON.stringify({ sections: [{ type: 'hero', copy: { subtitle: 'no title' } }] }));
		expect((await run(cwd, 'page', 'compose', 'bad.json')).data.error.message).toMatch(/needs "title"/);
	});
});
