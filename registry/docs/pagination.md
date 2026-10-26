---
name: pagination
title: Pagination
type: ui
surface: site
description: "Page keys under a table: the current page a white key, the others bare, Previous and Next with chevrons."
use_for: "Use under a table or list that is split into pages. Show the first and last pages, the current one and its neighbors, with PaginationEllipsis between. Mark the current page with isActive and an unavailable Previous or Next with aria-disabled."
never: [Pagination for fewer than two pages, Numbered pages for a live feed (load more instead), Blue page keys]
source: "Extension from opencommerce-agentcard-web src/app/globals.css (.btn-secondary) and monitoring.tsx"
---
