# activeContext.md

## Current Status

Digest framework v2.0 is live with uniform format across all digests:
- **arXiv Morning Digest**: Running daily at 7:11 AM IST
- **Web Science Digest**: Running daily at 10:17 AM IST

Both jobs now include subject tagging per digest-schema.md and follow TEMPLATE.md v2.0 format.

## Recent Changes (2026-05-12)

- **Digest format v2.0**: Uniform template for all digests (`## N. Title`, bold metadata, `YYYY-MM-DD` dates)
- **Reformat script**: `reformat-digest.js` converts old formats to v2.0
- **Viewer fixes**: Handles both arXiv and web science formats, extracts item counts, shows category chips
- **Manifest auto-update**: Cron jobs now instructed to update `manifest.json` after each digest
- **Per-entry tagging**: Both digest generators assign 2-3 tags per entry
- **Tag registry**: `tags.json` with 14 tags + counts and first-seen dates
- **Memory bank**: Initialized with mb-cli templates + database-native workflow (T21)
- **Database-native workflow**: Installed from parent memory-bank, 60/60 tests passing

## In Progress

- [ ] Let arXiv digest run tomorrow morning → verify v2.0 format and tags
- [ ] Let web science digest run → verify v2.0 format and manifest update
- [ ] GitHub activity digest — planned, not scheduled
- [ ] Tag merge review — first batch of tags needs human review after ~20 entries

## Next Actions

1. Monitor tomorrow's digest generation for format compliance
2. Verify manifest.json auto-update works in cron jobs
3. Design GitHub digest format (commits, issues, PRs across repos)
4. Review tag registry after ~20 entries for merge candidates

## Blockers

None.

---
*Updated: 2026-05-12*
