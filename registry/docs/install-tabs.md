---
name: install-tabs
title: Install tabs
type: ui
surface: site
description: "One install line on ink, a tab per package manager and a Copy key."
kinds: [code-window, tabs]
use_for: "Use under a closing call to action or in a getting-started section, for the one command that installs the SDK. Pass one entry per package manager."
never: [More than one command per tab, A light install box, Tabs that change anything but the command]
source: "opencommerce-agentcard-web src/components/install-tabs.tsx, src/components/cta.tsx"
---

`InstallTabs` takes `commands` (`{ label, command }[]`, one per package manager), `label` (the tab list's accessible
name, default "Package manager"), `defaultIndex` and `className`. The first word of each command is set as the tool,
the rest as its arguments. Copy always copies the selected command.
