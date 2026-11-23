import type { Command } from 'commander';
import { TEMPLATE_IDS } from '../assets/layouts.js';
import { renderCarousel } from '../image/carousel.js';
import { imageSpec, renderImages, type ImageInput } from '../image/render.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';

function run(input: ImageInput, json?: boolean) {
	const { layers: _layers, ...result } = renderImages(input);
	emit({ json }, { ok: true, ...result }, () => {
		const lines = result.files.map((file) => `  ${file.path}  ${file.width}x${file.height}  ${file.format}`);
		return [`Wrote ${result.files.length} ${result.files.length === 1 ? 'file' : 'files'} (${result.template}, ${result.theme}).`, ...lines, ...result.skipped.map((s) => `Not drawn at ${s.size}: ${s.reason}`), ...result.warnings].join('\n');
	});
}

/** The options of the command that ran and of `image` above it: a flag passed on either counts, a default never hides one. */
function given(command: Command): ImageInput & { json?: boolean } {
	const out: Record<string, unknown> = {};
	for (let at: Command | null = command; at && at.name() !== at.parent?.parent?.name(); at = at.parent) {
		for (const [key, value] of Object.entries(at.opts())) if (at.getOptionValueSource(key) === 'cli' && !(key in out)) out[key] = value;
		if (!at.parent) break;
	}
	return out as ImageInput & { json?: boolean };
}

function from(positional: string | undefined, command: Command, fallback: string) {
	const opts = given(command);
	const custom = opts.width !== undefined || opts.height !== undefined;
	// A first word that is a template's name picks the template; anything else is the headline.
	const template = positional && (TEMPLATE_IDS as readonly string[]).includes(positional) ? positional : undefined;
	if (template && opts.template && opts.template !== template) throw new Error(`Two templates: ${template} and --template ${opts.template}. Pass one.`);
	if (positional && !template && (opts.headline || opts.title)) throw new Error('Pass the headline once: as the first word or with --headline.');
	const size = opts.size ?? opts.preset ?? (custom ? undefined : template === 'avatar' || opts.template === 'avatar' ? 'avatar' : fallback);
	run({ ...opts, ...(template ? { template } : positional ? { headline: positional } : {}), size, preset: undefined }, opts.json);
}

function options(command: Command) {
	command.argument('[headline]', 'a template name, or the headline');
	command
		.option('--template <name>', 'hero, window, closing, cards, headline, lead, frame, quote, announcement or avatar; default is chosen from the copy')
		.option('--size <sizes>', 'og, square, portrait, story, landscape, x-banner, linkedin, linkedin-banner, linkedin-page, youtube, youtube-thumbnail, email, avatar, a size such as 1600x900, several with commas, or all')
		.option('--preset <sizes>', 'the same as --size')
		.option('--width <px>', 'a custom size, with --height')
		.option('--height <px>', 'a custom size, with --width')
		.option('--theme <theme>', 'the ground: white (default) or mist')
		.option('--ground <ground>', 'the same as --theme')
		.option('--headline <text>', 'headline')
		.option('--body <text>', 'supporting line, quotation, or the copy inside a frame')
		.option('--badge <text>', 'the line above the headline; "Product by ..." is typeset as an attribution (hero, window, closing)')
		.option('--title <text>', 'the same as --headline')
		.option('--text <text>', 'the same as --body')
		.option('--chip <text>', 'the same as --badge')
		.option('--label <text>', 'the name in a window bar')
		.option('--by <name>', 'attribution under a quote, as it should read')
		.option('--action <text>', 'label of the blue key (announcement, hero, window, closing)')
		.option('--secondary <text>', 'label of the white key beside it (hero, window, closing)')
		.option('--code <text>', 'code in the window (hero, window, frame); \\n for a line break')
		.option('--highlight <lines>', 'code lines on the blue band, such as 1-5 or 2,4')
		.option('--cards <text>', 'cards: cards separated by a blank line, heading first')
		.option('--footer <text>', 'cards: the address in the footer')
		.option('--image <file>', 'PNG, JPEG, WebP, GIF or SVG: the picture in a frame, hero or window, always whole')
		.option('--seed <n>', 'glyph field seed; each layout has its own default')
		.option('--logo', 'show the lockup')
		.option('--no-logo', 'hide the lockup')
		.option('--no-glyphs', 'leave out the glyph field')
		.option('--no-window', 'hero and window: leave out the window')
		.option('--inset', 'avatar: the whole mark on the ground, not carried to the edges')
		.option('--sample', 'fill the slots you leave out with sample copy; without it, only your copy is drawn')
		.option('--content <file>', 'JSON object with any of the slots; flags override it')
		.option('--format <formats>', 'png (default), svg, jpg, webp, pdf, both, or several with commas')
		.option('--scale <n>', 'raster scale, 0.25 to 4 (default 1)')
		.option('--out <path>', 'one file, or a directory (default: .ds/images)')
		.option('--json', 'JSON output');
}

