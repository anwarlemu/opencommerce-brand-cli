import { readFileSync, statSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import type { Picture } from '../assets/kit.js';
import { toPng } from './encode.js';

export function pngSize(buffer: Buffer) {
	if (buffer.length < 24 || buffer[0] !== 0x89 || buffer.toString('ascii', 1, 4) !== 'PNG') throw new Error('Output is not a PNG.');
	return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

export function rasterize(svg: string, opts: { width?: number } = {}) {
	const resvg = new Resvg(svg, { fitTo: opts.width ? { mode: 'width', value: opts.width } : { mode: 'original' }, font: { loadSystemFonts: false }, shapeRendering: 2, textRendering: 2, imageRendering: 0 });
	return Buffer.from(resvg.render().asPng());
}

/** The RGB pixels of an SVG (for a PDF page), and its size. */
export function rasterRgb(svg: string, opts: { width?: number } = {}) {
	const resvg = new Resvg(svg, { fitTo: opts.width ? { mode: 'width', value: opts.width } : { mode: 'original' }, font: { loadSystemFonts: false }, shapeRendering: 2, textRendering: 2, imageRendering: 0, background: '#ffffff' });
	const img = resvg.render();
	const px = img.pixels;
	const rgb = Buffer.alloc((px.length / 4) * 3);
	for (let i = 0, j = 0; i < px.length; i += 4, j += 3) {
		const a = px[i + 3] / 255;
		rgb[j] = Math.round(px[i] * a + 255 * (1 - a));
		rgb[j + 1] = Math.round(px[i + 1] * a + 255 * (1 - a));
		rgb[j + 2] = Math.round(px[i + 2] * a + 255 * (1 - a));
	}
	return { rgb, width: img.width, height: img.height, png: Buffer.from(img.asPng()) };
}

/** The frame size of a JPEG, and its EXIF rotation (1 when upright or unstated). */
function jpegInfo(buffer: Buffer) {
	let offset = 2;
	let rotation = 1;
	while (offset + 1 < buffer.length) {
		if (buffer[offset] !== 0xff) {
			offset += 1;
			continue;
		}
		while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
		if (offset >= buffer.length) break;
		const marker = buffer[offset];
		offset += 1;
		// Standalone markers carry no length: stuffed 0x00, TEM, restart, SOI and EOI.
		if (marker === 0x00 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) continue;
		if (offset + 1 >= buffer.length) break;
		const length = buffer.readUInt16BE(offset);
		if (length < 2) throw new Error('Could not read the JPEG size.');
		if (marker === 0xe1 && buffer.toString('latin1', offset + 2, offset + 8) === 'Exif\0\0') rotation = exifRotation(buffer.subarray(offset + 8, offset + length)) || rotation;
		const startOfFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
		if (startOfFrame) {
			if (offset + 6 >= buffer.length) break;
			return { height: buffer.readUInt16BE(offset + 3), width: buffer.readUInt16BE(offset + 5), rotation };
		}
		offset += length;
	}
	throw new Error('Could not read the JPEG size.');
}

function exifRotation(tiff: Buffer) {
	try {
		const le = tiff.toString('latin1', 0, 2) === 'II';
		const u16 = (o: number) => (le ? tiff.readUInt16LE(o) : tiff.readUInt16BE(o));
		const u32 = (o: number) => (le ? tiff.readUInt32LE(o) : tiff.readUInt32BE(o));
		const ifd = u32(4);
		for (let i = 0; i < u16(ifd); i++) if (u16(ifd + 2 + i * 12) === 0x0112) return u16(ifd + 2 + i * 12 + 8);
	} catch {}
	return 1;
}

const MAX_MB = 20;
const MAX_SIDE = 12000;

/** A picture for a layout: PNG, JPEG, WebP, GIF (its first frame) or SVG, upright. */
export function loadImage(file: string): Picture {
	const name = basename(file);
	let buffer: Buffer;
	try {
		buffer = readFileSync(file);
	} catch {
		throw new Error(`No image at ${file}.`);
	}
	if (buffer.length > MAX_MB * 1024 * 1024) throw new Error(`${name} is ${(buffer.length / 1048576).toFixed(0)} MB. Image files must be under ${MAX_MB} MB.`);
	let picture: Picture;
	if (buffer[0] === 0x89 && buffer.toString('ascii', 1, 4) === 'PNG') picture = { data: buffer, mime: 'image/png', ...pngSize(buffer) };
	else if (buffer[0] === 0xff && buffer[1] === 0xd8) {
		const { rotation, ...size } = jpegInfo(buffer);
		if (rotation > 1) {
			const png = toPng(buffer);
			picture = { data: png, mime: 'image/png', ...pngSize(png) };
		} else picture = { data: buffer, mime: 'image/jpeg', ...size };
	} else if (buffer.toString('latin1', 0, 4) === 'GIF8' || (buffer.toString('latin1', 0, 4) === 'RIFF' && buffer.toString('latin1', 8, 12) === 'WEBP')) {
		let png: Buffer;
		try {
			png = toPng(buffer);
		} catch {
			throw new Error(`${name} could not be read: the file is damaged. Save it again as a PNG or JPEG.`);
		}
		picture = { data: png, mime: 'image/png', ...pngSize(png) };
	} else if (buffer.subarray(0, 2000).toString('utf8').includes('<svg')) {
		let png: Buffer;
		try {
			png = rasterize(buffer.toString('utf8'));
			const size = pngSize(png);
			// A small drawing is rasterized larger, so it stays sharp in a window.
			if (size.width < 1600) png = rasterize(buffer.toString('utf8'), { width: 1600 });
		} catch {
			throw new Error(`${name} could not be read as an SVG.`);
		}
		picture = { data: png, mime: 'image/png', ...pngSize(png) };
	} else throw new Error(`${name} is not a picture this reads: the image must be a PNG, JPEG, WebP, GIF or SVG file.`);
	if (!picture.width || !picture.height) throw new Error(`${name} has no size.`);
	if (picture.width > MAX_SIDE || picture.height > MAX_SIDE) throw new Error(`${name} is ${picture.width}x${picture.height}. Images may be up to ${MAX_SIDE} px on a side.`);
	return picture;
}

/** Throws when a picture's data cannot be decoded (a truncated or damaged file draws nothing). */
export function assertReadable(picture: Picture, file: string) {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><image href="data:${picture.mime};base64,${picture.data.toString('base64')}" width="16" height="16" preserveAspectRatio="none"/></svg>`;
	const px = new Resvg(svg, { fitTo: { mode: 'original' }, font: { loadSystemFonts: false } }).render().pixels;
	for (let i = 3; i < px.length; i += 4) if (px[i] > 0) return;
	throw new Error(`${basename(file)} could not be drawn: the file is damaged or empty. Save it again as a PNG or JPEG.`);
}

export function resolveImage(file: string, contentFile?: string) {
	const fromCwd = resolve(file);
	if (isFile(fromCwd)) return fromCwd;
	if (contentFile) {
		const beside = resolve(dirname(contentFile), file);
		if (isFile(beside)) return beside;
	}
	throw new Error(`No image at ${file}.`);
}

function isFile(file: string) {
	try {
		return statSync(file).isFile();
	} catch {
		return false;
	}
}

/** A picture from a path: found, read and decoded, or an error that says why. */
export function picture(file: string, contentFile?: string): Picture {
	const path = resolveImage(file, contentFile);
	const p = loadImage(path);
	assertReadable(p, path);
	return p;
}
