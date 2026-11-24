---
name: sign-in-page
title: Sign in page
type: block
surface: site
description: "Sign in template with the header, one window holding work email, password and the blue key, the way to an account under it, and the footer."
kinds: []
use_for: "Use for the sign-in page. Pass onSubmit; throw an Error with a short message to show it under the password."
never: [Social buttons in other brands' colors, A second blue key, Placeholder text in place of labels]
source: "Extension in the opencommerce site's voice, after contact-page (opencommerce-agentcard-web globals.css .win, the fields of monitoring.tsx)"
---

`SignInPage` props: `onSubmit` (receives the form's `FormData`; throw to show an error). Composed from `SiteHeader`,
`Window`, `Field`, `Input`, `Button` and `SiteFooter`.
