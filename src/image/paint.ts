import { readFileSync } from 'node:fs';
import { brand, colorHex, tokens } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';
import { getFaces, measure, ratios, textPath } from './fonts.js';

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
		string: color('text-string'),
		band: color('blue-5'),
		codeBg: color('bg-code'),
		codeText: color('text-code'),
		codeKey: color('text-code-key'),
		codeString: color('text-code-string'),
		codeBand: color('bg-code-soft'),
		radiusControl: step('--ds-radius-control'),
		radiusPanel: step('--ds-radius-panel'),
		radiusChip: step('--ds-radius-sm'),
		radiusShell: step('--ds-radius-shell'),
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

const markLockupSizes = (mark: number) => ({ name: Math.round(mark * (17 / 32)), byline: Math.max(12, Math.round(mark * (12 / 32))) });

/** Width of the mark with the lockup beside it. */
export function measureMarkLockup(mark: number, colors: Paint) {
	const { display } = getFaces();
	const s = markLockupSizes(mark);
	const byline = lockupByline();
	return mark + Math.round(mark * 0.24) + measure(display, brand().name, s.name, colors.trackingTight) + (byline ? Math.round(mark * 0.16) + measure(display, byline, s.byline, 0) : 0);
}

/** The mark with the lockup beside it, the name at 17/32 of the mark as in the logo files. */
export function drawMarkLockup(x: number, y: number, mark: number, colors: Paint) {
	const { display } = getFaces();
	const s = markLockupSizes(mark);
	const byline = lockupByline();
	const { cap, desc } = ratios(display);
	const baseline = y + mark / 2 + ((cap - desc) * s.name) / 2;
	let cursor = x + mark + Math.round(mark * 0.24);
	const parts = [logoMark(x, y, mark), textPath(display, brand().name, cursor, baseline, s.name, colors.trackingTight, colors.ink)];
	if (byline) {
		cursor += measure(display, brand().name, s.name, colors.trackingTight) + Math.round(mark * 0.16);
		parts.push(textPath(display, byline, cursor, baseline, s.byline, 0, colors.secondary));
	}
	return parts.join('');
}
