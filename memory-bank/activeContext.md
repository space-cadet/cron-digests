# activeContext.md

## Current Status

T21 (Modularize + Calendar redesign) is **complete**. The viewer has been rewritten with:
- Modular CSS/JS files (was 1,201-line inline monster, now 82-line HTML shell)
- Month calendar view with colored dots per digest type
- Day click → digest modal
- Toggle between calendar and list views
- All existing features preserved

**Live at:** https://quantumofgravity.com/cron-digests/

## Completed (2026-07-07)

### T20: Server Migration ✅
Moved from GitHub Pages to quantumofgravity.com/cron-digests/

### T21: Modularize + Calendar Redesign ✅
1. Created modular structure:
   - `css/main.css` — layout, calendar, cards, modal
   - `css/theme.css` — dark mode overrides
   - `js/utils.js` — markdown converter, date helpers
   - `js/calendar.js` — month grid, day dots, navigation
   - `js/modal.js` — digest reader, markdown rendering
   - `js/search.js` — search + filter logic
   - `js/app.js` — main init, data loading, view toggle
2. Rewrote `index.html` as 82-line shell (was 1,201 lines)
3. Calendar features:
   - Month grid with day cells
   - Colored dots: arXiv (blue), Web Science (purple), Moltbook (orange)
   - Today highlighting
   - Prev/Next month navigation
   - Day click → shows digests for that date
4. List view improvements:
   - Month-grouped sticky headers (July 2026, June 2026, etc.)
   - Search and filters preserved
5. Browser history navigation:
   - URL hash updates when opening modals (#day=YYYY-MM-DD, #digest=...)
   - Back/forward buttons work through modal stack
6. Deployed to server and verified
7. Committed and pushed to GitHub

## Next

- **T22:** Fix Moltbook empty entries (API 401) — user explicitly wants this next
- Monitor user feedback on new calendar UI

## Blockers

None for T21. T22 blocked until Moltbook API issue diagnosed.

---
*Updated: 2026-07-07 07:25 UTC / 12:55 IST*
