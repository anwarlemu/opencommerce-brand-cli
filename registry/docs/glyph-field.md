---
name: glyph-field
title: Glyph field
type: visual
surface: site
description: "A faint canvas field of *s and @s in clumps, with a few blue runs, that flickers while on screen."
kinds: [media-frame]
use_for: "Put it behind the hero's code window (fade out, spilling past the card) or inside the closing card (fade in, gathering at the edges). Position it absolutely in a relative, isolated parent and keep it under the content."
never: [The field over text, More than three fields on a page, Blue as the main color of the field, A field on a dark ground]
source: "opencommerce-agentcard-web src/components/binary-stage.tsx, src/lib/noise.ts, src/app/globals.css (.hero-binary, .cta-binary)"
---

`GlyphField` props: `seed` (another map, default 3), `fade` ("out" | "in" | "none", default out), plus canvas props.
Size it with classes; it redraws when its box changes. It flickers only while on screen and is still with reduced
motion.
