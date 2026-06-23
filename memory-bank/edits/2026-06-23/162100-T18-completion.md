---
kind: edit_chunk
id: 2026-06-23-162100-cron-digests-T18-completion
updated_at: 2026-06-23 16:21:00 IST
task_ids: [T18, T19]
source_branch: main
source_commit: f73c656
---

#### 16:21:00 IST - T18 Completion + T19: Viewer Robustness & URL Fix

**T18: Post-Generation Verification Pipeline — COMPLETED**
- Enhanced `scripts/verify-digest.sh` — now validates 8 checkpoints: header, items, entries, index build, JSON, DB, manifest, viewer
- Created `scripts/digest-health-check.sh` — comprehensive pipeline health check (150 lines)
  - Checks date gaps (respects each cron schedule: arXiv Tue-Sat, web-science Mon-Fri)
  - Verifies index.json sync with actual .md files per type
  - Validates index.db has data
  - Checks latest digest structure
  - Verifies manifest files exist
  - Runs Playwright tests if available
  - Checks git status and GitHub Pages deployment
- Updated `scripts/arxiv-digest-full.sh` — runs verification after index rebuild, non-blocking
- Updated arXiv cron job payload (`e732d817`) — subagent only rewrites summaries, main job handles build-index + git push separately
- Fixed `scripts/build-index.js` and `scripts/validate-digest.js` — regex now accepts both `-` and `—` in digest headers
- This fixes silent parsing failures where files exist but are invisible to the viewer

**T19: Viewer 404 Fix & URL Clarification — NEW**
- User reported 404 on `https://space-cadet.github.io/cron-digests/viewer/index.html`
- Root cause: GitHub Actions deploys `viewer/` directory as the **root** of Pages site
- Correct URL: `https://space-cadet.github.io/cron-digests/` (no `/viewer/` prefix)
- Verified: 91 digests indexed, latest 2026-06-23 (arxiv, web-science, moltbook all present)
- Index generated at 2026-06-23 11:05 UTC
- CI workflow `.github/workflows/ci.yml` copies `arxiv/`, `web-science/`, `moltbook/` into `viewer/` before deployment
- Cleanup: removed accidental duplicate `viewer/arxiv/` and `viewer/web-science/` directories

**Enhanced Viewer Tests (`viewer/test.js`)**
- Added 10 comprehensive Playwright tests:
  1. Page loads and cards render
  2. Latest digest is visible as a card
  3. Search filters digests correctly
  4. Filter buttons (arXiv, web-science, moltbook, all) work
  5. Clicking card opens modal with actual content loaded
  6. Modal shows digest structure (TOC + paper items)
  7. Modal close button works
  8. Responsive layout on mobile (375px)
  9. Tag chips render in cards
  10. Category badges render correctly
  11. Latest digest modal has correct title matching date
- Tests read `viewer/index.json` to verify expected digests actually appear in the DOM

**Commits:**
- `c297cf5` — "fix: robust header parsing + health-check + viewer tests"
- `bf22ca9` — "cleanup: remove duplicate viewer/arxiv and viewer/web-science dirs"
- `f73c656` — merge commit with remote
