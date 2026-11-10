import { parse } from '@babel/parser';

export type PropSchema =
	| { kind: 'enum'; values: string[]; default?: string }
	| { kind: 'boolean'; default?: boolean }
	| { kind: 'string' }
	| { kind: 'node' };

export type ComponentApi = { export: string; props: Record<string, PropSchema> };

type Ast = { type: string; start: number; end: number; [key: string]: any };

function tree(source: string): Ast {
	return parse(source, { sourceType: 'module', plugins: ['jsx', 'typescript'] }) as unknown as Ast;
}

function keyName(node: Ast | undefined): string | undefined {
	if (!node) return undefined;
	if (node.type === 'Identifier') return node.name;
	if (node.type === 'StringLiteral') return node.value;
	return undefined;
}

function objectProps(node: Ast | undefined): Ast[] {
	if (!node || node.type !== 'ObjectExpression') return [];
	return (node.properties ?? []).filter((prop: Ast) => prop.type === 'ObjectProperty');
}

function refName(node: Ast | undefined): string {
	if (!node || node.type !== 'TSTypeReference') return '';
	if (node.typeName?.type === 'Identifier') return node.typeName.name;
	if (node.typeName?.type === 'TSQualifiedName') return node.typeName.right?.name ?? '';
	return '';
}

function readProp(node: Ast | undefined): PropSchema | undefined {
	if (!node) return undefined;
	if (node.type === 'TSBooleanKeyword') return { kind: 'boolean' };
	if (node.type === 'TSStringKeyword') return { kind: 'string' };
	if (node.type === 'TSTypeReference') {
		const name = refName(node);
		if (name === 'ReactNode') return { kind: 'node' };
		return undefined;
	}
	if (node.type === 'TSUnionType') {
		const values: string[] = [];
		for (const part of node.types ?? []) {
			if (part.type !== 'TSLiteralType' || part.literal?.type !== 'StringLiteral') return undefined;
			values.push(part.literal.value);
		}
		return values.length ? { kind: 'enum', values } : undefined;
	}
	return undefined;
}

function variantsOf(call: Ast): Record<string, PropSchema> {
	const arg = call.arguments?.[1];
	const props: Record<string, { kind: 'enum'; values: string[]; default?: string }> = {};
	let defaults: Ast | undefined;
	for (const prop of objectProps(arg)) {
		const name = keyName(prop.key);
		if (name === 'variants') {
			for (const variant of objectProps(prop.value)) {
				const variantName = keyName(variant.key);
				if (!variantName || variant.value?.type !== 'ObjectExpression') continue;
				const values = objectProps(variant.value).map((item) => keyName(item.key)).filter((item): item is string => !!item);
				if (values.length) props[variantName] = { kind: 'enum', values };
			}
		}
		if (name === 'defaultVariants') defaults = prop.value;
	}
	for (const prop of objectProps(defaults)) {
		const name = keyName(prop.key);
		const value = prop.value?.type === 'StringLiteral' ? prop.value.value : undefined;
		if (name && value && props[name]?.values.includes(value)) props[name].default = value;
	}
	return props;
}

function cvaMap(body: Ast[]) {
	const map = new Map<string, Record<string, PropSchema>>();
	const visit = (node: Ast | undefined) => {
		if (!node || typeof node !== 'object') return;
		if (node.type === 'VariableDeclarator' && node.id?.type === 'Identifier' && node.init?.type === 'CallExpression') {
			const callee = node.init.callee;
			if (callee?.type === 'Identifier' && callee.name === 'cva') map.set(node.id.name, variantsOf(node.init));
		}
		for (const value of Object.values(node)) {
			if (Array.isArray(value)) value.forEach(visit);
			else if (value && typeof value === 'object' && typeof value.type === 'string') visit(value);
		}
	};
	body.forEach(visit);
	return map;
}

