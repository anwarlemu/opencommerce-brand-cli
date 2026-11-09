import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getFaces, ratios, textPath } from '../src/image/fonts.js';
import { paint } from '../src/image/paint.js';
import { rasterize, renderImages } from '../src/image/render.js';

// Review stills for the image command. Words are the product's own: search, check out, track.

const out = join(import.meta.dirname, '..', 'samples', 'images');
mkdirSync(out, { recursive: true });

function productShot() {
	const colors = paint();
	const { display, sans } = getFaces();
	const width = 960;
	const height = 420;
	const rows: [string, string][] = [
		['Search', 'Any store in the catalog'],
		['Check out', 'One request, then the order'],
		['Track', 'The shipment, from the same endpoint'],
	];
	const rowH = 108;
	const top = Math.round((height - rowH * rows.length) / 2);
	const parts = [`<rect width="${width}" height="${height}" fill="${colors.white}"/>`];
	rows.forEach(([title, line], index) => {
		const y = top + index * rowH;
		const titleSize = 32;
		const lineSize = 18;
		const { cap, desc } = ratios(display);
		const baseline = y + 28 + cap * titleSize;
		parts.push(`<rect x="72" y="${Math.round(y + 30)}" width="14" height="14" rx="3" fill="${colors.brand}"/>`);
		parts.push(textPath(display, title, 104, baseline, titleSize, colors.trackingTight, colors.ink));
		const subBase = baseline + (desc * titleSize) + 8 + ratios(sans).cap * lineSize;
		parts.push(textPath(sans, line, 104, subBase, lineSize, 0, colors.secondary));
		if (index < rows.length - 1) parts.push(`<line x1="104" y1="${y + rowH - 8}" x2="${width - 72}" y2="${y + rowH - 8}" stroke="${colors.rule}" stroke-width="1"/>`);
	});
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${parts.join('')}</svg>`;
	return rasterize(svg);
}

const shot = join(tmpdir(), 'ds-product-shot.png');
writeFileSync(shot, productShot());

const code = ['const order = {', '  store: "north",', '  sku: "cup",', '  qty: 2,', '}', '', 'return order'].join('\n');

const jobs = [
	{ preset: 'og', template: 'headline', title: 'Open router for commerce', format: 'both' },
	{ preset: 'og', template: 'lead', title: 'Open router for commerce', text: 'One endpoint for agents to search, check out and track orders at any store.' },
	{ preset: 'og', template: 'quote', label: 'From the docs', text: 'The checkout is one request, and the order comes back as data.', by: 'Agentcard' },
	{ preset: 'og', template: 'announcement', label: 'Now available', title: 'Agents can buy from any store', action: 'Get started' },
	{ preset: 'og', template: 'frame', label: 'order.live', image: shot },
	{ preset: 'og', template: 'frame', label: 'order.ts', text: code, outName: 'og-frame-code' },
	{ preset: 'square', template: 'announcement', label: 'Now available', title: 'Agents can buy from any store', action: 'Get started' },
	{ preset: 'portrait', template: 'quote', text: 'One endpoint for every store an agent needs to buy from.', by: 'opencommerce' },
	{ preset: 'landscape', template: 'lead', title: 'Built for agents that buy', text: 'Search, check out and track the order from one endpoint.', ground: 'mist' },
];

for (const job of jobs) {
	const name = job.outName ?? `${job.preset}-${job.template}`;
	const format = job.format ?? 'png';
	const result = renderImages({ ...job, format, out: format === 'both' ? out : join(out, `${name}.png`) });
	if (format === 'both') {
		// both writes preset-template.svg and .png into the directory
	}
	for (const file of result.files) console.log(file.path, file.width, file.height, file.bytes);
}
