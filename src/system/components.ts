import { componentApis, emitElement, exampleParts, pascal, type ComponentApi, type PropSchema } from '../library/api.js';
import { loadIndexSync, loadItemSync, type IndexEntry } from '../library/registry.js';

export const COMPONENT_TYPES = ['ui', 'product', 'site', 'visual', 'block', 'hook', 'lib', 'theme'] as const;

function catalog(): IndexEntry[] {
	const items = loadIndexSync();
	if (!items.length) throw new Error('The component library index is not available. Build the registry, then retry.');
	return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

function oneOf(value: string | undefined, allowed: readonly string[], label: string) {
	if (value === undefined || value === '') return undefined;
	if (!allowed.includes(value)) throw new Error(`Unknown ${label} "${value}". Use ${allowed.join(', ')}.`);
	return value;
}

export function listComponents(options: { type?: string } = {}) {
	const type = oneOf(options.type, COMPONENT_TYPES, 'component type');
	const components = catalog()
		.filter((item) => !type || item.type === type)
		.map((item) => ({
			name: item.name,
			type: item.type,
			surface: item.surface,
			title: item.title,
			description: item.description,
			exports: item.exports ?? [],
			useFor: item.useFor,
			constraints: item.constraints ?? [],
		}));
	return { components, count: components.length };
}

function itemOrThrow(name: string) {
	if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error(`Unknown component "${name}". Run component list --json.`);
	const item = loadItemSync(name);
	if (!item) throw new Error(`Unknown component "${name}". Run component list --json.`);
	return item;
}

function apisOf(item: { files?: { path: string; content: string }[] }) {
	const apis: ComponentApi[] = [];
	for (const file of item.files ?? []) {
		if (!file.path.endsWith('.tsx') && !file.path.endsWith('.ts')) continue;
		try {
			apis.push(...componentApis(file.content));
		} catch (error) {
			throw new Error(`Could not read props from ${file.path}. ${(error as Error).message}`);
		}
	}
	const seen = new Set<string>();
	return apis.filter((api) => (seen.has(api.export) ? false : (seen.add(api.export), true)));
}

function moduleFrom(path: string) {
	return `@/${path.replace(/\.(tsx|ts|css)$/, '')}`;
}

export function inspectComponent(name: string) {
	const item = itemOrThrow(name);
	const example = item.examples?.[0];
	let parts = { imports: '', states: [] as { name: string; source: string }[] };
	if (example?.content) {
		try {
			parts = exampleParts(example.content);
		} catch (error) {
			throw new Error(`Could not read states from ${example.path}. ${(error as Error).message}`);
		}
	}
	return {
		name: item.name,
		type: item.type,
		surface: item.surface,
		title: item.title,
		description: item.description,
		useFor: item.useFor,
		constraints: item.constraints ?? [],
		exports: item.exports ?? [],
		api: apisOf(item),
		states: parts.states.map((state) => state.name),
		examples: parts.states,
		imports: parts.imports,
		files: item.files ?? [],
	};
}

export function componentSummary(name: string) {
	const detail = inspectComponent(name);
	return {
		name: detail.name,
		type: detail.type,
		surface: detail.surface,
		title: detail.title,
		description: detail.description,
		exports: detail.exports,
		useFor: detail.useFor,
		constraints: detail.constraints,
		api: detail.api,
		states: detail.states,
	};
}

function apiByName(apis: ComponentApi[], exportName: string | undefined, itemName: string) {
	if (exportName) {
		const found = apis.find((api) => api.export === exportName);
		if (!found) throw new Error(`Unknown export "${exportName}" on ${itemName}. Exports: ${apis.map((api) => api.export).join(', ') || 'none'}.`);
		return found;
	}
	const preferred = pascal(itemName);
	const found = apis.find((api) => api.export === preferred);
	if (found) return found;
	if (apis.length === 1) return apis[0];
	throw new Error(`Pass --export for ${itemName}. Exports: ${apis.map((api) => api.export).join(', ') || 'none'}.`);
}

function fileForExport(files: { path: string; content: string }[], exportName: string) {
	return files.find((file) => componentApis(file.content).some((api) => api.export === exportName));
}

export function emitComponent(name: string, options: { state?: string; exportName?: string; props?: string; text?: string }) {
	if (options.state && (options.props !== undefined || options.exportName || options.text !== undefined)) {
		throw new Error('Pass --state or --props, not both.');
	}
	const detail = inspectComponent(name);
	if (options.state || (!options.props && options.text === undefined && !options.exportName)) {
		if (!options.state) throw new Error(`Pass --state <name> or --props <json>. States: ${detail.states.join(', ') || 'none'}.`);
		const state = detail.examples.find((item) => item.name === options.state);
		if (!state) throw new Error(`Unknown state "${options.state}" on ${name}. States: ${detail.states.join(', ') || 'none'}.`);
		const code = [detail.imports, state.source].filter(Boolean).join('\n\n');
		return { name, mode: 'state' as const, state: state.name, export: undefined, props: undefined, imports: detail.imports, source: state.source, code: code.endsWith('\n') ? code : `${code}\n` };
	}
	let values: Record<string, unknown> = {};
	if (options.props !== undefined) {
		let parsed: unknown;
		try {
			parsed = JSON.parse(options.props);
		} catch {
			throw new Error('--props must be a JSON object.');
		}
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('--props must be a JSON object.');
		values = parsed as Record<string, unknown>;
	}
	if (options.text === undefined) throw new Error('Pass --text for the element children.');
	const api = apiByName(detail.api, options.exportName, name);
	if (!Object.keys(api.props).length && Object.keys(values).length) throw new Error(`No prop schema was parsed for ${api.export}. Pass --state to emit an example.`);
	const file = fileForExport(detail.files, api.export);
	if (!file) throw new Error(`No source file exports ${api.export}.`);
	const code = emitElement({ exportName: api.export, from: moduleFrom(file.path), props: api.props, values, text: options.text });
	return { name, mode: 'props' as const, state: undefined, export: api.export, props: values, imports: `import { ${api.export} } from ${JSON.stringify(moduleFrom(file.path))};`, source: code, code };
}

export type { PropSchema };
