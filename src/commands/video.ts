import type { Command } from 'commander';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';
import { renderStill, renderVideo, type VideoInput } from '../video/render.js';
import { videoSpec } from '../video/motion.js';

function options(command: Command) {
	command
		.option('--template <name>', 'hero, window, closing, cards, field, mark, orbit, social, announcement or product')
		.option('--size <size>', 'square, vertical or landscape')
		.option('--headline <text>', 'headline')
		.option('--body <text>', 'supporting line, or the copy inside a product window')
		.option('--badge <text>', 'the line above the headline')
		.option('--title <text>', 'the same as --headline')
		.option('--text <text>', 'the same as --body')
		.option('--chip <text>', 'the same as --badge')
		.option('--label <text>', 'the name in a window bar (or the line above a headline)')
		.option('--action <text>', 'label of the blue key (announcement, hero, window, closing)')
		.option('--secondary <text>', 'label of the white key (hero, window, closing)')
		.option('--code <text>', 'code in the window (hero, window, product); \\n for a line break')
		.option('--cards <text>', 'cards: cards separated by a blank line, heading first')
		.option('--footer <text>', 'cards: the address in the footer')
		.option('--sample', 'fill the slots you leave out with sample copy; without it, only your copy is drawn')
		.option('--seed <n>', 'glyph field seed')
		.option('--content <file>', 'JSON object with the copy slots; flags override it')
		.option('--format <format>', 'mp4 (default) or webm; or give --out a .webm name')
		.option('--still <seconds>', 'write one PNG frame at this time instead of a clip')
		.option('--theme <theme>', 'the ground: white (default) or mist')
		.option('--ground <ground>', 'the same as --theme')
		.option('--out <path>', 'an .mp4, .webm or (with --still) .png file, or a directory (default: .ds/videos)')
		.option('--json', 'JSON output');
}

export function videoCommands(program: Command) {
	const video = program.command('video').description('Render a short on-brand video. Pass --template and --size.');
	options(video);
	video.argument('[template]', 'the template, the same as --template');
	video.action((named: string | undefined, _opts, command: Command) => {
		const opts = command.optsWithGlobals() as VideoInput & { json?: boolean; still?: string };
		if (named && opts.template && named !== opts.template) throw new Error(`Two templates: ${named} and --template ${opts.template}. Pass one.`);
		if (named) opts.template = named;
		if (opts.still !== undefined) {
			const still = renderStill(opts, Number(opts.still));
			emit({ json: opts.json }, { ok: true, ...still }, () => `Wrote ${still.files[0].path}  ${still.width}x${still.height}  frame ${still.frame} at ${still.seconds.toFixed(2)}s (${still.template}, ${still.size}).`);
			return;
		}
		const result = renderVideo(opts);
		emit({ json: opts.json }, { ok: true, ...result }, () => {
			const file = result.files[0];
			return `Wrote ${file.path}  ${result.width}x${result.height}  ${result.frames} frames at ${result.fps} fps (${result.template}, ${result.size}).`;
		});
	});
	video.addHelpText('after', `\nExamples:\n  ${cli()} video templates --json\n  ${cli()} video --template social --size square --headline "..." --body "..." --out clip.mp4 --json\n  ${cli()} video --template announcement --size vertical --headline "..." --action "Get started" --json\n  ${cli()} video --template product --size landscape --label order.ts --code "..." --json\n  ${cli()} video --template hero --size landscape --headline "..." --body "..." --out hero.webm\n  ${cli()} video --template mark --size square --still 2 --out mark.png\n`);
	video
		.command('templates')
		.description('List video templates, sizes and the renderer')
		.option('--json', 'JSON output')
		.action((_opts, command: Command) => {
			const spec = videoSpec();
			emit(command.optsWithGlobals(), { ok: true, ...spec }, () =>
				[
					`Renderer: ${spec.renderer.id}. ${spec.renderer.raster}. ${spec.renderer.encode}.`,
					spec.motion,
					'Sizes:',
					...spec.sizes.map((size) => `  ${size.id.padEnd(12)} ${size.description}`),
					'Templates:',
					...spec.templates.map((template) => `  ${template.id.padEnd(14)} ${template.frames} frames at ${template.fps} fps. ${template.description}`),
					'Pass --template and --size. Grounds: white (default), mist. Formats: mp4 (default), webm. --still <seconds> writes one PNG.',
				].join('\n'),
			);
		});
}