function aliasesOf(body: Ast[]) {
	const map = new Map<string, Ast>();
	for (const stmt of body) {
		if (stmt.type === 'TSTypeAliasDeclaration' && stmt.id?.name) map.set(stmt.id.name, stmt.typeAnnotation);
	}
	return map;
}

function typeArgs(node: Ast): Ast[] {
	return node.typeParameters?.params ?? node.typeArguments?.params ?? [];
}

function readType(node: Ast | undefined, aliases: Map<string, Ast>, cvas: Map<string, Record<string, PropSchema>>, into: Record<string, PropSchema>, seen: Set<string>) {
	if (!node) return;
	if (node.type === 'TSIntersectionType' || node.type === 'TSUnionType') {
		for (const part of node.types ?? []) readType(part, aliases, cvas, into, seen);
		return;
	}
	if (node.type === 'TSTypeLiteral') {
		for (const member of node.members ?? []) {
			if (member.type !== 'TSPropertySignature') continue;
			const name = keyName(member.key);
			if (!name || name === 'className' || name === 'children') continue;
			const prop = readProp(member.typeAnnotation?.typeAnnotation);
			if (prop) into[name] = prop;
		}
		return;
	}
	if (node.type === 'TSTypeReference') {
		const name = refName(node);
		if (name === 'VariantProps') {
			const query = typeArgs(node)[0];
			const target = query?.type === 'TSTypeQuery' ? query.exprName?.name : undefined;
			if (target && cvas.has(target)) Object.assign(into, cvas.get(target));
			return;
		}
		if (name && aliases.has(name) && !seen.has(name)) {
			seen.add(name);
			readType(aliases.get(name), aliases, cvas, into, seen);
		}
	}
}

function booleanDefaults(fn: Ast) {
	const param = fn.params?.[0];
	const out: Record<string, boolean> = {};
	if (param?.type !== 'ObjectPattern') return out;
	for (const prop of param.properties ?? []) {
		if (prop.type !== 'ObjectProperty') continue;
		const name = keyName(prop.key);
		if (name && prop.value?.type === 'AssignmentPattern' && prop.value.right?.type === 'BooleanLiteral') out[name] = prop.value.right.value;
	}
	return out;
}

function exportedFunctions(body: Ast[], source: string) {
	const names = new Set<string>();
	const direct: { name: string; fn: Ast }[] = [];
	const pending = new Map<string, Ast>();
	for (const stmt of body) {
		if (stmt.type === 'FunctionDeclaration' && stmt.id?.name) pending.set(stmt.id.name, stmt);
		if (stmt.type === 'VariableDeclaration') {
			for (const decl of stmt.declarations ?? []) {
				if (decl.id?.type === 'Identifier' && (decl.init?.type === 'ArrowFunctionExpression' || decl.init?.type === 'FunctionExpression')) pending.set(decl.id.name, decl.init);
			}
		}
		if (stmt.type !== 'ExportNamedDeclaration') continue;
		const decl = stmt.declaration;
		if (decl?.type === 'FunctionDeclaration' && decl.id?.name) names.add(decl.id.name);
		if (decl?.type === 'VariableDeclaration') {
			for (const item of decl.declarations ?? []) if (item.id?.type === 'Identifier') names.add(item.id.name);
		}
		for (const spec of stmt.specifiers ?? []) names.add(spec.exported?.name ?? spec.local?.name);
	}
	for (const name of names) {
		const fn = pending.get(name);
		if (fn) direct.push({ name, fn });
	}
	return direct.sort((a, b) => source.indexOf(`function ${a.name}`) - source.indexOf(`function ${b.name}`));
}

