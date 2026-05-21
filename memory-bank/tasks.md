# Task Registry
*Created: 2026-05-12 05:05:52 IST*
*Last Updated: 2026-05-18 11:25:00 IST*

## Active Tasks
| ID | Title | Status | Priority | Started | Dependencies | Details |
|----|-------|--------|----------|---------|--------------|---------|
| — | — | — | — | — | — | — |

## Completed Tasks
| ID | Title | Completed | Related Tasks | Details |
|----|-------|-----------|---------------|---------|
| T4 | Digest Format v2.0 | 2026-05-12 | — | [Details](tasks/T4.md) |
| T5 | Update Cron Job Prompts | 2026-05-12 | T4 | [Details](tasks/T5.md) |
| T6 | Schema, Validation, and Index Infrastructure | 2026-05-18 | T4 | [Details](tasks/T6.md) |
| T7 | Viewer UI/UX Overhaul | 2026-05-18 | T4, T6 | [Details](tasks/T7.md) |
| T8 | CloakBrowser Integration for Web Science Digest | 2026-05-18 | T6 | [Details](tasks/T8.md) |
| T9 | CI/CD Pipeline for cron-digests | 2026-05-18 | T6, T7 | [Details](tasks/T9.md) |
| T10 | Cron Reliability Fix — Validator, CI, CloakBrowser | 2026-05-21 | T6, T8, T9 | [Details](tasks/T10.md) |

**Allowed Status Values:**
- `🔄` (In Progress)
- `✅` (Completed)
- `⏸️` (Paused)
- `❌` (Cancelled)

## Task Details

### T4: Digest Format v2.0
**Description:** Uniform markdown template for all digest types with strict parsing contract.
**Status:** ✅ **Last:** 2026-05-18 08:59:00 IST
**Criteria:** `## N. Title` entries, bold metadata fields, no section headers between entries, per-entry tags
**Files:** `TEMPLATE.md`, `digest-schema.md`, `reformat-digest.js`
**Notes:** Evolved from TEMPLATE.md v1.0; viewer regex depends on this format. Old digests retroactively fixed to match (2026-05-11, 2026-05-13).

### T5: Update Cron Job Prompts
**Description:** Added v2.0 format instructions and manifest-update instructions to cron job prompts.
**Status:** ✅ **Last:** 2026-05-12 05:05:52 IST
**Criteria:** Prompts reference TEMPLATE.md, instruct commit with dated message, update tags.json
**Files:** `cron-digests` repo root (job configs)
**Notes:** Cron jobs now auto-generate compliant digests.

### T6: Schema, Validation, and Index Infrastructure
**Description:** Formal schema, automated validation, and build-time index generation for the digest archive.
**Status:** ✅ **Last:** 2026-05-18 08:59:00 IST
**Criteria:** JSON Schema validates digest structure, validator runs clean (0 errors across 11 files), SQLite + JSON index built from all digests
**Files:** `schema/digest.json`, `scripts/validate-digest.js`, `scripts/build-index.js`, `viewer/index.db`, `viewer/index.json`
**Notes:** Index.json enables instant viewer loading. SQLite enables local querying. Validator enforces sequential `## N.` numbering and items_found accuracy.

### T7: Viewer UI/UX Overhaul
**Description:** Major viewer redesign with dark mode, tag filtering, keyboard navigation, and arxivite.org integration.
**Status:** ✅ **Last:** 2026-05-18 08:59:00 IST
**Criteria:** Dark mode toggle with persistence, tag chips (top bar + per-card), "New" badge on latest digest, PDF links, keyboard nav (j/k/Enter/Esc/), arxivite.org redirect
**Files:** `viewer/index.html`
**Notes:** Viewer now loads index.json instantly instead of N markdown fetches. Tag filter state syncs between top bar and card tags. arxivite.org replaces arxiv.org for all paper links.

### T8: CloakBrowser Integration for Web Science Digest
**Description:** Integrate CloakBrowser (stealth Chromium) for bot-resistant web-science digest generation from Phys.org and ScienceDaily.
**Status:** ✅ **Last:** 2026-05-18 11:25:00 IST
**Criteria:** Headed mode with xvfb passes bot detection, correct ScienceDaily URL and selectors, per-article summary fetching, physics keyword scoring, tag assignment, validated digest generated
**Files:** `scripts/generate-web-science-cloak.mjs`
**Notes:** Headless mode leaks detection on VPS; headed mode with xvfb is required. ScienceDaily URL was `/news/physics/` (404) → `/news/matter_energy/physics/` (200). Script uses ESM-only `import` syntax.

### T9: CI/CD Pipeline for cron-digests
**Description:** GitHub Actions workflow for automatic digest validation, index rebuild, and GitHub Pages deployment on every push.
**Status:** ✅ **Last:** 2026-05-18 11:25:00 IST
**Criteria:** Workflow validates digests, rebuilds index, auto-commits changes, deploys to Pages. Tested and verified with auto-generated commit.
**Files:** `.github/workflows/ci.yml`
**Notes:** Two-job architecture: validate-and-index (with auto-commit) → deploy. Validation failures block Pages deploy. `[ci skip]` prevents infinite CI loops.

## Operational Notes
- **arXiv digest cron:** Mon-Fri 7:11 IST, last run 2026-05-18 (15 selected from ~340 announcements)
- **Web Science digest cron:** Mon-Fri 10:17 IST, last run 2026-05-18 (6 articles via CloakBrowser manual re-run)
- **Generated digests:** arxiv/2026-05-18.md, web-science/2026-05-18.md
- **CI/CD:** GitHub Actions auto-validates, rebuilds index, deploys to Pages on every push
- **Index:** 12 digests, 112 entries, 93 unique tags indexed
- **Viewer:** Auto-deployed to GitHub Pages via CI, loads index.json instantly
- **CloakBrowser:** Available at `scripts/generate-web-science-cloak.mjs` for manual or future cron use
