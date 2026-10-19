---
name: feature-rows
title: Feature rows
type: site
surface: site
description: "Features as windows two to a row (picture, title, line), or one to a row beside their window; pictures play when first seen."
kinds: [window, window-bar, card-title, body-text, chip]
use_for: "Use FeatureGrid for the home page's four features in a medium SiteSection, FeatureRows for a product page that needs more room. Draw each picture from the page's own parts and key its motion off group-data-[state=…]/feature."
never: [Icons in place of pictures, Stock photos, More than one blue voice in a picture, Pictures that loop, A move that does not end on the finished frame, More than six features in the grid]
source: "opencommerce-agentcard-web src/components/features.tsx, src/components/feature-play.tsx, src/app/globals.css (THE FEATURE PICTURES)"
---

`FeatureGrid` and `FeatureRows` take `features` ({ title, description, media, file, tags }[]) plus list props.
`FeatureTag` is the small mono tag (FeatureRows shows `tags` with it).

A picture's motion: the card's `data-state` is absent (the finished frame: the server render and reduced motion),
`idle` (the opening frame) or `play` (the move). Write the finished frame as the default, the opening frame under
`group-data-[state=idle]/feature:` and the move under `group-data-[state=play]/feature:` with fill-mode backwards, so
each piece holds its opening frame through its delay. Keep moves at 300ms or less each, ease-out; a sequence may
stagger them (30 to 80ms apart).
