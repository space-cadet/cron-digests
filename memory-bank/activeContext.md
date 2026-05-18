# activeContext.md

## Current Status

Cron-digests archive is fully operational with formalized schema, automated validation, indexed viewer, dark mode UI, **and CI/CD pipeline**.

- **Schema/Validation:** JSON Schema at `schema/digest.json`, validator runs clean (0 errors), 12 digests indexed
- **Viewer:** Dark mode, tag filtering, keyboard nav, PDF links, arxivite.org integration — deployed to GitHub Pages
- **Cron jobs:** arXiv Mon-Fri 7:11 IST, Web Science Mon-Fri 10:17 IST — both operational
- **CI/CD:** GitHub Actions workflow (`.github/workflows/ci.yml`) auto-validates digests, rebuilds index, commits changes, and deploys to GitHub Pages on every push

## Completed This Session (2026-05-18)

### T9: CI/CD Pipeline for cron-digests
- GitHub Actions workflow: validate → index rebuild → auto-commit → GitHub Pages deploy
- Runs on every push to main
- If validation fails, CI blocks the Pages deploy
- If index changes, CI commits them back with `[ci skip]`

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

**Implementation docs:**
- [Digest Format v2.0](implementation-details/digest-format-v2.md)
- [CloakBrowser Integration](implementation-details/cloakbrowser-integration.md)
- [CI/CD Pipeline](implementation-details/ci-cd-pipeline.md)

## In Progress

- [x] Operational monitoring: verify cron jobs generate compliant digests — **DONE**: Web Science digest manually re-run with CloakBrowser, validated clean (0 errors)
- [ ] Tag registry sync: `tags.json` stale since May 14, missing new tags from May 15 & May 18
- [x] Web Science digest: next run today ~10:17 IST (Mon 2026-05-18) — **DONE**: Manual CloakBrowser run completed and pushed, CI auto-rebuilt index
- [x] CI/CD pipeline: GitHub Actions workflow created and verified — **DONE**: Auto-committed index rebuild on first push, Pages deploy confirmed

## Next Actions

1. Monitor tomorrow's Web Science digest (~10:17 IST) to verify full pipeline: cron → generate → validate → commit → push → CI rebuilds index → Pages deploys
2. Sync `tags.json` with all tags from May 15 & May 18 digests
3. Update `TEMPLATE.md` to match actual de-facto v2.0 format (Authors, arXiv ID, etc.)
4. Consider weekly summary digest from SQLite index
5. System cleanup: disk at 92%, old kernel image ~125 MB removable

## Blockers

None.

---
*Updated: 2026-05-18 11:25:00 IST*
