# activeContext.md

## Current Status

Cron-digests archive is fully operational. Recent arXiv HTML structure change has been addressed — both abstract and category extraction are now working correctly.

- **Schema/Validation:** JSON Schema at `schema/digest.json`, validator runs clean (0 errors), 23+ digests indexed
- **Viewer:** Dark mode, tag filtering, keyboard nav, PDF links, arxivite.org integration, Moltbook amber badge — deployed to GitHub Pages
- **Cron jobs:** arXiv Tue-Sat 7:11 IST, Web Science Tue-Sat 10:17 IST, Moltbook personal every 6h on the hour, Moltbook research every 6h at :30 — all operational
- **CI/CD:** GitHub Actions workflow auto-validates digests, rebuilds index, commits changes, deploys to Pages on every push
- **Metadata integrity:** T15 completed — arXiv HTML structure change fixed (abstracts + categories), all 6 recent digests repaired
- **Throttling fix (2026-06-05):** `time.sleep(3)` between arXiv category fetches in `fetch-arxiv-html.py` prevents 429 errors

## Completed This Session (2026-06-16)

### T15: arXiv HTML Structure Fix — Abstract and Category Extraction
- **Root cause:** arXiv removed `<p>` tags around abstracts; category codes inside parentheses were consumed by greedy regex
- **Fix 1:** Updated `scripts/arxiv-digest-full.sh` abstract regex to match text after `<span class="descriptor">Abstract:</span>` with `<p>` fallback
- **Fix 2:** Updated `scripts/fetch-arxiv-html.py` category regex to extract codes from within parentheses `(hep-th)` instead of greedily consuming text before them
- **Fix 3:** Re-fetched all 90 missing abstracts across 6 digests (2026-06-09 through 2026-06-16)
- **Verification:** All 6 digests now have 0 failed abstracts and 0 failed categories
- **Commits:** `89121b6`, `84df176`, `652b24c`, `df9dd14`

## In Progress

None.

## Next Actions

1. Monitor tomorrow's arXiv cron (~7:11 IST) to verify both fixes work in production
2. Consider adding digest quality check to cron job: alert if >20% abstracts failed
3. Review historical digests from May 11–26 for potential category backfill (lower priority)
4. Consider adding arXiv API as fallback for abstract extraction if HTML scraping fails

## Blockers

None.

---
*Updated: 2026-06-16 08:20:00 IST*
