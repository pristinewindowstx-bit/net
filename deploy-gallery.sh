#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/workspaces/net"
BRANCH="feature/gallery-autoplay"
PR_TITLE="Enable autoplay on gallery carousels and harden gallery.js initialization"
PR_BODY="This PR enables autoplay on the three gallery carousels and improves the gallery JavaScript's robustness.

- Adds data-autoplay=\"true\" and data-autoplay-interval=\"3000\" to the Projects, Our Team, and Team at Work carousels.
- Hardens site/assets/gallery.js: startup logging, try/catch, keyboard/touch support, autoplay, preload, ARIA improvements.
- Keeps the rest of the site unchanged."

cd "$REPO_DIR"

echo "1/5 git status"
git status --porcelain=1 --branch

echo "2/5 pushing branch to origin"
git push -u origin "$BRANCH"

echo "3/5 creating PR"
gh pr create --title "$PR_TITLE" --body "$PR_BODY" --head "$BRANCH" --base main --fill || true

# find PR number
PR_NUM=$(gh pr list --head "$BRANCH" --json number -q '.[0].number')
if [ -z "$PR_NUM" ]; then
  echo "No PR found for $BRANCH, exiting."
  exit 1
fi
echo "PR created: #$PR_NUM"

echo "4/5 merging PR"
gh pr merge "$PR_NUM" --merge --delete-branch

echo "5/5 triggering Netlify deploy (optional)"
if command -v netlify >/dev/null 2>&1; then
  # link should already exist for the site; the CLI will prompt if not
  netlify deploy --prod --dir=site || true
else
  echo "netlify CLI not installed; skipping Netlify deploy step. Install with: npm i -g netlify-cli"
fi

echo "Done. Visit https://pristinewindowstx.netlify.app/gallery.html after Netlify finishes deploy."
