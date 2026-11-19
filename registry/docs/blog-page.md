---
name: blog-page
title: Blog page
type: block
surface: site
description: "Blog index template with the header, the page's opening, the posts as windows (the latest across the column), page keys and the footer."
kinds: []
use_for: "Use as a starting point for a blog or news index. Replace the sample posts, people and page links."
never: [Stock photos on posts, Cards that tilt or lift on hover, Tags in caps, More than one post across the column]
source: "Extension in the opencommerce site's voice (opencommerce-agentcard-web src/components: windows, mono labels, chips)"
---

Composed from `SiteHeader`, `PageHeader`, `Window`, `Badge` (chip), `Pagination` and `SiteFooter`. Each post window is
one link: the title's anchor covers the window.
