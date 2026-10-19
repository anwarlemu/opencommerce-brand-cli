---
name: cta
title: CTA
type: site
surface: site
description: "The closing card: mist, a hairline and 16px corners, the headline, two keys and the install box, glyphs gathering at its edges."
kinds: [card, button-primary, button-secondary]
use_for: "Use once near the end of the home page, in a wide SiteSection. Pass the primary and secondary Buttons as actions and InstallTabs as media."
never: [More than one per page, A blue card, Two primary keys, A gradient or glow behind the headline, Long copy]
source: "opencommerce-agentcard-web src/components/cta.tsx, src/components/install-tabs.tsx, src/app/globals.css (.cta-binary)"
---

`Cta` props: `title`, `description`, `actions`, `media`, `glyphs` (default true), plus div props.
