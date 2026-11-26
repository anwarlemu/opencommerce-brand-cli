# opencommerce: what good looks like

Read by `opencommerce-ds review` every time, next to the reference screenshots in `brand/reference/`.

## The idea

opencommerce, by Agentcard, is the open router for commerce: one endpoint that lets AI agents search, check out and
track orders at any online store. The site is a developer's page: calm white, exact type, and the product shown as
real code and live data in small windows. Its one texture is a faint field of `*` and `@` (Agentcard's mark and the
address sign) that gathers around the windows and feathers out.

## The site

- One ground. The page is white from the header to the footer. Blue (#2E3AE8) is the one chromatic voice: the
  primary key, links, the [*] in a window bar, a lit tile, the bars of a live chart. Nothing sits on a blue ground,
  and nothing is a gradient behind text.
- Text is ink (#171818), never pure black. Secondary copy is ink at 64 percent; hints at 42. Dividers are ink at 9
  percent; the edges of windows, keys and fields at 16. Mist (ink at 2.5 percent) is the only tint: window bars,
  table heads, the closing card.
- Three faces. Headings and the wordmark in Neue Haas Grotesk Display (Helvetica Neue where it is not installed) at
  500, tracked tight: -0.03em at the 54px hero, -0.025em at the 44px section heading, -0.02em below. Body, buttons and
  links in Inter (16px, leading 1.6). Code, window bars, tags and figures in tables in the platform monospace.
  Nothing is bold; nothing is in caps.
- Sections are centered: a 44px heading, a 16px description at 64 percent ink under it, then the content in an 800px
  column (a live table or a step-by-step takes the whole 1200px frame). 120px of air above each section, no rules.
- Keys are flat: 40px tall, 8px corners, 15px Inter at 500, a border a shade darker than the fill and no shadow. The
  blue key is the main action and the white key sits beside it. A press shrinks a key to 97 percent.
- Windows are the brand's card: white, a 16 percent ink edge, 12px corners, a soft long drop, and a 36px mist bar with
  a dimmed arrow, a file-like name (`pricing.plan`, `monitoring.live`) and `[*]` in blue. Features, plans, tables and
  code all sit in windows. Code that runs is the dark body: ink with pale blue keywords and sky strings.
- The header is three glass trays over the page (the wordmark with "by Agentcard", the links, the Get started key);
  the current section's link is a white pill with blue text that slides as you scroll. The footer is white: link
  columns, small print, and the name set huge as a faint outline that lights blue under the pointer.
- Pictures are small and drawn from the page's own parts: hairlines on white, mono labels, blue as the only voice.
  Each plays once when first seen and rests on its finished frame.

## Always

- Keep what each screen is for: its main action stays the most prominent thing, its key information easy to scan.
- For new pages, follow the user's brief. When only restyling existing UI, preserve its words, links, images, elements and behavior.
- Text contrast at least 4.5:1; touch targets at least 44px on phones; visible focus on every control.
- Motion is small and quick (160 to 300ms, a strong ease-out), never ease-in; in-out only for something that travels
  and stays on screen (the header's trays, the nav pill). Everything stills with reduced motion.

## Refuse

- Blue grounds and bands, gradients behind text, glows, purple or teal accents, rounded pill buttons, raised or
  beveled keys, soft gray cards without a window bar, bold headings, all caps labels, dark mode pages, stock 3D
  imagery, blue used as decoration everywhere.

## Voice (for any text the agent must write, such as an alt text)

Plain, short and concrete; a developer is reading. Sentence case, American spelling, no em dashes. The product name
is lowercase: opencommerce. Never "seamless", "revolutionary", "cutting-edge", "unleash", "supercharge",
"next-generation", "world-class", "leverage", "elevate".
