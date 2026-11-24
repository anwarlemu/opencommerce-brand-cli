---
name: careers-page
title: Careers page
type: block
surface: site
description: "Careers template with the header, the page's opening, the open roles as rows in one window, the closing card, and the footer."
kinds: []
use_for: "Use for a careers page. Pass roles (title, team, place, href); keep each title short."
never: [Photos of people who are not on the team, Perks lists in place of roles, A second blue key]
source: "Extension in the opencommerce site's voice, after about-page (opencommerce-agentcard-web globals.css .win rows, cta.tsx)"
---

`CareersPage` props: `roles` (`{ title, team, place, href }[]`, sample roles at Acme by default). Composed from
`SiteHeader`, `PageHeader`, `SiteSection`, `Window`, `Cta`, `Button` and `SiteFooter`.
