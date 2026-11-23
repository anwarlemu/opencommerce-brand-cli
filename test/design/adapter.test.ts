import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { adapter, paint } from '../../src/design/adapter.js';
import type { DesignDoc, TemplateInfo } from '../../src/design/index.js';
import { rasterize, renderImages } from '../../src/image/render.js';
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
