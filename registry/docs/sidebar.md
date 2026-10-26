---
name: sidebar
title: Sidebar
type: ui
surface: site
description: "An app's rail: a white column with a rule at its edge, quiet rows, mono group labels and the pale blue current row."
kinds: [nav-link]
use_for: "Use for an app's main navigation (an order console, a developer dashboard). Wrap the page in SidebarProvider with the Sidebar and a SidebarInset beside it; put the wordmark or a switcher in SidebarHeader, groups of SidebarMenu rows in SidebarContent and the account in SidebarFooter. Mark the current row with isActive. Set collapsible=\"icon\" to let it narrow to glyphs (give rows a tooltip), floating or inset for the window looks. On phones it opens in the sheet; Cmd or Ctrl and B toggles it."
never: [More than seven top-level rows, Nested rows two levels deep, A sidebar on a marketing page, Icons without labels when expanded]
source: "Extension from opencommerce-agentcard-web src/app/globals.css (.nav-link, .win)"
---
