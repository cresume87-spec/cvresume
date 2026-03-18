#!/bin/bash
# Script: commit.sh
# Purpose: Safe Git commits enforcing Conventional Commits.

MESSAGE=$1

if [ -z "$MESSAGE" ]; then
    echo "❌ [ERROR] Commit message is required."
    echo "Usage: bash commit.sh \"<type>: <message>\""
    exit 1
fi

# Enforce Conventional Commits regex
if ! [[ $MESSAGE =~ ^(feat|fix|docs|style|refactor|test|chore)(\([a-z0-9-]+\))?:\ .+ ]]; then
    echo "❌ [ERROR] Invalid commit format. Must use Conventional Commits (e.g., 'feat: description')."
    exit 1
fi

echo "⏳ Adding files to staging..."
# Add all changes (respecting .gitignore)
git add .

echo "⏳ Committing..."
if git commit -m "$MESSAGE"; then
    echo "✅ [SUCCESS] Changes committed successfully: $MESSAGE"
else
    echo "⚠️ [WARNING] Nothing to commit or commit failed."
fi