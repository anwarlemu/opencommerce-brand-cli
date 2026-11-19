import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative } from 'node:path';
import { unknownName } from '../lib/names.js';

export type OutFile = { path: string; format: string; [key: string]: unknown };

export function write(path: string, data: Buffer | string) {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, data);
}

/** A path relative to the working directory when it is inside it. */
export function display(cwd: string, path: string) {
	const rel = relative(cwd, path);
	return rel && !rel.startsWith('..') && !isAbsolute(rel) ? rel : path;
}

/** A value from a fixed list, or an error with the nearest choices. */
export function pick<T extends string>(what: string, value: string, choices: readonly T[]): T {
	if ((choices as readonly string[]).includes(value)) return value as T;
	throw unknownName(what, value, [...choices]);
}

export function num(what: string, value: unknown, min: number, max: number, opts: { integer?: boolean } = {}): number | undefined {
	if (value === undefined || value === '') return undefined;
	const n = Number(value);
	if (!Number.isFinite(n) || n < min || n > max || (opts.integer && !Number.isInteger(n))) throw new Error(`--${what} takes ${opts.integer ? 'a whole number' : 'a number'} from ${min} to ${max}.`);
	return n;
}
