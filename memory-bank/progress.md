# Project Progress

*Last Updated: 2026-07-07 12:55 IST*

## What Works

- [x] **T20: Server migration** — Live at `https://quantumofgravity.com/cron-digests/`
- [x] **T21: Modular viewer + Calendar** — Complete 2026-07-07
  - Split 1,201-line inline HTML into modular CSS/JS
  - 82-line `index.html` shell + `css/`, `js/` directories
  - Month calendar with colored dots per digest type
  - Day click → digest modal
  - Toggle calendar/list views
  - All features preserved (search, tags, keyboard, dark mode, KaTeX)
- [x] Post-generation verification pipeline (T18): `verify-digest.sh`, `digest-health-check.sh`, Playwright tests
- [x] Three cron jobs: arXiv, Web Science, Moltbook — generating daily
- [x] CI/CD: GitHub Actions auto-validates, rebuilds index, deploys to Pages on push
- [x] 91+ digests indexed, 831 entries, 800 tags

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

None. T21 just completed.

## Planned

- [ ] **T22: Fix Moltbook empty entries at source**
  - Diagnose API 401 issue
  - Check if token expired, URL changed, or service down
  - Regenerate empty digests once fixed
  - Add guard: don't write empty stubs

## Known Issues

- Moltbook research stream API returning 401 (unauthorized) since ~June 25
- Empty Moltbook digests (June 25–July 7): 6-line stubs with "Items found: 0"
- GitHub Actions still deploys to Pages; server is manual copy. Need auto-sync or switch CI target.

## Next Priorities

1. **T22: Fix Moltbook API** — investigate 401, restore content
2. Consider CI auto-deploy to server (rsync step)
3. Monitor user feedback on calendar UI

## Architecture Decision

- **Primary hosting:** Apache on quantumofgravity.com (server)
- **Backup:** GitHub Pages (space-cadet.github.io/cron-digests/)
- **Deployment:** Manual rsync for now. May add CI step to rsync to server later.

---
*Updated: 2026-07-07 12:55 IST*
