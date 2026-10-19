---
name: section
title: Section
type: site
surface: site
description: "Page section with generous air above, the centered section heading and an optional label."
kinds: [section, column, section-heading, section-description, eyebrow]
use_for: "Use SiteSection for each band of the page and SectionHeading to open it. Pick width medium (800px) for features, pricing and questions, wide (1200px) for a table, the steps or the closing card. Add bottom padding only to the section that closes the page."
never: [A blue section, Rules between sections, Left-aligned section titles over centered content, Bold titles, Eyebrows in caps, Two tinted sections in a row]
source: "opencommerce-agentcard-web src/components/band.tsx, src/components/section-head.tsx, src/app/globals.css (.sec, .h-section, .lead)"
---

`SiteSection` props: `ground` ("white" | "mist", default white), `width` ("wide" | "medium", default wide),
`contained` (default true), `innerClassName`, plus section props. `SectionHeading` props: `title`, `description`,
`eyebrow`, `as` ("h1" | "h2" | "h3", default h2), `align` ("center" | "start"). `Eyebrow` takes paragraph props.
