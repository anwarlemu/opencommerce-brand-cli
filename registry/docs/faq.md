---
name: faq
title: FAQ
type: site
surface: site
description: "Centered questions with native expandable answers, one open at a time, on hairlines."
kinds: [faq]
use_for: "Pass title, lead and items (question and answer). Put it in a medium SiteSection just above the footer, with bottom padding."
never: [Answers longer than a short paragraph, Questions in caps, A chevron in place of the drawn +, Several answers open at once, A window around the list]
source: "opencommerce-agentcard-web src/components/faq.tsx, src/app/globals.css (.faq-answer)"
---

`Faq` props: `title`, `lead`, `items` ({ question, answer }[]), `minHeight` (default true: the list keeps its
height on wide screens as answers open), plus div props.
