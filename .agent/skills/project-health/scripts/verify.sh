#!/bin/bash
# Script: verify.sh
# Purpose: AI-optimized project health check. Runs type-check, lint, and tests.

set -e

echo "========================================"
echo "🛡️  STARTING PROJECT VERIFICATION..."
echo "========================================"

# Step 1: TypeScript Check
echo "⏳ [1/3] Running TypeScript Type Check (tsc)..."
if ! npm run type-check --silent; then
    echo "❌ [ERROR] TypeScript validation failed!"
    echo "ACTION REQUIRED: Pass the exact error lines above to the Architect (Claude)."
    exit 1
fi
echo "✅ [OK] Type Check Passed."

# Step 2: Linter
echo "⏳ [2/3] Running ESLint/Next Lint..."
if ! npm run lint --silent; then
    echo "❌ [ERROR] Linter found issues!"
    echo "ACTION REQUIRED: Pass the linter output to the Architect (Claude)."
    exit 1
fi
echo "✅ [OK] Linter Passed."

# Step 3: Tests
echo "⏳ [3/3] Running Unit/Integration Tests..."
if ! echo "n" | npm test --silent; then
    echo "❌ [ERROR] Test suite failed!"
    echo "ACTION REQUIRED: Do not guess the fix. Pass the failing test output to Claude."
    exit 1
fi
echo "✅ [OK] All Tests Passed."
echo "========================================"
echo "🎉 [SUCCESS] Project is healthy and ready for snapshot!"
exit 0