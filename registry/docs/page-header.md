---
name: page-header
title: Page header
type: site
surface: site
description: "Title, optional label and introduction for an inner page."
kinds: [eyebrow]
use_for: "Place below SiteHeader on company, form, legal or update pages. Put supporting title content in children."
never: [A tinted ground behind it, Centered, A second title under it, More than one per page]
source: "Extension in the opencommerce site's voice (.h-hero type, mono labels and hairlines; opencommerce-agentcard-web src/app/globals.css)"
---

`PageHeader` props: `eyebrow`, `title`, `lead`, `rule` (default true), `children` (inside the head, under the title).
The live /about sets its lead at 24px (18px on phones), not 19px; the component follows the live page.
