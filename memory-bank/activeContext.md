# activeContext.md

## Current Status

Cron-digests archive is fully operational. All three viewer bugs have been fixed and the summary pipeline now uses K2.7 subagent for quality generation.

- **Schema/Validation:** JSON Schema at `schema/digest.json`, validator runs clean (0 errors), 91+ digests indexed
- **Viewer:** Dark mode, tag filtering, keyboard nav, PDF links, arxivite.org integration, Moltbook amber badge, **KaTeX math rendering** — deployed to GitHub Pages at `https://space-cadet.github.io/cron-digests/`
- **Cron jobs:** arXiv Tue-Sat 7:11 IST (with K2.7 subagent summary fix), Web Science Mon-Fri 10:17 IST, Moltbook personal every 6h on the hour, Moltbook research every 6h at :30 — all operational
- **CI/CD:** GitHub Actions workflow auto-validates digests, rebuilds index, commits changes, deploys to Pages on every push
- **Metadata integrity:** arXiv HTML structure fixed (T15), abstracts + categories extracting correctly
- **Summary quality:** T16 completed — all digests back to June 10 have proper summaries; T17 completed — cron job now auto-generates quality summaries via K2.7 subagent
- **Tag display:** T16 fixed regex cross-line matching bug; chips now show correct categories
- **Verification Pipeline:** T18 completed — `verify-digest.sh` (8-checkpoint) + `digest-health-check.sh` (pipeline) + enhanced `viewer/test.js` (10 Playwright tests). Regex now accepts both `-` and `—` in headers to prevent silent parsing failures.
- **Viewer URL:** T19 completed — clarified that correct URL is root `/`, not `/viewer/index.html`. CI deploys `viewer/` directory as Pages root.

## Completed This Session (2026-06-23)

### T18: Post-Generation Verification Pipeline (Completed)
- **Created** `scripts/verify-digest.sh` — executable, 8-checkpoint validation per digest
- **Created** `scripts/digest-health-check.sh` — comprehensive pipeline health check (150 lines)
- **Tested** on arxiv 2026-06-23 — all 5 checks passed (15 files, 31 DB entries)
- **Updated** `scripts/arxiv-digest-full.sh` — verification runs after index rebuild, non-blocking
- **Updated** arXiv cron job payload — subagent only rewrites summaries, main job handles build-index + git push
- **Fixed** `build-index.js` and `validate-digest.js` — regex now accepts both `-` and `—` in headers
- **Enhanced** `viewer/test.js` — 10 comprehensive Playwright tests
- **Committed** moltbook digests 2026-06-20 through 2026-06-23
- **Rebuilt** index: 91 digests, 831 entries, 800 unique tags
- **Commits:** `c297cf5`, `bf22ca9`, `f73c656`

### T19: Viewer 404 Fix & URL Clarification (Completed)
- **Diagnosed** user was using wrong URL: `/viewer/index.html` instead of root `/`
- **Explained** CI deploys `viewer/` directory as Pages root — no `/viewer/` prefix in URL
- **Cleaned up** accidental duplicate `viewer/arxiv/` and `viewer/web-science/` directories
- **Verified** site live: 91 digests, latest 2026-06-23, all three types present
- **Commit:** `bf22ca9`

## In Progress

- Monitor tomorrow's arXiv cron (~7:11 IST) to verify K2.7 subagent summary pipeline works in production
- Integrate `verify-digest.sh` into web-science cron payload
- Check if moltbook digest generation has a cron wrapper; add verification if so

## Next Actions

1. Monitor tomorrow's arXiv cron (~7:11 IST) to verify K2.7 subagent summary pipeline works in production
2. Integrate `verify-digest.sh` into web-science cron payload
3. Check if moltbook digest generation has a cron wrapper; add verification if so
4. Review historical digests from May 11–26 for potential category backfill (lower priority)
5. Consider adding arXiv API as fallback for abstract extraction if HTML scraping fails

## Blockers

None.

---
*Updated: 2026-06-23 16:25:00 IST*
