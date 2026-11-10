import { readFileSync } from 'node:fs';

export const COPY_FIELDS = ['title', 'text', 'label', 'by', 'action', 'image'] as const;

export type Copy = { title: string; text: string; label: string; by: string; action: string; image?: string };

export type CopyInput = { title?: string; text?: string; label?: string; by?: string; action?: string; image?: string; content?: string };

/** Read a content file. Unknown keys and non-strings are errors. */
export function readContent(file: string): Copy {
	let parsed: unknown;
	try {
		parsed = JSON.parse(readFileSync(file, 'utf8'));
	} catch {
		throw new Error(`Could not read JSON from ${file}.`);
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error(`${file} must be a JSON object with ${COPY_FIELDS.join(', ')}.`);
	const record = parsed as Record<string, unknown>;
	for (const key of Object.keys(record)) {
		if (!(COPY_FIELDS as readonly string[]).includes(key)) throw new Error(`Unknown content field "${key}". Use ${COPY_FIELDS.join(', ')}.`);
	}
	const text = (key: (typeof COPY_FIELDS)[number]) => {
		const value = record[key];
		if (value === undefined) return '';
		if (typeof value !== 'string') throw new Error(`Content field "${key}" must be a string.`);
		return value.trim();
	};
	return { title: text('title'), text: text('text'), label: text('label'), by: text('by'), action: text('action'), image: text('image') || undefined };
}

/** Flags override the content file. Empty flags leave the file value in place. */
export function mergeCopy(input: CopyInput, fromFile?: Copy): Copy {
	return {
		title: input.title?.trim() || fromFile?.title || '',
		text: input.text?.trim() || fromFile?.text || '',
		label: input.label?.trim() || fromFile?.label || '',
		by: input.by?.trim() || fromFile?.by || '',
		action: input.action?.trim() || fromFile?.action || '',
		image: input.image?.trim() || fromFile?.image,
	};
}
