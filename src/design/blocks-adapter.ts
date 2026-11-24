import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BLOCKS, blocksSvg, type BlockType, type PlacedBlock } from '../assets/blocks.js';
import { parseCards } from '../assets/layouts.js';
import { picture as readPicture } from '../image/load.js';
import { encodeScene, THEMES } from '../image/render.js';
import { paint as colors } from '../image/paint.js';
import { brand } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';
import { blockRects } from './compose.js';
import { PLATFORMS } from './platforms.js';
import type { Adapter, BlockInfo, ComposeBlock, DesignDoc, DesignState, DrawnLayer, Format, SectionInfo } from './types.js';

// This brand's blocks and sections for the shared compose and page commands (src/design/compose.ts).

export const composeBlocks = (): BlockInfo[] => BLOCKS.map((b) => ({ type: b.type, names: b.names, kind: b.kind, description: b.description, copy: b.copy, ...(b.image ? { image: b.image } : {}), ...(b.options ? { options: b.options } : {}), span: b.span, ...(b.place ? { place: b.place } : {}), ...(b.under ? { under: true } : {}) }));

/** A compose document drawn: each block in its cells, in order. */
export function renderCompose(doc: DesignDoc, dir: string, out: { formats: Format[]; scale: number }) {
	const placed: PlacedBlock[] = blockRects(doc).map(({ block, rect }) => {
		const copy: Record<string, string> = {};
		const options: Record<string, string | number | boolean> = {};
		for (const [k, v] of Object.entries(doc.copy)) if (k.startsWith(`${block.id}.`)) copy[k.slice(block.id.length + 1)] = v;
		for (const [k, v] of Object.entries(doc.options)) if (k.startsWith(`${block.id}.`)) options[k.slice(block.id.length + 1)] = v;
		const file = doc.images[block.id];
		return { id: block.id, type: block.type as BlockType, rect, copy, options, ...(file ? { picture: readPicture(resolve(dir, file)) } : {}) };
	});
	const { svg, layers } = blocksSvg({ width: doc.size.width, height: doc.size.height, sizeId: doc.size.id, theme: doc.theme as 'white' | 'mist', seed: doc.seed, blocks: placed, edits: doc.layers }, brand().name);
	const files = encodeScene(svg, doc.size.width, doc.size.height, out.formats.filter((f): f is 'png' => f !== 'mp4' && f !== 'gif'), out.scale) as Record<string, Uint8Array>;
	return { files, layers };
}

const at = (col: number, row: number, cols: number, rows: number) => ({ col, row, cols, rows });
type Recipe = Pick<DesignState, 'blocks' | 'grid' | 'copy' | 'theme'>;

