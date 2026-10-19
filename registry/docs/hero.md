---
name: hero
title: Hero
type: site
surface: site
description: "White, centered page opening: a pill, the title, a line, two keys, the strip of marks and a code window over a field of glyphs."
kinds: [hero, hero-title, hero-subtitle, button-primary, button-secondary]
use_for: "Use at the top of the home page. Pass the primary and secondary Buttons as actions, LogoStrip as strip and a CodeWindow as media. Use titleClassName to adjust wrapping for a longer headline."
never: [A blue or tinted hero, A gradient behind the title, More than two keys, Long paragraphs in the hero, An image in place of the code, The glyph field over the title]
source: "opencommerce-agentcard-web src/components/hero.tsx, src/components/binary-stage.tsx, src/app/globals.css (.h-hero, .lead, .hero-binary)"
---

`Hero` props: `title`, `titleClassName`, `eyebrow` (the pill), `eyebrowHref`, `subtitle`, `actions`, `strip`,
`media`, `glyphs` (default true: the field behind the media), plus section props.
