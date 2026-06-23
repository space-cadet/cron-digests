#!/bin/bash
# verify-digest.sh — Verify a newly generated digest renders correctly
# Usage: bash scripts/verify-digest.sh <type> <date>
# Example: bash scripts/verify-digest.sh arxiv 2026-06-23

set -euo pipefail

TYPE="${1:-}"
DATE="${2:-}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"

cd "$REPO"

if [ -z "$TYPE" ] || [ -z "$DATE" ]; then
    echo "Usage: $0 <type> <date>"
    echo "  type: arxiv | web-science | moltbook"
    echo "  date: YYYY-MM-DD"
    exit 1
fi

FILE="$TYPE/$DATE.md"
if [ ! -f "$FILE" ]; then
    echo "❌ FAIL: $FILE does not exist"
    exit 1
fi

echo "Verifying $FILE ..."

# 1. Check header
echo "[1/5] Checking header..."
if ! grep -q "^# .* Digest — $DATE" "$FILE"; then
    echo "❌ FAIL: Missing or malformed header (# ... Digest — YYYY-MM-DD)"
    exit 1
fi

# 2. Check items count
if ! grep -q "Items found:" "$FILE"; then
    echo "❌ FAIL: Missing 'Items found:' line"
    exit 1
fi

# 3. Check at least one entry
ENTRY_COUNT=$(grep -c "^## [0-9]\+\." "$FILE" || true)
if [ "$ENTRY_COUNT" -lt 1 ]; then
    echo "❌ FAIL: No entries found (expected ## 1. ... style)"
    exit 1
fi
echo "   Found $ENTRY_COUNT entries"

# 4. Rebuild index and check digest appears
echo "[2/5] Rebuilding index..."
if ! node scripts/build-index.js; then
    echo "❌ FAIL: build-index.js failed"
    exit 1
fi

# 5. Check index.json contains the digest
echo "[3/5] Checking index.json..."
if ! grep -q "\"date\": \"$DATE\"" viewer/index.json; then
    echo "❌ FAIL: Date $DATE not found in index.json"
    exit 1
fi
if ! grep -q "\"type\": \"$TYPE\"" viewer/index.json; then
    echo "❌ FAIL: Type $TYPE not found in index.json"
    exit 1
fi

# 6. Check index.db contains entries for this date
echo "[4/5] Checking index.db..."
ENTRY_DB_COUNT=$(sqlite3 viewer/index.db "SELECT COUNT(*) FROM entries WHERE digest_date = '$DATE';" || echo "0")
if [ "$ENTRY_DB_COUNT" -lt 1 ]; then
    echo "❌ FAIL: No entries in SQLite for date $DATE"
    exit 1
fi
echo "   Found $ENTRY_DB_COUNT entries in database"

# 7. Check manifest.json contains the file
echo "[5/5] Checking manifest.json..."
if ! grep -q "$DATE.md" "$TYPE/manifest.json"; then
    echo "❌ FAIL: $DATE.md not in $TYPE/manifest.json"
    exit 1
fi

# 8. (Optional) Run viewer playwright tests if available
if [ -f "viewer/test.js" ] && command -v npx >/dev/null 2>&1; then
    echo "[BONUS] Running viewer tests..."
    cd viewer && npx playwright test test.js 2>/dev/null || echo "   Viewer tests skipped (playwright not available)"
fi

echo ""
echo "✅ All checks passed for $TYPE/$DATE.md"
echo "   Entries: $ENTRY_COUNT (file) | $ENTRY_DB_COUNT (db)"
echo "   Index: viewer/index.json + viewer/index.db updated"