/** Every image template as blocks: the same parts, placed on the grid as the layout places them. */
export function recipe(template: string, size: string, copy: Record<string, string>): Recipe | undefined {
	const blocks: ComposeBlock[] = [];
	const c: Record<string, string> = {};
	const add = (id: string, type: string, where: ComposeBlock['at'], words: Record<string, string | undefined> = {}) => {
		blocks.push({ id, type, at: where });
		for (const [k, v] of Object.entries(words)) if (v) c[`${id}.${k}`] = v;
	};
	const tall = (PLATFORMS.find((p) => p.id === size)?.height ?? 630) > (PLATFORMS.find((p) => p.id === size)?.width ?? 1200);
	switch (template) {
		case 'hero': {
			add('art', 'art', at(0, 0, 12, 12));
			let row = 0;
			if (copy.badge) add('badge', 'badge', at(3, row++, 6, 1), { text: copy.badge });
			add('headline', 'headline', at(1, row, 10, 3), { text: copy.headline });
			row += 3;
			if (copy.body) add('body', 'body', at(2, row++, 8, 1), { text: copy.body });
			if (copy.action || copy.secondary) {
				add('button', 'button', at(3, row, 6, 2), { text: copy.action || copy.secondary, secondary: copy.action ? copy.secondary : undefined });
				row += 2;
			}
			if (copy.code) add('window', 'window', at(2, row, 8, 12 - row), { code: copy.code, label: copy.label });
			break;
		}
		case 'window': {
			add('art', 'art', at(6, 0, 6, 12));
			add('logo', 'logo', at(0, 0, 4, 1));
			let row = 3;
			if (copy.badge) add('badge', 'badge', at(0, row++, 5, 1), { text: copy.badge });
			add('headline', 'headline', at(0, row, 5, 3), { text: copy.headline });
			row += 3;
			if (copy.body) add('body', 'body', at(0, row++, 5, 2), { text: copy.body });
			if (copy.action || copy.secondary) add('button', 'button', at(0, row + 1, 5, 2), { text: copy.action || copy.secondary, secondary: copy.action ? copy.secondary : undefined });
			if (copy.code) add('window', 'window', at(6, 1, 6, 10), { code: copy.code, label: copy.label });
			break;
		}
		case 'closing': {
			add('panel', 'panel', at(0, 0, 12, 12));
			add('logo', 'logo', at(4, 1, 4, 1));
			let row = 3;
			if (copy.badge) add('badge', 'badge', at(3, row++, 6, 1), { text: copy.badge });
			add('headline', 'headline', at(1, row, 10, 3), { text: copy.headline });
			row += 3;
			if (copy.body) add('body', 'body', at(2, row, 8, 2), { text: copy.body });
			if (copy.action || copy.secondary) add('button', 'button', at(3, 10, 6, 2), { text: copy.action || copy.secondary, secondary: copy.action ? copy.secondary : undefined });
			break;
		}
		case 'cards': {
			add('art', 'art', at(0, 0, 12, 12));
			if (copy.headline) add('headline', 'headline', at(1, 0, 10, 2), { text: copy.headline });
			add('cards', 'cards', at(0, 2, 12, 8), { cards: copy.cards });
			add('logo', 'logo', at(0, 11, 4, 1));
			if (copy.footer) add('footer', 'body', at(7, 11, 5, 1), { text: copy.footer });
			break;
		}
		case 'headline':
		case 'lead':
		case 'announcement':
		case 'quote': {
			add('logo', 'logo', at(0, 0, 4, 1), {});
			c['logo.variant'] = '';
			let row = tall ? 3 : 2;
			if (copy.badge) add('badge', 'badge', at(3, row++, 6, 1), { text: copy.badge });
			if (template === 'quote') {
				add('quote', 'quote', at(1, row, 10, 6), { text: copy.body, by: copy.by });
			} else {
				add('headline', 'headline', at(1, row, 10, 4), { text: copy.headline });
				row += 4;
				if (copy.body) add('body', 'body', at(2, row++, 8, 2), { text: copy.body });
				if (copy.action) add('button', 'button', at(4, row + 1, 4, 2), { text: copy.action });
			}
			delete c['logo.variant'];
			break;
		}
		case 'frame':
		case 'frame-code':
		case 'frame-note': {
			add('art', 'art', at(0, 2, 12, 10));
			add('logo', 'logo', at(0, 0, 4, 1));
			if (copy.headline) add('headline', 'headline', at(1, 1, 10, 2), { text: copy.headline });
			if (template === 'frame-code' || copy.code) add('window', 'window', at(2, 4, 8, 8), { code: copy.code, label: copy.label });
			else if (template === 'frame-note') add('card', 'card', at(2, 4, 8, 6), copy.label ? { title: copy.label, text: copy.body } : { title: copy.body });
			// A picture is a file, not copy, so the recipe keeps the window's name on a card where the picture goes.
			else if (copy.label) add('card', 'card', at(2, 4, 8, 4), { title: copy.label });
			break;
		}
		case 'avatar':
			add('logo', 'logo', at(2, 2, 8, 8));
			break;
		default:
			return undefined;
	}
	const out: Recipe = { blocks, copy: c };
	return out;
}

// ---------------------------------------------------------------------------------------------------- pages

type Section = SectionInfo & { component: string[] };

