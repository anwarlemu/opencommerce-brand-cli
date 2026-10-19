---
name: steps
title: Steps
type: site
surface: site
description: "How it works: steps listed down the left, each with its code in a dark window, playing through on a timer."
kinds: [tabs, code-window, window-bar]
use_for: "Use once on the home page, in a wide SiteSection, for three to six steps from first call to result. Each step carries the code that does it."
never: [More than six steps, Steps without code, A timer faster than 4 seconds a step, Auto-advancing under reduced motion, Light code windows here]
source: "opencommerce-agentcard-web src/components/in-action.tsx, src/app/globals.css (.swap-in, step-timer)"
---

`Steps` props: `steps` ({ title, code, file, language }[]), `interval` (ms a step stays open, default 6000), `label`
(the tab list's name, default "Steps"), plus div props. Arrow keys, Home and End move between steps.

Motion: the timer bar fills linearly (it is a clock) and holds while the pointer or focus is inside or the steps are off
screen; the new code fades in through a breath of blur (200ms ease-out). Reduced motion: no timer, and only the fade.
