---
name: data-table
title: Data Table
type: ui
surface: site
description: "The brand's table with a search field, sortable heads, row selection, a Columns menu and page keys."
kinds: [table]
use_for: "Use for records people sort, filter, select and page through (orders, merchants, API keys). Describe each column with an id, a header, an accessor for sorting and filtering, and a cell to render it; set sortable on the columns that can be sorted. Set selectable for a checkbox column and pageSizes to offer rows per page. Put bulk actions in toolbar."
never: [A data table for fewer than ten rows (use the table), Animating rows when sorting or paging, Hiding the only identifying column]
source: "opencommerce-agentcard-web src/components/monitoring.tsx (the merchant table) with table.tsx and pagination.tsx"
---