export const SECTIONS: Section[] = [
	{ type: 'header', description: 'The site header: the lockup, links in the glass trays, the Get started key.', copy: [{ id: 'action' }, { id: 'action-href' }], items: { count: [0, 6], copy: [{ id: 'label', required: true }, { id: 'href', required: true }] }, component: ['site-header'] },
	{ type: 'hero', description: 'The hero: the eyebrow pill, the headline, the line under it and the keys, over the glyph field.', copy: [{ id: 'eyebrow' }, { id: 'title', required: true }, { id: 'subtitle' }, { id: 'action' }, { id: 'action-href' }, { id: 'secondary' }, { id: 'secondary-href' }], component: ['hero', 'button'] },
	{ type: 'page-header', description: 'A page\'s own header: eyebrow, title and lead, for pages other than home.', copy: [{ id: 'eyebrow' }, { id: 'title', required: true }, { id: 'lead' }], component: ['page-header'] },
	{ type: 'features', description: 'A section heading and features in windows, a grid.', copy: [{ id: 'eyebrow' }, { id: 'title', required: true }, { id: 'description' }], items: { count: [2, 9], copy: [{ id: 'title', required: true }, { id: 'description' }, { id: 'file' }] }, component: ['section', 'feature-rows'] },
	{ type: 'steps', description: 'A section heading and steps, each with its code in the dark window.', copy: [{ id: 'title', required: true }, { id: 'description' }], items: { count: [2, 6], copy: [{ id: 'title', required: true }, { id: 'code', required: true }, { id: 'file' }] }, component: ['section', 'steps'] },
	{ type: 'pricing', description: 'Plans in windows: name, price, unit, a line, values (separated by |) and the key.', copy: [{ id: 'title', required: true }, { id: 'description' }], items: { count: [1, 4], copy: [{ id: 'name', required: true }, { id: 'price', required: true }, { id: 'unit' }, { id: 'blurb' }, { id: 'values' }, { id: 'action' }, { id: 'href' }, { id: 'featured' }] }, component: ['section', 'pricing'] },
	{ type: 'testimonials', description: 'Customer windows: the customer\'s name, the quote and its context (Acme, not real people).', copy: [{ id: 'title' }, { id: 'description' }], items: { count: [1, 6], copy: [{ id: 'name', required: true }, { id: 'quote', required: true }, { id: 'context' }] }, component: ['section', 'testimonials'] },
	{ type: 'logos', description: 'A strip of store names, set as words (no third-party marks are shipped).', copy: [{ id: 'label' }], items: { count: [3, 16], copy: [{ id: 'name', required: true }] }, component: ['logo-strip'] },
	{ type: 'faq', description: 'Questions and answers in the accordion.', copy: [{ id: 'title' }, { id: 'lead' }], items: { count: [1, 12], copy: [{ id: 'question', required: true }, { id: 'answer', required: true }] }, component: ['faq'] },
	{ type: 'prose', description: 'A heading and paragraphs (blank lines between them), for legal and about pages.', copy: [{ id: 'title' }, { id: 'body', required: true }], component: ['section', 'prose'] },
	{ type: 'cta', description: 'The closing card: title, line and keys on the mist card with the field at its edges.', copy: [{ id: 'title', required: true }, { id: 'description' }, { id: 'action' }, { id: 'action-href' }, { id: 'secondary' }, { id: 'secondary-href' }], component: ['cta', 'button'] },
	{ type: 'footer', description: 'The footer: link groups, a line, the legal line and the outlined wordmark.', copy: [{ id: 'description' }, { id: 'legal' }], items: { count: [0, 24], copy: [{ id: 'group', required: true }, { id: 'label', required: true }, { id: 'href', required: true }] }, component: ['site-footer'] },
];

