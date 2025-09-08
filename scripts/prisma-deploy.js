// Helper script to run Prisma migrate deploy, and self-heal a known
// failed migration state (P3009) for `0004_add_client_meta`.
// It attempts a deploy; if it fails, it marks the migration as rolled back
// and retries the deploy.

const { spawnSync } = require('node:child_process');

function run(cmd) {
  const res = spawnSync(cmd, { shell: true, stdio: 'inherit' });
  return res.status === 0;
}

console.log('[prisma-deploy] Running prisma migrate deploy...');
if (run('npx prisma migrate deploy')) {
  process.exit(0);
}

console.warn('[prisma-deploy] Deploy failed. Trying to resolve failed migrations and retry...');
// Resolve latest known failures in order (most recent first)
run('npx prisma migrate resolve --rolled-back 0007_company_logo_url');
run('npx prisma migrate resolve --rolled-back 0006_company_bankname');
run('npx prisma migrate resolve --rolled-back 0005_amounts_decimal');
run('npx prisma migrate resolve --rolled-back 0004_add_client_meta');

if (!run('npx prisma migrate deploy')) {
  console.error('[prisma-deploy] Deploy failed after resolve attempt.');
  process.exit(1);
}

console.log('[prisma-deploy] Deploy succeeded after resolve.');
