# Project Progress

*Last Updated: 2026-07-07 12:35 IST*

## What Works

- [x] **Server migration** (Phase 2): Live at `https://quantumofgravity.com/cron-digests/`
- [x] All previous features: card grid, modal, search, tags, keyboard nav, dark mode, KaTeX
- [x] Post-generation verification pipeline (T18): `verify-digest.sh`, `digest-health-check.sh`, Playwright tests
- [x] Three cron jobs: arXiv, Web Science, Moltbook — generating daily
- [x] CI/CD: GitHub Actions auto-validates, rebuilds index, deploys to Pages on push
- [x] 91+ digests indexed, 831 entries, 800 tags

## New Context (2026-07-07)

User wants a **complete viewer redesign** — from linear card grid to calendar-based navigation. Also wants the viewer **modularized** (split from monolithic 1,201-line inline HTML into separate CSS/JS files).

### Current Issues Identified

- **Empty Moltbook entries:** Recent files (June 25–July 7) are 6-line stubs with "Items found: 0". API returning 401.
- **Monolithic viewer:** 45KB single inline file. Hard to maintain.
- **No date-based navigation:** Users must scroll linearly to find a specific day.
- **Server vs Pages dual deployment:** Now primarily on server, GitHub Pages as backup.

## Completed (2026-07-07)

### Phase 2: Server Migration
1. Located Apache vhost for `quantumofgravity.com` → DocumentRoot `/home/quantumofgravity/public_html`
2. Created `cron-digests/` subdirectory
3. Copied `viewer/*` contents
4. Set correct ownership (`quantumofgravity:quantumofgravity`)
5. Verified all endpoints: HTML (200), index.json (200), digest files (200)
6. Site live at: `https://quantumofgravity.com/cron-digests/`

## In Progress

- [ ] **Phase 3: Modularization + Calendar redesign**
  - [ ] Split `index.html` into modular files (css/, js/)
  - [ ] Design month calendar view
  - [ ] Day cells with colored dots per digest type
  - [ ] Click day → show digest modal
  - [ ] Toggle between calendar and list views

## Planned

- [ ] **Phase 1: Fix Moltbook empty entries at source**
  - Diagnose API 401 issue
  - Check if token expired, URL changed, or service down
  - Regenerate empty digests once fixed

## Known Issues

- Moltbook research stream API returning 401 (unauthorized) since ~June 25
- `index.html` is 1,201 lines / 45KB — unmaintainable
- GitHub Actions still deploys to Pages; server is now manual copy. Need auto-sync or switch CI target.

## Next Priorities

1. **Modularize viewer** — split into css/main.css, js/app.js, js/calendar.js, js/modal.js, js/search.js, js/utils.js
2. **Calendar view** — month grid, day dots, click-to-open
3. **Fix Moltbook API** — investigate 401, restore content

## Architecture Decision

- **Primary hosting:** Apache on quantumofgravity.com (server)
- **Backup:** GitHub Pages (space-cadet.github.io/cron-digests/)
- **Deployment:** Manual rsync for now. May add CI step to rsync to server later.

---
*Updated: 2026-07-07 12:35 IST*
