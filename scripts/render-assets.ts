// The docs' gallery: every asset command run once with its sample copy, written into apps/www/public/assets so the
// Assets, Illustrations and Figma pages show real output. Deterministic, so a rerun with no engine change writes the
// same bytes. usage: npx tsx scripts/render-assets.ts [--video]
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderSlide, slideTypes } from '../src/assets/deck.js';
import { findItem, merchItems, renderItem } from '../src/assets/merch.js';
import { loadImage, rasterize, renderImages, type ImageInput } from '../src/image/render.js';
import { illustrate, subjects } from '../src/illustrate/render.js';
import { renderVideo } from '../src/video/render.js';

const root = join(import.meta.dirname, '..');
const out = join(root, 'apps', 'www', 'public', 'assets');
for (const dir of ['images', 'deck', 'illustrations', 'merch']) {
	rmSync(join(out, dir), { recursive: true, force: true });
	mkdirSync(join(out, dir), { recursive: true });
}

const shot = renderImages({ template: 'headline', title: 'Your screenshot here', preset: 'square', format: 'png', out: join(out, 'images', 'sample-picture.png') });

const images: [string, string, ImageInput][] = [
	['hero', 'og', { sample: true }],
	['window', 'og', { sample: true }],
	['closing', 'og', { sample: true }],
	['cards', 'og', { sample: true }],
	['hero', 'square', { sample: true }],
	['window', 'portrait', { image: shot.files[0].path, label: 'checkout.png', title: 'Watch it buy', text: 'Every step of a purchase, live.' }],
	['closing', 'story', { sample: true }],
	['cards', 'portrait', { sample: true }],
	['hero', 'x-banner', { sample: true }],
	['closing', 'linkedin-banner', { sample: true }],
	['lead', 'landscape', { title: 'Open router for commerce', text: 'One endpoint for agents to search, check out and track orders.' }],
	['announcement', 'square', { sample: true }],
	['frame', 'linkedin', { sample: true }],
	['lead', 'youtube', { sample: true }],
	['avatar', 'avatar', {}],
];
for (const [template, preset, copy] of images) renderImages({ template, preset, format: 'png', out: join(out, 'images', `${preset}-${template}.png`), ...copy });

const slides = slideTypes();
for (const [i, type] of slides.entries()) {
	const r = renderSlide({ type, sample: true, ...(type === 'image' ? { picture: loadImage(join(out, 'images', 'sample-picture.png')), label: 'checkout.png' } : {}) }, { png: true });
	writeFileSync(join(out, 'deck', `slide-${String(i + 1).padStart(2, '0')}-${type}.png`), r.png!);
}

for (const s of subjects()) {
	if (s === 'halftone') continue;
	const r = illustrate({ subject: s, sample: true });
	writeFileSync(join(out, 'illustrations', `${s}.png`), rasterize(r.svg));
}
{
	// The halftone draws the brand's own mark file, so the gallery ships no outside picture.
	const r = illustrate({ subject: 'halftone', width: 800, picture: loadImage(join(root, 'brand', 'logo', 'mark.svg')) });
	writeFileSync(join(out, 'illustrations', 'halftone.png'), rasterize(r.svg));
}

for (const item of merchItems()) {
	const r = renderItem(findItem(item.id), { variant: item.variants[0], sample: true, dpi: 72, svg: false, guides: true });
	writeFileSync(join(out, 'merch', `${item.id}-${r.variant}.png`), r.png!);
}

if (process.argv.includes('--video')) {
	mkdirSync(join(out, 'video'), { recursive: true });
	renderVideo({ template: 'hero', size: 'landscape', sample: true, out: join(out, 'video', 'landscape-hero.webm') });
	renderVideo({ template: 'mark', size: 'square', out: join(out, 'video', 'square-mark.webm') });
}
console.log(`assets in ${out}`);
