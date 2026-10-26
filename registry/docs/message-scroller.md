---
name: message-scroller
title: Message Scroller
type: ui
surface: site
description: "A conversation's scroll area that stays on the newest message and offers the white Jump to latest key when the reader scrolls up."
use_for: "Use to hold a conversation that grows: MessageScroller with MessageScrollerViewport, MessageScrollerContent and one MessageScrollerItem per message, plus MessageScrollerButton. Set scrollAnchor on the message just sent. Wrap the composer in MessageScrollerProvider when its send key needs useMessageScroller."
never: [Scrolling the page instead of the conversation, Sliding the jump key in, Auto-scrolling while the reader is reading older messages]
source: "Extrapolated from opencommerce (the secondary key and floating drop)"
---
