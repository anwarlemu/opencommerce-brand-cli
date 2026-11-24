// The docs' gallery: every asset command run once with its sample copy, written into apps/www/public/assets so the
// Assets, Illustrations and Figma pages show real output. Deterministic, so a rerun with no engine change writes the
// same bytes. usage: npx tsx scripts/render-assets.ts [--video]
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderSlide, slideTypes } from '../src/assets/deck.js';
import { findItem, merchItems, renderItem } from '../src/assets/merch.js';
import { loadImage, rasterize, renderImages, type ImageInput } from '../src/image/render.js';
import { illustrate, subjects } from '../src/illustrate/render.js';
import { adapter, paint } from '../src/design/adapter.js';
import { PLATFORMS, runDesign } from '../src/design/index.js';
import { renderVideo } from '../src/video/render.js';
import { iconSet } from '../src/commands/icons.js';
import { renderEmail, type EmailId } from '../src/commands/email.js';

const root = join(import.meta.dirname, '..');
const out = join(root, 'apps', 'www', 'public', 'assets');
for (const dir of ['images', 'deck', 'illustrations', 'merch', 'designs']) {
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

// The sizes, for the docs' table.
writeFileSync(
	join(out, 'sizes.json'),
	`${JSON.stringify(
		PLATFORMS.map((p) => {
			const zones = [...p.avoid.map((z) => z.name), ...(p.safe ? [`everything outside ${p.safe.name}`] : [])];
			const official = [...p.avoid, ...(p.safe ? [p.safe] : [])].every((z) => z.official);
			return { id: p.id, description: `${p.label}, ${p.width}x${p.height}`, ...(zones.length ? { zones: `Keeps clear of ${zones.join(', ')}${official ? '' : ' (approximate)'}.` } : {}), ...(p.limit ? { limit: `Up to ${p.limit.bytes / 1048576} MB${p.limit.official ? '' : ' (approximate)'}.` } : {}) };
		}),
		null,
		'\t',
	)}\n`,
);

// One design session, as a person would run it: each step's command, what the CLI answered, and the picture it left.
{
	const work = mkdtempSync(join(tmpdir(), 'designs-'));
	const steps: { command: string; answer: string; picture?: string; ok: boolean }[] = [];
	const bin = adapter().brand;
	const step = async (argv: string[], keep?: string, from = 'banner.png') => {
		const lines: string[] = [];
		const code = await runDesign(argv, adapter(), { cwd: work, bin: `npx ${bin}`, out: (t) => lines.push(t), err: (t) => lines.push(t), paint });
		if (keep) copyFileSync(join(work, from), join(out, 'designs', keep));
		const shown = argv.map((a) => (/[\s"]/.test(a) ? `'${a}'` : a)).join(' ');
		steps.push({ command: `design ${shown}`, answer: lines.join('\n'), ...(keep ? { picture: keep } : {}), ok: code === 0 });
	};
	await step(['new', 'hero', '--size', 'x-banner', '--headline', 'One endpoint for every online store', '--body', 'Search, check out and track orders from a single request.', '-o', 'banner'], '1-new.png');
	await step(['revise', 'banner', 'bigger headline'], '2-bigger.png');
	await step(['revise', 'banner', 'badge "Product by Agentcard", darker theme'], '3-badge.png');
	await step(['revise', 'banner', 'show the logo, logo top right'], '4-logo.png');
	await step(['revise', 'banner', 'hide the art, headline left'], '5-art.png');
	await step(['undo', 'banner'], '6-undo.png');
	await step(['revise', 'banner', 'make the logo neon green']);
	await step(['edit', 'banner', '--layer', 'headline.dx=-0.4']);
	await step(['variants', 'banner', '--by', 'seed', '--count', '4'], '7-variants.png', 'banner-by-seed.png');
	await step(['sizes', 'banner', '--to', 'og,square,story,x-banner,youtube'], '8-sizes.png', 'banner-sizes.png');
	await step(['compare', 'banner', 'banner-og'], '9-compare.png', 'banner-vs-banner-og.png');
	await step(['history', 'banner']);
	writeFileSync(join(out, 'designs', 'session.json'), `${JSON.stringify({ steps, file: readFileSync(join(work, 'banner.design.json'), 'utf8'), templates: adapter().templates().map((t) => ({ id: t.id, kind: t.kind, description: t.description })) }, null, '\t')}\n`);
	rmSync(work, { recursive: true, force: true });
}

// The rest of what the CLI makes, for the docs' Coverage page: a compose card, the new slides, print items, the icon
// set and the emails.
{
	const cov = join(out, 'coverage');
	rmSync(cov, { recursive: true, force: true });
	mkdirSync(cov, { recursive: true });
	const work = mkdtempSync(join(tmpdir(), 'coverage-'));
	const run = async (...argv: string[]) => runDesign(argv, adapter(), { cwd: work, bin: 'x', out: () => {}, err: (t) => console.error(t), paint });
	await run('new', 'compose', '--size', 'og', '-o', 'card');
	await run('compose', 'add', 'card', 'headline', 'Orders a day, since the endpoint opened', '--at', '0,0,7,4');
	await run('compose', 'add', 'card', 'stat', '1,200+', '--set', 'label=stores an agent can buy from', '--at', '0,6,6,5');
	await run('compose', 'add', 'card', 'chart', '--set', 'value=Mon 120, Tue 180, Wed 150, Thu 240, Fri 300', '--at', '7,0,5,11');
	copyFileSync(join(work, 'card.png'), join(cov, 'compose-og.png'));
	await run('new', 'compose', '--size', 'ad-300x250', '-o', 'ad');
	await run('compose', 'add', 'ad', 'logo', '--at', '0,0,12,2');
	await run('compose', 'add', 'ad', 'headline', 'Give your agent a checkout', '--at', '0,3,12,5');
	await run('compose', 'add', 'ad', 'button', 'Get started', '--at', '0,9,8,3');
	copyFileSync(join(work, 'ad.png'), join(cov, 'compose-ad-300x250.png'));
	rmSync(work, { recursive: true, force: true });
	for (const type of ['agenda', 'team', 'timeline', 'chart', 'comparison', 'qa']) writeFileSync(join(cov, `slide-${type}.png`), renderSlide({ type, sample: true }, { png: true }).png!);
	for (const id of ['business-card-front', 'business-card-back', 'one-pager-letter', 'report-cover', 'certificate', 'event-badge', 'name-tag', 'sticker-sheet', 'mug-15oz', 'lanyard']) {
		const r = renderItem(findItem(id), { sample: true, dpi: 72, svg: false, slots: id === 'certificate' ? { headline: 'Certificate of completion', name: 'Alex Acme' } : {} });
		writeFileSync(join(cov, `${id}.png`), r.png!);
	}
	for (const [name, data] of Object.entries(iconSet())) if (/\.(png|svg)$/.test(name)) writeFileSync(join(cov, `icon-${name}`), data);
	const emails: [EmailId, Record<string, string>][] = [
		['announcement', { badge: 'Now available', headline: 'Agents can buy from any store', body: 'One endpoint for search, checkout and tracking.', action: 'Get started', href: 'https://example.com/start', footer: 'You get this because you signed up at example.com.' }],
		['receipt', { headline: 'Your order', body: 'Acme confirmed it a moment ago.', items: 'Cup | $12\nShipping | $4\nTotal | $16' }],
	];
	for (const [id, copy] of emails) writeFileSync(join(cov, `email-${id}.html`), renderEmail(id, copy).html);
}

if (process.argv.includes('--video')) {
	mkdirSync(join(out, 'video'), { recursive: true });
	renderVideo({ template: 'hero', size: 'landscape', sample: true, out: join(out, 'video', 'landscape-hero.webm') });
	renderVideo({ template: 'mark', size: 'square', out: join(out, 'video', 'square-mark.webm') });
}
console.log(`assets in ${out}`);
