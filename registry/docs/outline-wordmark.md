---
name: outline-wordmark
title: Outline wordmark
type: visual
surface: site
description: "The name set as wide as the page in a faint outline, lit in blue under the pointer."
kinds: [footer]
use_for: "Use once, along the bottom edge of the site footer, with the product's name in its own case."
never: [A filled wordmark, The wordmark anywhere but the footer, A tagline in place of the name, A colored outline at rest]
source: "opencommerce-agentcard-web src/components/footer-wordmark.tsx, src/app/globals.css (THE FOOTER WORDMARK)"
---

`OutlineWordmark` props: `text`, plus paragraph props. It is decorative (hidden from screen readers); the footer
carries the name in text.
