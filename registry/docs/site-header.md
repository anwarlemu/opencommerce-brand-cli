---
name: site-header
title: Site header
type: site
surface: site
description: "Fixed header of three glass trays: the wordmark, the links with their pill, and one blue key."
kinds: [header, header-action, nav-link, nav-dock]
use_for: "Use once at the top of every page with the page's sections as links (#features) and the main action. Set fixed={false} inside a frame or preview."
never: [A filled header bar, More than one key, A white key in the header, A sticky header (fixed with a spacer instead), Many links in the header]
source: "opencommerce-agentcard-web src/components/site-header.tsx, src/components/logo.tsx, src/components/mobile-nav.tsx, src/app/globals.css (.nav-tray, .nav-cta, .mobile-sheet)"
---

`SiteHeader` props: `name` (default "opencommerce"), `byline` (default "by Agentcard"), `logo` (your own, in place
of the wordmark), `href` (default "#top"), `logoLabel`, `links` ({ label, href, current }[]), `action` ({ label,
href }), `spy` (default true), `fixed` (default true), plus header props.

Motion: once the page scrolls the trays drop 12px and slide together (250ms, in-out) and the byline folds (250ms
ease-out); the phone sheet drops 6px in as it opens (200ms ease-out) and closes at once. Reduced motion keeps only the
fades.
