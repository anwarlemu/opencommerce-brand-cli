import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { drawScene, sceneSvg, TEMPLATE_IDS, type TemplateId } from '../assets/layouts.js';
import { display, write, type OutFile } from '../assets/io.js';
import { imagesToPdf } from '../assets/pdf.js';
import { unknownName } from '../lib/names.js';
import { copyFrom } from './content.js';
import { picture, rasterRgb } from './load.js';
import { assertSize, chooseTemplate, encodeScene, overLimit, parseFormats, parseScale, parseSize, parseTheme, sceneFor, settleCopy, type Format } from './render.js';

// A carousel: several images at one size from one JSON file, with one theme, one headline size per template, one seed and
// the page number on each.

export type CarouselInput = { file: string; size?: string; theme?: string; format?: string; out?: string; seed?: string | number; numbers?: boolean; scale?: string | number };

const KEYS = ['size', 'theme', 'ground', 'seed', 'numbers', 'template', 'slides'];

export function renderCarousel(input: CarouselInput) {
	const cwd = process.cwd();
	const path = isAbsolute(input.file) ? input.file : resolve(cwd, input.file);
	let parsed: Record<string, unknown>;
	try {
		parsed = JSON.parse(readFileSync(path, 'utf8'));
	} catch (err) {
		throw new Error(`Could not read ${input.file} as JSON (${(err as Error).message}).`);
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !Array.isArray(parsed.slides) || !parsed.slides.length) throw new Error(`${input.file} needs a "slides" list: { "size": "portrait", "slides": [ { "template": "headline", "headline": "..." } ] }.`);
	for (const key of Object.keys(parsed)) if (!KEYS.includes(key)) throw unknownName('carousel field', key, KEYS);
	const slides = parsed.slides as Record<string, unknown>[];
	if (slides.length < 2 || slides.length > 20) throw new Error(`A carousel holds 2 to 20 slides; ${input.file} has ${slides.length}.`);
	const target = parseSize(String(input.size ?? parsed.size ?? 'portrait'));
	const theme = parseTheme(input.theme ?? (parsed.theme as string | undefined) ?? (parsed.ground as string | undefined));
	const seed = input.seed ?? (parsed.seed as number | undefined);
	const numbers = input.numbers ?? parsed.numbers !== false;
	const formats = parseFormats(input.format);
	const scale = parseScale(input.scale);
	const scenes = slides.map((slide, i) => {
		const where = `Slide ${i + 1}`;
		try {
			if (!slide || typeof slide !== 'object' || Array.isArray(slide)) throw new Error('takes an object.');
			const { template: named, ...rest } = slide;
			const { copy: given, image } = copyFrom(rest, input.file);
			const template = (named ?? parsed.template ?? chooseTemplate(given, !!image)) as TemplateId;
			if (!(TEMPLATE_IDS as readonly string[]).includes(template)) throw unknownName('template', String(template), [...TEMPLATE_IDS]);
			assertSize(template, target);
			const { copy } = settleCopy(template, given, !!image, false);
			const pic = image ? picture(image, join(dirname(path), 'carousel.json')) : undefined;
			return sceneFor(template, target, copy, new Set(), { theme, seed, ...(numbers ? { page: `${i + 1}/${slides.length}` } : {}) }, pic);
		} catch (error) {
			throw new Error(`${where}: ${(error as Error).message}`);
		}
	});
	// One headline size per template: the smallest any of its slides needs.
	const sizes = new Map<string, number>();
	const drawn = scenes.map((scene, i) => {
		try {
			const d = drawScene({ ...scene, dry: true });
			const size = d.layers.find((y) => y.id === 'headline')?.text?.size ?? d.layers.find((y) => y.id === 'body')?.text?.size ?? 0;
			sizes.set(scene.template, Math.min(sizes.get(scene.template) ?? Infinity, size));
			return size;
		} catch (error) {
			throw new Error(`Slide ${i + 1}: ${(error as Error).message}`);
		}
	});
	const dir = resolve(cwd, input.out ?? 'carousel');
	const files: OutFile[] = [];
	const warnings: string[] = [];
	const pages: { rgb: Buffer; width: number; height: number }[] = [];
	const raster = formats.filter((f): f is Exclude<Format, 'pdf'> => f !== 'pdf');
	const pending: { path: string; data: Buffer; entry: Omit<OutFile, 'path'> & { format: string } }[] = [];
	for (const [i, scene] of scenes.entries()) {
		const smallest = sizes.get(scene.template)!;
		const lead = scene.template === 'quote' ? 'body' : 'headline';
		const ratio = drawn[i] > 0 ? smallest / drawn[i] : 1;
		const svg = sceneSvg(ratio < 0.995 && ['headline', 'lead', 'quote', 'announcement', 'closing', 'hero'].includes(scene.template) ? { ...scene, edits: { [lead]: { scale: ratio } } } : scene).svg;
		const data = encodeScene(svg, target.width, target.height, raster, scale);
		const n = String(i + 1).padStart(2, '0');
		for (const f of raster) pending.push({ path: join(dir, `${n}-${scene.template}.${f}`), data: data[f]!, entry: { format: f, slide: i + 1, template: scene.template, width: Math.round(target.width * (f === 'svg' ? 1 : scale)), height: Math.round(target.height * (f === 'svg' ? 1 : scale)) } });
		if (formats.includes('pdf')) pages.push(rasterRgb(svg));
	}
	for (const p of pending) {
		write(p.path, p.data);
		files.push({ path: display(cwd, p.path), ...p.entry });
		const warn = overLimit(target.id, p.entry.format, p.data.length);
		if (warn) warnings.push(`Slide ${p.entry.slide}: ${warn}`);
	}
	if (pages.length) {
		const pdf = join(dir, 'carousel.pdf');
		write(pdf, imagesToPdf(pages, target.width * 0.75));
		files.push({ path: display(cwd, pdf), format: 'pdf', pages: pages.length });
	}
	return { size: target, theme, slides: slides.length, files, warnings };
}
