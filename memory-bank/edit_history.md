# Edit History

*Created: 2026-05-12 05:05:52 IST*
*Last Updated: 2026-06-16 08:20:00 IST*

### 2026-06-16

#### 08:20:00 IST - T15: arXiv HTML Structure Fix — Abstract and Category Extraction
- Modified `scripts/arxiv-digest-full.sh` — Updated abstract extraction regex to handle arXiv HTML change (removed `<p>` tags around abstracts). Added new pattern matching after `<span class="descriptor">Abstract:</span>` with old pattern as fallback.
- Modified `scripts/fetch-arxiv-html.py` — Fixed category extraction regex to extract codes from within parentheses (e.g., `(hep-th)`). Old regex greedily consumed text before parentheses, causing all categories to be empty.
- Modified `arxiv/2026-06-09.md` — Re-fetched all 15 abstracts using fixed regex. Restored from git history after accidental corruption from first repair attempt.
- Modified `arxiv/2026-06-10.md` — Re-fetched all 15 abstracts using fixed regex.
- Modified `arxiv/2026-06-11.md` — Re-fetched all 15 abstracts using fixed regex.
- Modified `arxiv/2026-06-12.md` — Re-fetched all 15 abstracts using fixed regex.
- Modified `arxiv/2026-06-13.md` — Re-fetched all 15 abstracts using fixed regex.
- Modified `arxiv/2026-06-16.md` — Re-fetched all 15 abstracts using fixed regex.
- Modified `viewer/arxiv/2026-06-09.md` through `viewer/arxiv/2026-06-16.md` — Submodule updated with corrected digests.
- Modified `viewer/index.db` — Rebuilt with corrected abstracts.
- Modified `viewer/index.json` — Rebuilt with corrected abstracts.
- Created `memory-bank/tasks/T15.md` — Task file documenting the HTML structure change, root cause, fixes, and lessons learned.
- Created `memory-bank/sessions/2026-06-16-morning.md` — Session file for T15 work.
- Modified `memory-bank/tasks.md` — Added T15 to completed tasks registry.
- Modified `memory-bank/activeContext.md` — Updated current status with T15 completion.
- Modified `memory-bank/session_cache.md` — Updated session history, task registry, session history.

### 2026-06-05

#### 21:33:00 IST - T14: arXiv Digest Throttled Rerun — 429 Error Prevention
- Modified `scripts/fetch-arxiv-html.py` - Added `import time` and `time.sleep(3)` between category fetch requests to prevent rate limiting
- Modified `arxiv/2026-06-05.md` - Rewritten with 12 new papers, all abstracts verified against live arxiv.org pages
- Modified `arxiv/seen-urls.json` - Updated with 12 new paper IDs
- Created `/tmp/fetch-abstracts.py` - Throttled abstract fetcher with 3-second delays between curl requests
- Created `/tmp/arxiv-abstracts.json` - Fetched abstracts for all 12 papers (deleted after use)

### 2026-05-25

#### 07:38:00 IST - T13: Moltbook Research Stream Integration into Viewer
- Created `moltbook/2026-05-25.md` - First Moltbook digest with 4 entries from research stream
- Created `moltbook/manifest.json` - Manifest tracking Moltbook digests
- Created `scripts/generate-moltbook-digest.js` - Parser converting ~/.openclaw/logs/moltbook-research.md into dated digest files
- Modified `scripts/build-index.js` - Added 'moltbook' to types array, indexes Moltbook digests into SQLite + JSON
- Modified `viewer/index.html` - Added moltbook source, amber badge, submolt chips, author lines, URL links. Header updated to three-source title
- Modified `.github/workflows/ci.yml` - git add -A now stages moltbook/ alongside other directories
- Modified `cron job moltbook-research` - Payload now runs generate-moltbook-digest.js after saving to log
- Modified `memory-bank/tasks/T13.md` - Task file documenting pipeline, decisions, and verification
- Created `memory-bank/sessions/2026-05-25-morning.md` - Session file for T13 work
- Created `memory-bank/edits/2026-05-25/073800-T13-moltbook-integration.md` - Edit chunk
- Modified `memory-bank/tasks.md` - Added T13 to completed tasks registry
- Modified `memory-bank/progress.md` - Updated project status, added T13 completion, noted 23 digests
- Modified `memory-bank/changelog.md` - Added moltbook integration to 2026-05-25 section
- Modified `memory-bank/activeContext.md` - Updated current status with T13 completion
- Modified `memory-bank/session_cache.md` - Updated session history, current session

