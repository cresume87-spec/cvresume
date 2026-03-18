# Workflow: Draft Persistence Debug (Network → DB → UI)

## Operator-first checklist (must be run by human)
- Confirm POST draft occurs and payload contains expected keys
- Confirm DB contains saved values at expected JSON path
- Confirm F5 restores UI values
- Confirm no “default overwrite” POST happens after F5

## Agent responsibilities
1) Start with PLAN ONLY:
   - hypotheses (max 3)
   - files to inspect (max 5)
   - how evidence will be collected
2) Implement minimal fix
3) Verify:
   - re-run operator checklist
   - run quality gates
4) Handover entry must use the Acceptance template and include Operator Confirmed.

## Handover template (copy/paste)
- Task:
- Files touched:
- What changed:
- Evidence:
  - Network:
  - DB:
  - UI (F5):
  - No-wipe:
- Gates:
- Operator Confirmed: YES/NO
- Status: DONE only if Operator Confirmed = YES