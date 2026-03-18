---
description: Routine technical debt cleanup. Claude reviews codebase for DRY violations, type safety issues, and Next.js App Router anti-patterns without changing business logic. Gemini executes the refactor and ensures all tests still pass.
---

# Workflow: Code Review & Refactor

**Trigger:** The user requests a code review, or a specific file has grown beyond 300 lines.
**Framework:** Analyze (Claude) -> Propose (Claude) -> Refactor (Gemini) -> Verify (Gemini).

## Phase 1: Deep Analysis (Claude)
*Role: Architect (Code Quality & Security)*
1. **Read & Inspect:** Review the target files provided by Gemini or the user.
2. **Identify Smells:** Look for:
   - "Prop drilling" that could be solved with Context or Zustand.
   - Any use of `any` or loose TypeScript interfaces.
   - Client Components (`"use client"`) that could be converted to Server Components.
   - Duplicate UI patterns that should be extracted to `src/components/ui`.
3. **DO NOT change business logic.** The app must behave exactly the same after this workflow.

## Phase 2: Refactoring Plan (Claude)
1. **Output the Plan:** Create a numbered list of exact changes.
2. **Draft the Code:** Provide the updated TypeScript interfaces and the refactored code snippets.
3. **Handover:** Instruct the Gemini Orchestrator to apply these changes file by file.

## Phase 3: Execution & Safety Net (Gemini)
*Role: Implementer (Safe Execution)*
1. **Apply Changes:** Carefully replace the code using Claude's snippets. Do not rewrite everything at once; do it file by file.
2. **Verify Types:** Run `npm run type-check`. If it fails, revert the specific file and ask Claude for a correction.
3. **Run Tests:** Execute `npm test`. If tests fail, the refactor broke the business logic. You have 2 attempts to fix it. If it still fails, run `git restore <file>` to abort the refactor and notify the user.

## Phase 4: Completion
1. Generate the standard `🧩 CONTEXT SNAPSHOT`.