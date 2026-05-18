# Project Progress

*Last Updated: 2026-05-18 11:25:00 IST*

## What Works

- [x] GitHub CLI (`gh`) installed and authenticated as `space_cadet`
- [x] Telegram channel enabled and paired (user 849773381)
- [x] arXiv Morning Digest cron job: Mon-Fri 7:11 IST
- [x] Web Science Digest cron job: Mon-Fri 10:17 IST
- [x] Digest format v2.0: uniform template across arXiv and web-science
- [x] Viewer UI: card grid, modal with ToC, category chips, search/filter
- [x] JSON Schema (`schema/digest.json`) formalizes digest structure
- [x] Validation script (`scripts/validate-digest.js`): 11 files, 0 errors
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
- [x] Memory bank fully synchronized with all work through 2026-05-18 11:25 IST

## In Progress

- [ ] Operational monitoring of automated cron runs
- [ ] `tags.json` sync with new tags from May 15 & May 18

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
3. Verified headed mode with xvfb passes bot detection (0 red flags on bot.sannysoft.com)
4. Corrected ScienceDaily URL: `/news/matter_energy/physics/` (was `/news/physics/` 404)
5. Fixed selectors: Phys.org `article.sorted-article h2 a`, ScienceDaily `a[href*="/releases/2026/"]`
6. Implemented per-article summary fetching for ScienceDaily
7. Built physics keyword scorer and tag assignment engine
8. Generated 2026-05-18 digest: 6 articles, validated clean (0 errors)
9. Committed script to `scripts/generate-web-science-cloak.mjs`

### T9: CI/CD Pipeline for cron-digests
1. Created `.github/workflows/ci.yml` with two-job architecture
2. Validation job: `scripts/validate-digest.js` runs on all digests, blocks deploy on failure
3. Index rebuild job: `scripts/build-index.js` regenerates SQLite + JSON
4. Auto-commit: updated `viewer/index.json` and `viewer/index.db` committed with `[ci skip]`
5. Pages deploy: uses `actions/deploy-pages@v4` for GitHub Pages
6. Tested: first push triggered CI, auto-committed index rebuild, Pages deployed
7. Full pipeline operational: cron → generate → validate → commit → push → CI → Pages

### Digest Generation & Format Fixes
1. arxiv/2026-05-18.md: Friday backlog + Monday fresh (15 selected from ~340 announcements)
2. web-science/2026-05-18.md: CloakBrowser-generated (3 Phys.org + 3 ScienceDaily)
3. Fixed format drift: removed category section headers, matched viewer parser expectations
4. Fixed old digests: arxiv/2026-05-11.md (`## Honorable Mentions` → `###`), web-science/2026-05-13.md (`## Notable Omissions` → `###`)

## To Do

- [ ] Sync `tags.json` with all tags from May 15 & May 18 digests
- [ ] Update `TEMPLATE.md` to match de-facto v2.0 format (Authors, arXiv ID, etc.)
- [ ] Consider modal search/filter within digest view
- [ ] Weekly summary digest from SQLite index
- [ ] System cleanup: old kernel image (~125 MB), abandoned node_modules, pnpm store review

## Known Issues

- `tags.json` stale since May 14 — missing new tags from May 15 & May 18
- `TEMPLATE.md` specifies `**Source:**` but actual digests use `**Authors:**`, `**arXiv ID:**` etc.
- Disk at 92% (67 GB droplet) — journal vacuumed, CloakBrowser binary ~206 MB added

## Next Priorities

1. Monitor tomorrow's Web Science digest (~10:17 IST) for full pipeline verification
2. Sync tag registry
3. Update template to match actual format
4. Evaluate disk cleanup (old kernel, abandoned node_modules, CloakBrowser binary)

## Project Status

**Fully Operational** — all infrastructure complete: cron jobs, validation, indexing, viewer, CI/CD, and CloakBrowser fallback. Awaiting routine cron verification and tag registry sync.