type OutlineSection = { type: string; copy?: Record<string, string>; items?: Record<string, string>[] };
const js = (v: string) => JSON.stringify(v);
const attr = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const html = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function reactSection(s: OutlineSection, n: number): { jsx: string; imports: Set<string> } {
	const c = s.copy ?? {};
	const it = s.items ?? [];
	const im = new Set<string>();
	const key = (label?: string, href?: string, variant?: string) => (label ? `<Button asChild${variant ? ` variant=${js(variant)}` : ''}><a href=${js(href || '#')}>{${js(label)}}</a></Button>` : '');
	const heading = (title?: string, desc?: string, eyebrow?: string) => (title ? `<SectionHeading title={${js(title)}}${desc ? ` description={${js(desc)}}` : ''}${eyebrow ? ` eyebrow={${js(eyebrow)}}` : ''} />` : '');
	switch (s.type) {
		case 'header':
			im.add('SiteHeader:site/site-header');
			return { imports: im, jsx: `<SiteHeader links={${JSON.stringify(it.map((x) => ({ label: x.label, href: x.href })))}}${c.action ? ` action={${JSON.stringify({ label: c.action, href: c['action-href'] || '#' })}}` : ''} />` };
		case 'hero':
			im.add('Hero:site/hero').add('Button:ui/button');
			return { imports: im, jsx: `<Hero title={${js(c.title)}}${c.eyebrow ? ` eyebrow={${js(c.eyebrow)}}` : ''}${c.subtitle ? ` subtitle={${js(c.subtitle)}}` : ''}${c.action || c.secondary ? ` actions={<>${key(c.action, c['action-href'])}${key(c.secondary, c['secondary-href'], 'secondary')}</>}` : ''} />` };
		case 'page-header':
			im.add('PageHeader:site/page-header');
			return { imports: im, jsx: `<PageHeader title={${js(c.title)}}${c.eyebrow ? ` eyebrow={${js(c.eyebrow)}}` : ''}${c.lead ? ` lead={${js(c.lead)}}` : ''} />` };
		case 'features':
			im.add('SiteSection:site/section').add('SectionHeading:site/section').add('FeatureGrid:site/feature-rows');
			return { imports: im, jsx: `<SiteSection>${heading(c.title, c.description, c.eyebrow)}<FeatureGrid features={${JSON.stringify(it.map((x) => ({ title: x.title, ...(x.description ? { description: x.description } : {}), ...(x.file ? { file: x.file } : {}) })))}} /></SiteSection>` };
		case 'steps':
			im.add('SiteSection:site/section').add('SectionHeading:site/section').add('Steps:site/steps');
			return { imports: im, jsx: `<SiteSection>${heading(c.title, c.description)}<Steps steps={${JSON.stringify(it.map((x) => ({ title: x.title, code: x.code, ...(x.file ? { file: x.file } : {}) })))}} /></SiteSection>` };
		case 'pricing':
			im.add('SiteSection:site/section').add('SectionHeading:site/section').add('Pricing:site/pricing');
			return { imports: im, jsx: `<SiteSection>${heading(c.title, c.description)}<Pricing plans={${JSON.stringify(it.map((x) => ({ name: x.name, price: x.price, ...(x.unit ? { unit: x.unit } : {}), ...(x.blurb ? { blurb: x.blurb } : {}), values: (x.values ?? '').split('|').map((v) => v.trim()).filter(Boolean), ...(x.action ? { action: { label: x.action, href: x.href || '#' } } : {}), ...(x.featured === 'true' ? { featured: true } : {}) })))}} /></SiteSection>` };
		case 'testimonials':
			im.add('SiteSection:site/section').add('SectionHeading:site/section').add('Testimonials:site/testimonials');
			return { imports: im, jsx: `<SiteSection>${heading(c.title, c.description)}<Testimonials cases={${JSON.stringify(it.map((x) => ({ name: x.name, quote: x.quote, ...(x.context ? { context: x.context } : {}) })))}} /></SiteSection>` };
		case 'logos':
			im.add('LogoStrip:site/logo-strip');
			return { imports: im, jsx: `<LogoStrip brands={${JSON.stringify(it.map((x) => ({ name: x.name })))}}${c.label ? ` label={${js(c.label)}}` : ''} />` };
		case 'faq':
			im.add('Faq:site/faq');
			return { imports: im, jsx: `<Faq items={${JSON.stringify(it.map((x) => ({ question: x.question, answer: x.answer })))}}${c.title ? ` title={${js(c.title)}}` : ''}${c.lead ? ` lead={${js(c.lead)}}` : ''} />` };
		case 'prose':
			im.add('SiteSection:site/section').add('SectionHeading:site/section').add('Prose:site/prose');
			return { imports: im, jsx: `<SiteSection width="medium">${heading(c.title)}<Prose>${c.body.split(/\n\s*\n/).map((p) => `<p>{${js(p.trim())}}</p>`).join('')}</Prose></SiteSection>` };
		case 'cta':
			im.add('Cta:site/cta').add('Button:ui/button');
			return { imports: im, jsx: `<Cta title={${js(c.title)}}${c.description ? ` description={${js(c.description)}}` : ''}${c.action || c.secondary ? ` actions={<>${key(c.action, c['action-href'])}${key(c.secondary, c['secondary-href'], 'secondary')}</>}` : ''} />` };
		case 'footer': {
			im.add('SiteFooter:site/site-footer');
			const groups: { title: string; links: { label: string; href: string }[] }[] = [];
			for (const x of it) {
				let g = groups.find((y) => y.title === x.group);
				if (!g) groups.push((g = { title: x.group, links: [] }));
				g.links.push({ label: x.label, href: x.href });
			}
			return { imports: im, jsx: `<SiteFooter groups={${JSON.stringify(groups)}}${c.description ? ` description={${js(c.description)}}` : ''}${c.legal ? ` legal={${js(c.legal)}}` : ''} />` };
		}
	}
	throw new Error(`Section ${n + 1}: no writer for ${s.type}.`);
}

