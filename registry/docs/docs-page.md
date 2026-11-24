---
name: docs-page
title: Docs page
type: block
surface: site
description: "A docs article template with the header, the article on the text column (eyebrow, title, date, paragraphs, headings and code windows with the copy key), and the footer."
kinds: []
use_for: "Use for a guide or reference page. Pass the article as children; put code in CodeWindow with copy."
never: [Code as an image, Headings in caps, More than one idea per heading]
source: "Extension in the opencommerce site's voice, after legal-page (opencommerce-agentcard-web globals.css prose and .win code)"
---

`DocsPage` props: `children` (the article; a sample guide by default). Composed from `SiteHeader`, `SiteSection`,
`Prose`, `CodeWindow` and `SiteFooter`.
