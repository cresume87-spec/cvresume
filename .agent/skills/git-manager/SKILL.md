---
name: git-manager
description: Use this skill to commit changes to the repository safely. It enforces Conventional Commits and ensures protected files are not accidentally committed.
---

# Git Operations Manager

Do not use raw `git commit` commands in the terminal. Always use this skill to save progress.

## Execution
To commit changes, the Orchestrator (Gemini) must run:
`bash .agent/skills/git-manager/scripts/commit.sh "<type>: <message>"`

*Allowed types:* `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
*Example:* `bash .agent/skills/git-manager/scripts/commit.sh "feat: add user login page"`