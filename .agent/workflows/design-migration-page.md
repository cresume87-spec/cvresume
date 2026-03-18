---
description: Migrate raw HTML from /src/_raw_designs into Next.js App Router pages. Gemini implements, runs quality gates, updates HANDOVER. Claude defines contracts and flags issues.
---

# Workflow: Design Migration (Raw HTML → Next.js Page)

**Trigger:** A page in `src/_raw_designs/` needs conversion into a Next.js App Router route.
**Framework:** Contract (Claude) → Migrate (Gemini) → Verify → Handover.

## Inputs / Outputs
- **In:** Raw HTML path, target route group, target `page.tsx` path.
- **Out:** `page.tsx` + extracted components + updated HANDOVER snapshot.

## Roles
- **Claude:** Defines contract (which HTML → which route), approves batching, flags architecture issues.
- **Gemini:** Executes migration, runs gates, updates HANDOVER. Max 3 fix attempts per gate failure (§Anti-Loop).

## Migration Rules (Non-Negotiable)

1. **Visual parity** with raw HTML. Use Parity Checklist below.
2. **Server Components by default.** `"use client"` only for hooks/browser APIs — add comment explaining why.
3. **HTML→TSX:** `class`→`className`, `<img>`→`next/image`, `<a>`→`next/link` (internal), delete CDN `<script>`/`<link>` tags, replace Material Symbols with `lucide-react`.
4. **Styling:** Use project Tailwind tokens + `cn()` from `@/lib/utils`. Use Shadcn/UI base components where applicable.
5. **Extract shared layout** (header/footer) only when obviously shared. Page-specific sections stay inline or go to `components/<group>/sections/`.
6. **Responsive-first adaptation from desktop source is mandatory** for all future migration batches. Preserve desktop parity, but ensure pages are usable on mobile/tablet widths (320–390, 768, 1024, 1280+). No horizontal scroll. Layouts, forms, cards, and navigation must adapt gracefully.
7. **Interactive UI states must be implemented when represented in raw designs.** If a raw design shows expanded conditional sections (e.g. toggle = true), the migrated page must include working UI-only toggle behavior:
   - when toggle = true → reveal dependent fields
   - when toggle = false → hide dependent fields
   - hidden dependent inputs must not keep visible mock values
8. **Remove all Stitch-inserted mock field values** from inputs, textareas, selects, and repeated rows unless explicitly required as instructional copy. Fields must be empty by default; placeholders/hints may remain.
9. **Application form migration may use Client Components where needed** for toggle/conditional UI state. Add a short comment explaining why `"use client"` is required.
10. **Do NOT** add backend logic, overwrite `(marketing)/page.tsx`, invent missing UI, or modify `PROJECT.md`.


## Procedure (Per Page)

1. Confirm raw HTML exists. Note any title/naming issues from HANDOVER.
2. Create route: `src/app/<group>/<route>/page.tsx`.
3. Convert HTML→TSX section by section (rules above).
4. Implement responsive adaptation from desktop source.
5. Implement required UI-only interactive states (toggles, conditional reveal/hide, expandable sections) where present in raw design.
6. Remove all mock/demo values from form controls while preserving placeholders and helper text.
7. Extract components if applicable.
8. Run Quality Gates.
9. Run Parity Checklist.
10. Extract components if applicable.
11. Run Quality Gates.
12. Run Parity Checklist.
13. Repeat for next page or finalize batch.

## Quality Gates (after EACH page)
```bash
// turbo-all
npm run type-check
npm run lint
npm test
npm run build
```

## Anti-Loop Protocol
3 attempts max per failure. After attempt 3, STOP and report:
```
❌ BLOCKED — <page>
Gate: <which> | Error: <verbatim> | Files: <list> | Attempts: 3/3
```

## Parity Checklist
- [ ] All sections present and ordered correctly
- [ ] Buttons, links, form inputs exist
- [ ] Internal links use `<Link>`, correct routes
- [ ] No CDN URLs, `<script>` tags, or `class=` remain
- [ ] Page metadata/title set
- [ ] No browser console errors
- [ ] Responsive behavior verified on 320–390, 768, 1024, 1280+ widths
- [ ] No horizontal overflow on mobile
- [ ] Toggle/conditional sections behave correctly
- [ ] Hidden dependent fields are not visible when toggle = false
- [ ] Mock/demo values removed from all form fields
- [ ] Placeholders/helper text preserved where appropriate

## Safe Placeholder Policy (Missing Designs)
If raw HTML is missing but route is required: create minimal page with project layout shell, "Coming Soon" heading, and `// TODO: [PLACEHOLDER] Raw design missing` comment. Must pass all gates. Log in HANDOVER under Known Issues.

**Known missing:** Forgot Password, Reset Password.

## HANDOVER Template (append after each batch)
```markdown
### 🧩 CONTEXT SNAPSHOT [YYYY-MM-DD] - Migration Batch: <Name>
**Goal:** Migrated <N> pages into App Router.
**Gates:** type-check ✅ | lint ✅ | test ✅ | build ✅
**Pages:**
| Source | Route | Components |
|--------|-------|------------|
| `x.html` | `src/app/.../page.tsx` | `Comp.tsx` |
**Parity:** Verified ✅
**Issues:** None (or list)
**Next:** <next action>
```

## Batch Order
**Batch 1 (Marketing):** `about_us`, `solutions`, `industries`, `faq`, `contact_us` + shared `header`/`footer` → layout components. Skip `homepage` (already done).
**Batch 2 (Auth):** `login`, `sign_up`, `email_verification` + placeholders for forgot/reset password.
**Batch 3 (Dashboard + Application):**
- `dashboard` + `submission_success` may be implemented by Gemini
- `application_step_1-5` + shared application shell should be contracted and implemented by Claude due to critical UX, conditional fields, and complex UI state requirements

## Gemini: How to Apply
1. Read `PROJECT.md` + `HANDOVER.md` first.
2. Start Batch 1: extract header/footer into layout FIRST, then migrate each page. Run gates after each.
3. After batch: append HANDOVER snapshot using template above. Set Next Action to Batch 2.