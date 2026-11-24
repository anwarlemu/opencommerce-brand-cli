---
name: server-error-page
title: Server error page
type: block
surface: site
description: "Server error (500) template with the header, a short message, a key to try again and one to the status page, the failed request in a code window over the field of glyphs, and the footer."
kinds: []
use_for: "Use for the 500 page. Say nothing was lost when that is true; pass onRetry to repeat the request instead of reloading."
never: [Blaming the reader, Stack traces, More than two keys, A blue or dark page]
source: "Extension in the opencommerce site's voice, after not-found-page (opencommerce-agentcard-web src/components/hero.tsx)"
---

`ServerErrorPage` props: `onRetry` (default reloads the page). Composed from `SiteHeader`, `Hero`, `CodeWindow` and
`SiteFooter`.
