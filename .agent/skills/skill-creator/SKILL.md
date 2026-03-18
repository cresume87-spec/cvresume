---
name: skill-creator
description: Use this skill ONLY when the user asks you to "create a new skill", "build a tool", or "write a script for the agent". This is the meta-skill used to generate other skills in the Anthropic standard format.
---

# Instructions for Creating a New Skill

You are generating a new skill for the Antigravity IDE environment. 

1. **Folder Structure:** Create a new folder for the skill at `.agent/skills/<new-skill-name>/`.
2. **Metadata (SKILL.md):** You MUST create a `SKILL.md` file in the root of the new skill's folder. It MUST contain YAML frontmatter with `name` and `description` (the trigger condition).
3. **Scripts Subdirectory:** If the skill requires code (Python/Bash), put it in `.agent/skills/<new-skill-name>/scripts/`.
4. **Self-Documenting Code:** Any script you write MUST accept a `--help` argument and handle errors gracefully. Do not throw raw stack traces. Print clear instructions for the LLM if it passes the wrong arguments.
5. **Testing:** You MUST write a test script with mock data and instruct the Orchestrator (Gemini) to execute it. The skill is not complete until the test passes.

When finished, inform the user that the new skill is available and update `PROJECT.md` or `HANDOVER.md`.