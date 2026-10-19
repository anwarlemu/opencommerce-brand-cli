---
name: badge
title: Badge
type: ui
surface: site
description: "Mono chips for counts and tags, small pills for an order or route status."
kinds: [chip]
use_for: "Use chip for a plan tag, a count or an endpoint (Every merchant, POST /buy). Use the status pills for an order or route (Processing, then Confirmed in brand). Use tag, tag-ink and tag-heart for added, improved and fixed updates."
never: [Badges as buttons, Caps, Filled color badges, More than one tone per row]
source: "opencommerce-agentcard-web src/components/pricing.tsx (the plan chip), features.tsx and globals.css (.feat-pill, .feat-pill-wait, .feat-pill-done)"
---