function htmlSection(s: OutlineSection): string {
	const c = s.copy ?? {};
	const it = s.items ?? [];
	const key = (label?: string, href?: string, white = false) => (label ? `<a class="ds-key${white ? ' ds-key-white' : ''}" href="${attr(href || '#')}">${html(label)}</a>` : '');
	const head = (title?: string, desc?: string, eyebrow?: string) => (title ? `<header class="ds-head">${eyebrow ? `<p class="ds-eyebrow">${html(eyebrow)}</p>` : ''}<h2>${html(title)}</h2>${desc ? `<p class="ds-lead">${html(desc)}</p>` : ''}</header>` : '');
	const win = (name: string, body: string) => `<div class="ds-window"><div class="ds-bar"><span aria-hidden="true">↳</span><span>${html(name)}</span><span class="ds-mark" aria-hidden="true">[*]</span></div><div class="ds-window-body">${body}</div></div>`;
	switch (s.type) {
		case 'header':
			return `<header class="ds-site-header"><a class="ds-wordmark" href="/">${html(brand().name)}</a><nav>${it.map((x) => `<a href="${attr(x.href)}">${html(x.label)}</a>`).join('')}</nav>${key(c.action, c['action-href'])}</header>`;
		case 'hero':
			return `<section class="ds-hero">${c.eyebrow ? `<p class="ds-pill">${html(c.eyebrow)}</p>` : ''}<h1>${html(c.title)}</h1>${c.subtitle ? `<p class="ds-lead">${html(c.subtitle)}</p>` : ''}<p class="ds-keys">${key(c.action, c['action-href'])}${key(c.secondary, c['secondary-href'], true)}</p></section>`;
		case 'page-header':
			return `<header class="ds-page-header">${c.eyebrow ? `<p class="ds-eyebrow">${html(c.eyebrow)}</p>` : ''}<h1>${html(c.title)}</h1>${c.lead ? `<p class="ds-lead">${html(c.lead)}</p>` : ''}</header>`;
		case 'features':
			return `<section class="ds-section">${head(c.title, c.description, c.eyebrow)}<ul class="ds-grid">${it.map((x, i) => `<li>${win(x.file || `feature-${i + 1}`, `<h3>${html(x.title)}</h3>${x.description ? `<p>${html(x.description)}</p>` : ''}`)}</li>`).join('')}</ul></section>`;
		case 'steps':
			return `<section class="ds-section">${head(c.title, c.description)}<ol class="ds-steps">${it.map((x, i) => `<li><h3>${html(x.title)}</h3>${win(x.file || `step-${i + 1}`, `<pre class="ds-code">${html(x.code)}</pre>`)}</li>`).join('')}</ol></section>`;
		case 'pricing':
			return `<section class="ds-section">${head(c.title, c.description)}<ul class="ds-grid">${it.map((x) => `<li>${win(x.name, `<p class="ds-price">${html(x.price)}${x.unit ? ` <span>${html(x.unit)}</span>` : ''}</p>${x.blurb ? `<p>${html(x.blurb)}</p>` : ''}<ul class="ds-values">${(x.values ?? '').split('|').map((v) => v.trim()).filter(Boolean).map((v) => `<li>${html(v)}</li>`).join('')}</ul>${key(x.action, x.href, x.featured !== 'true')}`)}</li>`).join('')}</ul></section>`;
		case 'testimonials':
			return `<section class="ds-section">${head(c.title, c.description)}<ul class="ds-grid">${it.map((x) => `<li>${win(x.name, `<blockquote>${html(x.quote)}</blockquote>${x.context ? `<p>${html(x.context)}</p>` : ''}`)}</li>`).join('')}</ul></section>`;
		case 'logos':
			return `<section class="ds-logos">${c.label ? `<p class="ds-eyebrow">${html(c.label)}</p>` : ''}<ul>${it.map((x) => `<li>${html(x.name)}</li>`).join('')}</ul></section>`;
		case 'faq':
			return `<section class="ds-section">${head(c.title, c.lead)}${it.map((x) => `<details class="ds-faq"><summary>${html(x.question)}</summary><p>${html(x.answer)}</p></details>`).join('')}</section>`;
		case 'prose':
			return `<section class="ds-section ds-prose">${c.title ? `<h2>${html(c.title)}</h2>` : ''}${c.body.split(/\n\s*\n/).map((p) => `<p>${html(p.trim())}</p>`).join('')}</section>`;
		case 'cta':
			return `<section class="ds-cta"><h2>${html(c.title)}</h2>${c.description ? `<p class="ds-lead">${html(c.description)}</p>` : ''}<p class="ds-keys">${key(c.action, c['action-href'])}${key(c.secondary, c['secondary-href'], true)}</p></section>`;
		case 'footer': {
			const groups = [...new Set(it.map((x) => x.group))];
			return `<footer class="ds-footer"><div class="ds-footer-groups">${groups.map((g) => `<div><p class="ds-eyebrow">${html(g)}</p>${it.filter((x) => x.group === g).map((x) => `<a href="${attr(x.href)}">${html(x.label)}</a>`).join('')}</div>`).join('')}</div>${c.description ? `<p>${html(c.description)}</p>` : ''}${c.legal ? `<p class="ds-legal">${html(c.legal)}</p>` : ''}</footer>`;
		}
	}
	return '';
}