/** `image`, `image og`, `image post` and `image carousel`: render brand images without a browser. */
export function imageCommands(program: Command) {
	const image = program.command('image').description('Render share images, social posts, banners and profile pictures from the copy you pass in (og 1200x630 and more)');
	options(image);
	image.action((headline: string | undefined, _opts, command: Command) => from(headline, command, 'og'));
	image.addHelpText('after', () => `\nOnly the copy you pass is drawn, whole. Copy that cannot fit at a readable size is an error that says what to shorten.\n\nExamples:\n  ${cli()} image hero --size og --badge "Product by Agentcard" --headline "..." --body "..." --out og.png\n  ${cli()} image window --size square --headline "..." --image shot.png --label shot.png\n  ${cli()} image closing --size story --headline "..." --action "Get started" --secondary "Read the docs"\n  ${cli()} image cards --size portrait --headline "..." --content cards.json\n  ${cli()} image lead --size og,x-banner,linkedin --headline "..." --body "..." --format png,svg\n  ${cli()} image avatar\n  ${cli()} image carousel slides.json --size portrait\n  ${cli()} image templates --json\n\nTo revise an image in steps, use ${cli()} design.\n`);

	const og = image.command('og').description('Render a 1200x630 Open Graph image');
	options(og);
	og.action((headline: string | undefined, _opts, command: Command) => {
		const opts = given(command);
		const size = opts.size ?? opts.preset;
		if ((size && size !== 'og' && size !== '1200x630') || opts.width || opts.height) throw new Error('image og always renders 1200x630. Use image post for square, portrait and landscape.');
		from(headline, command, 'og');
	});

	const post = image.command('post').description('Render a social post. Defaults to square (1080x1080)');
	options(post);
	post.action((headline: string | undefined, _opts, command: Command) => from(headline, command, 'square'));
	post.addHelpText('after', '\nThe default size is square (1080x1080). Pass --size (or --preset) portrait, landscape, og or all.\n');

	image
		.command('carousel <file>')
		.description('Several images at one size from one JSON file: one theme, one headline size per template, numbered')
		.option('--size <size>', 'square, portrait (default) or any one size; over the file\'s "size"')
		.option('--theme <theme>', 'white or mist; over the file\'s "theme"')
		.option('--seed <n>', 'glyph field seed for every slide')
		.option('--no-numbers', 'leave out the page numbers')
		.option('--format <formats>', 'png (default), svg, jpg, webp, pdf (one page per slide), or several with commas')
		.option('--scale <n>', 'raster scale, 0.25 to 4')
		.option('--out <dir>', 'output directory (default carousel/)')
		.option('--json', 'JSON output')
		.addHelpText('after', () => `\nThe file: { "size": "portrait", "theme": "white", "slides": [ { "template": "headline", "headline": "..." }, { "template": "cards", "cards": ["Search\\nAny store."] } ] }\nSlides take their template's slots by name, and "image" (a path relative to the file). Set "numbers": false to leave the numbers out.\n`)
		.action((file: string, _opts, command: Command) => {
			const o = given(command) as Record<string, unknown>;
			const r = renderCarousel({ file, size: (o.size ?? o.preset) as string | undefined, theme: o.theme as string | undefined, seed: o.seed as string | undefined, format: o.format as string | undefined, out: o.out as string | undefined, scale: o.scale as string | undefined, ...(o.numbers === false ? { numbers: false } : {}) });
			emit({ json: !!o.json }, { ok: true, ...r }, () => [...r.files.map((f) => `${f.path}${f.width ? `  ${f.width}x${f.height}` : ''}`), ...r.warnings].join('\n'));
		});

	image
		.command('templates')
		.description('List sizes, templates and the copy each one takes')
		.option('--json', 'JSON output')
		.action((_opts, command: Command) => {
			const spec = imageSpec();
			emit(command.optsWithGlobals(), { ok: true, ...spec }, () =>
				[
					'Sizes:',
					...spec.presets.map((preset) => `  ${preset.id.padEnd(18)} ${preset.description}`),
					'Templates:',
					...spec.templates.map((template) => `  ${template.id.padEnd(14)} ${template.description}${template.inputs.length ? `\n${' '.repeat(17)}Takes ${template.inputs.join(', ')}.` : ''}`),
					'Formats: png (default), svg, jpg, webp, pdf. Themes: white (default), mist.',
					'With no --template, cards selects cards, code selects window, an image selects frame, --by selects quote, --action selects announcement, a headline and body select lead, and a headline alone selects headline.',
				].join('\n'),
			);
		});
}
