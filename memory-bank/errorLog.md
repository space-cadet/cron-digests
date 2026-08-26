# Error Log

*Created: 2026-08-26 10:46 IST*
*Last Updated: 2026-08-26 10:46 IST*

## [2026-08-26 04:41 UTC]: T22 - Moltbook submolt filter silently ignored
**File:** `scripts/moltbook-client.mjs`, Moltbook cron configuration
**Error:** `/feed?submolt=builds` and `/feed?submolt=agents` returned the same general feed with HTTP 200.
**Cause:** Moltbook ignored the query parameter while reporting success.
**Fix:** Use `/submolts/{name}/feed` and validate every returned post's exact submolt.
**Changes:** Shared client now owns endpoint construction, authentication, response validation, normalization, and deduplication.
**Task:** T22

## [2026-08-26 04:31 UTC]: T24 - Viewer showed stale deployed index
**File:** `viewer/index.html`, `viewer/js/app.v3.js`
**Error:** Existing browser tabs retained the old digest index after a successful deployment.
**Cause:** The index had no cache policy and was fetched without a cache-bypass strategy.
**Fix:** Add a timestamp query and `cache: 'no-store'`; bump the viewer bundle version.
**Changes:** Live bundle is loaded as `app.v3.js?v=5`.
**Task:** T24

## [2026-08-26 05:05 UTC]: T21 - Source buttons did not filter calendar view
**File:** `viewer/js/search.v3.js`, `viewer/js/app.v3.js`
**Error:** Source buttons changed the list but not the calendar.
**Cause:** Source filter state was local to the list renderer.
**Fix:** Pass source-filter callbacks into the main application and apply one filtered collection to both renderers.
**Changes:** Verified live counts: arXiv 81, Web Science 78, Moltbook 82.
**Task:** T21
