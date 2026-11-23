import type { Command } from 'commander';
import { adapter, paint } from '../design/adapter.js';
import { designManifest, runDesign } from '../design/index.js';
import { cli } from '../lib/brand.js';

// `design`: make a design, revise it in plain words or exact edits, check it, undo it (src/design, shared by every brand).

/** Lists the command in help; its own arguments are read by runDesignCommand. */
export function designCommand(program: Command) {
	program.command('design [args...]').description('Make a design, revise it in plain words or exact edits, check it, undo it: new, revise, edit, undo, variants, sizes, compare, render, check').allowUnknownOption().helpOption(false);
}

export async function runDesignCommand(argv: string[]): Promise<number> {
	const lines: string[] = [];
	const code = await runDesign(argv, adapter(), { cwd: process.cwd(), bin: cli(), out: (text) => lines.push(text), err: (text) => process.stderr.write(`${text}\n`), paint });
	// Waits for a long JSON answer to leave through a pipe before the process ends.
	if (lines.length) await new Promise<void>((done) => process.stdout.write(`${lines.join('\n')}\n`, () => done()));
	return code;
}

export const designCatalog = () => designManifest(adapter(), cli());
