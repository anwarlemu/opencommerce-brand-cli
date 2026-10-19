---
name: copy-button
title: Copy button
type: ui
surface: site
description: "A small Copy key that swaps to Copied in place, on white or on ink."
kinds: [button-secondary]
use_for: "Place beside a command, key or file and pass its value: in a window bar's corner, at the top right of a code card or in an install box. Use dark on ink. Use compact only where there is no room for the word."
never: [A copy button without a label for screen readers, Green or red copy states, Copying without visible feedback, A key that changes width when it says Copied]
source: "opencommerce-agentcard-web src/components/copy-button.tsx; src/app/globals.css (.copy-layer, .key-white, .key-dark)"
---

`CopyButton` takes `value`, `label` (the accessible name, default "Copy"), `dark` (on ink), `compact` (the icon only,
named by a tooltip) and `className`. It also exports `useCopy()`, which returns `{ hasCopied, error, copy }` for a
control of your own.