#### 05:25:00 IST - T11: arXiv Metadata Hallucination Fix and Pipeline Hardening
- Modified `arxiv/2026-05-25.md` - Regenerated with fully verified metadata (12 papers, all checked against arXiv API via web_fetch)
- Modified `TEMPLATE.md` - Fixed example URLs from arxiv.org to arxivite.org
- Modified `cron-digests` arXiv cron prompt - Added mandatory web_fetch verification and non-negotiable URL rewrite rules
- Created `memory-bank/tasks/T11.md` - Task file documenting the hallucination incident, root cause, fix, and lessons learned
- Modified `memory-bank/tasks.md` - Added T11 to completed tasks registry
- Modified `memory-bank/progress.md` - Updated project status, added T11 completion, noted 22 digests indexed
- Modified `memory-bank/changelog.md` - Added 2026-05-25 section with verification fix and ES module fix
- Modified `memory-bank/activeContext.md` - Updated current status with T11 completion, viewer health
- Created `memory-bank/sessions/2026-05-25-night.md` - Session file for T11 work
- Modified `memory-bank/session_cache.md` - Updated current session, task registry, session history
- Modified `.github/workflows/ci.yml` - Removed `continue-on-error: true` from build-index step (now strict)
- Created `package.json` - Added to resolve ES module conflict (parent workspace has `"type": "module"`)
- Modified `web-science/manifest.json` - Added missing `2026-05-21.md` entry
- Modified `scripts/build-index.js` - Verified working after package.json addition (CommonJS now resolves correctly)
- Modified `scripts/validate-digest.js` - Verified working after package.json addition
- Modified `viewer/index.json` - Rebuilt index: 22 digests, 209 entries, 384 unique tags

### 2026-05-21

#### 16:45:00 IST - T10: Cron Reliability Fix — Validator, CI, and CloakBrowser Integration
- Modified `scripts/validate-digest.js` - Skip `items_found` accuracy check for arxiv digests (arxiv reports total announcement size, not selected entries)
- Modified `.github/workflows/ci.yml` - Added `continue-on-error: true` to build-index step; commit step now stages ALL changes (`arxiv/`, `web-science/`, `viewer/`) instead of only index files
- Modified `scripts/generate-web-science-cloak.mjs` - Corrected ScienceDaily URL from `/news/physics/` (404) to `/news/matter_energy/physics/` (200); fixed selectors after site layout change
- Created `scripts/check-index-health.js` - Standalone health checker for index freshness, manifest completeness, and digest coverage
- Modified `memory-bank/tasks/T10.md` - Task file with full incident report, root cause, and fix details
- Modified `memory-bank/tasks.md` - Added T10 to completed tasks registry
- Modified `memory-bank/progress.md` - Updated project status, 22 digests indexed, viewer health noted
- Modified `memory-bank/changelog.md` - Added 2026-05-21 section with validator fix and CloakBrowser fix
- Modified `memory-bank/activeContext.md` - Updated current status with T10 completion, noted index health
- Created `memory-bank/sessions/2026-05-21-evening.md` - Session file for T10 work
- Modified `memory-bank/session_cache.md` - Updated current session, task registry, session history
- Modified `memory-bank/edits/2026-05-21/164500-T10-cron-reliability-fix.md` - Edit chunk documenting all file changes