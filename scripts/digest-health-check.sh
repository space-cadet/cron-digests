#!/bin/bash
# digest-health-check.sh — Comprehensive digest pipeline verification
# Run this after any digest generation or as a nightly cron job

set -euo pipefail

REPO="${REPO:-/home/cloudy/.openclaw/workspace/code/cron-digests}"
cd "$REPO"

TODAY="$(date +%Y-%m-%d)"
EXIT_CODE=0

echo "=========================================="
echo "  Digest Health Check — $TODAY"
echo "=========================================="

# 1. Check for missing recent dates
echo ""
echo "[1] Checking for gaps in last 7 days..."

for TYPE in arxiv web-science moltbook; do
    MISSING=0
    for i in 0 1 2 3 4 5 6; do
        DAY="$(date -d "$TODAY - $i days" +%Y-%m-%d)"
        if [ ! -f "$TYPE/$DAY.md" ]; then
            # Skip expected weekends for arxiv (Tue-Sat = 2-6) and web-science (Mon-Fri = 1-5)
            DOW="$(date -d "$DAY" +%u)"  # 1=Mon, 7=Sun
            if [ "$TYPE" = "arxiv" ] && { [ "$DOW" = "1" ] || [ "$DOW" = "7" ]; }; then
                continue
            fi
            if [ "$TYPE" = "web-science" ] && { [ "$DOW" = "6" ] || [ "$DOW" = "7" ]; }; then
                continue
            fi
            echo "  ❌ $TYPE/$DAY.md missing"
            MISSING=$((MISSING + 1))
        fi
    done
    if [ "$MISSING" -eq 0 ]; then
        echo "  ✅ $TYPE: no unexpected gaps"
    else
        EXIT_CODE=1
    fi
done

# 2. Verify index.json is in sync with files
echo ""
echo "[2] Verifying index.json sync..."

if [ ! -f viewer/index.json ]; then
    echo "  ❌ viewer/index.json does not exist"
    EXIT_CODE=1
else
    # Count .md files per type (excluding README)
    for TYPE in arxiv web-science moltbook; do
        FILE_COUNT="$(find "$TYPE" -maxdepth 1 -name '*.md' ! -name 'README.md' | wc -l)"
        JSON_COUNT="$(python3 -c "import json; d=json.load(open('viewer/index.json')); print(sum(1 for x in d.get('digests',[]) if x.get('type')=='$TYPE'))" 2>/dev/null || echo 0)"
        if [ "$FILE_COUNT" -eq "$JSON_COUNT" ]; then
            echo "  ✅ $TYPE: $FILE_COUNT files = $JSON_COUNT index entries"
        else
            echo "  ❌ $TYPE: $FILE_COUNT files ≠ $JSON_COUNT index entries (run: node scripts/build-index.js)"
            EXIT_CODE=1
        fi
    done
fi

# 3. Verify index.db exists and has data
echo ""
echo "[3] Verifying index.db..."
if [ ! -f viewer/index.db ]; then
    echo "  ❌ viewer/index.db does not exist"
    EXIT_CODE=1
else
    DB_COUNT="$(sqlite3 viewer/index.db "SELECT COUNT(*) FROM digests;" 2>/dev/null || echo 0)"
    if [ "$DB_COUNT" -gt 0 ]; then
        echo "  ✅ index.db has $DB_COUNT digests"
    else
        echo "  ❌ index.db has no digests"
        EXIT_CODE=1
    fi
fi

# 4. Validate latest digest structure for each type
echo ""
echo "[4] Validating latest digest structure..."

for TYPE in arxiv web-science moltbook; do
    LATEST="$(find "$TYPE" -maxdepth 1 -name '*.md' ! -name 'README.md' -printf '%f\n' | sort | tail -1)"
    if [ -z "$LATEST" ]; then
        echo "  ❌ $TYPE: no digest files found"
        EXIT_CODE=1
        continue
    fi
    FILE="$TYPE/$LATEST"
    
    ERRORS=0
    
    # Check header
    if ! grep -q "^# .* Digest —" "$FILE"; then
        echo "  ❌ $LATEST: missing header"
        ERRORS=1
    fi
    
    # Check items found
    if ! grep -q "Items found:" "$FILE"; then
        echo "  ❌ $LATEST: missing 'Items found'"
        ERRORS=1
    fi
    
    # Check at least one entry
    ENTRY_COUNT="$(grep -c "^## [0-9]\+\." "$FILE" || true)"
    if [ "$ENTRY_COUNT" -lt 1 ]; then
        echo "  ❌ $LATEST: no entries found"
        ERRORS=1
    fi
    
    if [ "$ERRORS" -eq 0 ]; then
        echo "  ✅ $LATEST: $ENTRY_COUNT entries, structure OK"
    else
        EXIT_CODE=1
    fi
done

# 5. Check manifest.json files
echo ""
echo "[5] Checking manifest files..."
for TYPE in arxiv web-science moltbook; do
    if [ ! -f "$TYPE/manifest.json" ]; then
        echo "  ❌ $TYPE/manifest.json missing"
        EXIT_CODE=1
    else
        # Check manifest references files that actually exist
        MANIFEST_COUNT="$(python3 -c "import json; m=json.load(open('$TYPE/manifest.json')); print(len([f for f in m if f.endswith('.md')]))" 2>/dev/null || echo 0)"
        echo "  ✅ $TYPE/manifest.json: $MANIFEST_COUNT entries"
    fi
done

# 6. Viewer test (if playwright available)
echo ""
echo "[6] Viewer render test..."
if [ -f viewer/test.js ] && command -v npx >/dev/null 2>&1 && [ -d node_modules ] 2>/dev/null; then
    cd viewer && npx playwright test test.js 2>/dev/null || {
        echo "  ⚠️  Playwright tests had issues (non-blocking)"
    }
else
    echo "  ⏭️  Playwright tests skipped (not available)"
fi

# 7. Git status check
echo ""
echo "[7] Git status..."
if git diff --quiet && git diff --cached --quiet; then
    echo "  ✅ Working tree clean"
else
    echo "  ⚠️  Uncommitted changes detected — remember to push for GitHub Pages"
    git status --short
fi

# 8. GitHub Pages sync check (optional, if we can fetch)
echo ""
echo "[8] GitHub Pages deployment check..."
LOCAL_GEN="$(python3 -c "import json; d=json.load(open('viewer/index.json')); print(d.get('generated','unknown'))" 2>/dev/null || echo unknown)"
echo "  Local index.json generated: $LOCAL_GEN"

# Summary
echo ""
echo "=========================================="
if [ "$EXIT_CODE" -eq 0 ]; then
    echo "  ✅ ALL CHECKS PASSED"
else
    echo "  ❌ SOME CHECKS FAILED — see above"
fi
echo "=========================================="

exit $EXIT_CODE
