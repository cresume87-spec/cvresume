const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, 'node_modules', '@sparticuz', 'chromium', 'bin');
const publicDir = path.join(rootDir, 'public');
const outputFile = path.join(publicDir, 'chromium-pack.tar');
const packEntries = ['al2.tar.br', 'al2023.tar.br', 'chromium.br', 'fonts.tar.br', 'swiftshader.tar.br'];

function ensureSourceFiles() {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Chromium bin directory not found: ${sourceDir}`);
  }

  for (const entry of packEntries) {
    const fullPath = path.join(sourceDir, entry);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Required Chromium pack file missing: ${fullPath}`);
    }
  }
}

function buildPack() {
  fs.mkdirSync(publicDir, { recursive: true });
  execFileSync('tar', ['-cf', outputFile, '-C', sourceDir, ...packEntries], {
    stdio: 'inherit',
  });
}

function main() {
  ensureSourceFiles();
  buildPack();
  console.log(`[package-chromium] Created ${outputFile}`);
}

main();
