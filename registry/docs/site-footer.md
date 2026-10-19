---
name: site-footer
title: Site footer
type: site
surface: site
description: "White footer under a hairline: the name and a line, three link columns, the small print and the outlined wordmark."
kinds: [footer, link]
use_for: "Use once at the foot of every page. Provide link groups (three reads best), the description and the small print; check that every link resolves."
never: [A blue or dark footer, Icons beside every link, More than four columns, Bold headings, A filled wordmark]
source: "opencommerce-agentcard-web src/components/site-footer.tsx, src/components/footer-wordmark.tsx"
---

`SiteFooter` props: `groups` ({ title, links: { label, href, external }[] }[]), `name` (default "opencommerce"),
`byline` (default "by Agentcard"), `logo`, `description`, `legal`, `wordmark` (string or null, default
"opencommerce"), plus footer props.
