# Assumptions for the brand owner to confirm

Each is in force today; each names where it lives, so a change is one edit.

1. Source. Values were measured from the rendered opencommerce site (opencommerce-agentcard-web main at fe64096,
   built locally) on 2026-10-19, with its `src/app/globals.css` for names and intent. `brand/tokens.css`,
   `brand/elements.json`.
2. opencommerce has a site only: every project, including an app or dashboard, gets the site's look. `brand/brand.json`
   (`surfaces`).
3. The blue is the opencommerce site's #2E3AE8 (Agentcard's older bright blue), not agentcard.sh's current #0000FF.
   `brand/tokens.css`.
4. The display face is Neue Haas Grotesk Display, named in the stack and not shipped (it needs a webfont licence), so
   it renders as Helvetica Neue on Apple devices and Helvetica or Arial elsewhere. Only Inter is loaded; code uses the
   platform monospace. `brand/tokens.css`, `brand/brand.json` (`fonts`).
5. No markup touches: the page is white throughout, so a restyle adds no attributes. The *@ glyph field is a library
   visual an agent may place behind a window, not something the CLI adds. `brand/brand.json` (`touches`).
6. Muted text tokens are solid colors composited on white (ink at 64 and 42 percent), as the site mixes them; 64 passes
   AA, 42 is for hints only. `brand/tokens.css`.
7. Keys are flat (no bevel) and a press scales to 97 percent in 160ms; the site's own press runs at 80 to 120ms, which
   is under this harness's 150ms floor. `brand/tokens.css`, `brand/elements.json`.
8. Nothing is set in caps, so the value check rejects uppercase. `brand/brand.json` (`type`).
9. The logo is the typeset wordmark ("opencommerce" with "by Agentcard") and the [*] mark from the site's icon
   (`brand/logo/`). There is no drawn lockup.
10. The reference URL in `brand/brand.json` (`site`) is the Vercel deployment; opencommerce.agentcard.sh does not
    serve the site yet.
11. Review passes at 7 on every score. `brand/brand.json`.
12. The repo is meant to be public so installs need no token, like the Agentcard harness. Make it private if the
    brand's files should not be public.
