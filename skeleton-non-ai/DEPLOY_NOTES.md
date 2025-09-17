# Deploy Notes

- Ensure Vercel builds the latest commit.
- Prisma migrations: initial SQL has no BOM.
- Use pooled Neon URL (-pooler).
- NEXTAUTH_URL should be production domain.

## Vercel CLI (local) quick setup

- Prereqs: Vercel account + Project, or allow CLI to create one.
- Auth: set an auth token in your shell (recommended):
  - PowerShell: `$env:VERCEL_TOKEN = 'xxxxx'`
  - Bash: `export VERCEL_TOKEN=xxxxx`
- First-time link and deploy from repo root:
  - `npm run vercel:link`  (creates `.vercel/project.json`)
  - `npm run vercel:prod`

Notes:
- CLI also works if you run `npx vercel login` once on this machine.
- Build uses `npm run build` which includes Prisma `migrate deploy`.
- Ensure `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and any SMTP/Stripe vars are configured in Vercel Project → Settings → Environment.

## GitHub Actions (auto-deploy on push)

- Secrets required in the repo:
  - `VERCEL_TOKEN` — Vercel Personal Token
  - `VERCEL_ORG_ID` — Your team/org ID
  - `VERCEL_PROJECT_ID` — Target project ID
- Workflow: `.github/workflows/vercel.yml` builds and deploys on pushes to `main`.
- If you prefer Vercel’s Git integration, you can remove the workflow and connect the repo at vercel.com instead.

