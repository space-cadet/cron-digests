# activeContext.md

## Current Status

T23 (Backfill Missing Digests) is **complete**. All missing digests have been filled:
- arXiv: 5 backfilled (2026-05-16, 05-23, 06-02, 07-04, 07-16) via API `submittedDate` queries
- Web Science: 2 backfilled (2026-07-03, 07-16) via Phys.org daily top pages
- Moltbook: 9 placeholder stubs created (API 401 persists — blocked on T22)

Telegram notifications now enabled for all three cron jobs.

**Live at:** https://quantumofgravity.com/cron-digests/

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

- **T22:** Fix Moltbook empty entries (API 401) — restore actual content to placeholder stubs
- Monitor cron job Telegram notifications

---
*Updated: 2026-07-25 18:15 UTC / 23:45 IST*
