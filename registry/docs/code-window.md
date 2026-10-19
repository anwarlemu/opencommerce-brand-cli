---
name: code-window
title: Code window
type: ui
surface: site
description: "Code in a window: the file name in the bar, Copy at the right, light or on ink, with banded lines."
kinds: [code-window]
use_for: "Use for the code a page shows: the hero's setup file, a step's code, an API request. Pass code as a string for highlighting and copying, or pass rendered children. Light by default; dark for code that runs."
never: [A full syntax theme with many colors, Code in a proportional face, Rounded corners other than 12px, Horizontal scrolling for long lines (they wrap and hang)]
source: "opencommerce-agentcard-web src/components/code-block.tsx, hero.tsx, in-action.tsx; src/app/globals.css (.code, .code-dark, .tok-*, .code-line)"
---

`CodeWindow` props: `title` (the file name in the bar), `code` (string) or `children`, `language` (picks the comment
marker and turns keywords off for `text` and `http`), `copy` (puts the Copy key in the bar; needs `code`), `dark` (the
body on ink), `highlight` (zero-based line numbers to band; a run reads as one inset block) and `preClassName` (a fixed
height, or `text-caption leading-snug` for a tighter hero card). It also exports `tokenize(code, language)`.

Three voices only: keywords in the blue, strings in the deep blue (sky on ink), comments faint. Long lines wrap and hang
two columns past their own indent, so the structure still reads on a phone.
