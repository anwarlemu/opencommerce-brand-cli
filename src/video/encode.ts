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
	if (!ffmpegPath) throw new Error('The video encoder is not available. Install ffmpeg-static.');
	if (!frames.length) throw new Error('A video needs at least one frame.');
	const dir = mkdtempSync(join(tmpdir(), 'ds-video-'));
	try {
		frames.forEach((frame, index) => writeFileSync(join(dir, `frame-${String(index + 1).padStart(4, '0')}.png`), frame));
		const out = join(dir, 'out.mp4');
		const result = spawnSync(
			ffmpegPath,
			[
				'-hide_banner', '-loglevel', 'error', '-y',
				'-cpuflags', 'none',
				'-framerate', String(fps),
				'-start_number', '1',
				'-i', join(dir, 'frame-%04d.png'),
				'-frames:v', String(frames.length),
				'-c:v', 'libx264',
				'-pix_fmt', 'yuv420p',
				'-preset', 'medium',
				'-crf', '18',
				'-g', String(fps),
				'-keyint_min', String(fps),
				'-sc_threshold', '0',
				'-bf', '0',
				'-x264-params', `bframes=0:keyint=${fps}:min-keyint=${fps}:scenecut=0:open-gop=0`,
				'-movflags', '+faststart',
				'-fflags', '+bitexact',
				'-flags', '+bitexact',
				'-map_metadata', '-1',
				'-muxdelay', '0',
				'-muxpreload', '0',
				out,
			],
			{ env: { ...process.env, SOURCE_DATE_EPOCH: '0' }, encoding: 'utf8' },
		);
		if (result.status !== 0) throw new Error(`Video encode failed. ${result.stderr || result.stdout || 'ffmpeg exited without a message.'}`.trim());
		return readFileSync(out);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}
