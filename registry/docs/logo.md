---
name: logo
title: Logo
type: ui
surface: site
description: "The typeset opencommerce lockup with its byline, and the [*] mark."
kinds: []
use_for: "Use Lockup in headers and footers (compact once the header scrolls), and LogoMark in tight spots: an app icon, an avatar, a favicon-sized slot. Set label={null} when the containing link already has an accessible name."
never: [The name set in another face or weight, The name capitalized, The byline larger than the name, The mark stretched or outlined, A drop shadow or glow behind the logo]
source: "opencommerce-agentcard-web src/components/logo.tsx, src/app/icon2.svg; brand/logo (lockup.svg, mark.svg)"
---

`Lockup` takes every span prop plus `label` (string or null, default "opencommerce by Agentcard"), `tone` ("ink" |
"brand" | "white" | "current", default "ink"), `byline` (default true) and `compact` (folds the byline away over 250ms).
It is type, so size it with a text size on the name (`[&>[data-logo-name]]:text-h3`); the default is the header's 17px.

`LogoMark` takes every SVG prop plus `label` (default "opencommerce") and `tone` (the square's color: "brand" by default;
"white" draws a white square with blue strokes). Size it by width (`w-8`).
