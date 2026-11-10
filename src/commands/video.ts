import type { Command } from 'commander';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';
import { renderVideo, type VideoInput } from '../video/render.js';
import { videoSpec } from '../video/motion.js';

function options(command: Command) {
	command
		.option('--template <name>', 'social, announcement or product')
		.option('--size <size>', 'square, vertical or landscape')
		.option('--title <text>', 'headline')
		.option('--text <text>', 'supporting line, or the copy inside a product window')
		.option('--label <text>', 'short label, or the file name in a window bar')
		.option('--action <text>', 'label of the key on an announcement')
		.option('--content <file>', 'JSON object with title, text, label and action; flags override it')
		.option('--ground <ground>', 'white (default) or mist')
		.option('--out <path>', 'an .mp4 file, or a directory (default: .ds/videos)')
		.option('--json', 'JSON output');
}

export function videoCommands(program: Command) {
	const video = program.command('video').description('Render a short on-brand video. Pass --template and --size.');
	options(video);
	video.action((_opts, command: Command) => {
		const opts = command.optsWithGlobals() as VideoInput & { json?: boolean };
		const result = renderVideo(opts);
		emit({ json: opts.json }, { ok: true, ...result }, () => {
			const file = result.files[0];
			return `Wrote ${file.path}  ${result.width}x${result.height}  ${result.frames} frames at ${result.fps} fps (${result.template}, ${result.size}).`;
		});
	});
	video.addHelpText('after', `\nExamples:\n  ${cli()} video templates --json\n  ${cli()} video --template social --size square --title "..." --text "..." --out clip.mp4 --json\n  ${cli()} video --template announcement --size vertical --title "..." --action "Get started" --json\n  ${cli()} video --template product --size landscape --label order.ts --text "..." --json\n`);
	video
		.command('templates')
		.description('List video templates, sizes and the renderer')
		.option('--json', 'JSON output')
		.action((_opts, command: Command) => {
			const spec = videoSpec();
			emit(command.optsWithGlobals(), { ok: true, ...spec }, () =>
				[
					`Renderer: ${spec.renderer.id}. ${spec.renderer.raster}. ${spec.renderer.encode}.`,
					`${spec.renderer.frames} frames at ${spec.renderer.fps} fps (${spec.renderer.seconds}s).`,
					'Sizes:',
					...spec.sizes.map((size) => `  ${size.id.padEnd(12)} ${size.description}`),
					'Templates:',
					...spec.templates.map((template) => `  ${template.id.padEnd(14)} ${template.description}`),
					'Pass --template and --size. Grounds: white (default), mist. Format: mp4.',
				].join('\n'),
			);
		});
}
