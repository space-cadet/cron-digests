# activeContext.md

## Current Status

T22 (Moltbook pipeline repair), T24 (primary deployment automation), and the T21 source-filter repair are **complete**. T23 (Backfill Missing Digests) remains complete. All current work is live:
- arXiv: 5 backfilled (2026-05-16, 05-23, 06-02, 07-04, 07-16) via API `submittedDate` queries
- Web Science: 2 backfilled (2026-07-03, 07-16) via Phys.org daily top pages
- Moltbook: current digest has 12 verified posts; 13 contaminated historical files are explicitly invalidated

The personal and research Moltbook jobs share `scripts/moltbook-client.mjs`. Research uses `/submolts/{name}/feed`, structured records, exact submolt and URL validation, deduplication, and explicit zero-item output. All three feed jobs invoke `scripts/deploy-live.sh`.

**Live at:** https://quantumofgravity.com/cron-digests/

**Primary:** self-hosted Apache deployment. **Backup:** GitHub Pages.

**Verified live:** 241 digests; source filters show arXiv 81, Web Science 78, Moltbook 82 in both calendar and list views.

## Completed (2026-07-25)

### T23: Backfill Missing Digests ✅
1. Created `scripts/backfill-arxiv.py` — reusable script using arXiv API date-range queries
2. Backfilled 5 missing arXiv digests with API data
3. Backfilled 2 missing Web Science digests with Phys.org daily top pages
4. Created 9 Moltbook placeholder stubs (will regenerate when API fixed)
5. Updated all manifests, rebuilt viewer index, pushed to GitHub
6. Enabled Telegram notifications for all cron jobs (was `delivery.mode: "none"`)

### T21: Modularize + Calendar Redesign ✅
[...existing T21 content unchanged...]

## Next

- Monitor the scheduled feed and deployment jobs.
- Consider protected CI credentials for the self-hosted deployment path.

---
*Updated: 2026-08-26 05:16 UTC / 10:46 IST*
