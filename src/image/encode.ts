import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const ffmpegPath = createRequire(import.meta.url)('ffmpeg-static') as string | null;

/** Runs the pinned ffmpeg on bytes in, bytes out. cpuflags none and bitexact keep the bytes the same on every machine. */
export function ffmpeg(args: string[], input: Buffer): Buffer {
	if (!ffmpegPath) throw new Error('The encoder is not available. Install ffmpeg-static.');
	const r = spawnSync(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-cpuflags', 'none', ...args], { input, maxBuffer: 512 * 1024 * 1024 });
	if (r.error) throw r.error;
	if (r.status !== 0 || !r.stdout.length) throw new Error(`The encoder failed. ${String(r.stderr).trim().split('\n')[0]}`);
	return r.stdout;
}

export function toJpg(png: Buffer): Buffer {
	return ffmpeg(['-f', 'png_pipe', '-i', 'pipe:0', '-frames:v', '1', '-c:v', 'mjpeg', '-q:v', '2', '-pix_fmt', 'yuvj444p', '-threads', '1', '-flags:v', '+bitexact', '-fflags', '+bitexact', '-f', 'mjpeg', 'pipe:1'], png);
}

export function toWebp(png: Buffer): Buffer {
	return ffmpeg(['-f', 'png_pipe', '-i', 'pipe:0', '-frames:v', '1', '-c:v', 'libwebp', '-lossless', '1', '-compression_level', '4', '-threads', '1', '-flags:v', '+bitexact', '-fflags', '+bitexact', '-f', 'webp', 'pipe:1'], png);
}

/** Any picture ffmpeg reads, upright (a phone's rotation applied), as a PNG. */
export function toPng(data: Buffer): Buffer {
	return ffmpeg(['-i', 'pipe:0', '-frames:v', '1', '-c:v', 'png', '-threads', '1', '-flags:v', '+bitexact', '-fflags', '+bitexact', '-f', 'image2pipe', 'pipe:1'], data);
}
