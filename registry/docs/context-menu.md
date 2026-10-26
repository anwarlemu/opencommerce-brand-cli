---
name: context-menu
title: Context Menu
type: ui
surface: site
description: "The brand's menu opened with a right click or a long press on an item."
kinds: [menu-panel, menu-item]
use_for: "Use for shortcuts on an item in a list or table (copy an order ID, retry a checkout). Every action in it must also be reachable another way, such as a row's menu key. Use ContextMenuShortcut for keys, ContextMenuSub for one level of submenu and variant=\"destructive\" on a destructive item."
never: [The only way to reach an action, More than one level of submenu, A context menu on text people want to select]
source: "Extension from opencommerce-agentcard-web src/app/globals.css (.nav-tray) and dropdown-menu.tsx"
---
