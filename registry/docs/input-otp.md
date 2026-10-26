---
name: input-otp
title: Input OTP
type: ui
surface: site
description: "Joined 40px slots on the hairline, one character each in the platform mono, the active slot on the blue edge."
use_for: "Use for a one-time code (a login code, a card verification). Set maxLength and pattern (REGEXP_ONLY_DIGITS for numbers), split long codes into groups with InputOTPSeparator, and handle onComplete. Pasting a whole code fills every slot."
never: [Separate inputs per character, Hiding the caret, Auto-submitting without showing the code]
source: "Extrapolated from opencommerce (the input field)"
---
