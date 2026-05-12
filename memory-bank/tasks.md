# tasks.md

## Active Tasks

### T1: Unified Digest Framework
- **Status**: In Progress
- **Owner**: Cloudy
- **Started**: 2026-05-12

Formalize the digest generation system so new digest types can be added without reinventing structure.

**Deliverables:**
- [x] `digest-schema.md` — unified schema specification
- [x] `tags.json` — tag registry with starter tags
- [x] Update cron job prompts to include tagging
- [ ] Update viewer to render per-entry tags
- [ ] Document framework in memory bank

**Blockers:** None

---

### T2: GitHub Activity Digest
- **Status**: Planned
- **Owner**: Deepak (requested)
- **Depends on**: T1 complete

Generate daily/weekly digest of GitHub activity across repos.

**Open questions:**
- Daily or weekly? (Daily might be noisy)
- Which repos? All `space_cadet` repos or select ones?
- What to include? Commits, issues, PRs, releases?
- Tag system: Software & Tools, Open Source & Community, plus repo-specific tags?

---

### T3: Tag Registry Maintenance
- **Status**: Waiting
- **Trigger**: After ~20 tagged entries accumulated

Review tags.json for:
- Duplicate/similar tags to merge
- Overly specific tags to generalize
- Missing tags that emerged frequently

---

## Backlog

- [ ] Modal search/filter within viewer
- [ ] Error handling for failed digest fetches
- [ ] Failure notifications (email/Telegram when digest fails)
- [ ] Digest quality evaluation after 1 week automated runs
- [ ] Cross-digest search (search all types at once)

## Completed

- [x] Memory Bank structure initialized (2026-05-11)
- [x] Viewer UI with ToC, chips, dual-format support (2026-05-11)
- [x] arXiv and Web Science cron jobs running (2026-05-11)
- [x] Tagging system designed and deployed (2026-05-12)

---
*Updated: 2026-05-12*
