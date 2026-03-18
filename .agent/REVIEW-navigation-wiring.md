# Architect Review: Navigation & CTA Wiring Pass

**Date:** 2026-02-26 | **Reviewer:** Claude (Architect) | **Verdict:** 🟡 PASS WITH FIXES

---

## Critical Fixes (must fix before Batch 2)

### C1. Remove duplicate footer from Contact page
- **File:** `src/app/(marketing)/contact/page.tsx`
- **Action:** Delete lines 178–185 (the inline `<footer>` element). The shared Footer from `layout.tsx` already renders. If company registration info is needed, move it to `Footer.tsx`.

### C2. Fix dead anchor in SolutionsSection
- **File:** `src/components/marketing/sections/SolutionsSection.tsx`
- **Action:** Line 14: change `ctaHref="#"` to `ctaHref="/solutions"`

---

## Recommended Fixes

### R1. Reroute all marketing CTAs from `/login` to `/sign-up`
Marketing pages target new prospects who don't have accounts. `/sign-up` is the correct conversion path. The ONLY place `/login` belongs on marketing pages is the "Sign In" link in the Navbar.

**6 occurrences across 5 files — change `href="/login"` → `href="/sign-up"`:**
- `src/app/(marketing)/solutions/page.tsx` — line 28 and line 192
- `src/app/(marketing)/about/page.tsx` — line 165
- `src/app/(marketing)/faq/page.tsx` — line 143
- `src/app/(marketing)/industries/page.tsx` — line 212
- `src/app/(marketing)/contact/page.tsx` — line 93

### R2. Disable misleading footer links
- **File:** `src/components/marketing/layout/Footer.tsx`
- **Lines 48 and 50:** Replace `<Link>` elements with disabled spans:

Line 48 — "Careers" currently links to `/contact`:
```diff
-<li><Link href="/contact" className="hover:text-primary transition-colors">Careers</Link></li>
+<li><span className="text-gray-500 cursor-not-allowed">Careers</span></li>
```

Line 50 — "Partners" currently links to `/industries`:
```diff
-<li><Link href="/industries" className="hover:text-primary transition-colors">Partners</Link></li>
+<li><span className="text-gray-500 cursor-not-allowed">Partners</span></li>
```

---

## Deferred (do NOT fix now)

- **Mobile hamburger navigation** — `Navbar.tsx` hides all links below `md:` breakpoint. Defer to after Batch 2. Log in HANDOVER as known gap.
- **Contact form `type="button"`** — correct for MVP (no backend yet), will be wired during auth/forms phase.

---

## Execution Steps for Gemini

```
STEP 1: Delete inline footer from contact/page.tsx (lines 178-185)
STEP 2: Change ctaHref="#" to ctaHref="/solutions" in SolutionsSection.tsx line 14
STEP 3: Replace href="/login" with href="/sign-up" in 5 files (6 occurrences listed above)
STEP 4: Disable "Careers" and "Partners" links in Footer.tsx (lines 48, 50)
STEP 5: Run quality gates:
  npm run type-check
  npm run lint
  npm test
  npm run build
  All must pass.
```

---

## HANDOVER Block (append after fixes pass)

```markdown
### 🧩 CONTEXT SNAPSHOT [2026-02-26] - Navigation Review Fixes
**Goal Achieved:** Applied corrective fixes from Architect Review.
**Gates:** type-check ✅ | lint ✅ | test ✅ | build ✅
**Changes:**
- Removed duplicate inline footer from contact/page.tsx
- Fixed dead anchor (#) in SolutionsSection → /solutions
- Rerouted 6 CTA hrefs from /login to /sign-up across 5 marketing pages
- Disabled misleading "Careers" and "Partners" footer links
**Known Deferred:**
- Mobile hamburger nav not implemented (Navbar.tsx) — flagged for post-Batch-2
**Next:** Proceed to Batch 2 — Auth Pages per design-migration-page.md §12.
```
