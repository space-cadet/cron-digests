#!/usr/bin/env bash
# Build and deploy the primary cron-digests viewer.
set -euo pipefail

REPO="/home/cloudy/.openclaw/workspace/code/cron-digests"
TARGET="/home/quantumofgravity/public_html/cron-digests"
LOCK_FILE="/tmp/cron-digests-live-deploy.lock"

cd "$REPO"
exec 9>"$LOCK_FILE"
flock 9

mkdir -p "$TARGET"

# The viewer is a self-contained deployment tree. Keep its digest copies in
# sync before rebuilding the index, so every source has the same data set.
for digest_type in arxiv web-science moltbook; do
  if [ -d "$digest_type" ]; then
    mkdir -p "viewer/$digest_type"
    rsync -a "$digest_type/" "viewer/$digest_type/"
  fi
done

node scripts/build-index.js
node scripts/validate-digest.js >/tmp/cron-digests-live-validation.log

# Do not delete server-only diagnostics/test files; update the public viewer
# assets in place under the existing Apache document root.
rsync -aO --no-g --no-p viewer/ "$TARGET/"

python3 - "$TARGET/index.json" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as f:
    index = json.load(f)

digests = index.get("digests", [])
if not digests:
    raise SystemExit("live deployment verification failed: index contains no digests")

latest = digests[0]
print(
    "Live viewer deployed:",
    latest.get("date"),
    latest.get("type"),
    "|",
    len(digests),
    "digests",
    "| generated",
    index.get("generated"),
)
PY

echo "Primary deployment target: https://quantumofgravity.com/cron-digests/"
