import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { z } from 'zod';
import { brand, tokens } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';

const rule = z.object({ id: z.string().regex(/^[a-z0-9-]+$/), text: z.string().min(1), source: z.string().min(1) });
const rules = z.array(rule).min(1);

const face = z.object({
	id: z.string().regex(/^[a-z0-9-]+$/),
	role: z.string().min(1),
	family: z.string().min(1),
	token: z.string().regex(/^--ds-font-/),
	bundled: z.boolean(),
	weights: z.array(z.number().int()).optional(),
	files: z.array(z.string().min(1)).optional(),
	license: z.string().optional(),
	licenseFile: z.string().optional(),
	note: z.string().optional(),
	reason: z.string().optional(),
	substitute: z.object({
		family: z.string().min(1),
		role: z.string().min(1),
		file: z.string().min(1),
		license: z.string().min(1),
		licenseFile: z.string().min(1),
		note: z.string().min(1),
	}).optional(),
});

const logo = z.object({
	id: z.string().regex(/^[a-z0-9-]+$/),
	file: z.string().min(1),
	name: z.string().min(1),
	summary: z.string().min(1),
	do: rules,
	dont: rules,
});

const surface = z.object({
	summary: z.string().min(1),
	do: rules,
	dont: rules,
	sources: z.array(z.string().min(1)).min(1),
});

const schema = z.object({
	schemaVersion: z.literal(1),
	fonts: z.object({ faces: z.array(face).min(1) }),
	logos: z.array(logo).min(1),
	voice: z.object({
		summary: z.string().min(1),
		do: rules,
		dont: rules,
		banned: z.array(z.string().min(1)).min(1),
		productName: z.string().min(1),
		case: z.string().min(1),
		spelling: z.string().min(1),
		sources: z.array(z.string().min(1)).min(1),
	}),
	principles: z.object({ site: surface, product: surface }),
});

export type BrandSystem = z.infer<typeof schema>;

const sha256 = (data: Buffer) => createHash('sha256').update(data).digest('hex');

function abs(rel: string) {
	if (rel.includes('..') || rel.startsWith('/') || rel.includes('\\')) throw new Error(`Brand path "${rel}" must stay inside the package.`);
	return pkgPath(...rel.split('/'));
}

function mustFile(rel: string) {
	const file = abs(rel);
	if (!existsSync(file)) throw new Error(`Missing brand file ${rel}.`);
	return readFileSync(file);
}

function checkFace(item: BrandSystem['fonts']['faces'][number]) {
	if (!(item.token in tokens().site)) throw new Error(`Font ${item.id} names ${item.token}, which is not a token.`);
	if (item.bundled) {
		if (!item.files?.length || !item.license || !item.licenseFile) throw new Error(`Bundled font ${item.id} needs files and a license.`);
		for (const file of item.files) mustFile(file);
		mustFile(item.licenseFile);
		return;
	}
	if (!item.reason || !item.substitute) throw new Error(`Font ${item.id} is not bundled. State why, and name the substitute file that is in the repo.`);
	mustFile(item.substitute.file);
	mustFile(item.substitute.licenseFile);
}

let cached: BrandSystem | undefined;

export function loadSystem(): BrandSystem {
	if (cached) return cached;
	const parsed = schema.safeParse(JSON.parse(readFileSync(pkgPath('brand', 'system.json'), 'utf8')));
	if (!parsed.success) throw new Error(`brand/system.json is invalid. ${parsed.error.issues.map((issue) => `${issue.path.join('.')} ${issue.message}`).join('; ')}`);
	const system = parsed.data;
	if (system.voice.productName !== brand().name) throw new Error('Voice productName must match the brand name.');
	const ids = new Set<string>();
	for (const face of system.fonts.faces) {
		if (ids.has(face.id)) throw new Error(`Duplicate font id ${face.id}.`);
		ids.add(face.id);
		checkFace(face);
	}
	const cited = new Set<string>([...system.voice.sources, ...system.principles.site.sources, ...system.principles.product.sources]);
	for (const rule of [...system.voice.do, ...system.voice.dont, ...system.principles.site.do, ...system.principles.site.dont, ...system.principles.product.do, ...system.principles.product.dont]) cited.add(rule.source);
	for (const mark of system.logos) {
		const file = mustFile(mark.file);
		if (!file.subarray(0, 300).toString('utf8').includes('<svg')) throw new Error(`${mark.file} is not an SVG logo.`);
		for (const rule of [...mark.do, ...mark.dont]) cited.add(rule.source);
	}
	for (const file of cited) mustFile(file);
	cached = system;
	return system;
}

export function fontRecords() {
	const system = loadSystem();
	return system.fonts.faces.map((face) => ({
		...face,
		tokenValue: tokens().site[face.token],
		files: (face.files ?? []).map((file) => ({ path: file, sha256: sha256(mustFile(file)) })),
		licenseFile: face.licenseFile ? { path: face.licenseFile, sha256: sha256(mustFile(face.licenseFile)) } : undefined,
		substitute: face.substitute ? { ...face.substitute, sha256: sha256(mustFile(face.substitute.file)), licenseSha256: sha256(mustFile(face.substitute.licenseFile)) } : undefined,
	}));
}

export function logoRecords() {
	return loadSystem().logos.map((logo) => {
		const data = mustFile(logo.file);
		return { ...logo, sha256: sha256(data), svg: data.toString('utf8') };
	});
}

export function gaps() {
	const system = loadSystem();
	const list: { id: string; detail: string }[] = [];
	for (const face of system.fonts.faces) if (!face.bundled && face.reason) list.push({ id: `font-${face.id}`, detail: face.reason });
	if (!(brand().surfaces ?? ['site', 'product']).includes('product')) list.push({ id: 'product-surface', detail: system.principles.product.summary });
	return list;
}
