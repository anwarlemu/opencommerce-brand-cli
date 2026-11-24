import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ffmpegPath = createRequire(import.meta.url)('ffmpeg-static') as string | null;

/**
 * Encode PNG frames with the pinned ffmpeg-static binary.
 * cpuflags none and bitexact keep the bytes stable across CPUs. SOURCE_DATE_EPOCH pins metadata.
 */
export function encodeMp4(frames: Buffer[], fps: number) {
	return encode(frames, fps, 'mp4');
}

/** VP9 in WebM, single-threaded with a fixed keyframe interval so the bytes are stable. */
export function encodeWebm(frames: Buffer[], fps: number) {
	return encode(frames, fps, 'webm');
}

/** An animated GIF, its palette made from the frames (the brand's few colors keep it small and banding-free). */
export function encodeGif(frames: Buffer[], fps: number) {
	return encode(frames, fps, 'gif');
}

function encode(frames: Buffer[], fps: number, kind: 'mp4' | 'webm' | 'gif') {
	if (!ffmpegPath) throw new Error('The video encoder is not available. Install ffmpeg-static.');
	if (!frames.length) throw new Error('A video needs at least one frame.');
	const dir = mkdtempSync(join(tmpdir(), 'ds-video-'));
	try {
		frames.forEach((frame, index) => writeFileSync(join(dir, `frame-${String(index + 1).padStart(4, '0')}.png`), frame));
		const out = join(dir, `out.${kind}`);
		const input = ['-hide_banner', '-loglevel', 'error', '-y', '-cpuflags', 'none', '-framerate', String(fps), '-start_number', '1', '-i', join(dir, 'frame-%04d.png'), '-frames:v', String(frames.length)];
		const codec =
			kind === 'gif'
				? ['-filter_complex', `[0:v]fps=${Math.min(fps, 25)},scale=iw*min(1\\,960/iw):-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64:stats_mode=full[p];[b][p]paletteuse=dither=none`, '-loop', '0']
				: kind === 'mp4'
				? ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '18', '-g', String(fps), '-keyint_min', String(fps), '-sc_threshold', '0', '-bf', '0', '-x264-params', `bframes=0:keyint=${fps}:min-keyint=${fps}:scenecut=0:open-gop=0`, '-movflags', '+faststart']
				: ['-c:v', 'libvpx-vp9', '-pix_fmt', 'yuv420p', '-b:v', '0', '-crf', '30', '-deadline', 'good', '-cpu-used', '2', '-row-mt', '0', '-threads', '1', '-g', String(fps), '-auto-alt-ref', '0'];
		const result = spawnSync(
			ffmpegPath,
			[...input, ...codec, '-fflags', '+bitexact', '-flags', '+bitexact', '-map_metadata', '-1', ...(kind === 'mp4' ? ['-muxdelay', '0', '-muxpreload', '0'] : []), out],
			{ env: { ...process.env, SOURCE_DATE_EPOCH: '0' }, encoding: 'utf8' },
		);
		if (result.status !== 0) throw new Error(`Video encode failed. ${result.stderr || result.stdout || 'ffmpeg exited without a message.'}`.trim());
		return readFileSync(out);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}
