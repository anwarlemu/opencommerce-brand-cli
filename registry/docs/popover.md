---
name: popover
title: Popover
type: ui
surface: site
description: "Anchored panel for contextual details or controls."
kinds: [popover-panel]
use_for: "Use for explanations, filters or small controls. Use variant=\"glass\" over imagery or the header. Keep longer tasks in Dialog or Sheet."
never: [Forms longer than a few fields (use a dialog), Popovers that open on hover (use a tooltip), Gray panels]
source: "Extension from opencommerce-agentcard-web src/app/globals.css (.nav-tray, .win)"
---

Long content scrolls inside the panel (which keeps its drop) and fades at an edge with more past it (fade-y), with room for focus rings.
