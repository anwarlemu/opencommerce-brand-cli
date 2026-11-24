# opencommerce design system

Components, design tokens and a CLI for building opencommerce pages and interfaces.

Reference: https://opencommerce-ds.vercel.app

## Consistent CLI workflow

Hand this CLI to an agent and start with one command. `manifest` (alias `describe`) lists every command, token, font, logo, template, size, component and rule. The same inputs produce the same bytes. Unknown names exit with an error instead of a guess.

```sh
npx opencommerce-ds manifest --json
npx opencommerce-ds brand system --json
npx opencommerce-ds principles --json
npx opencommerce-ds component inspect button --json
npx opencommerce-ds component emit button --state Site --json
npx opencommerce-ds info --json
npx opencommerce-ds search button --json
npx opencommerce-ds view button --json
npx opencommerce-ds add button card --dry-run --json
npx opencommerce-ds add button card --json
npx opencommerce-ds add button --diff
```

For a new app: `npx -y github:anwarlemu/opencommerce-brand-cli#release create --template vite --name my-app`.
For an existing app: `init` sets up the theme; `apply --dry-run` previews a requested restyle.
`add` also installs agent instructions and portable Claude/Codex skills, so a separate init is optional.
Use `--cwd <app>` for a different directory. Existing components.json aliases, TS/JS output, local helpers, unrelated registries and local component edits are preserved.

The standard registry works with shadcn 4.22.1:

```sh
npx opencommerce-ds init
npx opencommerce-ds shadcn add @opencommerce-ds/theme @opencommerce-ds/button
npx opencommerce-ds mcp init --client claude
```

Include `theme` explicitly when using upstream shadcn to update existing theme aliases. Native `add` handles it automatically. Shared workspace installation, presets, migrations, registry authoring and MCP use the pinned upstream implementation via `shadcn <args...>`. Bundled component discovery works offline; installation needs network access for missing dependencies. Agent hosts must load their MCP configuration before it is available in a session.

## Install the CLI

Run once from the project root:

```sh
npm install --save-dev github:anwarlemu/opencommerce-brand-cli#release
```

Prepare styles, fonts and agent instructions for new work:

```sh
npx opencommerce-ds init
npx opencommerce-ds guide
```

