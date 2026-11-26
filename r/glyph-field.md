# Glyph field
A faint canvas field of *s and @s in clumps, with a few blue runs, that flickers while on screen.

Install: npx opencommerce-ds add glyph-field
Requires: theme, utils
Packages: none
Exports: GlyphField, GlyphFieldProps
Client boundary: yes
Reference: opencommerce-agentcard-web src/components/binary-stage.tsx, src/lib/noise.ts, src/app/globals.css (.hero-binary, .cta-binary)


## Usage
Put it behind the hero's code window (fade out, spilling past the card) or inside the closing card (fade in, gathering at the edges). Position it absolutely in a relative, isolated parent and keep it under the content.
- Avoid: The field over text
- Avoid: More than three fields on a page
- Avoid: Blue as the main color of the field
- Avoid: A field on a dark ground
`GlyphField` props: `seed` (another map, default 3), `fade` ("out" | "in" | "none", default out), plus canvas props.
Size it with classes; it redraws when its box changes. It flickers only while on screen and is still with reduced
motion.

## Examples
Example components: npx opencommerce-ds add glyph-field
[Site](https://opencommerce-ds.vercel.app/preview/glyph-field/Site)

examples/glyph-field.tsx

```tsx
import { GlyphField } from "@/components/visuals/glyph-field";

export function Site() {
  return (
    <div className="grid gap-8 py-10">
      <div className="relative isolate mx-auto h-72 w-full max-w-200">
        <GlyphField className="absolute inset-0 -z-10 size-full" />
        <div className="relative mx-auto mt-16 h-40 max-w-120 rounded-panel border border-line-strong bg-surface shadow-card" />
      </div>
      <div className="relative isolate overflow-hidden rounded-shell border border-line bg-subtle px-6 py-20 text-center">
        <GlyphField seed={11} fade="in" className="absolute inset-0 size-full" />
        <p className="relative font-display text-h2 leading-display font-medium tracking-tighter">Copy sits on clean ground</p>
      </div>
    </div>
  );
}

```

## Source

components/visuals/glyph-field.tsx

```tsx
"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// The field of *s and @s (the opencommerce site's binary stage): Agentcard's mark and the address sign set on a
// character lattice, their density following a noise map, so they read as solid clumps that crumble into scattered
// glyphs at their coasts with open ground between. Mostly faint ink, with a few short runs in the brand blue deep inside
// a clump. A few glyphs flip now and then while the field is on screen; under reduced motion it is still. The colors and
// the face are read from the brand tokens, never written here. `fade` shapes it across its box: "out" is solid in the
// middle and gone at the edges (behind a card), "in" is clear in the middle and gathers at the edges (round a card's
// copy). The fade is baked into each glyph rather than laid on as a mask, so a flicker repaints a cell, not the layer.

/** The lattice cell and the glyph size, in CSS pixels. */
const CW = 9;
const CH = 13;
const FONT_PX = 11;

type Glyph = { x: number; y: number; alpha: number; blue: boolean; star: boolean };
type Fade = "out" | "in" | "none";

/** Deterministic hash to [0, 1): the pattern is the same on every load; only the flicker is random. */
function hash(x: number, y: number) {
  let h = (x * 374761393 + y * 668265263) ^ 0x5bf03635;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

/** Value noise, interpolated between lattice hashes. */
function noise(x: number, y: number, seed: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const a = hash(xi + seed, yi);
  const b = hash(xi + 1 + seed, yi);
  const c = hash(xi + seed, yi + 1);
  const d = hash(xi + 1 + seed, yi + 1);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}

/** Three octaves: big landmasses with ragged coasts. */
function fbm(x: number, y: number, seed: number) {
  return noise(x, y, seed) * 0.55 + noise(x * 2.1, y * 2.1, seed + 17) * 0.3 + noise(x * 4.3, y * 4.3, seed + 41) * 0.15;
}

/** How much of a glyph survives at (nx, ny), each from -1 to 1 across the box. */
function fadeAt(fade: Fade, nx: number, ny: number) {
  if (fade === "none") return 1;
  if (fade === "out") {
    const d = Math.hypot(nx, ny);
    return 1 - smooth(Math.min(1, Math.max(0, (d - 0.68) / 0.32)));
  }
  const d = Math.hypot(nx / 1.44, ny / 1.7);
  return Math.min(1, Math.max(0, (d - 0.48) / 0.52));
}

type GlyphFieldProps = Omit<React.ComponentProps<"canvas">, "children"> & {
  /** Another seed gives another map. */
  seed?: number;
  fade?: Fade;
};

function GlyphField({ seed = 3, fade = "out", className, ...props }: GlyphFieldProps) {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const css = getComputedStyle(canvas);
    const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
    const ink = token("--ds-color-ink", "currentColor");
    const blue = token("--ds-color-brand", "currentColor");
    const mono = token("--ds-font-mono", "monospace");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let glyphs: Glyph[] = [];
    let timer = 0;
    let visible = false;

    const paint = (g: Glyph) => {
      ctx.globalAlpha = g.alpha;
      ctx.fillStyle = g.blue ? blue : ink;
      ctx.fillText(g.star ? "*" : "@", g.x + CW / 2, g.y);
    };

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `400 ${FONT_PX}px ${mono}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      const cols = Math.ceil(width / CW);
      const rows = Math.ceil(height / CH);
      glyphs = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const land = fbm(c / 16, r / 11, seed);
          // Solid inside a clump; at the coast a glyph survives only now and then, so the edges crumble.
          const odds = smooth(Math.min(1, Math.max(0, (land - 0.4) / 0.16)));
          if (hash(c * 7 + 11, r * 13 + 5) > odds) continue;
          const f = fadeAt(fade, ((c + 0.5) * CW * 2) / width - 1, ((r + 0.5) * CH * 2) / height - 1);
          if (f < 0.03) continue;
          // Blue comes in short horizontal runs, deep inside a clump.
          const isBlue = land > 0.56 && fbm(c / 7 + 40, r / 3.5, seed + 6) > 0.64;
          glyphs.push({ x: c * CW, y: r * CH, blue: isBlue, alpha: (isBlue ? 0.6 : 0.12 + odds * 0.08) * f, star: hash(c * 3 + 1, r * 5 + 2) > 0.45 });
        }
      }
      ctx.clearRect(0, 0, width, height);
      glyphs.forEach(paint);
      ctx.globalAlpha = 1;
    };

    const flicker = () => {
      if (!glyphs.length) return;
      const n = Math.max(1, Math.round(glyphs.length * 0.01));
      for (let i = 0; i < n; i++) {
        const g = glyphs[(Math.random() * glyphs.length) | 0];
        g.star = !g.star;
        ctx.clearRect(g.x, g.y, CW, CH);
        paint(g);
      }
      ctx.globalAlpha = 1;
    };

    const start = () => {
      window.clearInterval(timer);
      if (visible && !still) timer = window.setInterval(flicker, 140);
    };

    const ro = new ResizeObserver(build);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });

    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      ro.observe(canvas);
      io.observe(canvas);
    });
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      ro.disconnect();
      io.disconnect();
    };
  }, [seed, fade]);

  return <canvas ref={ref} aria-hidden data-slot="glyph-field" className={cn("pointer-events-none block", className)} {...props} />;
}

export { GlyphField };
export type { GlyphFieldProps };

```
