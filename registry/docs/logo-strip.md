---
name: logo-strip
title: Logo strip
type: site
surface: site
description: "The stores or customers as bare grey marks drifting left in one row under the hero's keys."
kinds: [logo-strip]
use_for: "Pass the brands with an image src (drawn as a mask, so any color works), a mark node in currentColor, or just a name. Use once, in the hero."
never: [Logos in their own colors, Tiles or borders around the marks, A fast drift, Two strips on a page]
source: "opencommerce-agentcard-web src/components/logo-strip.tsx, src/components/merchant-logo.tsx, src/app/globals.css (THE LOGO STRIP, .logo-mask)"
---

`LogoStrip` props: `brands` ({ name, src, logo, ratio }[]), `label` (the list's name, default "Stores"),
`duration` (seconds a lap, default 100), plus div props. Built on Marquee.
