---
name: {{bin}}
description: Build or restyle interfaces with the {{brand}} design system. Use when the project uses {{bin}} or the user requests {{brand}} components, tokens, or visual styling.
---

Use the project's configured components and brand tokens. Preserve the user's requested content and behavior.

Read project context with `npx {{bin}} info --json`. It reports the framework, stylesheet, aliases, installed components and registry. If the CLI is missing, use `npx -y {{source}}` in its place.

Find suitable components with `search <term> --json`, then read `view <names...> --json`. The response contains exact source and working examples. Inspect variant names, callback signatures and example dependencies instead of assuming another library's API.

Install with `add <names...> --dry-run --json`, then `add <names...> --json`. Existing local files are preserved. Use `add <names...> --diff` to compare updates; use `--overwrite` only when replacing those local changes is intended.

For new applications, `create --template vite --name <directory>` scaffolds the framework and installs the brand. Existing applications use `init`. Use `apply --dry-run` only when the user requests conversion of existing styles; package installation and restyling are different operations.

Start with `manifest --json` (the same catalog as `describe`). It lists every command, token, font, logo, template, size, component and rule. Unknown names are errors. Do not invent a token, component, prop, template or size.

Read `principles --json` before layout. `brand tokens --json`, `brand fonts --json`, `brand logos --json` and `brand voice --json` are the brand system. `component list --json`, then `component inspect <name> --json`, then `component emit <name> --state <state> --json` or `--props` with `--text`. Emit checks props against the source. `guide` has the longer rules. `tokens <term> --json` searches values. Keep colors scoped to component roles; preserve artwork, chart data and unrelated palettes. Use `check --json` and the application's build and interaction tests to verify the result.

Render on-brand images with `npx {{bin}} image`. `image templates --json` lists the sizes (og, square, portrait, story, landscape, x-banner, linkedin-banner, or WIDTHxHEIGHT), the nine templates (hero, window, closing and cards from the brand image tool; headline, lead, frame, quote, announcement) and their slots. Pass copy with flags or `--content file.json`, your pictures with `--image`, and read the written files from `--json`. PNG and SVG, the same bytes for the same inputs.

Make slides with `npx {{bin}} deck` (1920x1080, a PNG per slide and a PDF; `deck --list`), print files with `npx {{bin}} merch` (`merch --list`; sizes are vendor conventions), and illustrations in the brand style with `npx {{bin}} illustrate` (field, window, mark, orbit, halftone of `--image`; rules in `brand/illustration.md`). For Figma, `npx {{bin}} figma tokens|push|pull|check` writes files and prints the Figma MCP steps; the CLI never calls Figma.

Render a short video with `npx {{bin}} video`. `video templates --json` lists the templates (hero, window, closing, cards, field, mark, orbit, social, announcement, product) and the sizes `square`, `vertical` and `landscape`. Pass `--template` and `--size`; `.webm` or `--format webm` for WebM; `--still <seconds>` for one PNG. Encoded without a browser from the bundled fonts and logo files.

The standard shadcn registry is `{{registry}}/r/shadcn/{name}.json`, under `@{{bin}}` in components.json. Use `npx shadcn@4.22.1 add @{{bin}}/theme @{{bin}}/<name>` for shadcn's workspace routing and ecosystem integrations. The same registry works with its MCP server. Component references are at `{{registry}}/components`.

With the upstream installer, include the theme explicitly so existing shadcn font and color aliases are updated. Native add applies it automatically.
