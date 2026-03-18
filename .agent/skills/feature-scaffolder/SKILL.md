---
name: feature-scaffolder
description: Use this skill when the user asks to create a new UI component, feature, or page. It generates the boilerplate code and strictly enforces TDD by creating a failing test.
---

# Feature Scaffolder

To scaffold a new component, the Orchestrator (Gemini) must run the Python script:
`python .agent/skills/feature-scaffolder/scripts/scaffold.py <ComponentName> <Category>`

*Example:* `python .agent/skills/feature-scaffolder/scripts/scaffold.py Button ui`
*Allowed Categories:* `ui`, `features`

Once generated, the Architect (Claude) MUST write the actual tests, and the Implementer (Gemini) MUST write the component logic to pass those tests.