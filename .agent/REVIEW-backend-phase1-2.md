# Architect Review: Backend Phase 1-2

**Date:** 2026-02-27  
**Reviewer:** Claude Opus (Architect)  
**Scope:** env validation, DB schema + RLS, health check  

---

## Verdict: PASS WITH FIXES

6 issues found — 3 critical, 3 moderate. No security leaks.

---

## ✅ What Passed

| Check | Result |
|-------|--------|
| No `SUPABASE_SERVICE_ROLE_KEY` in client code | ✅ Not found anywhere in `src/` |
| `.gitignore` blocks `.env*` files | ✅ Line 34 |
| Health route uses anon key only | ✅ `env.NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Health RPC cannot leak data | ✅ Returns only `{ ok, timestamp }` |
| RLS enabled on table | ✅ `ENABLE ROW LEVEL SECURITY` |
| SELECT policy: own row only | ✅ `auth.uid() = user_id` |
| INSERT policy: own row only | ✅ `WITH CHECK (auth.uid() = user_id)` |
| UPDATE policy: own DRAFT only | ✅ `USING (... AND status = 'DRAFT')` |
| No DELETE policy (correct) | ✅ Users cannot delete applications |
| `updated_at` trigger | ✅ `BEFORE UPDATE` trigger correct |
| CHECK constraints on status/step/progress | ✅ All 3 present |
| `ON DELETE CASCADE` from auth.users | ✅ User deletion cleans up |

---

## 🔴 Critical Issues (3)

### C1: `env.ts` — Mock Fallbacks Defeat Validation

**File:** `src/lib/env.ts` (lines 15-16)

```typescript
// CURRENT — DANGEROUS
NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key',
```

**Problem:** The entire purpose of Zod env validation is to FAIL FAST when a required env var is missing. The `|| 'mock-...'` fallback silently passes validation and the app boots with garbage credentials, leading to confusing runtime errors. This bypasses the safety net entirely.

**Fix:**
```typescript
// Remove all mock fallbacks. Pass raw process.env values.
// Use a build-time guard instead.
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

const envSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),       // ← ADD (see C2)
    RESEND_API_KEY: z.string().startsWith('re_').optional(),
    COMPLIANCE_EMAIL_TO: z.string().email().optional().default('compliance@ex-payments.com'),
    NEXT_PUBLIC_SITE_URL: z.string().url(),              // ← RENAME (see M1)
    HEALTHCHECK_TOKEN: z.string().optional(),
});

export const env = isBuildPhase
    ? ({} as z.infer<typeof envSchema>)  // Skip validation during build
    : envSchema.parse({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        COMPLIANCE_EMAIL_TO: process.env.COMPLIANCE_EMAIL_TO,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        HEALTHCHECK_TOKEN: process.env.HEALTHCHECK_TOKEN,
    });
