---
name: nav-dock
title: Nav dock
type: site
surface: site
description: "The header's tray of links in frosted glass, with a lit pill that slides to the current section."
kinds: [nav-dock, nav-link]
use_for: "SiteHeader renders it from its links; use it alone only for a custom header. Link on-page sections by #id so the pill follows the reader, or set spy={false} and mark the current page."
never: [More than six links, Icons instead of labels, A colored tray, A dark glass tray on the white page, Moving the pill with a spring]
source: "opencommerce-agentcard-web src/components/nav-pills.tsx, src/app/globals.css (.nav-tray, .nav-link, .nav-lit)"
---

`NavDock` props: `links` ({ label, href, current }[]), `spy` (default true), `spyLine` (px from the top, default
120), `label` (the landmark's name, default "Main"), plus nav props. `TRAY` is the glass's class list, for a tray of
your own.

Motion: links wash on hover and shrink to 0.96 on press (160ms ease-out); the pill's clip slides between links (250ms,
in-out); with reduced motion it jumps.
