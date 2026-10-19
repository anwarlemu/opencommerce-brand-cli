---
name: window
title: Window
type: ui
surface: site
description: "A white card with a quiet title bar: file name centered, the [*] mark or an action at the right."
kinds: [window, window-bar, card]
use_for: "Use for the things a page shows off: code (agent.ts), plans (free.plan), a live table (monitoring.live), a feature's picture. Name the bar like a file. Use dark for code that runs."
never: [A window bar on every card of a page, Colored or blue bars on the page's main windows, Rounded corners other than 12px, A heavy or offset shadow]
source: "opencommerce-agentcard-web src/app/globals.css (.win, .win-bar, .win-mark), src/components/window.tsx"
---

`Window` takes `name` (the bar's file name), `actions` (replaces the [*], for a Copy key), `dark` (the body on ink, for
code that runs), `raised` (the firmer drop of a small card set on a picture), `tone` and `bodyClassName`. The bar is
mist with the name in the 11.5px platform mono at 64 percent ink, a dimmed arrow at the left and the drawn [*] in blue
at the right. `tone` keeps other bars for special cases: `sky`, `blue` and five pale tints. `WindowBar` and
`WindowMark` are exported for bars on other surfaces (a dialog, a command menu).
