---
name: questionnaire
title: Questionnaire
type: ui
surface: site
description: "Questions asked one at a time: choice keys on the hairline that take the pale blue when chosen, a mono progress count and the blue Next key."
use_for: "Use for a short set of questions with set answers (onboarding an agent, a checkout preference survey). Pass items with name, required and multiple; for each, a QuestionnaireItem with a title, choices (QuestionnaireChoice), an optional QuestionnaireInput and QuestionnaireError; finish with QuestionnaireActions (Previous, Skip, Next, Submit). Read the answers from FormData on submit."
never: [More than one question on screen, Animating between questions, Hiding the progress]
source: "Extrapolated from opencommerce (in-action.tsx step list, checkbox.tsx, the keys)"
---
