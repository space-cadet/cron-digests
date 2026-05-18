---
kind: edit_chunk
id: 2026-05-18-112500-T9-ci-cd-pipeline
created_at: 2026-05-18 11:25:00 IST
task_ids: [T9]
source_branch: main
source_commit: 81114febf5149244d7517b2c0eaea81ca5b010fa
---

#### 11:25:00 IST - T9: CI/CD pipeline for cron-digests
- Created `.github/workflows/ci.yml` - GitHub Actions workflow with two jobs: validate-and-index + deploy
- Created `.github/workflows/ci.yml` - Validate step: runs `scripts/validate-digest.js` on all digests, blocks deploy on failure
- Created `.github/workflows/ci.yml` - Index rebuild step: runs `scripts/build-index.js` to regenerate SQLite and JSON indices
- Created `.github/workflows/ci.yml` - Auto-commit step: commits updated `viewer/index.json` and `viewer/index.db` with `[ci skip]` prefix
- Created `.github/workflows/ci.yml` - Pages deploy step: deploys viewer directory to GitHub Pages using actions/deploy-pages@v4
- Modified `viewer/index.json` - Rebuilt index via `scripts/build-index.js` to include 2026-05-18 web-science digest (12 digests, 112 entries)
- Modified `viewer/index.db` - Rebuilt SQLite index with new digest entries
