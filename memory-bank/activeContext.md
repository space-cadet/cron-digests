# activeContext.md

## Current Status

All planned feature tasks completed. cron-digests archive is fully operational with formalized schema, automated validation, indexed viewer, and dark mode UI.

- **Schema/Validation:** JSON Schema at `schema/digest.json`, validator runs clean (0 errors), 11 digests indexed
- **Viewer:** Dark mode, tag filtering, keyboard nav, PDF links, arxivite.org integration — deployed to GitHub Pages
- **Cron jobs:** arXiv Mon-Fri 7:11 IST, Web Science Mon-Fri 10:17 IST — both operational

## Completed This Session (2026-05-18)

### T8: CloakBrowser Integration for Web Science Digest
- Installed CloakBrowser (`npm install cloakbrowser playwright-core`)
- Created `generate-web-science-digest.mjs` script using CloakBrowser + xvfb for headed mode on headless VPS
- Fixed ScienceDaily URL: `https://www.sciencedaily.com/news/matter_energy/physics/` (not `/news/physics/`)
- Fixed selector strategy for both Phys.org (`article.sorted-article h2 a`) and ScienceDaily (`a[href*="/releases/2026/"]`)
- Added per-article summary fetching for ScienceDaily by visiting each article page
- Generated digest: 6 articles (3 Phys.org + 3 ScienceDaily), all validated clean
- Committed and pushed to `main`

### T6: Schema, Validation, and Index Infrastructure
- JSON Schema formalizing digest header + entry structure
- `validate-digest.js`: parses markdown, validates item counts, sequential numbering, flags structural violations
- `build-index.js`: parses all `.md` → SQLite (`viewer/index.db`) + JSON (`viewer/index.json`)
- 11 digests, 106 entries, 93 unique tags indexed
- Old digests retroactively fixed (footer `##` → `###`)

### T7: Viewer UI/UX Overhaul
- Dark mode toggle with CSS variables and localStorage persistence
- Tag filter bar (top-20 tags with counts) + per-card tag chips
- "New" badge on latest digest
- PDF links alongside abstracts in modal
- Keyboard navigation: `j`/`k`, `Enter`, `/`, `Esc`
- Compact tag chip sizing
- arxivite.org redirect for all paper links
- Instant `index.json` loading (replaces N markdown fetches)

## In Progress

- [x] Operational monitoring: verify cron jobs generate compliant digests — **DONE**: Web Science digest manually re-run with CloakBrowser, validated clean (0 errors)
- [ ] Tag registry sync: `tags.json` stale since May 14, missing new tags from May 15 & May 18
- [x] Web Science digest: next run today ~10:17 IST (Mon 2026-05-18) — **DONE**: Manual CloakBrowser run completed and pushed

## Next Actions

1. Sync `tags.json` with all tags from May 15 & May 18 digests
2. Update `TEMPLATE.md` to match actual de-facto v2.0 format (Authors, arXiv ID, etc.)
3. Consider integrating `scripts/generate-web-science-cloak.mjs` into the cron job payload for automated web-science digest generation
4. Consider weekly summary digest from SQLite index
5. System cleanup: disk at 93%, old kernel image ~125 MB removable

## Blockers

None.

---
*Updated: 2026-05-18 08:59:00 IST*
