---
name: trace
title: Trace
type: ui
surface: site
description: "An agent's steps as lines of muted 14px text with glyphs, mono durations, a breathing running step and details that open from a hairline."
use_for: "Use to show what an agent did or is doing: one TraceLine per step with a TraceIcon, TraceTitle and TraceDescription (a duration). Set status running, pending or error. Wrap a step in TraceCollapsible with a trigger and content to reveal its detail (the request, the response)."
never: [Spinners on every line, Colored backgrounds for steps, Details open by default for every step]
source: "Extrapolated from opencommerce (in-action.tsx steps, monitoring.tsx log, the rule)"
---
