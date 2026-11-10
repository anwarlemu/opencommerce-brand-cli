import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { componentApis, emitElement } from '../src/library/api.js';
import { brand, colorHex } from '../src/lib/brand.js';
import { emitComponent, inspectComponent, listComponents } from '../src/system/components.js';
import { fontRecords, gaps, loadSystem, logoRecords } from '../src/system/load.js';
import { manifest } from '../src/system/manifest.js';
import { groupedTokens, lookupToken } from '../src/system/tokens.js';

const ROOT = join(import.meta.dirname, '..');
const BIN = join(ROOT, 'bin.js');
const run = (args: string[]) => {
	try {
		return { status: 0, stdout: execFileSync(process.execPath, [BIN, ...args], { encoding: 'utf8' }), stderr: '' };
	} catch (error) {
		const failed = error as { status?: number; stdout?: string; stderr?: string };
		return { status: failed.status ?? 1, stdout: String(failed.stdout ?? ''), stderr: String(failed.stderr ?? '') };
	}
};

describe('brand system', () => {
	it('groups every token and rejects an unknown name', () => {
		const grouped = groupedTokens();
		expect(Object.keys(grouped.other)).toEqual([]);
		for (const group of ['color', 'type', 'space', 'radius', 'motion', 'shadow']) expect(Object.keys(grouped.groups[group as 'color']).length).toBeGreaterThan(0);
		expect(lookupToken('--ds-color-brand').value.toLowerCase()).toBe(colorHex('brand')?.toLowerCase());
		expect(() => lookupToken('--ds-color-nope')).toThrow(/Unknown token/);
		expect(() => lookupToken('--made-up')).toThrow(/Unknown token/);
	});

	it('lists only font and logo files that exist, and records the missing display face', () => {
		const fonts = fontRecords();
		expect(fonts.map((face) => face.id)).toEqual(['sans', 'display', 'mono']);
		const display = fonts.find((face) => face.id === 'display');
		expect(display?.bundled).toBe(false);
		expect(display?.substitute?.file).toBe('brand/fonts/TeXGyreHeros-Regular.otf');
		for (const face of fonts) {
			for (const file of face.files) expect(existsSync(join(ROOT, file.path)), file.path).toBe(true);
			if (face.substitute) expect(existsSync(join(ROOT, face.substitute.file))).toBe(true);
		}
		const logos = logoRecords();
		expect(logos.map((logo) => logo.id)).toEqual(['mark', 'lockup']);
		expect(logos[0].svg.toLowerCase()).toContain(colorHex('brand')?.toLowerCase());
		expect(logos[1].svg.toLowerCase()).toContain(brand().name);
		const prose = readFileSync(join(ROOT, 'brand/principles.md'), 'utf8');
		for (const word of loadSystem().voice.banned) expect(prose).toContain(word);
		expect(loadSystem().voice.productName).toBe(brand().name);
		expect(gaps().map((gap) => gap.id)).toEqual(expect.arrayContaining(['font-display', 'product-surface']));
		expect(existsSync(join(ROOT, 'registry/components/product'))).toBe(false);
		expect(brand().surfaces).toEqual(['site']);
	});

	it('parses button props from source and refuses an unknown value', () => {
		const source = readFileSync(join(ROOT, 'registry/components/ui/button.tsx'), 'utf8');
		const button = componentApis(source).find((api) => api.export === 'Button');
		expect(button?.props.variant).toMatchObject({ kind: 'enum', values: ['primary', 'secondary', 'on-brand', 'ghost'], default: 'primary' });
		expect(button?.props.size).toMatchObject({ kind: 'enum', values: ['md', 'sm', 'icon'] });
		expect(button?.props.asChild).toMatchObject({ kind: 'boolean', default: false });
		expect(() => emitElement({ exportName: 'Button', from: '@/components/ui/button', props: button!.props, values: { variant: 'link' }, text: 'Go' })).toThrow(/Unknown value/);
		const hero = componentApis(readFileSync(join(ROOT, 'registry/components/site/hero.tsx'), 'utf8')).find((api) => api.export === 'Hero');
		expect(hero?.props.glyphs).toMatchObject({ kind: 'boolean', default: true });
		expect(hero?.props.title).toMatchObject({ kind: 'node' });
	});
});

