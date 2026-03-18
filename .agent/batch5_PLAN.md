PLAN — Batch 5: Fix 400 Error Serialization & Autosave Reliability
Diagnosis (3 root causes)
Cause A — [object Object] error string (src/server/application/draft.ts, catch block)
createApplicationRow does throw error where error is a Supabase PostgrestError. The upsertDraftPatch catch uses e instanceof Error ? e.message : String(e). In Next.js server bundles, PostgrestError can fail the instanceof Error check across module boundaries, so String(e) → "[object Object]". Fix: extract .message from any object shape, then fall back to JSON.stringify.
Cause B — the actual trigger of the 400 (src/server/application/draft.ts, upsertDraftPatch)
After Batch 4's getApplicationRow change (DRAFT-only), if no DRAFT exists:
getApplicationRow returns null
createApplicationRow tries INSERT → fails with unique-constraint violation (user hasn't yet run the SQL migration from Batch 4) → throws PostgrestError → caught as [object Object] → { ok: false, error: "[object Object]" } → route returns 400
Why company_number "worked": it was typed during an older session when a DRAFT row still existed. company_name / incorporation_country are typed in a new session where only a PENDING app exists, so every save attempts and fails the INSERT.
Secondary trigger: the UPDATE … .eq('status', 'DRAFT').select().single() throws PGRST116 when it matches 0 rows (race: app was submitted between the row read and the update). Fix: use .maybeSingle() and handle null gracefully.
Cause C — client swallows the body (src/components/application/useDraft.ts)
throw new Error('Failed to save draft');   // ← discards response body entirely
The response JSON ({ error: "..." }) is never read, so the real reason is never logged.
Fix Strategy (≤ 3 files, targeted)
File	Change
src/server/application/draft.ts	(1) Fix upsertDraftPatch catch to extract .message from any thrown object. (2) Change update().single() → update().maybeSingle(), treat null result as "status-changed, skip silently". (3) Clamp progressPercent with isNaN guard.
src/app/api/application/draft/route.ts	(1) Add dev-only log of payload shape on entry. (2) Return structured validation error { error: 'Invalid payload', received: { hasPatch, currentStep, progressPercent } }. (3) Ensure result.error is always a string before JSON-encoding.
src/components/application/useDraft.ts	(1) On !res.ok, read and parse JSON body; log { status, body } in dev. (2) Surface the parsed error message to state.error (no PII — only error text). (3) Dev-only log of Object.keys(patch).slice(0,10) + typeof currentStep/progressPercent.
No schema change, no new files, no new deps.
Evidence to collect after fix
Trigger a 400: navigate to step-1 when no DRAFT exists (before SQL migration) → server console shows the real PostgrestError message, client logs { status: 400, body: { error: "duplicate key..." } }.
After running the SQL migration → first save creates the DRAFT row → subsequent saves return 200.
Type in company_name and select incorporation_country → both show POST 200 after ~1s debounce.
Non-goals
No field-level Zod validation of patch contents (out of scope, changes API contract).
No multi-app applicationId routing (deferred from Batch 4).
No changes to step page components.