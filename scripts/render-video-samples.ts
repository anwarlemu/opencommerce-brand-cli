import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderFramePng, renderVideo } from '../src/video/render.js';

// One settled frame and one mp4 for each video template family.

const out = join(import.meta.dirname, '..', 'samples', 'videos');
mkdirSync(out, { recursive: true });

const jobs = [
	{ template: 'social', size: 'square', title: 'Open router for commerce', text: 'One endpoint for agents to search, check out and track orders.' },
	{ template: 'announcement', size: 'vertical', label: 'Now available', title: 'Agents can buy from any store', action: 'Get started' },
	{ template: 'product', size: 'landscape', title: 'One request', label: 'order.ts', text: 'const order = {\n  sku: "cup",\n}\nreturn order\n' },
];

for (const job of jobs) {
	const name = `${job.size}-${job.template}`;
	const result = renderVideo({ ...job, out: join(out, `${name}.mp4`) });
	writeFileSync(join(out, `${name}.png`), renderFramePng(job, result.frames - 1, result.frames));
	console.log(name, result.files[0].bytes, result.files[0].sha256);
}