describe('agent catalog', () => {
	it('manifest lists the capabilities and describe matches it', () => {
		const data = manifest();
		expect(data.entry).toBe('manifest');
		expect(data.alias).toBe('describe');
		expect(data.tokens.other).toEqual([]);
		expect(data.image.templates.map((item) => item.id)).toEqual(['headline', 'lead', 'frame', 'quote', 'announcement']);
		expect(data.video.templates.map((item) => item.id)).toEqual(['social', 'announcement', 'product']);
		expect(data.video.sizes.map((item) => item.id)).toEqual(['square', 'vertical', 'landscape']);
		expect(data.components.map((item) => item.name)).toContain('button');
		expect(data.principles.product.summary.toLowerCase()).toContain('site');
		const listed = listComponents();
		expect(listed.count).toBe(data.components.length);
		expect(() => listComponents({ type: 'widget' })).toThrow(/Unknown component type/);
		expect(listComponents({ type: 'product' }).count).toBe(0);
	});

	it('inspects and emits button, and errors on an unknown component or state', () => {
		const button = inspectComponent('button');
		expect(button.states).toContain('Site');
		expect(button.api.find((api) => api.export === 'Button')?.props.variant).toMatchObject({ kind: 'enum' });
		const state = emitComponent('button', { state: 'Site' });
		expect(state.code).toContain('export function Site');
		expect(state.code).toContain('Get started');
		expect(readFileSync(join(ROOT, 'registry/examples/button.tsx'), 'utf8')).toContain(state.source.trim());
		const props = emitComponent('button', { props: '{"variant":"secondary","size":"sm"}', text: 'Read the docs' });
		expect(props.code).toContain('variant="secondary"');
		expect(props.code).toContain('size="sm"');
		expect(props.code).toContain('"Read the docs"');
		expect(props.code).toContain('@/components/ui/button');
		expect(() => emitComponent('button', { props: '{"variant":"link"}', text: 'Go' })).toThrow(/Unknown value/);
		expect(() => emitComponent('button', { state: 'Hover' })).toThrow(/Unknown state/);
		expect(() => emitComponent('not-a-component', { state: 'Site' })).toThrow(/Unknown component/);
		expect(() => emitComponent('button', {})).toThrow(/Pass --state/);
		expect(() => emitComponent('button', { state: 'Site', props: '{}' })).toThrow(/not both/);
	});

	it('answers manifest, brand, principles and component as JSON and rejects unknown input', () => {
		const manifestJson = JSON.parse(run(['manifest', '--json']).stdout);
		const described = JSON.parse(run(['describe', '--json']).stdout);
		expect(manifestJson.ok).toBe(true);
		expect(described.components.map((item: { name: string }) => item.name)).toEqual(manifestJson.components.map((item: { name: string }) => item.name));
		expect(manifestJson.gaps.map((gap: { id: string }) => gap.id)).toEqual(expect.arrayContaining(['font-display', 'product-surface']));
		const token = JSON.parse(run(['brand', 'tokens', '--name=--ds-color-brand', '--json']).stdout);
		expect(token).toMatchObject({ ok: true, name: '--ds-color-brand', group: 'color' });
		const missing = JSON.parse(run(['brand', 'tokens', '--group', 'plasma', '--json']).stdout);
		expect(missing.ok).toBe(false);
		expect(missing.error).toMatch(/Unknown token group/);
		const principles = JSON.parse(run(['principles', '--surface', 'product', '--json']).stdout);
		expect(principles.surface).toBe('product');
		expect(principles.do.length).toBeGreaterThan(0);
		const badSurface = JSON.parse(run(['principles', '--surface', 'print', '--json']).stdout);
		expect(badSurface.ok).toBe(false);
		const emitted = JSON.parse(run(['component', 'emit', 'button', '--props', '{"variant":"ghost"}', '--text', 'Get started', '--json']).stdout);
		expect(emitted.ok).toBe(true);
		expect(emitted.code).toContain('variant="ghost"');
		const unknown = JSON.parse(run(['component', 'inspect', 'nope', '--json']).stdout);
		expect(unknown.ok).toBe(false);
		expect(unknown.error).toMatch(/Unknown component/);
		const voice = JSON.parse(run(['brand', 'voice', '--json']).stdout);
		expect(voice.voice.banned).toContain('seamless');
	});
});
