# Project Progress

*Last Updated: 2026-05-18 08:59:00 IST*

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
- [x] Memory bank fully synchronized with all work through 2026-05-18

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

### Digest Generation & Format Fixes
1. arxiv/2026-05-18.md: Friday backlog + Monday fresh (15 selected from ~340 announcements)
2. Fixed format drift: removed category section headers, matched viewer parser expectations
3. Fixed old digests: arxiv/2026-05-11.md (`## Honorable Mentions` → `###`), web-science/2026-05-13.md (`## Notable Omissions` → `###`)

## To Do

- [ ] Sync `tags.json` with all tags from May 15 & May 18 digests
- [ ] Update `TEMPLATE.md` to match de-facto v2.0 format (Authors, arXiv ID, etc.)
- [ ] Add GitHub Actions CI to run validator on PRs
- [ ] Consider modal search/filter within digest view
- [ ] Weekly summary digest from SQLite index
- [ ] System cleanup: old kernel image (~125 MB), pnpm store review

## Known Issues

- `tags.json` stale since May 14 — missing new tags from recent digests
- `TEMPLATE.md` specifies `**Source:**` but actual digests use `**Authors:**`, `**arXiv ID:**` etc.
- Disk at 93% (67 GB droplet) — journal vacuumed, still tight

## Next Priorities

1. Monitor Web Science cron run today (~10:17 IST)
2. Sync tag registry
3. Update template to match actual format
4. Evaluate disk cleanup (old kernel, abandoned node_modules)

## Project Status

**Operational** — all feature tasks complete, infrastructure deployed, awaiting routine cron verification.
