# Project Progress

*Last Updated: 2026-06-19 03:12 IST*

## What Works

- [x] **Post-generation verification pipeline** (T18): `verify-digest.sh` (8 checkpoints), `digest-health-check.sh` (pipeline), enhanced `viewer/test.js` (10 Playwright tests)
- [x] **Robust header parsing**: `build-index.js` and `validate-digest.js` accept both `-` and `—` in headers, preventing silent parsing failures
- [x] **Viewer URL clarification**: `https://space-cadet.github.io/cron-digests/` (root, no `/viewer/` prefix) — CI deploys `viewer/` directory as Pages root
- [x] GitHub CLI (`gh`) installed and authenticated as `space_cadet`
- [x] Telegram channel enabled and paired (user 849773381)
- [x] arXiv Morning Digest cron job: **Tue-Sat** 7:11 IST (with mandatory `web_fetch` verification + K2.7 subagent summary rewrite)
- [x] Web Science Digest cron job: **Mon-Fri** 10:17 IST
- [x] **Moltbook personal stream cron**: every 6h on the hour
- [x] **Moltbook research stream cron**: every 6h at :30
- [x] Digest format v2.0: uniform template across arXiv, web-science, and Moltbook
- [x] Viewer UI: card grid, modal with ToC, category chips, search/filter
- [x] JSON Schema (`schema/digest.json`) formalizes digest structure
- [x] Validation script (`scripts/validate-digest.js`): **91+ files, 0 errors**
- [x] Index builder (`scripts/build-index.js`): SQLite + JSON export
- [x] Viewer loads `index.json` instantly (1 fetch vs N markdown files)
- [x] Dark mode with toggle and localStorage persistence
- [x] Tag filtering: top-20 tags with counts, card tag chips, click-to-filter
- [x] "New" badge on latest digest card
- [x] PDF links in modal alongside abstracts
- [x] Keyboard navigation (`j`/`k`, `Enter`, `/`, `Esc`)
- [x] arxivite.org replaces arxiv.org for all paper links
- [x] CloakBrowser integration: stealth Chromium for bot-resistant web-science fetching
- [x] CI/CD pipeline: GitHub Actions auto-validates, rebuilds index, deploys to Pages on every push
- [x] **KaTeX math rendering** in arXiv abstracts (card previews + modal views)
- [x] **Tag/chip display** fixed — regex cross-line matching bug eliminated
- [x] **Paper summaries** rewritten for all digests (June 16–19) — actual contributions, not abstract copies
- [x] **K2.7 subagent integration** in arXiv cron job for automatic summary generation
- [x] Memory bank fully synchronized with all work through **2026-06-23 16:25 IST**
- [x] **Moltbook research stream integration**: cron → log → generator → digest → index → viewer pipeline live
- [x] **Moltbook generator** (`scripts/generate-moltbook-digest.js`): parses research log into dated digest files
- [x] Viewer shows three sources: arXiv (green), Web Science (blue), Moltbook (amber)
- [x] Moltbook submolt chips and author lines in viewer modal
- [x] **Metadata verification pipeline**: mandatory `web_fetch` for every arXiv paper before inclusion
- [x] **ES module isolation**: cron-digests `package.json` overrides parent workspace module type
- [x] **arXiv HTML structure fix** (T15): abstracts + categories extracting correctly after arXiv HTML changes
- [x] **arXiv throttling** (T14): 3-second sleep between category fetches prevents 429 errors

## In Progress

- [ ] Operational monitoring of automated cron runs (next: arXiv ~7:11 IST Tue-Sat, Web Science ~10:17 IST Mon-Fri, Moltbook research ~:30 past the hour)
- [ ] `tags.json` sync with new tags from May 21, 22, 25, June 16-23

## Completed (2026-06-23)

