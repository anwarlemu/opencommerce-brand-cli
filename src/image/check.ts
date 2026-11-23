import { paint } from './paint.js';
import { checkDesign, checkText, errorsOf } from '../design/check.js';
import type { DesignDoc, DrawnLayer, Finding, LayerEdit, TemplateInfo } from '../design/types.js';

// The design check on what the plain commands draw, so `image`, `deck` and a carousel keep the rules a design keeps.

/** Every color words may be drawn in or on. */
export function wordColors(): string[] {
	const c = paint();
	return [...new Set([c.white, c.mist, c.ink, c.brand, c.secondary, c.faint, c.label, c.onBrand, c.windowBar, c.string, c.band, c.codeBg, c.codeBand, c.codeText, c.codeKey, c.codeString].map((hex) => hex.toLowerCase()))];
}

/** A window that is hidden takes its code and its name with it. */
export const COPY_ALIASES: Record<string, string> = { text: 'body', chip: 'badge', code: 'window', label: 'window' };

export type SceneFacts = { template: string; kind?: 'image' | 'slide'; sizeId: string; width: number; height: number; copy: Record<string, string | undefined>; edits?: Record<string, LayerEdit> };

export function findingsOf(f: SceneFacts, layers: DrawnLayer[], png?: Uint8Array): Finding[] {
	const copy = Object.fromEntries(Object.entries(f.copy).filter(([k, v]) => v && k !== 'highlight')) as Record<string, string>;
	const doc = { version: 1, brand: '', kind: f.kind ?? 'image', template: f.template, size: { id: f.sizeId, width: f.width, height: f.height }, copy, images: {}, options: {}, layers: f.edits ?? {}, history: [], future: [] } as DesignDoc;
	return checkDesign({ doc, info: { id: f.template } as TemplateInfo, layers, adapter: { colors: wordColors, aliases: { copy: COPY_ALIASES } }, png });
}

/** Throws when a drawing breaks a rule. */
export function assertScene(f: SceneFacts, layers: DrawnLayer[]) {
	const errors = errorsOf(findingsOf(f, layers));
	if (errors.length) throw new Error(`${f.template} at ${f.sizeId} breaks a rule, so nothing was written.\n${checkText(errors)}`);
}
