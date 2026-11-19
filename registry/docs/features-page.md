---
name: features-page
title: Features page
type: block
surface: site
description: "Features page template: header, hero, main features beside their windows, a grid of smaller features, steps, customer cases, closing card and footer."
kinds: []
use_for: "Use as a starting point for a product or features page. Replace the sample features, pictures, cases and code, and check every link."
never: [A blue or dark section, More than one closing card, Icons in place of feature pictures, Real company names or quotes in the sample cases]
source: "Extension in the opencommerce site's voice (opencommerce-agentcard-web src/components/hero.tsx, features.tsx, in-action.tsx, cta.tsx), arranged as a page of its own"
---

Composed from `SiteHeader`, `Hero`, `LogoStrip`, `FeatureRows`, `FeatureGrid`, `Steps`, `Testimonials`, `Cta` and
`SiteFooter`. The pictures in the feature rows are drawn in the page's own parts and play once when first seen, as on
the home page.
