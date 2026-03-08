# Deploy Notes

- Ensure Vercel builds the latest commit.
- Prisma migrations: initial SQL has no BOM.
- Use pooled Neon URL (-pooler).
- NEXTAUTH_URL should be production domain.

## CardServ deployment mode

- The app is now **live-first** and uses `.env` only.
- Default live website setup:
  - `CARDSERV_MODE=live`
  - `CARDSERV_BASE_URL=https://live.cardserv.io`
  - `CARDSERV_EUR_REQUESTOR_ID=...`
  - `CARDSERV_EUR_TOKEN=...`
  - `CARDSERV_USD_REQUESTOR_ID=...`
  - `CARDSERV_USD_TOKEN=...`
  - `CARDSERV_GBP_REQUESTOR_ID=...`
  - `CARDSERV_GBP_TOKEN=...`
- Optional sandbox override for integration testing only:
  - `CARDSERV_MODE=sandbox`
  - `CARDSERV_BASE_URL=https://test.cardserv.io`
  - `CARDSERV_SANDBOX_REQUESTOR_ID=853`
  - `CARDSERV_SANDBOX_TOKEN=<sandbox token>`
- Do not mix sandbox host with live mode, or live host with sandbox mode.

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
- Ensure `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, CardServ vars, and any SMTP vars are configured in Vercel Project → Settings → Environment.

## GitHub Actions (auto-deploy on push)

- Secrets required in the repo:
  - `VERCEL_TOKEN` — Vercel Personal Token
  - `VERCEL_ORG_ID` — Your team/org ID
  - `VERCEL_PROJECT_ID` — Target project ID
- Workflow: `.github/workflows/vercel.yml` builds and deploys on pushes to `main`.
- If you prefer Vercel’s Git integration, you can remove the workflow and connect the repo at vercel.com instead.
