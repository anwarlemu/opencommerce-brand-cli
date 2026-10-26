---
name: alert-dialog
title: Alert Dialog
type: ui
surface: site
description: "A confirmation in one of the brand's windows: a title bar, a title, a line, and the white Cancel beside the blue or red action."
kinds: [window, window-bar]
use_for: "Use to confirm an action that is hard to undo (cancel an order, revoke an API key). Say what will happen in the description. Put the white AlertDialogCancel before the AlertDialogAction; set variant=\"destructive\" on the action for something destructive. Set name for the title bar and size=\"sm\" for a short, centered question with an AlertDialogMedia mark."
never: [A confirmation for an action that can be undone, A close mark (it must be answered), Vague actions such as OK and Yes, Two destructive actions in one dialog]
source: "Extension from opencommerce-agentcard-web src/app/globals.css (.win, .win-bar) and dialog.tsx"
---
