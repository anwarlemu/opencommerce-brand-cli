---
name: status-table
title: Status table
type: site
surface: site
description: "A live table in a window: a live dot and filter, rows with marks, mono figures and day bars, a legend."
kinds: [table, window, window-bar, input]
use_for: "Use for live health of the things a product depends on (stores, routes, providers), in a wide SiteSection. Pass the columns, one value per column per row, and the day history."
never: [Red and green bars (the brand's blue only), More than six columns, Live data faked as live, A dark table]
source: "opencommerce-agentcard-web src/components/monitoring.tsx"
---

`StatusTable` props: `rows` ({ name, logo, values, days }[]), `columns` ({ label, mono, muted }[]), `name` (the
window's name, default "monitoring.live"), `nameLabel`, `daysLabel`, `live`, `filterLabel`, `filterPlaceholder`,
`note`, plus div props. `days` is "up" | "degraded" | "down", oldest first. On a phone each row stacks.
