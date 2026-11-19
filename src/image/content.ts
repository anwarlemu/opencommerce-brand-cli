import { readFileSync } from 'node:fs';
import { unknownName } from '../lib/names.js';

export const COPY_FIELDS = ['title', 'text', 'label', 'by', 'action', 'image', 'chip', 'secondary', 'code', 'highlight', 'cards', 'footer'] as const;

export type CopyField = (typeof COPY_FIELDS)[number];
export type Copy = Record<Exclude<CopyField, 'image'>, string> & { image?: string };

export type CopyInput = Partial<Record<CopyField, string>> & { content?: string };

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
		if (!(COPY_FIELDS as readonly string[]).includes(key)) {
			const error = unknownName('content field', key, [...COPY_FIELDS]);
			throw Object.assign(new Error(error.message.replace(`\`${key}\``, `"${key}"`)), { suggestions: (error as Error & { suggestions?: string[] }).suggestions });
		}
	}
	const text = (key: CopyField) => {
		const value = record[key];
		if (value === undefined) return '';
		if (Array.isArray(value) && key === 'cards' && value.every((v) => typeof v === 'string')) return value.join('\n\n');
		if (typeof value !== 'string') throw new Error(`Content field "${key}" must be a string.`);
		return key === 'code' ? value.replace(/\s+$/, '') : value.trim();
	};
	const out = Object.fromEntries(COPY_FIELDS.map((key) => [key, text(key)])) as Copy;
	out.image = text('image') || undefined;
	return out;
}

/** Flags override the content file. Empty flags leave the file value in place. Flags take \n for a line break. */
export function mergeCopy(input: CopyInput, fromFile?: Copy): Copy {
	const pick = (key: Exclude<CopyField, 'image'>) => {
		const flag = input[key];
		const value = typeof flag === 'string' && flag.trim() ? flag.replace(/\\n/g, '\n') : '';
		return (key === 'code' ? value.replace(/\s+$/, '') : value.trim()) || fromFile?.[key] || '';
	};
	const out = Object.fromEntries(COPY_FIELDS.filter((key) => key !== 'image').map((key) => [key, pick(key as Exclude<CopyField, 'image'>)])) as Copy;
	out.image = input.image?.trim() || fromFile?.image;
	return out;
}
