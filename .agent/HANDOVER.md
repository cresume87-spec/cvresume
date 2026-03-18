### CONTEXT SNAPSHOT [2026-03-04] — Fix #2: Logout redirect to homepage, 303 to avoid 405

- **Task:** After POST /auth/signout, redirect to "/" (homepage) with status 303 (See Other) so the browser follows with GET and user lands on homepage with 200 (not /login with 405 from method preservation).

- **Context:** /auth/signout is POST-only (GET returns 405 to prevent prefetch logout). Redirect with default 307 preserves POST, so the browser was following the redirect with POST to /login and getting 405.

- **Changes:**
  - `src/app/auth/signout/route.ts`: POST handler now redirects to `new URL('/', request.url)` with status **303** (See Other). Origin still from request.url (no NEXT_PUBLIC_SITE_URL). Dashboard unchanged: still uses `<form method="post" action="/auth/signout">` (no Link).

- **Evidence checklist:**
  1. **Incognito:** Log in, go to /dashboard, click Logout → user lands on **/** (homepage) with **200**.
  2. **Cookies:** Auth cookie (sb-*) removed after signout.
  3. **Navigation:** After logout, navigating to /dashboard redirects to /login (expected).
  4. **Gates:** type-check ✅ | lint ✅ | test ✅ (or bash .agent/skills/project-health/scripts/verify.sh).

- **Operator Confirmed: YES**

- **Status: DONE**

---

### CONTEXT SNAPSHOT [2026-03-04] — Fix #1: /application/success PDF download + remove Return button

- **Task:** (1) Remove "Return to Homepage" button from success page. (2) Implement secure PDF download: GET `/api/application/pdf?applicationId=...` (session-bound auth, RLS; verify application belongs to user and status PENDING/SIGNED; generate PDF from form_data and return as attachment). (3) Wire success page "Download Application PDF" to that endpoint.

- **Root cause:** Submit pipeline does not store PDF in DB or storage; it generates PDF in memory and emails it. So download is implemented by regenerating PDF on demand from stored form_data.

- **Files touched:**
  - `src/app/api/application/pdf/route.ts` (new) — GET handler: getUserOrThrow(supabase), require applicationId query, getApplicationById(supabase, applicationId, userId), verify status in ['PENDING','SIGNED'], generateApplicationPdf(row.form_data, row.submitted_at), return Response with Content-Type: application/pdf, Content-Disposition: attachment; filename="application-<id>.pdf". Returns 400 if no applicationId, 404 if not found, 403 if wrong status, 401 if unauthenticated.
  - `src/server/actions/submit-application.ts` — SubmitResult now includes optional applicationId; on success return { ok: true, applicationId: updatedRow.id }; when already submitted return { ok: true, applicationId: row.id }.
  - `src/app/(dashboard)/application/step-5/page.tsx` — On result.ok redirect to `/application/success?applicationId=${result.applicationId}` when applicationId present.
  - `src/app/(dashboard)/application/success/page.tsx` — Async page with searchParams (Promise); read applicationId; display it in reference box (or "—" if missing); removed "Return to Homepage" link; "Download Application PDF" is an `<a href="/api/application/pdf?applicationId=...">` when applicationId present, else disabled-style div.

- **Verification (must run):**
  1. **Network:** GET `/api/application/pdf?applicationId=<id>` with valid auth returns 200, Content-Type: application/pdf, body is PDF.
  2. **UI:** On success page after submit, click "Download Application PDF" → file downloads; spot-check 2–3 fields in PDF match submitted data.
  3. **Gates:** Run `bash .agent/skills/project-health/scripts/verify.sh` (or npm run type-check && npm run lint && npm test). type-check ✅ | lint ✅ | test ✅ (3 passed) | build ✅.

- **Operator Confirmed: YES**

- **Status: DONE**

---

### CONTEXT SNAPSHOT [2026-03-04] — Fix: Step 2 toggle persistence + Step 5 Sign & Finish validation

- **Task:** Fix two bugs: (1) Step 2 toggle states (is_licensed, has_subscription, etc.) not persisting after page refresh; (2) Step 5 "Sign and Finish" button reporting fields empty when they are filled.

- **Root causes:**
  1. **Step 2 toggles:** Toggle booleans used raw `setValue()` without RHF field registration. In RHF v7, `setValue` on unregistered fields does not reliably trigger `useWatch` re-renders, so toggle state changes could be missed by autosave and not properly restored by `reset()`. Step 4 toggles worked because they used `Controller`, which properly registers fields.
  2. **Step 5 validation:** `handleSignAndFinish()` read signature values from `autoSaveValues` (a closure-captured variable from `useWatch`). Under React Compiler memoization, the closure could be stale — capturing an old snapshot where values were still empty strings.

- **Fix:**
  1. **Step 2:** Wrapped all 7 toggle fields in `<Controller>` components (matching Step 4's proven pattern). `Controller` registers the field with RHF, ensuring `useWatch` tracks changes, autosave fires on toggle, and `reset()` properly restores the value.
  2. **Step 5:** Replaced `autoSaveValues` reading with `getValues()` in `handleSignAndFinish()`. `getValues()` reads the current form state synchronously at call time, immune to stale closures.

- **Files touched (2):**
  - `src/app/(dashboard)/application/step-2/page.tsx` — Added `Controller` import; wrapped all 7 toggles in `Controller`; removed derived `s2`/`isLicensed`/etc. variables (Controller provides values directly)
  - `src/app/(dashboard)/application/step-5/page.tsx` — Added `getValues` to `useForm` destructuring; changed `handleSignAndFinish()` to use `getValues()` instead of `autoSaveValues`

- **What was NOT changed:** `useDraft.ts`, server draft API, submit pipeline, RLS policy, middleware, autosave effect pattern, `"use no memo"` directives.

- **Evidence checklist (verify after deploy):**
  1. Step 2: Toggle "Licensing" ON → enter license number → refresh → toggle is still ON, license number preserved.
  2. Step 2: Toggle any switch ON → refresh immediately (before typing in dependent fields) → toggle state persists.
  3. Step 2: Toggle ON → toggle OFF → dependent fields cleared → refresh → toggle is OFF.
  4. Step 5: Enter Title, First Name, Surname → click "Sign and Finish" → submission proceeds (no false "fields empty" error).
  5. Network: Toggle changes in Step 2 trigger POST `/api/application/draft` with correct boolean values.

- **Gates:** `type-check` ✅ (0 errors) | `lint` ✅ (0 errors) | `build` ✅

- **Operator Confirmed: YES**

- **Status: CONFIRMED**
