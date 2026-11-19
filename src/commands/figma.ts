import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import type { Command } from 'commander';
import { checkFigmaValues, dedupe } from '../figma/check.js';
import { figmaSvg, parseFigmaUrl, svgScript } from '../figma/push.js';
import { figmaTokens, figmaTokenScripts } from '../figma/tokens.js';
import { loadImage, rasterize } from '../image/render.js';
import { illustrate, subjects } from '../illustrate/render.js';
import { brand } from '../lib/brand.js';
import { unknownName } from '../lib/names.js';
import { emit } from '../lib/output.js';
import { loadIndexSync, loadItemSync } from '../library/registry.js';

// `figma` gives the Figma MCP tools what they need; the CLI never calls Figma itself. Every subcommand writes files
// and prints the exact tool calls, in order, that an agent makes with them.

type Flags = Record<string, string | boolean | undefined>;
export const FIGMA_ACTIONS = ['tokens', 'push', 'pull', 'check'] as const;
export const PUSH_KINDS = ['illustration', 'asset', 'slide', 'component', 'page'] as const;

export type Step = { tool: string; args?: Record<string, unknown>; note: string };

const sessionSteps = (task: string, newFile: boolean): Step[] => [
	...(newFile
		? [
				{ tool: 'whoami', note: 'Only if no planKey is known: read the plans and use the one plan, or ask which.' },
				{ tool: 'create_new_file', args: { fileName: `${brand().name} ${task}`, editorType: 'design', planKey: '<plan key>' }, note: 'Only when there is no target file yet.' },
			]
		: []),
	{ tool: 'create_session', args: { fileKey: '<fileKey>', description: task }, note: 'Before any other file tool; pass the returned sessionId on every later call.' },
];
const useFigmaNote = 'Load the figma-use skill (skill://figma/figma-use/SKILL.md) before the first use_figma call, and figma-generate-library for variables or figma-generate-design for visible frames; pass skillNames.';

function outDir(flags: Flags) {
	const dir = resolve(typeof flags.out === 'string' ? flags.out : 'figma');
	mkdirSync(dir, { recursive: true });
	return dir;
}
const rel = (p: string) => p.replace(`${process.cwd()}/`, '');

function printSteps(json: boolean, doc: { files: string[]; steps: Step[]; [k: string]: unknown }, title: string) {
	emit({ json }, { ok: true, ...doc }, () => [title, ...doc.files.map((f) => `  wrote ${rel(f)}`), 'Figma MCP steps, in order:', ...doc.steps.map((s, i) => `  ${i + 1}. ${s.tool}${s.args ? ` ${JSON.stringify(s.args)}` : ''}\n     ${s.note}`)].join('\n'));
}

function tokensAction(flags: Flags) {
	const dir = outDir(flags);
	const doc = figmaTokens();
	const scripts = figmaTokenScripts(doc);
	const files = [join(dir, 'tokens.json')];
	writeFileSync(files[0], `${JSON.stringify(doc, null, 2)}\n`);
	scripts.forEach((s, i) => {
		const f = join(dir, `tokens-${i + 1}.js`);
		writeFileSync(f, s);
		files.push(f);
	});
	const steps: Step[] = [
		...sessionSteps('apply brand tokens as variables', !flags.file),
		...scripts.map((_, i) => ({ tool: 'use_figma', args: { fileKey: '<fileKey>', sessionId: '<sessionId>', code: `<contents of ${rel(files[i + 1])}>`, skillNames: 'figma-use,figma-generate-library' }, note: i === 0 ? `${useFigmaNote} The script finds or creates "${doc.collection}" with modes ${doc.modes.join(', ')}.` : 'Same collection; continues the variables.' })),
		{ tool: 'get_variable_defs', args: { fileKey: '<fileKey>', nodeId: '<a node bound to the variables>' }, note: 'Optional check once something is bound; run figma check on the saved result.' },
	];
	printSteps(!!flags.json, { files, collection: doc.collection, modes: doc.modes, variables: doc.variables.length, effectStyles: doc.effects.length, skipped: doc.skipped, steps }, `${doc.variables.length} variables (${doc.modes.join(', ')}) and ${doc.effects.length} effect styles; ${doc.skipped.length} tokens have no Figma type.`);
}

