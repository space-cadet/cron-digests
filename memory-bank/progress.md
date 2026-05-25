# Project Progress

*Last Updated: 2026-05-25 05:25:00 IST*

## What Works

- [x] GitHub CLI (`gh`) installed and authenticated as `space_cadet`
- [x] Telegram channel enabled and paired (user 849773381)
- [x] arXiv Morning Digest cron job: Mon-Fri 7:11 IST (with mandatory `web_fetch` verification)
- [x] Web Science Digest cron job: Mon-Fri 10:17 IST
- [x] Digest format v2.0: uniform template across arXiv and web-science
- [x] Viewer UI: card grid, modal with ToC, category chips, search/filter
- [x] JSON Schema (`schema/digest.json`) formalizes digest structure
- [x] Validation script (`scripts/validate-digest.js`): 22 files, 0 errors
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
- [x] Memory bank fully synchronized with all work through 2026-05-25 05:25 IST
- [x] **Metadata verification pipeline**: mandatory `web_fetch` for every arXiv paper before inclusion
- [x] **ES module isolation**: cron-digests `package.json` overrides parent workspace module type

## In Progress

- [ ] Operational monitoring of automated cron runs (next: tomorrow 7:11 IST)
- [ ] `tags.json` sync with new tags from May 21, 22, 25

## Completed (2026-05-25)

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

- `tags.json` stale since May 14 — missing new tags from May 21, 22, 25
- `TEMPLATE.md` specifies `**Source:**` but actual digests use `**Authors:**`, `**arXiv ID:**` etc.
- Disk at 92% (67 GB droplet) — journal vacuumed, CloakBrowser binary ~206 MB added

## Next Priorities

1. Monitor tomorrow's arXiv cron (~7:11 IST) to verify `web_fetch` verification works
2. Sync tag registry
3. Update template to match actual format

## Project Status

**Fully Operational** — all infrastructure complete: cron jobs (with verification), validation, indexing, viewer, CI/CD, and CloakBrowser fallback. Awaiting routine cron verification and tag registry sync.
