---
description: Defines TDD for new features. Claude (Architect) designs structure, TS types, and writes failing tests. Gemini (Implementer) writes internal logic to pass tests. Prevents AI loops, enforces Next.js/Tailwind standards, and saves API costs.
---

# Workflow: Feature Implementation
**Trigger:** When the user requests a new feature or component.
**Framework:** Plan -> Act -> Test -> Reflect

## Phase 1: Planning (Strictly NO CODING)
1. **Context Gathering:** - Read `PROJECT.md` to understand the architecture and current stack.
   - Use `ls` and `cat` (via Gemini) to inspect existing adjacent files.
2. **Drafting the Plan:**
   - The Agent MUST output a numbered list of files it intends to create or modify.
   - Wait for the user to approve the plan (or proceed if pre-approved).

## Phase 2: Test-Driven Execution (Act)
1. **Write the Test First:**
   - Create a test file for the intended feature in `__tests__/` or `.agent/tests/`.
   - Explicitly run the test via terminal and confirm it FAILS. (Do not mock functionality that doesn't exist yet).
2. **Write the Implementation:**
   - Write the code strictly adhering to `AGENTS.md` rules (e.g., Server Components by default, proper TS types).
   - Keep functions small. Do not refactor unrelated files.

## Phase 3: QA & Loop Prevention (Test)
1. **Run the Validation Suite:**
   - Ask Gemini to execute: `npm run type-check` and `npm test`.
2. **Anti-Loop Protocol:**
   - If a test or type-check fails, analyze the terminal output.
   - **CRITICAL:** You are allowed a maximum of 3 attempts to fix a failing test. If it fails on the 3rd attempt, STOP IMMEDIATELY, output the exact error, and ask the user for guidance. Do not guess blindly.

## Phase 4: Handover (Reflect)
1. Update the "Current Active Task" section in `PROJECT.md` if the feature is complete.
2. Generate the standard `🧩 CONTEXT SNAPSHOT` (defined in `GEMINI.md`).
3. State clearly: "Feature implementation complete. Ready for next task."