---
name: tags-input
title: Tags input
type: ui
surface: site
description: "Editable list of values with add, remove and validation states."
kinds: [input]
use_for: "Use inside Field for domains, emails or similar values. Enter or comma adds a value; Backspace removes the last value when the input is empty. Provide isTagInvalid for validation."
never: [Pill-shaped fields or tags, Tags without a way to remove them, Free text that should be a textarea]
source: "Extension from opencommerce-agentcard-web src/components/monitoring.tsx (#merchant-filter), pricing.tsx (the plan chip)"
---
