# Task Registry
*Created: 2026-05-12 05:05:52 IST*
*Last Updated: 2026-05-25 05:25:00 IST*

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
| T11 | arXiv Metadata Hallucination Fix — Verification Pipeline | 2026-05-25 | T6, T10 | [Details](tasks/T11.md) |
| T12 | ES Module Fix — package.json for CommonJS scripts | 2026-05-25 | T11 | [Details](tasks/T12.md) |
| T13 | Moltbook Research Stream Integration into Viewer | 2026-05-25 | T6, T9 | [Details](tasks/T13.md) |

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

### T10: Cron Reliability Fix — Validator, CI, and CloakBrowser Integration
**Description:** Fixed validator false positives on arxiv digest items_found, hardened CI staging, corrected CloakBrowser script URLs after site redesign.
**Status:** ✅ **Last:** 2026-05-21 16:45:00 IST
**Criteria:** Validator skips items_found check for arxiv (reports total announcements, not selected). CI stages all directories. CloakBrowser script targets correct ScienceDaily URL.
**Files:** `scripts/validate-digest.js`, `.github/workflows/ci.yml`, `scripts/generate-web-science-cloak.mjs`
**Notes:** ScienceDaily redesigned their URL structure — the old `/news/physics/` path 404'd. The fix was `/news/matter_energy/physics/`. Also discovered that `continue-on-error: true` on the CI build step was hiding real failures.

### T11: arXiv Metadata Hallucination Fix — Verification Pipeline
**Description:** Regenerated 2026-05-25 arXiv digest with fully verified metadata after discovering the cron job hallucinated paper details. Added mandatory web_fetch verification to the arXiv cron prompt.
**Status:** ✅ **Last:** 2026-05-25 05:25:00 IST
**Criteria:** All 12 papers verified against arXiv API via web_fetch. All URLs use arxivite.org. Cron prompt now includes non-negotiable verification rules.
**Files:** `arxiv/2026-05-25.md`, `TEMPLATE.md`, `.github/workflows/ci.yml`
**Notes:** The hallucination: paper titles, authors, and abstracts were plausible-sounding but wrong. Real titles were simpler. Root cause: cron job generating digest without live web_fetch verification. Fix: mandatory verification + URL rewrite enforcement.

### T12: ES Module Fix — package.json for CommonJS scripts
**Description:** Created package.json (no "type": "module") to resolve ES module conflict caused by parent workspace having `"type": "module"`. Fixed web-science manifest missing entry.
**Status:** ✅ **Last:** 2026-05-25 05:25:00 IST
**Criteria:** `scripts/build-index.js` and `scripts/validate-digest.js` (CommonJS `require()`) work again. CI build step is strict (no `continue-on-error`).
**Files:** `package.json`, `.github/workflows/ci.yml`, `web-science/manifest.json`
**Notes:** Parent workspace `/home/cloudy/.openclaw/workspace/` has `"type": "module"` in its package.json. This propagated to cron-digests, breaking CommonJS scripts. The fix: create a local package.json without type:module.

### T13: Moltbook Research Stream Integration into Viewer
**Description:** Integrated Moltbook research stream (cron job output) into the cron-digests viewer as a third digest source alongside arXiv and Web Science.
**Status:** ✅ **Last:** 2026-05-25 07:38:00 IST
**Criteria:** Moltbook digest generated from research log, indexed by build-index.js, rendered in viewer with amber badge and submolt chips. GitHub Pages live. CI stages moltbook/ directory.
**Files:** `moltbook/2026-05-25.md`, `moltbook/manifest.json`, `scripts/generate-moltbook-digest.js`, `scripts/build-index.js`, `viewer/index.html`, `.github/workflows/ci.yml`
**Notes:** Full pipeline: cron job saves to `~/.openclaw/logs/moltbook-research.md` → `generate-moltbook-digest.js` parses → dated digest + manifest → `build-index.js` indexes → viewer renders. The viewer shows submolt name as chips, author lines, and direct URLs.

## Operational Notes
- **arXiv digest cron:** Tue-Sat 7:11 IST, last run 2026-05-25 (12 papers verified)
- **Web Science digest cron:** Tue-Sat 10:17 IST, last run 2026-05-25 (6 articles via CloakBrowser)
- **Moltbook research cron:** Every 6h at :30, last run 2026-05-25 07:11 IST (146s, 4 entries)
- **Moltbook personal cron:** Every 6h on the hour, last run 2026-05-25 06:11 IST (164s)
- **Generated digests:** arxiv/2026-05-25.md, web-science/2026-05-25.md, moltbook/2026-05-25.md
- **CI/CD:** GitHub Actions auto-validates, rebuilds index, deploys to Pages on every push
- **Index:** 23 digests, 213 entries, 384+ unique tags indexed
- **Viewer:** Auto-deployed to GitHub Pages via CI, loads index.json instantly, now shows three sources
- **CloakBrowser:** Available at `scripts/generate-web-science-cloak.mjs` for manual or future cron use
- **Moltbook generator:** Available at `scripts/generate-moltbook-digest.js`, reads from `~/.openclaw/logs/moltbook-research.md`
