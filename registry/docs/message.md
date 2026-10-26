---
name: message
title: Message
type: ui
surface: site
description: "One message: a 32px square avatar, the sender with the time in mono, the bubbles and a mono footer, mirrored for the agent's own."
use_for: "Use for each turn of an agent conversation: MessageAvatar, then MessageContent holding MessageHeader (the name, then a time element), the Bubble parts and an optional MessageFooter (Delivered). Set align end for the agent's own messages. Stack turns in MessageGroup or MessageScroller."
never: [Round avatars, Bold sender names, Timestamps in Inter]
source: "Extrapolated from opencommerce (avatar.tsx, mono figures)"
---
