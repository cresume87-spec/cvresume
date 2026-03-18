---
description: Standardized bug hunting. Gemini reproduces the error in terminal/browser and gathers logs. Claude analyzes root cause and designs the patch. Gemini implements the fix and verifies. Prevents blind guessing and regression.
---

# Workflow: Bugfix Resolution

**Trigger:** A bug is reported by the user, or a test/build fails unexpectedly.
**Framework:** Investigate (Gemini) -> Architect Patch (Claude) -> Implement (Gemini) -> Verify.

## Phase 1: Investigation & Log Gathering (Gemini)
*Role: Orchestrator (Cost-efficient data gathering)*
1. **Reproduce:** Attempt to reproduce the bug using terminal commands (e.g., `npm run build`, `npm run type-check`, or running specific test files).
2. **Trace:** Read the exact error stack trace.
3. **Context Check:** Use `cat` or `grep` to read the specific files mentioned in the stack trace. 
4. **Halt & Pass:** DO NOT attempt to rewrite complex business logic. Pass the gathered logs, file contents, and error context to the Architect (Claude).

## Phase 2: Root Cause Analysis & Test Design (Claude)
*Role: Architect (Deep reasoning and contract definition)*
1. **Analyze:** Read the logs provided by Gemini. Identify the root cause (e.g., type mismatch, Next.js Server/Client boundary violation, missing Zod validation).
2. **Write Regression Test:** You MUST write a failing test in the `__tests__/` directory that specifically reproduces this bug. 
3. **Draft the Patch Skeleton:** If the fix requires structural changes, update the TypeScript `interfaces` or rewrite the function signature. Leave the internal logic empty or comment out the exact lines Gemini needs to change.
4. **Handover:** Instruct Gemini to implement the internal logic to make your new regression test pass.

## Phase 3: Implementation & Anti-Loop (Gemini)
*Role: Implementer (Execution)*
1. **Implement:** Write the specific lines of code required to fix the bug based on Claude's skeleton and instructions.
2. **Execute Validation:** Run the specific regression test created by Claude.
3. **Anti-Loop Protocol (CRITICAL):**
   - You have a MAXIMUM of 3 attempts to make the test pass.
   - If the test still fails after 3 attempts, STOP. Do not guess. Output the latest error log and ask the user or Claude for a revised architectural approach.

## Phase 4: Final QA & Handover (Gemini)
1. **Global Check:** Once the specific test passes, run the global suite: `npm run type-check` and `npm test` to ensure no cascading breaks (regressions) occurred.
2. **Update Status:** Mark the bug as resolved in `PROJECT.md` (if it was listed in Known Issues).
3. **Output Snapshot:** Generate the standard `🧩 CONTEXT SNAPSHOT` (defined in `GEMINI.md`).