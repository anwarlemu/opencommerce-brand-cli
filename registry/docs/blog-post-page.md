---
name: blog-post-page
title: Blog post page
type: block
surface: site
description: "Blog post template with a trail back to the blog, the title and author line, the post in the reading column, related posts, closing card and footer."
kinds: []
use_for: "Use as a starting point for one post. Pass the rendered post as Prose children and replace the author, date and related posts."
never: [Body text wider than 576px, Bold headings, A hero image in color beside a gray page, Two closing cards]
source: "Extension in the opencommerce site's voice (opencommerce-agentcard-web src/components; the prose from agentcard.sh/terms)"
---

Composed from `SiteHeader`, `Breadcrumb`, `PageHeader` (the author line as its children, with `Avatar`), `Prose`,
`Window`, `Badge`, `Cta` and `SiteFooter`.
