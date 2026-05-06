#!/bin/bash

set -e

log_step() {
  echo ""
  echo "=========================================="
  echo "👉 $1"
  echo "=========================================="
}

echo "🚀 AI Fix Pipeline Start"

# Step 1
log_step "Running react-doctor"
npx -y react-doctor@latest .

# Step 2
LATEST_DIR=$(ls -td /tmp/react-doctor-* | head -1)
log_step "Using report: $LATEST_DIR"

FILES=("$LATEST_DIR"/*.txt)
TOTAL=${#FILES[@]}
INDEX=1

# Step 3 loop
for file in "${FILES[@]}"; do
  log_step "[$INDEX/$TOTAL] Processing $(basename "$file")"

  content=$(cat "$file")

  echo "🤖 Running Kiro..."

  # STREAM OUTPUT REALTIME
  kiro-cli chat --trust-all-tools <<EOF
You are a senior React/Next.js engineer.

Fix issues from this report:

$content

Rules:
- Fix ONLY these issues
- Do NOT refactor unrelated code
- Keep behavior unchanged
EOF

  echo "✅ Kiro done"

  log_step "Git commit"
  git add .
  git commit -m "fix: $(basename "$file")" || echo "⚠️ Nothing to commit"

  INDEX=$((INDEX+1))
done

echo ""
echo "🎉 All done!"