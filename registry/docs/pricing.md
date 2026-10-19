---
name: pricing
title: Pricing
type: site
surface: site
description: "Plans side by side in windows, with the figure, compared rows and a full-width key; one plan featured."
kinds: [window, window-bar, stat, chip, button-primary, button-secondary]
use_for: "Pass title, description, the compared rows and two plans with one value per row. Feature at most one plan."
never: [More than one featured plan, More than three plans, Strikethrough prices without a reason, Check lists in place of compared rows, A blue window]
source: "opencommerce-agentcard-web src/components/pricing.tsx, src/lib/content.ts (PRICING)"
---

`Pricing` props: `title`, `description`, `rows` (the labels compared), `plans` ({ name, badge, price, unit, blurb,
values, action ({ label, href } or a node), featured, file }[]), plus div props.