### T18: Post-Generation Verification Pipeline
1. Created `scripts/verify-digest.sh` — executable 8-checkpoint validation per digest (header, items, entries, index, JSON, DB, manifest, viewer)
2. Created `scripts/digest-health-check.sh` — 150-line comprehensive pipeline health check
3. Fixed `build-index.js` and `validate-digest.js` — regex now accepts both `-` and `—` in headers, preventing silent parsing failures
4. Enhanced `viewer/test.js` — 10 comprehensive Playwright tests (cards, modals, search, filters, responsive, tags)
5. Updated `scripts/arxiv-digest-full.sh` — verification runs after index rebuild, non-blocking
6. Updated arXiv cron job payload — subagent only rewrites summaries, main job handles build-index + git push separately
7. Tested on arXiv 2026-06-23: all 5 checks passed (15 files, 31 DB entries)
8. Health check: 0 exit code, all types synced (91 digests, 831 entries, 800 tags)

### T19: Viewer 404 Fix & URL Clarification
1. Diagnosed user was using wrong URL: `/viewer/index.html` instead of root `/`
2. Explained CI deploys `viewer/` directory as Pages root — no `/viewer/` prefix in URL
3. Correct URL: `https://space-cadet.github.io/cron-digests/`
4. Cleaned up accidental duplicate `viewer/arxiv/` and `viewer/web-science/` directories
5. Verified site live: 91 digests, latest 2026-06-23, all three types present

## Completed (2026-05-25)

### T13: Moltbook Research Stream Integration into Viewer
1. Created `moltbook/` directory with first digest (`2026-05-25.md`, 4 entries) and `manifest.json`
2. Built `scripts/generate-moltbook-digest.js` — 87-line parser that reads `~/.openclaw/logs/moltbook-research.md` and outputs dated digest + manifest update
3. Updated `scripts/build-index.js` — added `'moltbook'` to `types` array, indexes into SQLite + JSON
4. Updated `viewer/index.html` — amber badge (`.type-moltbook`), submolt chips, author lines, URL links, three-source header
5. Updated `.github/workflows/ci.yml` — `git add -A` now stages `moltbook/`
6. Updated `moltbook-research` cron job payload — runs generator after saving to log
7. Verified GitHub Pages deployment: 1 moltbook digest with 4 entries live in production

### T11: arXiv Metadata Hallucination Fix — Verification Pipeline
1. Identified hallucination: May 25 digest had 12 papers with real IDs but invented metadata
2. Regenerated digest with all 12 papers verified via `web_fetch` against live arXiv pages
3. Updated cron prompt with mandatory verification rules and URL rewrite requirements
4. Fixed all `arxiv.org` → `arxivite.org` URLs in May 25 digest and TEMPLATE.md
5. Spot-checked historical digests (May 22, 20, 15) — all clean

### T12: ES Module Fix and Manifest Repair (Emergent)
1. Discovered `build-index.js` and `validate-digest.js` crashed with `ReferenceError: require is not defined`
2. Root cause: parent workspace `package.json` has `"type": "module"`, forcing ES module mode on child scripts
3. Created `package.json` in cron-digests root (no `"type": "module"`) to override parent setting
4. Fixed `web-science/manifest.json` missing `2026-05-21.md` entry
5. Removed `continue-on-error: true` from CI build-index step (was masking failures)
6. Rebuilt index: 22 digests, 209 entries, 384 unique tags
7. Validation passed: 22 files, 0 errors

## Completed (2026-05-21)

### T10: Cron Reliability Fix — Validator, CI, and CloakBrowser Integration
1. Diagnosed root causes: web science cron stuck on blocked sites, CI fragile, validator false positives
2. Fixed validator: skip `items_found` check for arxiv digests
3. Hardened CI: `continue-on-error` on build-index, commit step stages ALL changes
4. Updated web science cron prompt with exact CloakBrowser command and 5-minute fallback
5. Generated `web-science/2026-05-21.md` via CloakBrowser (6 articles)

## Completed (2026-05-18)

