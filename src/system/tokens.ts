import { tokens } from '../lib/brand.js';

export const TOKEN_GROUPS = ['color', 'type', 'space', 'radius', 'motion', 'shadow'] as const;
export type TokenGroup = (typeof TOKEN_GROUPS)[number];

const MATCH: Record<TokenGroup, (name: string) => boolean> = {
	color: (name) => name.startsWith('--ds-color-'),
	type: (name) => /^--ds-(font|text|leading|tracking)-/.test(name),
	space: (name) => name.startsWith('--ds-space-') || name.startsWith('--ds-layout-') || name.startsWith('--ds-frame-'),
	radius: (name) => name.startsWith('--ds-radius-'),
	motion: (name) => name.startsWith('--ds-duration-') || name.startsWith('--ds-easing-'),
	shadow: (name) => name.startsWith('--ds-shadow-') || name.startsWith('--ds-glass-') || name.startsWith('--ds-band-'),
};

export function tokenGroup(name: string): TokenGroup | undefined {
	return TOKEN_GROUPS.find((group) => MATCH[group](name));
}

/** Every site token, split into fixed groups. A token that fits none is reported under other. */
export function groupedTokens() {
	const site = tokens().site;
	const groups = Object.fromEntries(TOKEN_GROUPS.map((group) => [group, {} as Record<string, string>])) as Record<TokenGroup, Record<string, string>>;
	const other: Record<string, string> = {};
	for (const [name, value] of Object.entries(site).sort(([a], [b]) => a.localeCompare(b))) {
		const group = tokenGroup(name);
		if (group) groups[group][name] = value;
		else other[name] = value;
	}
	return { groups, other };
}

export function lookupToken(name: string) {
	const value = tokens().site[name];
	if (value === undefined) throw new Error(`Unknown token "${name}". Use a --ds- name from brand tokens --json.`);
	const group = tokenGroup(name);
	if (!group) throw new Error(`Token "${name}" is not in a known group.`);
	return { name, group, value };
}
