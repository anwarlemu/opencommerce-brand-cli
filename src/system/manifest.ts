import { readFileSync } from 'node:fs';
import { imageSpec } from '../image/render.js';
import { brand, cli } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';
import { videoSpec } from '../video/motion.js';
import { deckCatalog } from '../assets/deck.js';
import { merchCatalog } from '../assets/merch.js';
import { illustrateData } from '../illustrate/render.js';
import { designCatalog } from '../commands/design.js';
import { FIGMA_ACTIONS, PUSH_KINDS } from '../commands/figma.js';
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
			{ id: 'image', usage: `${bin} image --template hero --preset og --title "..." --json`, readOnly: false, summary: 'Share images and social posts: ten templates (hero, window, closing, cards, headline, lead, frame, quote, announcement, avatar) at thirteen sizes or WIDTHxHEIGHT; PNG, SVG, JPG, WebP and PDF; only the copy you pass, whole. image templates lists them.' },
			{ id: 'image carousel', usage: `${bin} image carousel slides.json --json`, readOnly: false, summary: 'Several images at one size from one JSON file, consistent and numbered.' },
			{ id: 'design', usage: `${bin} design new hero --headline "..." -o banner.design.json`, readOnly: false, summary: 'Make a design, then revise it: design revise <file> "bigger headline, logo top right" in plain words, design edit for exact changes, undo, redo, variants, sizes, compare, render, check. Every write is checked; errors change nothing.' },
			{ id: 'video', usage: `${bin} video --template hero --size landscape --json`, readOnly: false, summary: 'Short MP4 or WebM clips (hero, window, closing, cards, field, mark, orbit, social, announcement, product) at square, vertical and landscape; --still <seconds> for one PNG. video templates lists them.' },
			{ id: 'deck', usage: `${bin} deck --input deck.json --json`, readOnly: false, summary: 'Slides at 1920x1080 (cover, section, statement, bullets, stat, quote, image, end): PNG or SVG per slide and one PDF. deck --list shows the slots.' },
			{ id: 'merch', usage: `${bin} merch tee-front --json`, readOnly: false, summary: 'Print files with bleed and safe area (tee front and back, hoodie, cap, tote, mug wrap, die-cut sticker, poster): SVG at physical size and PNG at a dpi. merch --list shows sizes; they are vendor conventions.' },
			{ id: 'illustrate', usage: `${bin} illustrate field --json`, readOnly: false, summary: 'Illustrations in the brand style (field, window, mark, orbit, halftone of --image): vector SVG and PNG. Rules in brand/illustration.md.' },
			{ id: 'figma tokens', usage: `${bin} figma tokens --json`, readOnly: false, summary: 'Brand tokens as Figma variables JSON plus use_figma scripts, and the MCP steps to run.' },
			{ id: 'figma push', usage: `${bin} figma push <illustration|asset|slide|component|page> [target] --json`, readOnly: false, summary: 'Figma-ready SVG or HTML plus the ordered Figma MCP calls. The CLI never calls Figma.' },
			{ id: 'figma pull', usage: `${bin} figma pull <figma url> --json`, readOnly: true, summary: 'The read steps for a Figma node and where to save each result for figma check.' },
			{ id: 'figma check', usage: `${bin} figma check <saved files...> --json`, readOnly: true, summary: 'Flags off-brand colors, fonts, sizes, radii and spacing in exported Figma data, naming the nearest token; exits 1 when there are any.' },
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
		deck: deckCatalog(),
		merch: merchCatalog(),
		illustrate: { ...illustrateData(), rules: 'brand/illustration.md' },
		design: designCatalog(),
		figma: { actions: [...FIGMA_ACTIONS], pushKinds: [...PUSH_KINDS], note: 'The CLI never calls Figma: each action writes files and prints the Figma MCP tool calls to make, in order.' },
		unknownNames: 'Every command, template, size, slot, subject, item, variant and slide type is checked against a fixed list; an unknown name exits 1 and names the nearest choices.',
		gaps: gaps(),
	};
}
