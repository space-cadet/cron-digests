# activeContext.md

## Current Status

Cron-digests archive is fully operational with formalized schema, automated validation, indexed viewer, dark mode UI, CI/CD pipeline, **and strict metadata verification**.

- **Schema/Validation:** JSON Schema at `schema/digest.json`, validator runs clean (0 errors), 22 digests indexed
- **Viewer:** Dark mode, tag filtering, keyboard nav, PDF links, arxivite.org integration — deployed to GitHub Pages
- **Cron jobs:** arXiv Mon-Fri 7:11 IST (with mandatory `web_fetch` verification), Web Science Mon-Fri 10:17 IST — both operational
- **CI/CD:** GitHub Actions workflow (`.github/workflows/ci.yml`) auto-validates digests, rebuilds index, commits changes, deploys to Pages on every push
- **Metadata integrity:** Hallucination incident (May 25) resolved; verification rules now hard-coded in cron prompt

## Completed This Session (2026-05-25)

### T11: arXiv Metadata Hallucination Fix — Verification Pipeline
- Identified that May 25 arXiv digest contained 12 papers with real IDs but hallucinated titles, authors, and abstracts
- Regenerated digest with all 12 papers verified against live arXiv abstract pages via `web_fetch`
- Updated cron prompt with non-negotiable verification rules: "You may NOT include any paper whose metadata you have not verified via web_fetch"
- Added mandatory URL rewrite rule: all paper links MUST use `https://arxivite.org/abs/<id>`
- Spot-checked historical digests (May 22, 20, 15) — all clean, isolated incident

### T12: ES Module Fix and Manifest Repair (Emergent)
- Discovered `scripts/build-index.js` and `scripts/validate-digest.js` were broken due to parent workspace `package.json` having `"type": "module"`
- Created `package.json` in cron-digests root (no `"type": "module"`) to resolve CommonJS scripts
- Fixed `web-science/manifest.json` missing `2026-05-21.md` entry
- Removed `continue-on-error: true` from CI build-index step (was masking failures)
- Rebuilt index: 22 digests, 209 entries, 384 unique tags
- Validation passed: 22 files, 0 errors

**Implementation docs:**
- [Digest Format v2.0](implementation-details/digest-format-v2.md)
- [CloakBrowser Integration](implementation-details/cloakbrowser-integration.md)
- [CI/CD Pipeline](implementation-details/ci-cd-pipeline.md)
- [Validation and Indexing](implementation-details/validation-and-indexing.md)

## In Progress

- [x] Operational monitoring: verify cron jobs generate compliant digests — **DONE**: May 25 arXiv digest manually verified and regenerated
- [ ] Tag registry sync: `tags.json` still stale, missing new tags from May 21, 22, 25

## Next Actions

1. Monitor tomorrow's arXiv cron (~7:11 IST) to verify new `web_fetch` verification rules work
2. Monitor tomorrow's Web Science cron (~10:17 IST) for CloakBrowser + fallback behavior
3. Sync `tags.json` with all tags from May 21, 22, 25 digests
4. Consider adding spot-check verification as secondary safeguard (2-3 random papers per digest)

## Blockers

None.

---
*Updated: 2026-05-25 05:25:00 IST*
