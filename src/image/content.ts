import { readFileSync } from 'node:fs';
import { SLOTS, type Copy, type Slot } from '../assets/layouts.js';
import { unknownName } from '../lib/names.js';

// Copy slots, under one set of names: headline, body, badge and the rest. The earlier names still work.

export const ALIASES: Record<string, Slot> = { title: 'headline', text: 'body', chip: 'badge' };
export const COPY_FIELDS = [...SLOTS, 'image', ...Object.keys(ALIASES)] as const;

export type CopyInput = Partial<Record<Slot | 'title' | 'text' | 'chip' | 'image', string>> & { content?: string };
export type ReadCopy = { copy: Copy; image?: string };

const tidy = (slot: string, value: string) => (slot === 'code' ? value.replace(/\s+$/, '') : value.trim());

/** Copy from an object of slots (a content file, a carousel card). Unknown keys and non-strings are errors. */
export function copyFrom(record: Record<string, unknown>, where: string): ReadCopy {
	const out: ReadCopy = { copy: {} };
	for (const [key, value] of Object.entries(record)) {
		if (!(COPY_FIELDS as readonly string[]).includes(key)) {
			const error = unknownName('content field', key, [...COPY_FIELDS]);
			throw Object.assign(new Error(error.message.replace(`\`${key}\``, `"${key}"`)), { suggestions: (error as Error & { suggestions?: string[] }).suggestions });
		}
		let text: string;
		if (Array.isArray(value) && key === 'cards' && value.every((v) => typeof v === 'string')) text = value.join('\n\n');
		else if (typeof value === 'string') text = value;
		else throw new Error(`${where}: content field "${key}" must be a string.`);
		if (key === 'image') out.image = text.trim() || undefined;
		else {
			const slot = ALIASES[key] ?? (key as Slot);
			const tidied = tidy(slot, text);
			if (tidied) out.copy[slot] = tidied;
		}
	}
	return out;
}

/** Read a content file. */
export function readContent(file: string): ReadCopy {
	let parsed: unknown;
	try {
		parsed = JSON.parse(readFileSync(file, 'utf8'));
	} catch {
		throw new Error(`Could not read JSON from ${file}.`);
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error(`${file} must be a JSON object with ${COPY_FIELDS.join(', ')}.`);
	return copyFrom(parsed as Record<string, unknown>, file);
}

/** Flags override the content file. Empty flags leave the file value in place. Flags take \n for a line break. */
export function mergeCopy(input: CopyInput, fromFile?: ReadCopy): ReadCopy {
	const copy: Copy = { ...fromFile?.copy };
	const set = (slot: Slot, value: unknown) => {
		if (typeof value !== 'string' || !value.trim()) return;
		copy[slot] = tidy(slot, value.replace(/\\n/g, '\n'));
	};
	for (const [old, slot] of Object.entries(ALIASES)) set(slot, (input as Record<string, unknown>)[old]);
	for (const slot of SLOTS) set(slot, input[slot]);
	return { copy, image: input.image?.trim() || fromFile?.image };
}