```

### C2: `env.ts` — Missing `SUPABASE_SERVICE_ROLE_KEY`

**File:** `src/lib/env.ts`

**Problem:** The architecture contract (§A) requires `SUPABASE_SERVICE_ROLE_KEY` for the PDF + email pipeline. It is not in the env schema. When Phase 7 (PDF + email) is implemented, the admin client will fail silently.

**Fix:** Add to schema as shown in C1 fix above. Keep as `z.string().min(1)` (required). Since this is server-only, it will NEVER be exposed to client code (no `NEXT_PUBLIC_` prefix).

### C3: Missing Supabase Client Helpers

**Problem:** Architecture contract §A specifies 3 files:
- `src/lib/supabase/client.ts` (browser client)
- `src/lib/supabase/server.ts` (server client)
- `src/lib/supabase/admin.ts` (service role client)

None of these exist. The health route creates an ad-hoc `createClient()` call instead of using the helper. Package `@supabase/supabase-js` and `@supabase/ssr` are not installed.

**Fix:** 
1. `npm install @supabase/supabase-js @supabase/ssr`
2. Create all 3 files per architecture contract §A
3. Refactor health route to import from `@/lib/supabase/server`

---

## 🟡 Moderate Issues (3)

### M1: Env Var Naming Mismatch

**File:** `src/lib/env.ts` (line 8)

| Architecture Contract | Actual Implementation |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `NEXT_PUBLIC_APP_URL` |

**Fix:** Rename to `NEXT_PUBLIC_SITE_URL` to match the canonical contract. Update all references.

### M2: SQL Schema Has 4 Extra Columns

**File:** `docs/sql/01_backend_mvp_schema.sql` (lines 13-16)

```sql
pdf_sent_at       timestamptz,        -- NOT in contract
email_message_id  text,               -- NOT in contract
submit_attempts   integer NOT NULL DEFAULT 0,  -- NOT in contract
last_submit_error text,               -- NOT in contract
```

**Assessment:** These columns are reasonable for observability (tracking PDF send status, retry attempts, email message ID). However, they were NOT in the architecture contract and were added without approval.

**Decision — KEEP, but update architecture contract:**
- `pdf_sent_at` — useful for confirming compliance email delivery
- `email_message_id` — useful for Resend tracking/debugging
- `submit_attempts` + `last_submit_error` — useful for retry pipeline

**Fix:** Add these 4 columns to `docs/backend-mvp-architecture.md` §B with a note: "Added during Phase 2 implementation for observability."

### M3: Health RPC Uses `SECURITY DEFINER`

**File:** `docs/sql/01_backend_mvp_schema.sql` (line 70)

```sql
SECURITY DEFINER  -- Runs with function-owner privileges
```

**Assessment:** This is acceptable because:
- The function body is trivial (`SELECT jsonb_build_object('ok', true, 'timestamp', now())`)
- It touches NO user tables
- It cannot be exploited for privilege escalation

However, `SECURITY INVOKER` would be the safer default. Since the function needs no special privileges:

**Fix:** Change to `SECURITY INVOKER` (or remove the line entirely — `INVOKER` is the default):
```sql
CREATE OR REPLACE FUNCTION public.health()
RETURNS jsonb
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT jsonb_build_object('ok', true, 'timestamp', now());
$$;
```

---

## Implementation Contract for Gemini

Execute in this order:

### Fix 1: Install Supabase packages
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Fix 2: Rewrite `src/lib/env.ts`
Replace entire file with the corrected version from C1 above. Key changes:
- Remove all mock fallbacks
- Add `SUPABASE_SERVICE_ROLE_KEY`
- Rename `NEXT_PUBLIC_APP_URL` → `NEXT_PUBLIC_SITE_URL`
- Add `isBuildPhase` guard for Next.js build-time

### Fix 3: Create Supabase client helpers
Create 3 files per architecture contract §A:
- `src/lib/supabase/client.ts` — `createBrowserClient()` from `@supabase/ssr`
- `src/lib/supabase/server.ts` — `createServerClient()` from `@supabase/ssr` using cookies
- `src/lib/supabase/admin.ts` — `createClient()` from `@supabase/supabase-js` with service role key

### Fix 4: Refactor health route
Update `src/app/api/health/route.ts` to import the server client from `@/lib/supabase/server` instead of creating an ad-hoc client.

### Fix 5: Update SQL — health function security
Change `SECURITY DEFINER` to `SECURITY INVOKER` in `docs/sql/01_backend_mvp_schema.sql` line 70.

### Fix 6: Update architecture contract
Add the 4 extra observability columns (`pdf_sent_at`, `email_message_id`, `submit_attempts`, `last_submit_error`) to `docs/backend-mvp-architecture.md` §B with an "Added during Phase 2" annotation.

### Quality gate after fixes:
```bash
npm run type-check && npm run build
```

---

## Handover Instructions

Append to `.agent/HANDOVER.md`:

```markdown
### 🧩 CONTEXT SNAPSHOT [2026-02-27] — Architect Review: Phase 1-2
**Verdict:** PASS WITH FIXES (6 issues: 3 critical, 3 moderate)
**Critical:** env.ts mock fallbacks removed, SUPABASE_SERVICE_ROLE_KEY added, Supabase client helpers must be created
**Moderate:** env var naming aligned, SQL extra columns approved, health RPC changed to SECURITY INVOKER
**Review Document:** `.agent/REVIEW-backend-phase1-2.md`
**Next Action:** Gemini applies 6 fixes → quality gate → proceed to Phase 3 (Auth Flows)
```
