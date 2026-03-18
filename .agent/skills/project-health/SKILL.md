---
name: project-health
description: Use this skill when the user asks to verify the project, check for errors, run tests, or validate TypeScript and linting rules. It is the primary quality gate before handing over context.
---

# Project Health Validation

This skill runs the standard project verification suite (TypeScript, ESLint, and Unit Tests). 

## Execution
To use this skill, the Orchestrator (Gemini) must execute the bash script:
`bash .agent/skills/project-health/scripts/verify.sh`

## Handling the Output
- If the script outputs `[SUCCESS]`, the project is healthy.
- If the script outputs `[ERROR]`, the Orchestrator MUST pass the exact error logs to the Architect (Claude) for analysis before making any code changes. Do not attempt to guess the fix blindly.