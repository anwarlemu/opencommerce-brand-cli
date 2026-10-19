---
name: marquee
title: Marquee
type: visual
surface: site
description: "A slow strip of grey marks or names drifting left, fading at both ends, paused under the pointer."
kinds: [logo-strip]
use_for: "Use under the hero's actions for the stores, customers or partners a product reaches; LogoStrip wraps it for marks. Use at most one per page."
never: [Logos in color on the strip, A fast loop (under 60s a lap), Two running strips on one page, Text a reader must read to act]
source: "opencommerce-agentcard-web src/components/logo-strip.tsx, src/app/globals.css (THE LOGO STRIP)"
---

`Marquee` props: `items` (ReactNode[]), `label` (the list's accessible name), `duration` (seconds a lap, default 100),
plus div props. The items take the strip's grey through currentColor.
