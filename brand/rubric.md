# Review rubric

Score a restyled screen against the reference screenshots (the brand's own site) and the principles. The screen
keeps its own copy, elements and purpose; judge only how it looks and how usable it is. Scores 0 to 10: 7 is
shippable, 9 matches the reference in quality, 5 is generic. Be consistent: the same screen with the same problems
gets the same scores. When a previous punch list is given, check each item first and say whether it is fixed.

## Same composition (blocker when broken)
When "before" images are given (the screen right after the automatic conversion, before any hand edits), compare
the layout: every element is still there, at the same size relative to its neighbors, in the same place in the
arrangement. Nothing enlarged to fill space or shrunk, no floating piece moved over the content it used to frame, no
image or effect lost (a background drawing, a trail, a glow that is now invisible). Colors and type are expected to
change; sizes, proportions and overlaps are not. Report any break as a blocker naming the element.

## Purpose (score: hierarchy)
Say in one line what the screen is for. Its main action is the most prominent thing (one blue key, the white key
beside it), its key information is easy to find and scan, and the restyle did not bury, flatten or reorder
anything.

## One system (score: coherence)
Every section uses the same few parts: the same keys, cards, windows, radius, spacing rhythm and type scale.
Nothing left from the old look: an old accent color or font, pill-shaped buttons, a stray gray panel, a dark band
that no longer belongs, gray smudges where an old shadow or fade was converted.

## Reads as opencommerce (score: brand_voice)
Compared side by side with the reference, does it look like the same brand?
One white page; centered display headings at 500, tracked tight, with a 16px description at 64 percent ink; ink
text, never pure black; flat 8px keys in Inter (the blue key, the white key beside it); content in windows (12px
corners, a mist bar with a mono name and a blue [*]); code in the platform mono; glass trays for the header; a white
footer ending in the outlined wordmark.
Too little reads as a generic white page with blue buttons (5 at most). Too much is as wrong (5 at most): blue
grounds or bands, window bars on every small card, the *@ texture behind text, gradients or glows, bold or all caps
headings, rounded pill buttons, beveled keys.

## Common UX errors (score: detail_quality)
Flag each as a blocker or major:
- Text touching an edge or a card border; content without its 20px gutter on phones.
- Headlines too big for a phone (more than about four lines, or words breaking); body text under 14px.
- Images or screenshots drawn for an old dark theme left as black holes or fading into the page (frame them).
- Translucent headers or menus unreadable over the content behind them.
- Spacing that collapsed or ballooned; uneven padding; misaligned columns; clipped or overlapping elements;
  horizontal scroll. A tall scroll-pinned section is behavior the site had before: note it, do not ask to remove it.
- Lines of body text wider than about 75 characters.

## Accessibility (score: accessibility)
Text contrast at least 4.5:1 (3:1 for large text and icons), on keys and over images.
Touch targets at least 44px on phones. Visible focus. States not told apart by color alone.
