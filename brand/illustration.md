# opencommerce illustration rules

The brand draws its pictures from the page's own parts: characters on a lattice, faint ink on white, blue only where
the site puts it. `illustrate` (and the art in `image`, `deck`, `video` and `merch`) follows these rules. Each names its
source. Sources are the brand's site (opencommerce-agentcard-web, read-only) and the brand's image tool in
agd-playground (`src/components/opencommerce-og/draw.ts`).

## The lattice

1. Pictures are made of monospace glyphs on a fixed cell grid, never of strokes or fills. The field uses 9 by 13 px
   cells with 11 px glyphs; the mark uses a finer 4.4 by 7.4 px grid. Source: `src/components/scatter-stage.tsx`
   (CW, CH, FONT_PX), `src/components/merchant-orbit.tsx` (MAIN, FINE).
2. Glyphs are vector outlines from the bundled mono (the site sets the platform mono; JetBrains Mono stands in), placed
   with `<use>`, so an SVG stays editable in Figma and a vector editor. Source: `brand/fonts/README.md`.

## The field of * and @

3. The field is `*` and `@` only (Agentcard's mark and the address sign), in clumps from a seeded noise map that
   crumble at their coasts. Source: `brand/principles.md` (The idea), `src/lib/noise.ts`, `scatter-stage.tsx`.
4. Ink glyphs sit at 12 to 20 percent; a few short runs deep inside a clump turn blue at 60 percent. Nothing else is
   blue. Source: `scatter-stage.tsx` (alpha and isBlue), `draw.ts` drawGlyphs.
5. The field gathers round windows and feathers out toward the edges. It never sits under words: every layout keeps a
   clear margin round its text, keys and windows. Source: `draw.ts` (the `keep` boxes), `scatter-stage.tsx` (CLEAR,
   HALO_CLEAR).
6. Each section or picture has its own seed so fields do not repeat; the same seed always draws the same field.
   Source: `src/components/section-objects.tsx` (seedOf), `draw.ts` (seed).

## The window

7. The window is the brand's card: white, a hairline edge at ink 16 percent, 12 px corners, the card's soft drop, a
   36 px mist bar with a dimmed arrow, a file-like name in mono and the [*] in blue. Code inside is ink with blue
   keywords, deep blue strings and faint comments, with pale blue bands on the lines that matter. Source:
   `src/components/window.tsx`, `src/app/globals.css` (THE WINDOW), `brand/tokens.css`, `draw.ts` drawWindow.
8. A picture inside a window (your `--image`) is fitted whole with 22 px of air, never cropped. Source: `draw.ts`
   (inside picture).

## The mark in characters

9. The [*] drawn as a solid slab (the logo's strokes extruded), turned slightly and lit from up left, shaded with the
   ramp `.:-=+*#%@` from faint to dense; only the brightest cells turn blue. It is the hero's sun, used once per
   picture, never as a repeating pattern. Source: `src/lib/mark-3d.ts`, `merchant-orbit.tsx` (SUN_RAMP),
   `brand/system.json` (do not use the mark as a repeating decoration).
10. The orbit is nine flat rings of dots nested evenly round the slab, tilted toward the viewer; the far half is fainter
    and passes behind the slab. The store tiles that travel the rings on the site are third-party logos and are left
    out. Source: `merchant-orbit.tsx` (RINGS, tilt, roll).

## Pictures in characters

11. A picture you pass becomes a halftone on the mark's fine grid with the same ramp: darker tones take denser glyphs,
    the darkest turn blue, white stays white. Source: the mark's shading in `merchant-orbit.tsx` and the halftone
    drawings in `src/components/hero-ascii.ts` (pictures sampled into characters).

## Motion

12. The field drifts as the site's does: the noise read through a slow sideways slide (0.032 per second) and a gentle
    warp, about 12 redraws a second; constant motion, so linear. The mark sways on slow sines. Entrances use the
    ease-out token at 160 to 300 ms, staggered 60 ms, and then rest. Nothing eases in. Source: `scatter-stage.tsx`
    (draw), `merchant-orbit.tsx` (ry, rx), `brand/tokens.css` (motion), `brand/principles.md` (pictures play once
    and rest).

## Never

13. No blue grounds, gradients, glows, stock 3D or a second accent color; no third-party logos, real people or real
    quotes (use Acme and your own `--image`). Source: `brand/principles.md` (Refuse), the shared brief.
