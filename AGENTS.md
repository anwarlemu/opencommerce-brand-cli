# Agents

Use this CLI as the whole brand system. Do not invent tokens, fonts, logos, components, props, templates or sizes.

## If you are building with the CLI

1. Run `npx opencommerce-ds manifest --json`. `describe --json` is the same catalog. It lists every command, token group, font, logo, principle, component, image template, video template and known gap.
2. Read `npx opencommerce-ds guide` or `brand/agent-guide.md` before writing UI.
3. Brand system: `brand tokens`, `brand fonts`, `brand logos`, `brand voice`, and `brand system`. Exact token lookup is `brand tokens --name=--ds-color-brand`. A name that does not exist is an error.
4. Rules: `principles --json`. `site` is the page system. `product` has no separate theme in this repo. Use the site tokens and the registry.
5. Components: `component list --json`, then `component inspect <name> --json`. Copy a real example with `component emit <name> --state <State> --json`, or pass `--props` and `--text`. Unknown props and unknown values error.
6. Stills: `image templates --json`, then `image` or `image post` or `image og`. Presets are `og`, `square`, `portrait` and `landscape`.
7. Video: `video templates --json`, then `video --template <social|announcement|product> --size <square|vertical|landscape>`. Clips are 2 seconds, 12 fps, mp4, drawn from the bundled fonts and logo files. There is no other template or size.
8. Add `--json` on any of these commands. JSON goes to stdout. Failure is `{ "ok": false, "error": "..." }` and exit 1.

The display face named in the tokens is not bundled. Renderers use the substitute listed by `brand fonts`. Do not download a replacement.

Sample stills are in `samples/images/`. Sample videos are in `samples/videos/`.

## If you are changing this repository

Read `CLAUDE.md`. Run `npm run ci` before pushing. Brand strings stay in `brand/`, not in `src/`. Do not add an em dash. Do not commit `build`, `dist` or `node_modules`.
