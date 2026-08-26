# Project Progress

*Last Updated: 2026-08-26 10:46 IST*

## What Works

- [x] **T20: Server migration** — Live at `https://quantumofgravity.com/cron-digests/`
- [x] **T21: Modular viewer + Calendar** — Complete 2026-07-07
- [x] **T23: Backfill missing digests** — Complete 2026-07-25
  - arXiv: 5 backfilled via API `submittedDate` queries
  - Web Science: 2 backfilled via Phys.org daily top pages
  - Moltbook: historical placeholder records retained for provenance
  - Reusable `scripts/backfill-arxiv.py` created
- [x] Post-generation verification pipeline (T18): `verify-digest.sh`, `digest-health-check.sh`, Playwright tests
- [x] Three cron jobs: arXiv, Web Science, Moltbook — generating daily
- [x] Telegram notifications now enabled for all three cron jobs
- [x] **T22: Moltbook pipeline repair** — Complete 2026-08-26
  - Shared client, correct submolts endpoint, structured validation, and explicit zero-item handling
  - 12 verified current posts; 13 contaminated files marked invalid
- [x] **T24: Primary deployment automation** — Complete 2026-08-26
  - `scripts/deploy-live.sh` deploys to `quantumofgravity.com`; Pages remains backup
  - Cache-safe index loading and versioned viewer bundle deployed
- [x] **T21: Source filter synchronization** — Complete 2026-08-26
  - Source buttons filter both calendar and list views
- [x] CI/CD: GitHub Actions auto-validates, rebuilds index, and deploys Pages as backup
- [x] 241 digests indexed, 1814 entries, 946 unique tags

## Completed (2026-07-25)

### T23: Backfill Missing Digests
1. Created `scripts/backfill-arxiv.py` — reusable script using arXiv API `submittedDate` range queries
2. Backfilled 5 missing arXiv digests (2026-05-16, 05-23, 06-02, 07-04, 07-16)
3. Backfilled 2 missing Web Science digests (2026-07-03, 07-16) via Phys.org daily top pages
4. Created 9 Moltbook placeholder stubs for dates with no content (API 401)
5. Updated all manifests (arxiv, web-science, moltbook)
6. Rebuilt viewer index (SQLite + JSON)
7. Enabled Telegram notifications for all three cron jobs (changed `delivery.mode: "none"` → `"announce"`)
8. Committed and pushed to GitHub

## Completed (2026-07-07)

### T21: Modularize viewer + Calendar redesign
1. Created modular file structure:
   - `viewer/css/main.css` — layout, calendar grid, cards, modal
   - `viewer/css/theme.css` — dark mode variable overrides
   - `viewer/js/utils.js` — markdown converter, date helpers, arXiv ID extraction
   - `viewer/js/calendar.js` — month grid rendering, prev/next navigation, day click handlers
   - `viewer/js/modal.js` — digest reader modal, type-specific rendering (arXiv/web-science/moltbook)
   - `viewer/js/search.js` — search/filter logic, list view rendering, keyboard nav
   - `viewer/js/app.js` — main init, data loading, view toggle, tag bar, event coordination
2. Calendar features:
   - 7-column month grid with Sun-Sat headers
   - Day cells show: day number, colored dots (arXiv=blue, Web Science=purple, Moltbook=orange), item count
   - Today highlighting (amber border)
   - Hover effects (lift + border)
   - Click day → opens modal showing all digests for that date
   - Prev/Next month buttons
3. Preserved all existing functionality:
   - Search box with real-time filtering
   - Type filter buttons (All/arXiv/Web Science/Moltbook)
   - Tag bar with top-20 tags, click-to-filter, clear button
   - List view as toggle alternative to calendar
   - Modal with ToC, arxivite.org links, PDF links
   - KaTeX math rendering
   - Keyboard shortcuts (j/k, Enter, Esc, /)
   - Dark mode with toggle and localStorage persistence
4. List view improvements:
   - Month-grouped sticky headers (July 2026, June 2026, May 2026)
   - Cards organized under month sections with accent border
5. Browser history navigation:
   - URL hash updates: `#day=YYYY-MM-DD` for day modal, `#digest=YYYY-MM-DD-type` for digest modal
   - Back/forward buttons navigate through modal stack correctly
   - `popstate` listener handles all hash changes
6. Cloudflare cache workaround: versioned JS filenames (`*.v3.js`)
7. Deployed and verified on quantumofgravity.com/cron-digests/
8. Committed: `1dd5918`, `6c13c38`, `82453b0`, pushed to GitHub

### T20: Server Migration
1. Located Apache vhost DocumentRoot: `/home/quantumofgravity/public_html`
2. Created `cron-digests/` subdirectory
3. Copied `viewer/*` contents
4. Set correct ownership (`quantumofgravity:quantumofgravity`)
5. Verified all endpoints: HTML (200), index.json (200), digest files (200)
6. Site live at: `https://quantumofgravity.com/cron-digests/`

## In Progress

None. T22, T24, and the source-filter repair are complete.

## Planned

- [ ] Consider a protected CI runner for self-hosted deployment credentials.
- [ ] Monitor the scheduled Moltbook jobs for endpoint or API schema changes.

## Known Issues

- Historical Moltbook stubs and contaminated files remain as explicit invalid provenance records.
- The primary self-hosted deployment depends on the scheduled deploy script; Pages is the backup.

## Next Priorities

1. **T22: Fix Moltbook API** — investigate 401, restore content
2. Consider CI auto-deploy to server (rsync step)
3. Monitor user feedback on calendar UI

## Architecture Decision

- **Primary hosting:** Apache on quantumofgravity.com (server)
- **Backup:** GitHub Pages (space-cadet.github.io/cron-digests/)
- **Deployment:** Cron-driven `scripts/deploy-live.sh` to the self-hosted primary; GitHub Actions Pages deployment is the backup.

---
*Updated: 2026-08-26 10:46 IST*