/** The plain HTML page's own layout, from the tokens: sections in the 1200px frame, windows, keys, the mono label. */
const PAGE_CSS = `body{margin:0;background:var(--ds-color-bg-default);color:var(--ds-color-text-default);font-family:var(--ds-font-sans);font-size:16px;line-height:1.6}
h1,h2,h3{font-family:var(--ds-font-display);font-weight:500;color:var(--ds-color-text-default);margin:0}
h1{font-size:clamp(2.5rem,6vw,3.375rem);letter-spacing:var(--ds-tracking-hero);line-height:var(--ds-leading-heading)}
h2{font-size:2.75rem;letter-spacing:-0.025em;line-height:var(--ds-leading-heading)}
h3{font-size:1.125rem;letter-spacing:var(--ds-tracking-tight)}
a{color:var(--ds-color-text-brand)}
.ds-site-header,.ds-section,.ds-hero,.ds-page-header,.ds-cta,.ds-logos,.ds-footer{width:min(1200px,calc(100% - 32px));margin:0 auto}
.ds-site-header{display:flex;align-items:center;gap:24px;padding:16px 0}.ds-site-header nav{display:flex;gap:16px;flex:1}.ds-site-header nav a{color:var(--ds-color-text-secondary);text-decoration:none}
.ds-wordmark{font-family:var(--ds-font-display);font-weight:500;color:var(--ds-color-text-default);text-decoration:none;font-size:17px;letter-spacing:var(--ds-tracking-tight)}
.ds-hero,.ds-page-header,.ds-head,.ds-cta{text-align:center}.ds-hero{padding:120px 0 80px}.ds-page-header{padding:96px 0 48px}.ds-section{padding:120px 0 0}.ds-head{max-width:800px;margin:0 auto 48px}
.ds-lead{color:var(--ds-color-text-secondary);max-width:640px;margin:16px auto 0}
.ds-eyebrow{font-family:var(--ds-font-mono);font-size:12px;color:var(--ds-color-text-label);margin:0 0 12px}
.ds-pill{display:inline-block;border:1px solid var(--ds-color-border-strong);border-radius:var(--ds-radius-sm);padding:6px 14px;color:var(--ds-color-text-secondary);font-size:14px;margin:0 0 24px}
.ds-keys{display:flex;gap:10px;justify-content:center;margin-top:32px}
.ds-key{display:inline-flex;align-items:center;height:40px;padding:0 18px;border-radius:var(--ds-radius-control);background:var(--ds-color-brand);border:1px solid var(--ds-color-blue-edge);color:var(--ds-color-text-on-brand);font-weight:500;font-size:15px;text-decoration:none;transition:scale var(--ds-duration-fast) var(--ds-easing-out)}
.ds-key:active{scale:.97}.ds-key-white{background:var(--ds-color-bg-default);border-color:var(--ds-color-border-key);color:var(--ds-color-text-default)}
@media (prefers-reduced-motion:reduce){.ds-key{transition:none}.ds-key:active{scale:1}}
.ds-grid{list-style:none;padding:0;margin:0;display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.ds-window{background:var(--ds-color-bg-default);border:1px solid var(--ds-color-border-window);border-radius:var(--ds-radius-panel);box-shadow:var(--ds-shadow-card);overflow:hidden}
.ds-bar{display:flex;justify-content:space-between;align-items:center;height:36px;padding:0 14px;background:var(--ds-color-window-bar);border-bottom:1px solid var(--ds-color-border-default);font-family:var(--ds-font-mono);font-size:11.5px;color:var(--ds-color-text-secondary)}
.ds-mark{color:var(--ds-color-brand)}.ds-window-body{padding:20px 22px}.ds-window-body p{color:var(--ds-color-text-secondary);margin:8px 0 0}
.ds-code{margin:0;font-family:var(--ds-font-mono);font-size:13px;line-height:var(--ds-leading-code);background:var(--ds-color-bg-code);color:var(--ds-color-text-code);padding:16px;border-radius:var(--ds-radius-sm);overflow:auto}
.ds-steps{list-style:none;padding:0;display:grid;gap:24px}.ds-price{font-family:var(--ds-font-display);font-size:2.25rem;color:var(--ds-color-text-default)!important}.ds-price span{font-size:1rem;color:var(--ds-color-text-secondary)}
.ds-values{padding-left:18px;color:var(--ds-color-text-secondary)}blockquote{margin:0;font-family:var(--ds-font-display);font-size:1.25rem}
.ds-logos{padding:48px 0;text-align:center}.ds-logos ul{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:32px;justify-content:center;font-family:var(--ds-font-display);color:var(--ds-color-text-secondary)}
.ds-faq{border-bottom:1px solid var(--ds-color-border-default);padding:16px 0;max-width:800px;margin:0 auto}.ds-faq summary{cursor:pointer;font-weight:500}
.ds-prose{max-width:800px}.ds-prose p{color:var(--ds-color-text-secondary)}
.ds-cta{margin-top:120px;padding:96px 24px;background:var(--ds-color-bg-subtle);border:1px solid var(--ds-color-border-default);border-radius:var(--ds-radius-shell);box-sizing:border-box}
.ds-footer{padding:96px 0 48px;color:var(--ds-color-text-secondary)}.ds-footer-groups{display:grid;gap:24px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}.ds-footer-groups a{display:block;color:var(--ds-color-text-secondary);text-decoration:none;padding:4px 0}.ds-legal{font-size:13px}`;

