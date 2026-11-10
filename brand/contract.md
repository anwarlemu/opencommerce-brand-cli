# {{brand}} design system
- Start with `{{cli}} manifest --json`. It lists every command, token, font, logo, template, size, component and rule. `describe` is the same command.
- Read `.ds/agent-guide.md` before changing UI. Follow the user's brief. When only restyling, preserve content, links, order and behavior.
- Discover UI with `{{cli}} component list --json`, then `inspect` and `emit`. Do not invent components, props or states.
- Read `{{cli}} brand system --json` and `{{cli}} principles --json` before styling. Unknown names are errors.
- Render images with `{{cli}} image` and short videos with `{{cli}} video`. List templates first. Unknown templates and sizes error.
- Use `{{cli}} init` and `{{cli}} add <names...>` to install. Use `{{cli}} apply --dry-run` before a requested restyle.
- Connect controls to real actions. Test keyboard, focus, states, and phone and desktop layouts.
- Run the project's checks, then `{{cli}} check --json`. `{{cli}} review <url> --any` reviews a page; report a manual review when no reviewer is available.
- A `ds-override: <reason>` comment only counts after the user approves it with `{{cli}} approve`.
