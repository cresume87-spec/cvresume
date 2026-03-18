---
description: Strict bootstrapping process for new projects. Claude designs the PROJECT.md core schema and ADRs. Gemini sets up the Next.js scaffold, configures Tailwind/TS strictly, and establishes the initial Git commit state.
---

# Workflow: Project Initialization

**Trigger:** "Start a new project", "Initialize setup".
**Framework:** Design (Claude) -> Scaffold (Gemini) -> Configure (Gemini) -> Verify.

## Phase 1: Architectural Design (Claude)
*Role: Architect (Blueprint Generation)*
1. **Gather Requirements:** Analyze the user's project prompt.
2. **Draft PROJECT.md:** Fill out the `.agent/PROJECT.md` template strictly. Define the Data Schema, MVP scope, and Target Audience. 
3. **Handover:** Instruct Gemini to create the physical Next.js environment.

## Phase 2: Scaffolding (Gemini)
*Role: Orchestrator (Environment Setup)*
1. **Execute CLI:** Run the standard Next.js setup command (if not already done by the IDE):
   `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`
2. **Cleanup Boilerplate:**
   - Delete all default CSS in `src/app/globals.css` except Tailwind directives.
   - Clear `src/app/page.tsx` and replace it with a simple functional component.
3. **Enforce Folder Structure:**
   - Create directories: `src/components/ui`, `src/components/features`, `src/lib`, `src/server`, `src/types`, `__tests__`.

## Phase 3: Strict Configuration (Gemini)
1. **TypeScript Strictness:** Open `tsconfig.json` and ensure `"strict": true` and `"noImplicitAny": true` are set.
2. **Tooling:** Install essential utilities if missing: `npm install clsx tailwind-merge`.
3. **Permissions:** Make all scripts in `.agent/scripts/` executable (`chmod +x .agent/scripts/*.sh`).
4. **Git Ignore Core AI Files:** You MUST append `.agent/` and `PROJECT.md` to the `.gitignore` file immediately. These files are for local IDE orchestration only and must never be committed to the repository.

## Phase 4: Final Verification
1. Run `bash .agent/scripts/verify-project.sh`.
2. Output: "Project initialized successfully. Core schema saved in PROJECT.md. Ready for first feature request."
3. Generate the standard `🧩 CONTEXT SNAPSHOT`.