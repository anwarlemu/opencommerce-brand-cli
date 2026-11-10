import { readFileSync } from 'node:fs';
import { imageSpec } from '../image/render.js';
import { brand, cli } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';
import { videoSpec } from '../video/motion.js';
import { listComponents, componentSummary } from './components.js';
import { fontRecords, gaps, loadSystem, logoRecords } from './load.js';
import { groupedTokens } from './tokens.js';

export function manifest() {
	const b = brand();
	const version = JSON.parse(readFileSync(pkgPath('package.json'), 'utf8')).version as string;
	const system = loadSystem();
	const grouped = groupedTokens();
	const bin = cli();
	const components = listComponents().components.map((item) => componentSummary(item.name));
	return {
		schemaVersion: 1,
		name: b.name,
		bin: b.bin,
		version,
		entry: 'manifest',
		alias: 'describe',
		determinism: 'The same inputs produce the same bytes. Every name is checked against a fixed list. Unknown templates, sizes, components, tokens and options exit with an error.',
		commands: [
			{ id: 'manifest', usage: `${bin} manifest --json`, readOnly: true, summary: 'List every command, token, font, logo, template, size, component and rule.' },
			{ id: 'describe', usage: `${bin} describe --json`, readOnly: true, summary: 'Same as manifest.' },
			{ id: 'brand system', usage: `${bin} brand system --json`, readOnly: true, summary: 'Tokens, fonts, logos and voice.' },
			{ id: 'brand tokens', usage: `${bin} brand tokens --group color --json`, readOnly: true, summary: 'Exact tokens by group or by --name. Unknown names error.' },
			{ id: 'brand fonts', usage: `${bin} brand fonts --json`, readOnly: true, summary: 'Bundled faces, licenses and the display face that is not bundled.' },
			{ id: 'brand logos', usage: `${bin} brand logos --json`, readOnly: true, summary: 'Logo files, hashes and usage rules.' },
			{ id: 'brand voice', usage: `${bin} brand voice --json`, readOnly: true, summary: 'Voice and tone rules, including banned words.' },
			{ id: 'principles', usage: `${bin} principles --surface site --json`, readOnly: true, summary: 'Do and do-not rules for site and product.' },
			{ id: 'component list', usage: `${bin} component list --json`, readOnly: true, summary: 'Every component. Filter with --type. Unknown types error.' },
			{ id: 'component inspect', usage: `${bin} component inspect <name> --json`, readOnly: true, summary: 'Props, states, constraints and source for one component.' },
			{ id: 'component emit', usage: `${bin} component emit <name> --state Site --json`, readOnly: true, summary: 'Example source for a state, or JSX for validated props.' },
			{ id: 'image', usage: `${bin} image templates --json`, readOnly: false, summary: 'Open Graph and social stills. image templates lists presets and templates.' },
			{ id: 'video', usage: `${bin} video templates --json`, readOnly: false, summary: 'Short clips at square, vertical and landscape. video templates lists them.' },
			{ id: 'list', usage: `${bin} list --json`, readOnly: true, summary: 'Search the component catalog by words.' },
			{ id: 'show', usage: `${bin} show <name> --json`, readOnly: true, summary: 'Alias of view. Exact source, examples and usage.' },
			{ id: 'tokens', usage: `${bin} tokens <term> --json`, readOnly: true, summary: 'Search tokens by substring. No match is an error.' },
			{ id: 'look', usage: `${bin} look <file-or-element> --json`, readOnly: true, summary: 'Element styling for a file or one element kind.' },
			{ id: 'check', usage: `${bin} check --json`, readOnly: true, summary: 'Check style values against tokens. --fix writes replacements.' },
			{ id: 'guide', usage: `${bin} guide --json`, readOnly: true, summary: 'The portable agent guide.' },
			{ id: 'init', usage: `${bin} init --json`, readOnly: false, summary: 'Install styles, fonts and agent instructions.' },
			{ id: 'add', usage: `${bin} add <names...> --json`, readOnly: false, summary: 'Copy components into an app.' },
			{ id: 'apply', usage: `${bin} apply --dry-run --json`, readOnly: false, summary: 'Restyle an existing app. Preview first.' },
		],
		tokens: {
			groups: Object.fromEntries(Object.entries(grouped.groups).map(([group, entries]) => [group, Object.keys(entries)])),
			other: Object.keys(grouped.other),
		},
		fonts: fontRecords(),
		logos: logoRecords().map(({ svg: _svg, ...logo }) => logo),
		voice: system.voice,
		principles: system.principles,
		components,
		image: imageSpec(),
		video: videoSpec(),
		gaps: gaps(),
	};
}
