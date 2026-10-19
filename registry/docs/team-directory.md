---
name: team-directory
title: Team directory
type: site
surface: site
description: "Responsive directory of people with photos, roles and optional links."
kinds: [window, window-bar, card, link]
use_for: "Use for teams, advisors, investors or partners. Provide current names and links."
never: [Color photos, Round avatars, Bold names, A colored window bar, Cards with gaps between people instead of the ruled grid]
source: "Extension in the opencommerce site's voice (its windows, hairlines and mono labels; opencommerce-agentcard-web src/components/window.tsx); the grid from agentcard.sh/about"
---

`TeamDirectory` props: `name` (the bar label: `team.dir`), `columns` (1 | 2 | 3,
default 2; one column on phones; two columns use 64px photos and 96px cells, three use 40px photos and 84px cells),
`people` (`{ name, role?, photo?, photoAlt?, href? }`: `photo` is an image URL or any node, shown in grayscale; `href`
makes the cell a link with the arrow), `footer` (`{ logo?, label?, href?, ariaLabel? }[]`, two to a row).

A linked cell takes the mist under the pointer and its arrow turns blue (160ms, ease-out); nothing moves.
