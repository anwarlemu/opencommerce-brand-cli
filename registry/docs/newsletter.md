---
name: newsletter
title: Newsletter
type: site
surface: site
description: "A newsletter sign-up in one window: the heading and a line, then the work email and the blue key, thanking the reader in place."
kinds: [window, input, button-primary]
use_for: "Use once on a page, near the footer. Pass onSubmit to add the address to your list."
never: [A second field, A blue band, A pop-up]
source: "Extension in the opencommerce site's voice (the fields of monitoring.tsx, globals.css .win)"
---

`Newsletter` props: `title`, `description`, `action` (the key's label), `thanks`, `onSubmit` (receives `FormData`),
plus div props.