/** Prop schemas read from a component file. Enums, booleans, strings and text nodes only. */
export function componentApis(source: string): ComponentApi[] {
	const ast = tree(source);
	const body = ast.program.body as Ast[];
	const cvas = cvaMap(body);
	const aliases = aliasesOf(body);
	return exportedFunctions(body, source).map(({ name, fn }) => {
		const props: Record<string, PropSchema> = {};
		readType(fn.params?.[0]?.typeAnnotation?.typeAnnotation, aliases, cvas, props, new Set());
		const text = source.slice(fn.start ?? 0, fn.end ?? 0);
		for (const [cvaName, variants] of cvas) {
			if (text.includes(`${cvaName}(`) || text.includes(`typeof ${cvaName}`)) Object.assign(props, variants);
		}
		for (const [prop, value] of Object.entries(booleanDefaults(fn))) {
			if (!props[prop]) props[prop] = { kind: 'boolean', default: value };
			else if (props[prop].kind === 'boolean' && props[prop].default === undefined) props[prop] = { kind: 'boolean', default: value };
		}
		return { export: name, props };
	});
}

export function exampleParts(source: string) {
	if (!source.trim()) return { imports: '', states: [] as { name: string; source: string }[] };
	const ast = tree(source);
	const body = ast.program.body as Ast[];
	let importStart: number | undefined;
	let importEnd: number | undefined;
	const states: { name: string; source: string }[] = [];
	for (const stmt of body) {
		if (stmt.type === 'ImportDeclaration') {
			importStart ??= stmt.start;
			importEnd = stmt.end;
		}
		if (stmt.type === 'ExportNamedDeclaration' && stmt.declaration?.type === 'FunctionDeclaration' && stmt.declaration.id?.name) {
			states.push({ name: stmt.declaration.id.name, source: source.slice(stmt.start, stmt.end) });
		}
		if (stmt.type === 'ExportNamedDeclaration' && stmt.declaration?.type === 'VariableDeclaration') {
			for (const decl of stmt.declaration.declarations ?? []) {
				if (decl.id?.type === 'Identifier' && (decl.init?.type === 'ArrowFunctionExpression' || decl.init?.type === 'FunctionExpression')) {
					states.push({ name: decl.id.name, source: source.slice(stmt.start, stmt.end) });
				}
			}
		}
	}
	return { imports: importStart === undefined ? '' : source.slice(importStart, importEnd).trim(), states };
}

export function pascal(name: string) {
	return name.split('-').map((part) => (part ? part[0].toUpperCase() + part.slice(1) : '')).join('');
}

const ATTR = /^[A-Za-z][A-Za-z0-9]*$/;

export function emitElement(options: { exportName: string; from: string; props: Record<string, PropSchema>; values: Record<string, unknown>; text: string }) {
	const attrs: string[] = [];
	for (const [key, value] of Object.entries(options.values)) {
		if (!ATTR.test(key)) throw new Error(`Unknown prop "${key}" on ${options.exportName}.`);
		const prop = options.props[key];
		if (!prop) {
			const known = Object.keys(options.props);
			throw new Error(`Unknown prop "${key}" on ${options.exportName}. Known props: ${known.join(', ') || 'none'}.`);
		}
		if (prop.kind === 'enum') {
			if (typeof value !== 'string' || !prop.values.includes(value)) throw new Error(`Unknown value "${String(value)}" for ${key}. Use ${prop.values.join(', ')}.`);
			attrs.push(`${key}=${JSON.stringify(value)}`);
		} else if (prop.kind === 'boolean') {
			if (typeof value !== 'boolean') throw new Error(`Prop ${key} must be a boolean.`);
			attrs.push(value ? key : `${key}={false}`);
		} else if (prop.kind === 'string' || prop.kind === 'node') {
			if (typeof value !== 'string') throw new Error(`Prop ${key} must be a string.`);
			attrs.push(`${key}=${JSON.stringify(value)}`);
		}
	}
	const open = attrs.length ? `<${options.exportName} ${attrs.join(' ')}>` : `<${options.exportName}>`;
	const child = `{${JSON.stringify(options.text)}}`;
	return `import { ${options.exportName} } from ${JSON.stringify(options.from)};\n\nexport function ${options.exportName}Example() {\n  return (\n    ${open}\n      ${child}\n    </${options.exportName}>\n  );\n}\n`;
}
