---
name: button
title: Button
type: ui
surface: site
description: "Flat keys for primary, secondary and toolbar actions."
kinds: [button-primary, button-secondary, button-on-brand, header-action]
use_for: "Use one primary action per section. Pair it with secondary (Get started, then Read the docs); ghost in toolbars; on-brand only on a rare blue band. Wire an onClick handler, use type=\"submit\" for forms, or use asChild with a link for navigation."
never: [Rounded pill buttons, Bold labels, Two blue keys side by side for equal actions, A gradient or glow on a key, A drop shadow under a key, A key that sinks or lifts on press]
source: opencommerce-agentcard-web src/app/globals.css (.btn, .btn-primary, .btn-secondary, .nav-cta)
---
