import { join, resolve } from 'node:path';
import type { Command } from 'commander';
import { display, pick, write, type OutFile } from '../assets/io.js';
import { parseCards } from '../assets/layouts.js';
import { assertDrawable, cleanText } from '../image/fonts.js';
import { paint } from '../image/paint.js';
import { brand, cli, tokens } from '../lib/brand.js';
import { emit } from '../lib/output.js';

// `email`: messages as plain HTML tables with inline styles, which survive the mail clients that strip stylesheets,
// plus the plain-text part. The brand's one white ground, ink text, the blue key with its darker edge and 8px corners,
// the mist window bar as a section head, Inter with system fallbacks (web fonts do not load in most clients) and the
// name set as the lockup does. Only the words given are written.

export const EMAILS = {
	announcement: { description: 'A badge line, a headline, a paragraph and the blue key.', takes: ['badge', 'headline', 'body', 'action', 'href', 'footer'], required: ['headline'] },
	newsletter: { description: 'A headline, a paragraph, then sections (blank lines between them, heading first), each in a window, and the key.', takes: ['headline', 'body', 'items', 'action', 'href', 'footer'], required: ['headline', 'items'] },
	receipt: { description: 'A headline, a line, and the order as rows ("Item | $10", one per line; write the total as the last row).', takes: ['headline', 'body', 'items', 'action', 'href', 'footer'], required: ['headline', 'items'] },
	'password-reset': { description: 'A headline, a paragraph, the key with its link, and the link written out for clients that block buttons.', takes: ['headline', 'body', 'action', 'href', 'footer'], required: ['headline', 'action', 'href'] },
} as const;
export type EmailId = keyof typeof EMAILS;

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function renderEmail(id: EmailId, copy: Record<string, string | undefined>) {
	const spec = EMAILS[id];
	const c = paint();
	const words: Record<string, string> = {};
	for (const [k, v] of Object.entries(copy)) {
		if (!v?.trim()) continue;
		if (!(spec.takes as readonly string[]).includes(k)) throw new Error(`The ${id} email does not take --${k}. It takes ${spec.takes.map((t) => `--${t}`).join(', ')}.`);
		words[k] = cleanText(v.replace(/\\n/g, '\n')).trim();
		if (k !== 'href') assertDrawable(k, words[k]);
	}
	for (const k of spec.required) if (!words[k]) throw new Error(`The ${id} email needs --${k}. Nothing is made up for it.`);
	if (words.href && !/^(https?:|mailto:|\/)/.test(words.href)) throw new Error('--href takes a link (https://..., mailto:... or /path).');
	const sans = "Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
	const display = `${tokens().site['--ds-font-display'] ?? "'Helvetica Neue', Helvetica, Arial, sans-serif"}`.replace(/"/g, "'");
	const mono = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
	const p = (t: string, extra = '') => `<p style="margin:0 0 16px;font:16px/1.6 ${sans};color:${c.secondary};${extra}">${esc(t).replace(/\n/g, '<br>')}</p>`;
	const key = words.action ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:8px 0 24px"><tr><td style="background:${c.brand};border:1px solid ${c.blueEdge};border-radius:8px"><a href="${esc(words.href ?? '#')}" style="display:inline-block;padding:11px 18px;font:500 15px/1 ${sans};color:${c.onBrand};text-decoration:none">${esc(words.action)}</a></td></tr></table>` : '';
	const windowHead = (name: string) => `<tr><td style="background:${c.windowBar};border-bottom:1px solid ${c.rule};padding:10px 16px;font:12px/1 ${mono};color:${c.secondary}">${esc(name)}<span style="float:right;color:${c.brand}">[*]</span></td></tr>`;
	const win = (name: string, inner: string) => `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${c.border};border-radius:12px;border-collapse:separate;overflow:hidden;margin:0 0 16px">${windowHead(name)}<tr><td style="padding:16px 20px">${inner}</td></tr></table>`;
	const parts: string[] = [];
	const text: string[] = [];
	if (words.badge) {
		parts.push(`<p style="margin:0 0 12px;font:12px/1.4 ${mono};color:${c.label}">${esc(words.badge)}</p>`);
		text.push(words.badge);
	}
	parts.push(`<h1 style="margin:0 0 16px;font:500 32px/1.1 ${display};letter-spacing:-0.02em;color:${c.ink}">${esc(words.headline)}</h1>`);
	text.push(words.headline, '');
	if (words.body) {
		parts.push(p(words.body));
		text.push(words.body, '');
	}
	if (id === 'newsletter') {
		for (const s of parseCards(words.items)) {
			parts.push(win(s.title, s.body ? p(s.body, 'margin:0') : ''));
			text.push(s.title, s.body, '');
		}
	}
	if (id === 'receipt') {
		const rows = words.items.split('\n').map((r) => r.split('|').map((x) => x.trim())).filter((r) => r[0]);
		const body = rows.map((r) => `<tr><td style="padding:8px 0;border-bottom:1px solid ${c.rule};font:15px/1.4 ${sans};color:${c.ink}">${esc(r[0])}</td><td style="padding:8px 0;border-bottom:1px solid ${c.rule};font:15px/1.4 ${mono};color:${c.ink};text-align:right">${esc(r[1] ?? '')}</td></tr>`).join('');
		parts.push(win('order', `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${body}</table>`));
		text.push(...rows.map((r) => `${r[0]}  ${r[1] ?? ''}`), '');
	}
	if (key) {
		parts.push(key);
		text.push(`${words.action}: ${words.href ?? ''}`, '');
	}
	if (id === 'password-reset') {
		parts.push(p(words.href, `font:13px/1.5 ${mono};word-break:break-all`));
	}
	if (words.footer) text.push(words.footer);
	const name = brand().name;
	const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(words.headline)}</title></head>
<body style="margin:0;padding:0;background:${c.white}">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${c.white}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px">
<tr><td style="padding:0 0 32px;font:500 17px/1 ${display};letter-spacing:-0.02em;color:${c.ink}">${esc(name)}</td></tr>
<tr><td>${parts.join('\n')}</td></tr>
${words.footer ? `<tr><td style="padding:32px 0 0;border-top:1px solid ${c.rule};font:13px/1.5 ${sans};color:${c.secondary}">${esc(words.footer)}</td></tr>` : ''}
</table></td></tr></table>
</body></html>
`;
	return { html, text: `${name}\n\n${text.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n` };
}

export function emailCommand(program: Command) {
	program
		.command('email [template]')
		.description('Emails as plain HTML tables with inline styles (announcement, newsletter, receipt, password-reset), and the plain-text part')
		.option('--badge <text>', 'announcement: the line above the headline')
		.option('--headline <text>', 'the headline')
		.option('--body <text>', 'the paragraph (\\n for a line break)')
		.option('--items <text>', 'newsletter: sections, blank lines between, heading first; receipt: rows "Item | $10", one per line')
		.option('--action <text>', 'the blue key')
		.option('--href <url>', 'where the key goes')
		.option('--footer <text>', 'the line at the foot (an address, why they get this)')
		.option('-o, --out <dir>', 'output directory (default email/)')
		.option('--list', 'the templates and what they take')
		.option('--json', 'JSON output')
		.action((named: string | undefined, o: Record<string, string | boolean | undefined>) => {
			if (o.list) {
				const list = Object.entries(EMAILS).map(([id, e]) => ({ id, ...e }));
				emit(o, { ok: true, templates: list }, () => list.map((e) => `${e.id.padEnd(15)} ${e.description} Takes ${e.takes.map((t) => `--${t}`).join(', ')}.`).join('\n'));
				return;
			}
			if (!named) throw new Error(`Name a template: ${cli()} email announcement (${Object.keys(EMAILS).join(', ')}).`);
			const id = pick('email', named, Object.keys(EMAILS) as EmailId[]);
			const copy = Object.fromEntries(['badge', 'headline', 'body', 'items', 'action', 'href', 'footer'].map((k) => [k, typeof o[k] === 'string' ? (o[k] as string) : undefined]));
			const r = renderEmail(id, copy);
			const cwd = process.cwd();
			const dir = resolve(cwd, typeof o.out === 'string' ? o.out : 'email');
			const files: OutFile[] = [];
			write(join(dir, `${id}.html`), r.html);
			write(join(dir, `${id}.txt`), r.text);
			files.push({ path: display(cwd, join(dir, `${id}.html`)), format: 'html' }, { path: display(cwd, join(dir, `${id}.txt`)), format: 'txt' });
			emit(o as { json?: boolean }, { ok: true, files }, () => files.map((f) => f.path).join('\n'));
		});
}
