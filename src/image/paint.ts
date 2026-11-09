import { readFileSync } from 'node:fs';
import { brand, colorHex, tokens } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';

// Every color and every spacing step the images use is read from the brand tokens, not written here.

function px(value: string) {
	if (value.endsWith('rem')) return Number.parseFloat(value) * 16;
	if (value.endsWith('px')) return Number.parseFloat(value);
	return Number.parseFloat(value);
}

export function paint() {
	const site = tokens().site;
	const color = (name: string) => {
		const hex = colorHex(name);
		if (!hex) throw new Error(`Brand color ${name} is missing from the tokens.`);
		return hex.slice(0, 7);
	};
	const step = (name: string) => px(site[name] ?? '');
	return {
		white: color('bg-default'),
		mist: color('bg-subtle'),
		ink: color('ink'),
		brand: color('brand'),
		blueEdge: color('blue-edge'),
		secondary: color('text-secondary'),
		faint: color('text-faint'),
		label: color('text-label'),
		onBrand: color('text-on-brand'),
		windowBar: color('window-bar'),
		border: color('border-window'),
		rule: color('border-default'),
		sky: color('sky'),
		codeBg: color('bg-code'),
		codeText: color('text-code'),
		codeKey: color('text-code-key'),
		codeString: color('text-code-string'),
		codeDim: color('text-code-dim'),
		radiusControl: step('--ds-radius-control'),
		radiusPanel: step('--ds-radius-panel'),
		trackingDisplay: px(site['--ds-tracking-display']),
		trackingHero: px(site['--ds-tracking-hero']),
		trackingTighter: px(site['--ds-tracking-tighter']),
		trackingTight: px(site['--ds-tracking-tight']),
		leadingHeading: px(site['--ds-leading-heading']),
		leadingLead: px(site['--ds-leading-lead']),
		leadingCode: px(site['--ds-leading-code']),
	};
}

export type Paint = ReturnType<typeof paint>;

export function trackingFor(size: number, colors: Paint) {
	if (size >= 80) return colors.trackingDisplay;
	if (size >= 48) return colors.trackingHero;
	if (size >= 32) return colors.trackingTighter;
	return colors.trackingTight;
}

let byline: string | undefined | null;
/** The second line of the lockup ("by ..."), read from the logo file. */
export function lockupByline() {
	if (byline !== undefined) return byline ?? undefined;
	const svg = readFileSync(pkgPath('brand', 'logo', 'lockup.svg'), 'utf8');
	const texts = [...svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].map((match) => match[1].trim()).filter(Boolean);
	const name = brand().name.toLowerCase();
	byline = texts.find((text) => text.toLowerCase() !== name) ?? null;
	return byline ?? undefined;
}

let mark: string | undefined;
/** The mark, scaled from the logo file's 32px box. */
export function logoMark(x: number, y: number, size: number) {
	mark ??= readFileSync(pkgPath('brand', 'logo', 'mark.svg'), 'utf8').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
	const scale = Math.round((size / 32) * 10000) / 10000;
	return `<g transform="translate(${Math.round(x)} ${Math.round(y)}) scale(${scale})">${mark}</g>`;
}
