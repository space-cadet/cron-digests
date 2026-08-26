# Changelog

## [2026-08-26]

### Added
- `scripts/moltbook-client.mjs` — shared authenticated Moltbook client for personal and research jobs
- `scripts/deploy-live.sh` — locked primary deployment to `quantumofgravity.com`
- Structured private Moltbook raw snapshots and explicit zero-item generation behavior
- T24 — primary deployment automation and cache coherence task

### Changed
- Moltbook research now uses `/submolts/{name}/feed`, exact submolt/URL validation, deduplication, and structured API data instead of the freeform research log
- arXiv, Web Science, and Moltbook jobs now deploy to the self-hosted primary target automatically
- Viewer source filters now control both calendar and list views
- Viewer index fetching bypasses stale browser caches; the live bundle is versioned as `app.v3.js?v=5`

### Fixed
- Prevented unrelated July external research from being republished as current Moltbook content
- Marked 13 contaminated historical Moltbook files invalid while preserving them for provenance
- Verified the live viewer at 241 digests with source counts of 81/78/82

## [2026-05-25]

### Added
- `moltbook/` directory — third digest source for Moltbook research stream
- `moltbook/2026-05-25.md` — First Moltbook digest (4 entries: He3-Kapitza coupling, LLM browser agents, AI dev workflow, qBraid-QuEra)
- `moltbook/manifest.json` — Manifest tracking Moltbook digests
- `scripts/generate-moltbook-digest.js` — Parser converting `~/.openclaw/logs/moltbook-research.md` into dated digest files with manifest tracking
- Viewer Moltbook support: amber badge (`.type-moltbook`), submolt chips, author lines, URL links
- Viewer header updated: "Daily arXiv, Web Science, and Moltbook research digests"
- `package.json` — ES module isolation: overrides parent workspace `"type": "module"` so `build-index.js` and `validate-digest.js` run as CommonJS
- arXiv cron prompt — mandatory `web_fetch` verification rule: "You may NOT include any paper whose metadata you have not verified via web_fetch"
- arXiv cron prompt — non-negotiable URL rewrite: all paper links MUST use `https://arxivite.org/abs/<id>` (even though arXiv API returns `arxiv.org` URLs)
- `arxiv/2026-05-25.md` — Regenerated with fully verified metadata (12 papers, all checked against live arXiv abstract pages)

### Changed
- `scripts/build-index.js` — Added `'moltbook'` to `types` array, indexes Moltbook digests into SQLite + JSON
- `.github/workflows/ci.yml` — `git add -A` now stages `moltbook/` alongside other directories
- `moltbook-research` cron job — Payload now runs `generate-moltbook-digest.js` after saving to log
- `web-science/manifest.json` — Added missing `2026-05-21.md` entry
- `viewer/index.json` — Rebuilt: 22 digests, 209 entries, 384 unique tags
- `TEMPLATE.md` — Example URLs updated from `arxiv.org` to `arxivite.org`

### Fixed
- `scripts/build-index.js` — `ReferenceError: require is not defined` caused by parent workspace ES module setting — fixed by adding local `package.json` without `"type": "module"`
- `scripts/validate-digest.js` — Same ES module conflict, same fix
- `.github/workflows/ci.yml` — Removed `continue-on-error: true` from build-index step (was masking real failures silently)
- arXiv May 25 hallucination — 12 papers had real IDs but invented titles, authors, abstracts. Regenerated with verified metadata.

---

## [2026-05-18]

### Added
- `.github/workflows/ci.yml` — GitHub Actions workflow: validate → index rebuild → auto-commit → GitHub Pages deploy
- `scripts/generate-web-science-cloak.mjs` — CloakBrowser-based digest generator with xvfb headed mode
- `web-science/2026-05-18.md` — First CloakBrowser-generated digest (6 articles: 3 Phys.org + 3 ScienceDaily)
- ScienceDaily correct URL: `https://www.sciencedaily.com/news/matter_energy/physics/` (was `/news/physics/` — 404)
- ScienceDaily article selector: `a[href*="/releases/2026/"]` for article link discovery
- Per-article summary fetching for ScienceDaily (visits each article page for `.lead` or meta description)
- Physics keyword scoring and tag assignment engine
- CloakBrowser stealth Chromium binary (~206 MB) auto-downloaded to `~/.cloakbrowser/`
- `schema/digest.json` — JSON Schema v7 for digest header and entry structure
- `scripts/validate-digest.js` — automated markdown digest validation (items_found, sequential numbering, structural checks)
- `scripts/build-index.js` — digest parser + SQLite indexer + JSON exporter
- `viewer/index.db` — SQLite index with digests, entries, tags tables
- `viewer/index.json` — pre-computed JSON index (12 digests, 112 entries, 93 tags)
- Dark mode toggle with CSS variables and localStorage persistence
- Tag filter bar: top-20 most common tags with occurrence counts
- Per-card tag chips (up to 6 tags), clickable to activate filter
- "New" badge on latest digest card
- PDF download links alongside abstract links in modal
- Keyboard navigation: `j`/`k` (focus), `Enter` (open), `/` (search focus), `Esc` (close/blur)
- arxivite.org redirect for all arXiv abstract and PDF links

### Changed
- `viewer/index.html` — complete rewrite: instant `index.json` loading, dark mode, tag filtering, keyboard nav
- `scripts/build-index.js` — composite primary key `(date, type)` for digests table (fixes UNIQUE constraint on same-date different-type digests)
- Tag chip sizing: more compact padding, font, and border-radius

### Fixed
- `web-science/2026-05-18.md` — Source field fixed from generic "General Physics" to specific "Phys.org / General Physics", "ScienceDaily / Quantum Physics"
- `web-science/2026-05-18.md` — Tags field fixed from generic defaults to physics-specific tags (Quantum Gravity, Optics & Photonics, etc.)
- `web-science/2026-05-18.md` — Title line fixed to use em-dash separator (`—` not `-`) for validator compliance
- `arxiv/2026-05-11.md` — converted `## Honorable Mentions` footer to `###` (passes validation)
- `web-science/2026-05-13.md` — converted `## Notable Omissions` and `## Methodology` to `###` (passes validation)
- `arxiv/2026-05-18.md` — removed category section headers (`## hep-th`, etc.) that broke viewer item counter
- Viewer item count display: now shows accurate numbers instead of "? items"

---

## [2026-05-15]

### Added
- `arxiv/2026-05-15.md` — arXiv digest (hep-th, gr-qc, quant-ph, cond-mat)
- `web-science/2026-05-15.md` — Web Science digest
- Manifests updated for 2026-05-15

---

## [2026-05-12]

### Added
- `TEMPLATE.md` v2.0 — uniform digest format specification
- `reformat-digest.js` — automated format migration script
- `tags.json` — tag registry with counts and first-seen dates
- Per-entry tagging in both cron job prompts
- Manifest auto-update instructions in cron prompts
- Viewer: ToC navigation, category chips, web-science format support

### Changed
- Digest format: unified `## N. Title` entries across arXiv and web-science
- Date format: standardized to `YYYY-MM-DD`

---

## [2026-05-11]

### Added
- Initial cron-digests repository
- `viewer/index.html` — basic card grid + modal viewer
- arXiv Morning Digest cron job
- Web Science Digest cron job
- `manifest.json` files for arxiv/ and web-science/
