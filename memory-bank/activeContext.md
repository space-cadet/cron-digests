# activeContext.md

## Current Status

Cron-digests archive migrated from GitHub Pages to `quantumofgravity.com/cron-digests/`. Phase 2 complete.

- **Deployed:** `https://quantumofgravity.com/cron-digests/` — all assets (HTML, JSON, digests) confirmed 200 OK
- **Migration method:** Manual `cp -r viewer/*` to `/home/quantumofgravity/public_html/cron-digests/` + chown
- **Moltbook empty entries:** Persistent issue. API returning 401. User explicitly said "don't hide them — fix them."
- **Viewer:** Still monolithic 45KB inline HTML. User wants modularization + calendar view.

## Completed Today (2026-07-07)

### Phase 2: Migrate from GitHub Pages to quantumofgravity.com
1. Identified Apache vhost root: `/home/quantumofgravity/public_html`
2. Created `/home/quantumofgravity/public_html/cron-digests/`
3. Copied `viewer/*` contents to server
4. Set ownership to `quantumofgravity:quantumofgravity`
5. Verified: `curl https://quantumofgravity.com/cron-digests/` → 200 OK
6. Verified: `curl /index.json` → 200 OK
7. Verified: `curl /arxiv/2026-07-07.md` → 200 OK

## In Progress (Next)

- **Phase 3:** Modularize viewer + calendar redesign
  - Split 1,201-line `index.html` into: `index.html` (shell), `css/main.css`, `js/app.js`, `js/calendar.js`, `js/modal.js`, `js/search.js`, `js/utils.js`
  - Add month calendar grid with colored dots (arXiv=blue, Web Science=purple, Moltbook=orange)
  - Click day → show digests for that date
  - Keep list view as toggle
- **Phase 1:** Fix Moltbook empty entries at source (API 401 issue)

## Planned Changes (User-Approved Order)

1. ✅ Phase 2: Migrate to server (DONE)
2. 🔄 Phase 3: Modularization + calendar redesign (NEXT)
3. ⏳ Phase 1: Fix Moltbook empty entries (after redesign)

## Key Decisions

- **User wants empty Moltbook entries visible, not hidden.** Fix the root cause, not the symptom.
- **Modularize first, then redesign.** User agreed to split into separate CSS/JS files.
- **Server deployment is now primary.** GitHub Pages remains as backup.

## Blockers

- Moltbook API returning 401 Unauthorized for research stream (TBD: Phase 1)

---
*Updated: 2026-07-07 07:05 UTC / 12:35 IST*