export async function writePage(outline: { title?: string; sections: OutlineSection[] }, flavor: string): Promise<Record<string, string>> {
	if (flavor === 'html') {
		const css = readFileSync(pkgPath('build', 'site.css'), 'utf8');
		const fonts = brand().fonts?.css ? `<link rel="stylesheet" href="${attr(brand().fonts.css)}">` : '';
		const body = outline.sections.map(htmlSection).join('\n');
		return { 'index.html': `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${html(outline.title ?? brand().name)}</title>\n${fonts}\n<style>\n${css}\n${PAGE_CSS}\n</style>\n</head>\n<body>\n${body}\n</body>\n</html>\n` };
	}
	const imports = new Map<string, Set<string>>();
	const parts = outline.sections.map((s, i) => {
		const r = reactSection(s, i);
		for (const x of r.imports) {
			const [name, file] = x.split(':');
			if (!imports.has(file)) imports.set(file, new Set());
			imports.get(file)!.add(name);
		}
		return `      ${r.jsx}`;
	});
	const lines = [...imports].map(([file, names]) => `import { ${[...names].sort().join(', ')} } from "@/components/${file}";`);
	const components = [...new Set(outline.sections.flatMap((s) => SECTIONS.find((x) => x.type === s.type)!.component))];
	return {
		'page.tsx': `${lines.join('\n')}\n\n// Built by \`design page compose\` from an outline: only the outline's words are on the page.\n// Add the components first: npx ${brand().bin} add ${components.join(' ')}\nexport default function Page() {\n  return (\n    <main>\n${parts.join('\n')}\n    </main>\n  );\n}\n`,
	};
}

export const pageAdapter: Adapter['page'] = {
	sections: () => SECTIONS.map(({ component: _c, ...s }) => s),
	flavors: ['react', 'html'],
	write: writePage,
};

export const composeAdapter = (): NonNullable<Adapter['compose']> => ({
	blocks: composeBlocks,
	themes: [...THEMES],
	grounds: { white: colors().white, mist: colors().mist },
	formats: ['png', 'svg', 'jpg', 'webp', 'pdf'],
	recipe,
});

export type { DrawnLayer };
