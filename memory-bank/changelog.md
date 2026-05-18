# Changelog

## [2026-05-18]

### Added
- `schema/digest.json` — JSON Schema v7 for digest header and entry structure
- `scripts/validate-digest.js` — automated markdown digest validation (items_found, sequential numbering, structural checks)
- `scripts/build-index.js` — digest parser + SQLite indexer + JSON exporter
- `viewer/index.db` — SQLite index with digests, entries, tags tables
- `viewer/index.json` — pre-computed JSON index (11 digests, 106 entries, 93 tags)
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
