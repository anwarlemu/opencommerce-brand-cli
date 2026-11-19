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

function presetFrom(command: Command, fallback: string) {
	// `image` owns --preset and defaults it to og. optsWithGlobals copies that default onto
	// subcommands, so `image post` would render the Open Graph size. Honor the flag only when
	// someone passed it.
	if (command.getOptionValueSourceWithGlobals('preset') === 'cli') return String(command.optsWithGlobals().preset);
	return fallback;
}

function from(positional: string | undefined, command: Command, fallback: string) {
	const opts = command.optsWithGlobals() as ImageInput & { json?: boolean };
	run({ ...opts, title: opts.title ?? positional, preset: presetFrom(command, fallback) }, opts.json);
}

function options(command: Command, preset?: string) {
	command.argument('[title]', 'headline; for a quote, the quotation when --text is omitted');
	if (preset) command.option('--preset <preset>', 'og, square, portrait, story, landscape, x-banner, linkedin-banner, a size such as 1600x900, or all', preset);
	command
		.option('--template <name>', 'hero, window, closing, cards, headline, lead, frame, quote or announcement; default is chosen from the inputs')
		.option('--title <text>', 'headline')
		.option('--text <text>', 'supporting line, quotation, or the copy inside a window')
		.option('--label <text>', 'short label above the headline, or the file name in a window bar')
		.option('--by <name>', 'attribution under a quote')
		.option('--action <text>', 'label of the blue key (announcement, hero, window, closing)')
		.option('--secondary <text>', 'label of the white key beside it (hero, window, closing)')
		.option('--chip <text>', 'the chip above the headline (hero, window, closing); "Product by ..." is typeset as an attribution')
		.option('--code <text>', 'code in the window (hero, window); \\n for a line break')
		.option('--highlight <lines>', 'code lines on the blue band, such as 1-5 or 2,4, or none')
		.option('--cards <text>', 'cards template: cards separated by a blank line, heading first')
		.option('--footer <text>', 'cards template: the address in the footer')
		.option('--image <file>', 'PNG, JPEG or SVG: the screenshot in a frame, or the picture in a hero or window')
		.option('--seed <n>', 'glyph field seed; each layout has its own default')
		.option('--logo', 'show the lockup (hero, window, closing, cards)')
		.option('--no-logo', 'hide the lockup')
		.option('--no-glyphs', 'leave out the glyph field (hero, window, closing, cards)')
		.option('--no-window', 'hero and window: leave out the window')
		.option('--content <file>', 'JSON object with any of the slots (title, text, label, by, action, secondary, chip, code, highlight, cards, footer, image); flags override it')
		.option('--ground <ground>', 'white (default) or mist')
		.option('--format <format>', 'png, svg, or both; default png, or the --out extension')
		.option('--out <path>', 'a .png or .svg file for one image, or a directory (default: .ds/images)')
		.option('--json', 'JSON output');
}

/** `image`, `image og` and `image post`: render brand images without a browser. */
export function imageCommands(program: Command) {
	const image = program.command('image').description('Render an Open Graph image or a social post from the copy you pass in');
	options(image, 'og');
	image.action((title: string | undefined, _opts, command: Command) => from(title, command, 'og'));
	image.addHelpText('after', `\nExamples:\n  ${cli()} image --template hero --preset og --title "..." --text "..." --chip "Product by Agentcard" --out og.png\n  ${cli()} image --template window --preset square --title "..." --image shot.png --label shot.png\n  ${cli()} image --template closing --preset story --title "..." --action "Get started" --secondary "Read the docs"\n  ${cli()} image --template cards --preset portrait --title "..." --content cards.json\n  ${cli()} image --preset og --template lead --title "..." --text "..." --out og.png --json\n  ${cli()} image post --preset landscape --template quote --text "..." --by "..." --json\n  ${cli()} image templates --json\n`);

	const og = image.command('og').description('Render a 1200x630 Open Graph image');
	options(og);
	og.action((title: string | undefined, _opts, command: Command) => {
		if (command.getOptionValueSourceWithGlobals('preset') === 'cli') {
			const preset = String(command.optsWithGlobals().preset);
			if (preset !== 'og' && preset !== '1200x630') throw new Error('image og always renders 1200x630. Use image post for square, portrait and landscape.');
		}
		from(title, command, 'og');
	});

	const post = image.command('post').description('Render a social post. Defaults to square (1080x1080)');
	options(post);
	post.action((title: string | undefined, _opts, command: Command) => from(title, command, 'square'));
	post.addHelpText('after', '\nThe default preset is square (1080x1080). Pass --preset portrait, landscape, og or all. --preset is defined on image and applies here too.\n');

	image
		.command('templates')
		.description('List presets, templates and the content each one takes')
		.option('--json', 'JSON output')
		.action((_opts, command: Command) => {
			const spec = imageSpec();
			emit(command.optsWithGlobals(), { ok: true, ...spec }, () =>
				[
					'Presets:',
					...spec.presets.map((preset) => `  ${preset.id.padEnd(17)} ${preset.description}`),
					'Templates:',
					...spec.templates.map((template) => `  ${template.id.padEnd(14)} ${template.description}`),
					'Formats: png (default), svg, both. Grounds: white (default), mist.',
					'With no --template, an image selects frame, a --by selects quote, an --action selects announcement, a title and text select lead, and a title alone selects headline.',
				].join('\n'),
			);
		});
}