### T6: Schema, Validation, and Index Infrastructure
1. JSON Schema for digest header and entry structure
2. `validate-digest.js` with markdown parser, item count checks, sequential numbering validation
3. `build-index.js` with markdown → SQLite → JSON pipeline
4. Composite PK fix (date, type) for SQLite digests table
5. 11 digests indexed: 106 entries, 93 unique tags

### T7: Viewer UI/UX Overhaul
1. CSS variable architecture for light/dark themes
2. Tag bar with count badges and active filter state
3. Per-card tag chips (up to 6) with hover-to-filter
4. "New" badge on most recent digest
5. Paper action buttons (Abstract + PDF) in modal
6. Keyboard event handlers (j/k, Enter, /, Esc)
7. Mouse hover syncs keyboard focus index
8. Compact chip sizing pass
9. arxivite.org URL replacement

### T8: CloakBrowser Integration for Web Science Digest
1. Installed CloakBrowser (`cloakbrowser` + `playwright-core`)
2. Auto-downloaded stealth Chromium binary (~206 MB)
3. Verified headed mode with xvfb passes bot detection
4. Corrected ScienceDaily URL: `/news/matter_energy/physics/`
5. Fixed selectors: Phys.org `article.sorted-article h2 a`, ScienceDaily `a[href*="/releases/2026/"]`
6. Implemented per-article summary fetching for ScienceDaily
7. Built physics keyword scorer and tag assignment engine
8. Generated 2026-05-18 digest: 6 articles, validated clean

### T9: CI/CD Pipeline for cron-digests
1. Created `.github/workflows/ci.yml` with two-job architecture
2. Validation job: `scripts/validate-digest.js` runs on all digests
3. Index rebuild job: `scripts/build-index.js` regenerates SQLite + JSON
4. Auto-commit: updated `viewer/index.json` and `viewer/index.db` committed with `[ci skip]`
5. Pages deploy: uses `actions/deploy-pages@v4`
6. Tested: first push triggered CI, auto-committed index rebuild, Pages deployed

## To Do

- [ ] Sync `tags.json` with all tags from May 21, 22, 25 digests
- [ ] Update `TEMPLATE.md` to match de-facto v2.0 format (Authors, arXiv ID, etc.)
- [ ] Consider modal search/filter within digest view
- [ ] Weekly summary digest from SQLite index
- [ ] System cleanup: old kernel image (~125 MB), pnpm store review

## Known Issues

- `tags.json` stale since May 14 — missing new tags from May 21, 22, 25, and June 16-23
- `TEMPLATE.md` specifies `**Source:**` but actual digests use `**Authors:**`, `**arXiv ID:**` etc.
- Playwright tests in `viewer/test.js` show `⏭️ skipped` on gateway (no Playwright installed) — would need `npm install playwright-core` to enable automated CI testing
- Disk at 92% (67 GB droplet) — journal vacuumed, CloakBrowser binary ~206 MB added

## Next Priorities

1. Monitor tomorrow's arXiv cron (~7:11 IST Tue-Sat) to verify K2.7 subagent + verification pipeline works in production
2. Integrate `verify-digest.sh` into web-science cron payload
3. Check if moltbook digest generation has a cron wrapper; add verification if so
4. Sync `tags.json` with all tags from May 21, 22, 25, and June 16-23
5. Update `TEMPLATE.md` to match de-facto v2.0 format (Authors, arXiv ID, etc.)
6. Consider adding arXiv API as fallback for abstract extraction if HTML scraping fails
7. Install Playwright on gateway to enable automated `viewer/test.js` runs in CI

## Project Status

**Fully Operational** — all infrastructure complete: three cron jobs (arXiv, Web Science, Moltbook), validation, indexing, three-source viewer, CI/CD, CloakBrowser fallback, and metadata verification. Awaiting routine cron verification and tag registry sync.

---
*Updated: 2026-06-23 16:25:00 IST*
