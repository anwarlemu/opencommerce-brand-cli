---
name: contact-page
title: Contact page
type: block
surface: site
description: "Contact page template with the header, the page's opening, a form in a window beside other ways to reach the team, and the footer."
kinds: []
use_for: "Use as a starting point for a contact or sales page. Pass onSubmit to send the form's data to your endpoint, and replace the addresses."
never: [More than one blue key, Required fields without the mark, Placeholder text in place of labels]
source: "Extension in the opencommerce site's voice (opencommerce-agentcard-web src/components/monitoring.tsx field, globals.css .win)"
---

`ContactPage` props: `onSubmit` (receives the form's `FormData`). After it resolves, the form thanks the sender in
place. Composed from `SiteHeader`, `PageHeader`, `Window`, `Field`, `Input`, `NativeSelect`, `Textarea`, `Button`,
`Item` and `SiteFooter`.