`init` does not convert existing components. The bare command does; see "Update an existing interface" below.
Requires Node.js 20 or later. Read [the agent guide](https://opencommerce-ds.vercel.app/agents.md) with any coding agent.
The same guide is installed at `.ds/agent-guide.md`. Agents that do not auto-load project instructions should read it explicitly.

## Add components

Run `add` from the target app root. Components require React 19.2+, Tailwind CSS 4, and valid project configuration. For other frameworks, run the bare CLI command to apply the brand instead. In a React and Tailwind 4 app, add the components the page needs:

```sh
npx opencommerce-ds add button card field input --surface site
```

The CLI copies component source, installs dependencies and adds the theme. It uses the project’s `src` folder and
configured aliases and components.json paths. Read each component’s examples and usage notes before changing it.

```sh
npx opencommerce-ds add hero section site-header site-footer --surface site
npx opencommerce-ds list --json
npx opencommerce-ds show select --json
npx opencommerce-ds tokens border
```

## Instructions for coding agents

Include this with the page requirements:

```text
Build this page using the opencommerce design system at https://opencommerce-ds.vercel.app.
Read https://opencommerce-ds.vercel.app/agents.md first.
Run npx opencommerce-ds show <name> --json for exact exports, usage rules, examples and source.
Add existing components with the CLI. Use design tokens for custom layout and styling.
Connect every control to its intended behavior. Include validation, loading, empty and error states where needed.
Run the project checks and the CLI token check. Test keyboard interaction and desktop and phone layouts.
```

## Render an image

`image` renders share images, social posts, banners and profile pictures from the copy you pass in. It uses the brand tokens, the bundled fonts and the logo. It does not open a browser, so an agent can run it in CI.

```sh
npx opencommerce-ds image templates --json
npx opencommerce-ds image lead --size og --headline "Open router for commerce" --body "One endpoint for agents to search, check out and track orders." --out og.png
npx opencommerce-ds image hero --size og,x-banner,linkedin --headline "Open router for commerce" --format png,svg --out images
npx opencommerce-ds image frame --image ./screen.png --size square
npx opencommerce-ds image carousel slides.json --size portrait
```

Only the copy you pass is drawn, whole. Text steps down and wraps again to a readable floor; copy that still does not fit is an error that says what to shorten. `--sample` fills sample copy on purpose. Sizes, safe areas and upload limits are in `src/design/platforms.ts` (`image templates --json` lists them, with their sources); `--size all` draws every size that holds the copy. Templates: `hero`, `window`, `closing`, `cards` (the brand image tool's layouts, in agd-playground), `headline`, `lead`, `frame`, `quote`, `announcement` and `avatar`. Formats: PNG, SVG, JPG, WebP, PDF.

Headings use a bundled Helvetica-compatible face (Neue Haas Grotesk Display is not redistributable). Body and keys use Inter. Labels and code use the bundled monospace. Sample output is in `samples/images/`. Regenerate it with `npx tsx scripts/render-samples.ts`.

A content file must be a JSON object whose keys are `headline`, `body`, `badge`, `label`, `by`, `action`, `secondary`, `code`, `highlight`, `cards`, `footer` and `image` (`title`, `text` and `chip` still work). Any other key, or a value that is not a string, is an error. The same inputs write the same files.

## Revising a design

`design` works on a small JSON file, so a person or an agent can make something, look at it, and change it until it is right.

```sh
npx opencommerce-ds design new hero --size x-banner --headline "One endpoint for every online store" -o banner
npx opencommerce-ds design revise banner "bigger headline, show the logo, logo top right, darker theme"
npx opencommerce-ds design edit banner --set headline="One request, any store" --layer headline.dx=0.03
npx opencommerce-ds design undo banner
npx opencommerce-ds design variants banner --by seed --count 4
npx opencommerce-ds design sizes banner --to og,square,story,x-banner
```

Plain words are read by rules, with no model and no API key; a part that is not understood changes nothing. Edits are applied inside the layout, so text wraps again and the art keeps clear. Every write is checked, and an off-brand or broken result is refused and changes nothing. Slides, print files, illustrations and clips work the same way (`design templates`). `src/design/` is shared by every brand's CLI except `adapter.ts`.

## Compose, pages, icons and email

```sh
npx opencommerce-ds design new compose --size og -o card
npx opencommerce-ds design compose add card stat "42%" --set label="of checkouts finish in one request" --place left
npx opencommerce-ds design compose add card chart --set value="Mon 12, Tue 18, Wed 24" --place right
npx opencommerce-ds design page compose outline.json --flavor react,html
npx opencommerce-ds icons
npx opencommerce-ds email announcement --headline "Agents can buy from any store" --action "Get started" --href https://example.com
```

`compose` places the brand's blocks on a grid at any size (every platform size, the IAB ads, A4 and Letter, business cards, wallpapers); `page compose` writes a page from the site's sections; `icons` writes the favicon set and app icons from the mark; `email` writes table-based HTML that survives mail clients. `manifest --json` has an "I need X" table (`need`).

## Slides, print files, illustrations and Figma

```sh
npx opencommerce-ds deck --input deck.json --out deck        # cover, section, statement, bullets, stat, quote, image, end
npx opencommerce-ds merch --all --sample --out merch         # tee, hoodie, cap, tote, mug wrap, die-cut sticker, poster
npx opencommerce-ds illustrate orbit                         # field, window, mark, orbit, halftone (--image)
npx opencommerce-ds figma tokens                             # also push, pull, check
```

Slides and print files draw only the copy they are given; `--sample` fills sample copy. `deck` writes a PNG (or SVG) per 1920x1080 slide and one PDF. `merch` writes print files with bleed and safe area (SVG at physical size, PNG at `--dpi`); the sizes are common vendor print areas, so confirm with your vendor, and every item prints on white or light blanks with the logo files as drawn. `illustrate` draws the brand's glyph language as vector SVG and PNG; the rules are in `brand/illustration.md`. `figma` writes files and prints the Figma MCP steps; it never calls Figma. Layouts and sizes live in `brand/assets/*.json`. The docs site's Assets, Illustrations and Figma pages show the output; regenerate it with `npx tsx scripts/render-assets.ts --video`.

## Render a short video

`video` renders a short MP4 or WebM without a browser. Frames are drawn from the brand tokens, the bundled fonts and the logo files, rasterized with system fonts off, and encoded with the pinned ffmpeg binary (`cpuflags none`, bitexact). `--template` and `--size` are required.

```sh
npx opencommerce-ds video templates --json
npx opencommerce-ds video --template social --size square --title "Open router for commerce" --text "One endpoint for agents to search, check out and track orders." --out clip.mp4 --json
npx opencommerce-ds video --template announcement --size vertical --title "Agents can buy from any store" --action "Get started" --json
npx opencommerce-ds video --template product --size landscape --label order.ts --text "const order = { sku: \"cup\" }" --json
```

Templates: `hero`, `window`, `closing`, `cards` (4 s at 30 fps), `field` (6 s at 12 fps), `mark`, `orbit` (6 s at 30 fps), `social`, `announcement`, `product` (2 s at 12 fps). Sizes: `square` (1080x1080), `vertical` (1080x1920), `landscape` (1920x1080). `--ground` is `white` or `mist`. `--out` is an `.mp4` or `.webm` file or a directory (default `.ds/videos`). `--still <seconds>` writes one PNG. Sample output is in `samples/videos/`. Regenerate it with `npx tsx scripts/render-video-samples.ts`.

## Read the brand system

```sh
npx opencommerce-ds brand tokens --group color --json
npx opencommerce-ds brand tokens --name=--ds-color-brand --json
npx opencommerce-ds brand fonts --json
npx opencommerce-ds brand logos --json
npx opencommerce-ds brand voice --json
npx opencommerce-ds principles --surface site --json
npx opencommerce-ds principles --surface product --json
```

Token groups are `color`, `type`, `space`, `radius`, `motion` and `shadow`. `--name` is exact. Pass it as `--name=--ds-color-brand`. `tokens <term>` searches by substring, and a term that matches nothing is an error.

`brand fonts` lists the bundled faces and the display face that is not in this repo. `brand logos` returns the mark and the lockup with usage rules. There is no other logo. `brand voice` is the closed voice and tone list. `principles` returns do and do-not rules for `site` and for `product`. Product work uses the site system: this brand has no product theme and no product component directory.

## Use components without guessing

```sh
npx opencommerce-ds component list --json
npx opencommerce-ds component inspect button --json
npx opencommerce-ds component emit button --state Site --json
npx opencommerce-ds component emit button --props '{"variant":"secondary"}' --text "Read the docs" --json
```

`inspect` returns the props parsed from the source, the example states, the constraints and the file contents. `emit --state` copies an example. `emit --props` rejects unknown props and unknown values. `list` and `search` still filter the catalog by words.

## Check the implementation

```sh
npx opencommerce-ds check --changed
npx opencommerce-ds review http://localhost:3000 --any
```

Start the development server before running `review`. It captures desktop and phone screenshots and compares the
page with the opencommerce reference. It requires `playwright-core` and Chromium (`npx playwright install chromium`).
Review uses the available Codex or Claude Code session, or the Anthropic API when configured. When no reviewer is
available, it saves screenshots for the coding agent to review. Visual review does not test form validation or
control behavior; test those separately.

## Commands

Run these commands with `npx opencommerce-ds` after installing the CLI.

| Command | Purpose |
|---|---|
| `init` | Install styles, fonts and agent instructions without converting existing components. |
| `guide` | Read the portable agent workflow, including setup and verification. |
| `show <item>` | Read usage rules, exports, examples and source. Use `--json` for structured output. |
| `add <items...>` | Copy components, dependencies and the theme into a React and Tailwind 4 project. |
| `list` | List available components, sections, page templates and visuals. |
| `look <file\|element>` | Show component and token guidance for a file or element type. |
| `tokens [term]` | Find a token by name or role. |
| `manifest` | List every command, token, font, logo, template, size, component and rule. `describe` is the same command. |
| `brand` | Read tokens, fonts, logos and voice. `brand tokens --name=` is an exact lookup. |
| `principles` | Do and do-not rules for site and product. |
| `component` | `list`, `inspect` and `emit` components, props and example states. |
| `image` | Render an Open Graph image or a social post. `image templates --json` lists presets and templates. |
| `video` | Render a short MP4 or WebM, or one still. `video templates --json` lists templates and sizes. |
| `deck` | Slides at 1920x1080: a PNG per slide and one PDF. `deck --list` shows slide types and slots. |
| `merch` | Print files with bleed and safe area. `merch --list` shows items and sizes. |
| `illustrate` | Illustrations in the brand style, SVG and PNG. `illustrate --list` shows subjects. |
| `figma` | `tokens`, `push`, `pull`, `check`: files plus the Figma MCP steps. |
| `check [files...]` | Check style values. Use `--changed` for Git changes or `--fix` for exact token replacements. |
| `review <url> --any` | Review a page that is not part of an existing conversion task list. |
| `review <url>` | Review a tracked screen and mark its task complete when it passes. |
| `approve` | Approve a `ds-override` comment in a human-operated terminal. |
| `done <screen>` | Mark a native screen task complete. Web screen tasks use `review`. |
| `skip <screen> --reason "..."` | Record why a tracked screen was left unchanged. |

## Update an existing interface

The `apply` command restyles existing code, with color changes scoped to recognized components. It can replace matching React
components, convert style values, install styles and fonts, and add agent rules and checks. Review the diff before
continuing. This conversion preserves existing copy and behavior.

```sh
npx opencommerce-ds apply --dry-run
npx opencommerce-ds apply
```

Subsequent runs report the next screen to review. `--redo` repeats conversion after an update. Component decisions
are recorded in `.ds/components.json`. The conversion also installs checks for Claude Code, Codex, Cursor and Git
commits. Adding individual components with `add` does not run this conversion.

## Text and structured references

- `/agents.md`: the agent workflow.
- `/llms.txt`: short catalog with links to every component.
- `/llms-full.txt`: complete guide, examples and source.
- `/r/index.json`: all items, including hooks, helpers and theme.
- `/r/<name>.md` and `/r/<name>.json`: usage rules, exports, dependencies, examples and exact source.

All references are generated from the same registry the CLI installs. Prefer individual component references to
the complete file. `guide`, `manifest`, `describe`, `brand`, `principles`, `component`, `list`, `show`, `look`, `tokens` and `check` without `--fix` are read-only. `image templates` and `video templates` are read-only. `init` and
`add` accept `--dry-run`; add `--json` for structured results. JSON goes to stdout; progress goes to stderr. Unknown names exit 1 with `{ "ok": false, "error": "..." }`.

## Source

- `registry/components/`: components and page templates.
- `registry/examples/`: working examples shown in the docs.
- `registry/docs/`: component descriptions, usage notes and constraints.
- `brand/tokens.css`: design tokens.
- `brand/elements.json`: styles for each element type and their source references.
- `brand/reference/`: reference screenshots used for review.
- `apps/www/`: the design system site.

Run `npm run ci` for the CLI tests and registry checks, `npm run build --workspace www` for the docs build,
and `DOCS_URL=http://localhost:3000 npm run test:docs` for the browser checks against a running production build.

The explicit `apply` command scopes color conversion to recognized components and preserves unrelated artwork and shared palette data. The legacy bare-command conversion remains for compatibility; use `apply` for new restyling tasks.
