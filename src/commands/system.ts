import type { Command } from 'commander';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';
import { emitComponent, inspectComponent, listComponents, COMPONENT_TYPES } from '../system/components.js';
import { fontRecords, gaps, loadSystem, logoRecords } from '../system/load.js';
import { manifest } from '../system/manifest.js';
import { groupedTokens, lookupToken, TOKEN_GROUPS } from '../system/tokens.js';

function jsonOpts(command: Command) {
	return command.optsWithGlobals() as { json?: boolean; group?: string; name?: string; type?: string; surface?: string; state?: string; export?: string; props?: string; text?: string };
}

export function systemCommands(program: Command) {
	const run = (command: Command, data: unknown, text: () => string) => emit(jsonOpts(command), { ok: true, ...((data && typeof data === 'object' ? data : { value: data }) as object) }, text);

	const describe = (command: Command) => {
		const data = manifest();
		run(command, data, () =>
			[
				`${data.name} ${data.version}. ${data.bin} manifest --json lists the whole system. describe is the same command.`,
				`Commands: ${data.commands.map((item) => item.id).join(', ')}`,
				`Token groups: ${Object.keys(data.tokens.groups).join(', ')}`,
				`Fonts: ${data.fonts.map((face) => face.id).join(', ')}`,
				`Logos: ${data.logos.map((logo) => logo.id).join(', ')}`,
				`Components: ${data.components.length}`,
				`Image templates: ${data.image.templates.map((item) => item.id).join(', ')}`,
				`Video templates: ${data.video.templates.map((item) => item.id).join(', ')}`,
				`Video sizes: ${data.video.sizes.map((item) => item.id).join(', ')}`,
				data.gaps.length ? `Gaps: ${data.gaps.map((gap) => gap.id).join(', ')}` : '',
			]
				.filter(Boolean)
				.join('\n'),
		);
	};
	program.command('manifest').description('List every capability, template, size, component, token and rule').option('--json', 'JSON output').action((_opts, command: Command) => describe(command));
	program.command('describe').description('Same as manifest').option('--json', 'JSON output').action((_opts, command: Command) => describe(command));

	const brandCmd = program.command('brand').description('Read tokens, fonts, logos and voice from the brand files');
	brandCmd.action(() => {
		throw new Error('Pass a brand command: system, tokens, fonts, logos or voice.');
	});
	brandCmd
		.command('system')
		.description('Tokens, fonts, logos and voice')
		.option('--json', 'JSON output')
		.action((_opts, command: Command) => {
			const system = loadSystem();
			const grouped = groupedTokens();
			run(command, { tokens: grouped.groups, otherTokens: grouped.other, fonts: fontRecords(), logos: logoRecords(), voice: system.voice, gaps: gaps() }, () =>
				[`Fonts: ${system.fonts.faces.map((face) => face.family).join(', ')}`, `Logos: ${system.logos.map((logo) => logo.id).join(', ')}`, `Voice: ${system.voice.summary}`, 'Pass --json for values and rules.'].join('\n'),
			);
		});
	brandCmd
		.command('tokens')
		.description('List tokens by group, or one token by exact name')
		.option('--group <group>', `one of ${TOKEN_GROUPS.join(', ')}`)
		.option('--name <token>', 'exact token name, such as --ds-color-brand')
		.option('--json', 'JSON output')
		.action((_opts, command: Command) => {
			const opts = jsonOpts(command);
			if (opts.group && !(TOKEN_GROUPS as readonly string[]).includes(opts.group)) throw new Error(`Unknown token group "${opts.group}". Use ${TOKEN_GROUPS.join(', ')}.`);
			if (opts.name) {
				const found = lookupToken(opts.name);
				if (opts.group && found.group !== opts.group) throw new Error(`Token "${opts.name}" is in ${found.group}, not ${opts.group}.`);
				run(command, found, () => `${found.name}  ${found.value}  (${found.group})`);
				return;
			}
			const grouped = groupedTokens();
			if (Object.keys(grouped.other).length) throw new Error(`Tokens are not in a group: ${Object.keys(grouped.other).join(', ')}.`);
			const data = opts.group ? { group: opts.group, tokens: grouped.groups[opts.group as (typeof TOKEN_GROUPS)[number]] } : { groups: grouped.groups };
			run(command, data, () => {
				const groups = opts.group ? [opts.group] : [...TOKEN_GROUPS];
				return groups
					.map((group) => [`${group}:`, ...Object.entries(grouped.groups[group as (typeof TOKEN_GROUPS)[number]]).map(([name, value]) => `  ${name.padEnd(36)} ${value}`)].join('\n'))
					.join('\n');
			});
		});
	brandCmd
		.command('fonts')
		.description('Bundled font files, licenses and any face that is not included')
		.option('--json', 'JSON output')
		.action((_opts, command: Command) => {
			const fonts = fontRecords();
			run(command, { fonts }, () => fonts.map((face) => `${face.id.padEnd(10)} ${face.family}${face.bundled ? '' : ' (not bundled)'}\n  ${face.role}`).join('\n'));
		});
	brandCmd
		.command('logos')
		.description('Logo files and their usage rules')
		.option('--json', 'JSON output')
		.action((_opts, command: Command) => {
			const logos = logoRecords();
			run(command, { logos }, () => logos.map((logo) => [`${logo.name}  ${logo.file}`, logo.summary, ...logo.do.map((rule) => `  do: ${rule.text}`), ...logo.dont.map((rule) => `  do not: ${rule.text}`)].join('\n')).join('\n\n'));
		});
	brandCmd
		.command('voice')
		.description('Voice and tone rules')
		.option('--json', 'JSON output')
		.action((_opts, command: Command) => {
			const voice = loadSystem().voice;
			run(command, { voice }, () => [voice.summary, ...voice.do.map((rule) => `  do: ${rule.text}`), ...voice.dont.map((rule) => `  do not: ${rule.text}`)].join('\n'));
		});

	program
		.command('principles')
		.description('Design rules for the site and for product UI')
		.option('--surface <surface>', 'site or product')
		.option('--json', 'JSON output')
		.action((_opts, command: Command) => {
			const opts = jsonOpts(command);
			const principles = loadSystem().principles;
			let surface: 'site' | 'product' | undefined;
			if (opts.surface) {
				if (opts.surface !== 'site' && opts.surface !== 'product') throw new Error('Unknown surface. Use site or product.');
				surface = opts.surface;
			}
			const data = surface ? { surface, ...principles[surface] } : { surfaces: principles };
			run(command, data, () => {
				const names = surface ? [surface] : (['site', 'product'] as const);
				return names
					.map((name) => {
						const item = principles[name];
						return [`${name}: ${item.summary}`, ...item.do.map((rule) => `  do: ${rule.text}`), ...item.dont.map((rule) => `  do not: ${rule.text}`)].join('\n');
					})
					.join('\n\n');
			});
		});

	const component = program.command('component').description('List, inspect and emit components from the registry');
	component.action(() => {
		throw new Error('Pass a component command: list, inspect or emit.');
	});
	component
		.command('list')
		.description('List every component')
		.option('--type <type>', `one of ${COMPONENT_TYPES.join(', ')}`)
		.option('--json', 'JSON output')
		.action((_opts, command: Command) => {
			const data = listComponents({ type: jsonOpts(command).type });
			run(command, data, () => [...data.components.map((item) => `${item.name.padEnd(28)} ${item.type.padEnd(8)} ${item.description ?? ''}`), `${data.count} components.`].join('\n'));
		});
	component
		.command('inspect <name>')
		.description('Props, states, constraints and source for one component')
		.option('--json', 'JSON output')
		.action((name: string, _opts, command: Command) => {
			const data = inspectComponent(name);
			run(command, data, () =>
				[
					`${data.title ?? data.name}`,
					data.description ?? '',
					data.useFor ?? '',
					...(data.constraints ?? []).map((rule) => `  do not: ${rule}`),
					`Exports: ${data.exports.join(', ') || 'none'}`,
					`States: ${data.states.join(', ') || 'none'}`,
					...data.api.map((api) => `Props for ${api.export}: ${Object.keys(api.props).join(', ') || 'none'}`),
					`Pass --json for source and prop values. Emit with ${cli()} component emit ${data.name} --state <state> --json`,
				]
					.filter(Boolean)
					.join('\n'),
			);
		});
	component
		.command('emit <name>')
		.description('Emit an example state, or JSX for props checked against the component')
		.option('--state <state>', 'example export to copy')
		.option('--export <name>', 'component export to instantiate with --props')
		.option('--props <json>', 'JSON object of prop values')
		.option('--text <text>', 'child text when using --props')
		.option('--json', 'JSON output')
		.action((name: string, _opts, command: Command) => {
			const opts = jsonOpts(command);
			const data = emitComponent(name, { state: opts.state, exportName: opts.export, props: opts.props, text: opts.text });
			run(command, data, () => data.code);
		});
}