/** Static HTML for html_to_figma: the page as rendered, stylesheets and images inlined, scripts removed. */
async function snapshotHtml(url: string, width: number): Promise<string> {
	const { launch } = await import('../review/capture.js');
	const browser = await launch();
	try {
		const page = await browser.newPage({ viewport: { width, height: 900 } });
		await page.goto(url, { waitUntil: 'networkidle' });
		return await page.evaluate(async () => {
			const toData = async (src: string) => {
				try {
					const blob = await (await fetch(src)).blob();
					return await new Promise<string>((ok) => {
						const r = new FileReader();
						r.onload = () => ok(String(r.result));
						r.readAsDataURL(blob);
					});
				} catch {
					return src;
				}
			};
			let css = '';
			for (const sheet of Array.from(document.styleSheets)) {
				try {
					css += Array.from(sheet.cssRules).map((r) => r.cssText).join('\n');
				} catch {}
			}
			const doc = document.documentElement.cloneNode(true) as HTMLElement;
			doc.querySelectorAll('script, link[rel="stylesheet"], link[rel="preload"], noscript, nextjs-portal').forEach((n) => n.remove());
			for (const img of Array.from(doc.querySelectorAll('img'))) if (img.src) img.src = await toData(img.src);
			const style = document.createElement('style');
			style.textContent = css.replace(/url\((['"]?)(\/[^)'"]+)\1\)/g, (_m, _q, p) => `url(${location.origin}${p})`);
			doc.querySelector('head')?.appendChild(style);
			return `<!doctype html>\n${doc.outerHTML}`;
		});
	} finally {
		await browser.close();
	}
}

function svgSteps(dir: string, svgText: string, name: string, frame: string, files: string[], steps: Step[]) {
	const clean = figmaSvg(svgText);
	const upload = join(dir, `${name}.figma.svg`);
	writeFileSync(upload, clean);
	files.push(upload);
	const script = svgScript(clean, frame);
	if (script) {
		const f = join(dir, `push-${name}.js`);
		writeFileSync(f, script);
		files.push(f);
		steps.push({ tool: 'use_figma', args: { fileKey: '<fileKey>', sessionId: '<sessionId>', code: `<contents of ${rel(f)}>`, skillNames: 'figma-use,figma-generate-design' }, note: `${useFigmaNote} Imports the SVG as editable layers in "${frame}", placed clear of existing frames.` });
	}
	steps.push({ tool: 'upload_assets', args: { fileKey: '<fileKey>', count: 1 }, note: `${script ? 'Instead of the script, or ' : ''}for an SVG too big for one script: POST ${rel(upload)} with Content-Type image/svg+xml to the returned URL; it arrives as editable vectors.` });
}

async function pushAction(kind: string | undefined, target: string | undefined, flags: Flags) {
	if (!kind) throw new Error(`Name what to push: ${PUSH_KINDS.join(', ')}`);
	if (!(PUSH_KINDS as readonly string[]).includes(kind)) throw unknownName('push kind', kind, [...PUSH_KINDS]);
	const dir = outDir(flags);
	const files: string[] = [];
	const steps: Step[] = [...sessionSteps(`push ${kind}${target ? ` ${target}` : ''}`, !flags.file)];
	const extra: Record<string, unknown> = {};
	if (kind === 'illustration') {
		if (!target) throw new Error(`Name a subject: ${subjects().join(', ')}`);
		if (!subjects().includes(target)) throw unknownName('subject', target, subjects());
		let width: number | undefined;
		let height: number | undefined;
		if (typeof flags.size === 'string') {
			const m = /^(\d+)x(\d+)$/i.exec(flags.size);
			if (!m) throw new Error('--size takes WIDTHxHEIGHT');
			width = Number(m[1]);
			height = Number(m[2]);
		}
		const picture = typeof flags.image === 'string' ? loadImage(resolve(flags.image)) : undefined;
		const r = illustrate({ subject: target, width, height, seed: typeof flags.seed === 'string' ? Number(flags.seed) : undefined, picture });
		const svg = join(dir, `illustration-${target}.svg`);
		const png = join(dir, `illustration-${target}.png`);
		writeFileSync(svg, r.svg);
		writeFileSync(png, rasterize(r.svg));
		files.push(svg, png);
		svgSteps(dir, r.svg, `illustration-${target}`, `Illustration / ${target}`, files, steps);
		extra.glyphs = r.glyphs;
	} else if (kind === 'asset' || kind === 'slide') {
		if (!target) throw new Error('Pass the file to push (SVG, PNG, JPEG, WebP, GIF or HTML)');
		const file = resolve(target);
		if (!existsSync(file)) throw new Error(`No such file: ${target}`);
		const ext = extname(file).toLowerCase();
		const name = basename(file, ext);
		const types: Record<string, string> = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' };
		if (ext === '.html' || ext === '.htm') {
			const out = join(dir, `${name}.html`);
			writeFileSync(out, readFileSync(file));
			files.push(out);
			steps.push({ tool: 'html_to_figma', args: { fileKey: '<fileKey>', sessionId: '<sessionId>', promptId: '<new uuid>' }, note: `POST ${rel(out)} (Content-Type text/html) to the returned single-use URL. The HTML must be self-contained (inline CSS, images as data URIs).` });
		} else if (ext === '.svg') svgSteps(dir, readFileSync(file, 'utf8'), name, `${kind === 'slide' ? 'Slide' : 'Asset'} / ${name}`, files, steps);
		else if (types[ext]) steps.push({ tool: 'upload_assets', args: { fileKey: '<fileKey>', count: 1 }, note: `POST ${rel(file)} with Content-Type ${types[ext]} to the returned URL (it arrives as an image fill in a new frame). For editable layers, render the asset with --format svg and push that.` });
		else throw unknownName('file type', ext || target, [...Object.keys(types), '.html']);
	} else if (kind === 'component') {
		if (!target) throw new Error('Name a library component (see list --json)');
		const item = loadItemSync(target);
		if (!item) throw unknownName('component', target, loadIndexSync().map((i) => i.name));
		const previews = (item.examples ?? []).flatMap((e) => e.previews ?? []);
		const preview = typeof flags.example === 'string' ? previews.find((p) => p.name === flags.example) : previews[0];
		if (!preview) throw unknownName('example', String(flags.example ?? ''), previews.map((p) => p.name));
		const base = typeof flags.url === 'string' ? flags.url.replace(/\/$/, '') : undefined;
		const url = base ? `${base}${new URL(preview.url).pathname}` : preview.url;
		const html = await snapshotHtml(url, Number(flags.width ?? 1440));
		const out = join(dir, `component-${target}-${preview.name}.html`);
		writeFileSync(out, html);
		files.push(out);
		extra.preview = url;
		steps.push({ tool: 'html_to_figma', args: { fileKey: '<fileKey>', sessionId: '<sessionId>', promptId: '<new uuid>' }, note: `POST ${rel(out)} (text/html) to the returned URL. Plain layers; rebuild as a component with use_figma and the variables when it must be reusable.` });
	} else {
		if (!target) throw new Error('Pass a page URL or a saved HTML file');
		const html = /^https?:/.test(target) ? await snapshotHtml(target, Number(flags.width ?? 1440)) : readFileSync(resolve(target), 'utf8');
		const out = join(dir, `page-${(/^https?:/.test(target) ? new URL(target).pathname : basename(target)).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'}.html`);
		writeFileSync(out, html);
		files.push(out);
		steps.push({ tool: 'html_to_figma', args: { fileKey: '<fileKey>', sessionId: '<sessionId>', promptId: '<new uuid>' }, note: `POST ${rel(out)} (text/html) to the returned URL.` });
	}
	steps.push({ tool: 'get_screenshot', args: { fileKey: '<fileKey>', nodeId: '<frameId from the last step>', sessionId: '<sessionId>' }, note: 'One screenshot to confirm the result; stop when it matches.' });
	printSteps(!!flags.json, { files, kind, target: target ?? null, ...extra, steps }, `Ready to push ${kind}${target ? ` ${target}` : ''}.`);
}

function pullAction(url: string | undefined, flags: Flags) {
	if (!url) throw new Error('Pass a Figma URL with a node-id (https://figma.com/design/<fileKey>/<name>?node-id=1-2)');
	const { fileKey, nodeId, kind } = parseFigmaUrl(url);
	if (kind !== 'design') throw new Error(`figma pull reads design files; this is a ${kind} URL`);
	if (!nodeId) throw new Error('The URL has no node-id: select the frame in Figma and copy its link');
	const dir = outDir(flags);
	const vars = join(dir, `variables-${nodeId.replace(':', '-')}.json`);
	const ctx = join(dir, `design-${nodeId.replace(':', '-')}.txt`);
	const steps: Step[] = [
		{ tool: 'create_session', args: { fileKey, description: `check node ${nodeId} against ${brand().name} tokens` }, note: 'First; pass the returned sessionId on the next calls.' },
		{ tool: 'get_variable_defs', args: { fileKey, nodeId, sessionId: '<sessionId>' }, note: `Save the JSON result to ${rel(vars)}.` },
		{ tool: 'get_design_context', args: { fileKey, nodeId, sessionId: '<sessionId>', clientFrameworks: 'react', clientLanguages: 'typescript' }, note: `Load the figma-design-to-code skill first. Save the returned code to ${rel(ctx)}.` },
		{ tool: 'shell', args: { run: `npx ${brand().bin} figma check ${rel(vars)} ${rel(ctx)} --json` }, note: 'Lists every value that is not a brand token, with the nearest token. Build with library components and tokens, never the raw values.' },
	];
	printSteps(!!flags.json, { files: [], fileKey, nodeId, saveTo: { variables: vars, designContext: ctx }, steps }, `Figma file ${fileKey}, node ${nodeId}.`);
}

function checkAction(paths: string[], flags: Flags) {
	if (!paths.length) throw new Error('Pass the saved get_variable_defs JSON and/or get_design_context code');
	const all = paths.flatMap((p) => {
		if (!existsSync(p)) throw new Error(`No such file: ${p}`);
		return checkFigmaValues(readFileSync(p, 'utf8')).map((f) => ({ ...f, where: `${p} ${f.where}` }));
	});
	const findings = dedupe(all);
	const off = findings.filter((f) => !f.ok);
	const doc = { ok: off.length === 0, checked: all.length, offBrand: off, onBrand: findings.filter((f) => f.ok) };
	emit({ json: !!flags.json }, doc, () => (off.length ? [`${off.length} off-brand value${off.length === 1 ? '' : 's'}:`, ...off.map((f) => `  ${f.kind.padEnd(7)} ${f.message} (${f.count}x, first at ${f.where})`)] : [`All ${all.length} values are brand tokens.`]).join('\n'));
	if (off.length) process.exitCode = 1;
}

export function figmaCommand(program: Command) {
	program
		.command('figma [action] [args...]')
		.description('Work in Figma through its MCP tools: tokens, push <illustration|asset|slide|component|page>, pull <url>, check <files...>')
		.option('--out <dir>', 'where to write the files (default ./figma)')
		.option('--file <key>', 'an existing Figma file key (skips the create-file steps)')
		.option('--image <file>', 'push illustration: the picture (window, halftone)')
		.option('--size <WxH>', 'push illustration: frame size')
		.option('--seed <n>', 'push illustration: seed')
		.option('--example <name>', 'push component: which preview (default the first)')
		.option('--url <base>', 'push component: docs site to capture from (default the hosted registry)')
		.option('--width <px>', 'push component or page: capture width', '1440')
		.option('--json', 'JSON output')
		.action(async (action: string | undefined, args: string[], _o: unknown, cmd: Command) => {
			const flags = cmd.optsWithGlobals() as Flags;
			if (!action) throw new Error(`Name an action: ${FIGMA_ACTIONS.join(', ')}`);
			if (action === 'tokens') return tokensAction(flags);
			if (action === 'push') return pushAction(args[0], args[1], flags);
			if (action === 'pull') return pullAction(args[0], flags);
			if (action === 'check') return checkAction(args, flags);
			throw unknownName('figma action', action, [...FIGMA_ACTIONS]);
		})
		.addHelpText('after', () => ['', 'The CLI never calls Figma: it writes files and prints the Figma MCP steps to run, in order.', `  npx ${brand().bin} figma tokens`, `  npx ${brand().bin} figma push illustration field`, `  npx ${brand().bin} figma push slide deck/slide-01-cover.svg`, `  npx ${brand().bin} figma pull "https://figma.com/design/<key>/x?node-id=1-2"`, `  npx ${brand().bin} figma check figma/variables-1-2.json figma/design-1-2.txt`].join('\n'));
}
