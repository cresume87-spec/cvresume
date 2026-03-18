---
name: context-handover
description: Use this skill at the very end of your task, right before passing control back to the user or to another agent. It generates the HANDOVER.md file to maintain context between chats.
---

# Context Handover Generator

To generate the context snapshot, the Orchestrator (Gemini) must run:
`python .agent/skills/context-handover/scripts/handover.py`

Once generated, the Architect (Claude) MUST instruct Gemini to manually fill in the "Architectural Changes" and "Next Action" sections in the resulting `.agent/HANDOVER.md` file.