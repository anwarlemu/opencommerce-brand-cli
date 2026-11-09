import type { Command } from 'commander';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';
import { imageSpec, renderImages, type ImageInput } from '../image/render.js';

function run(input: ImageInput, json?: boolean) {
	const result = renderImages(input);
	emit({ json }, { ok: true, ...result }, () => {
		const lines = result.files.map((file) => `  ${file.path}  ${file.width}x${file.height}  ${file.format}`);
		return [`Wrote ${result.files.length} ${result.files.length === 1 ? 'file' : 'files'} (${result.template}, ${result.ground}).`, ...lines].join('\n');
	});
}

function from(positional: string | undefined, opts: ImageInput & { json?: boolean }, fallback: string) {
	run({ ...opts, title: opts.title ?? positional, preset: opts.preset || fallback }, opts.json);
}

function options(command: Command, preset?: string) {
	command.argument('[title]', 'headline; for a quote, the quotation when --text is omitted');
	if (preset) command.option('--preset <preset>', 'og, square, portrait, landscape, a size such as 1200x630, or all', preset);
	command
		.option('--template <name>', 'headline, lead, frame, quote or announcement; default is chosen from the inputs')
		.option('--title <text>', 'headline')
		.option('--text <text>', 'supporting line, quotation, or the copy inside a window')
		.option('--label <text>', 'short label above the headline, or the file name in a window bar')
		.option('--by <name>', 'attribution under a quote')
		.option('--action <text>', 'label of the flat key on an announcement')
		.option('--image <file>', 'PNG, JPEG or SVG screenshot for the frame template')
		.option('--content <file>', 'JSON object with title, text, label, by, action and image; flags override it')
		.option('--ground <ground>', 'white (default) or mist')
		.option('--format <format>', 'png (default), svg, or both')
		.option('--out <path>', 'a .png or .svg file for one image, or a directory (default: .ds/images)')
		.option('--json', 'JSON output');
}

/** `image`, `image og` and `image post`: render brand images without a browser. */
export function imageCommands(program: Command) {
	const image = program.command('image').description('Render an Open Graph image or a social post from the copy you pass in');
	options(image, 'og');
	image.action((title: string | undefined, _opts, command: Command) => from(title, command.optsWithGlobals(), 'og'));
	image.addHelpText('after', `\nExamples:\n  ${cli()} image --preset og --template lead --title "..." --text "..." --out og.png --json\n  ${cli()} image post --preset landscape --template quote --text "..." --by "..." --json\n  ${cli()} image templates --json\n`);

	const og = image.command('og').description('Render a 1200x630 Open Graph image');
	options(og);
	og.action((title: string | undefined, _opts, command: Command) => {
		const opts = command.optsWithGlobals();
		if (opts.preset && opts.preset !== 'og') throw new Error('image og always renders 1200x630. Use image post for square, portrait and landscape.');
		from(title, opts, 'og');
	});

	const post = image.command('post').description('Render a social post (square, portrait or landscape)');
	options(post, 'square');
	post.action((title: string | undefined, _opts, command: Command) => from(title, command.optsWithGlobals(), 'square'));

	image
		.command('templates')
		.description('List presets, templates and the content each one takes')
		.option('--json', 'JSON output')
		.action((_opts, command: Command) => {
			const spec = imageSpec();
			emit(command.optsWithGlobals(), { ok: true, ...spec }, () =>
				[
					'Presets:',
					...spec.presets.map((preset) => `  ${preset.id.padEnd(12)} ${preset.description}`),
					'Templates:',
					...spec.templates.map((template) => `  ${template.id.padEnd(14)} ${template.description}`),
					'Formats: png (default), svg, both. Grounds: white (default), mist.',
					'With no --template, an image selects frame, a --by selects quote, an --action selects announcement, a title and text select lead, and a title alone selects headline.',
				].join('\n'),
			);
		});
}
