---
name: stats
title: Stats
type: site
surface: site
description: "Figures in windows: the number in the display face, its label under it, in a row that wraps, under an optional heading."
kinds: [window, stat]
use_for: "Use for two to four figures that matter (orders a day, stores reached). Pass stats with value, label and an optional window name."
never: [Figures nobody can check, More than four in a row, Blue figures]
source: "Extension in the opencommerce site's voice (the live numbers in monitoring.tsx and features.tsx, globals.css .win)"
---

`Stats` props: `title`, `description`, `stats` (`{ value, label, name? }[]`), plus div props.
